
import _ from "lodash"
import { useEffect, useMemo, useState } from "react"
import { Button, Callout, Card, NonIdealState } from "@blueprintjs/core"

import { api } from "@/api"
import { useGetSubmissionsByProteome } from "@/api/orchestrated/submissionsByProteome"
import { usePrefetchVolcanoData } from "@/api/orchestrated/volcanoData"
import { BaseInput } from "@/comps/core/input/api/BaseInput"
import { SubmissionTitle } from "@/comps/submission/view/SubmissionTitle"
import { ConditionApplicationSelection } from "@/comps/core/base/attribute_selection/Pairwise"
import { ConditionApplicationsView } from "@/comps/core/base/condition_applications/ConditionApplicationView"
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch"
import InteractiveChart from "@/comps/core/charts/interactive"
import { ScatterPlot } from "@/comps/core/charts/scatter"
import { RemoveButton } from "@/comps/core/base/buttons/RemoveButton"
import { Loading } from "@/comps/core/base/states/Loading"
import APIError from "@/comps/core/error/APIerror"
import { VolcanoListButton, VolcanoCompareButton } from "@/comps/analysis/volcano/SignificantProteins"
import { log2FCFieldName, pValueFieldName, significantFieldName } from "@/comps/analysis/volcano/compareUtils"
import { addStringToArrayOrRemove } from "@/services/arrays/transforms"
import { DownloadData } from "@/comps/protein/charts/resultCard/chartselection/DownloadChart"


let panelIdCounter = 0
const nextPanelId = () => `panel-${++panelIdCounter}`

function ProteomeTag({ tag }) {
    const { data: proteomeText } = api.proteomes.queryProteomes.useGetProteomeText(
        { tag }, { enabled: _.isString(tag), staleTime: Infinity })
    return <span>{_.isString(proteomeText) ? proteomeText : tag}</span>
}


function PanelSetup({ panel, index, referenceTag, referenceProteomes, isFetching, onUpdate, onRemove, onProteomes, canRemove }) {
    const { data: proteomes } = api.submissions.core.useGetSubmissionProteomes(
        { tag: panel.submission_tag }, { enabled: _.isString(panel.submission_tag), staleTime: Infinity })
    const proteomeTags = _.isArray(proteomes) ? proteomes : []

    useEffect(() => {
        onProteomes(panel.id, proteomeTags)
    }, [panel.id, _.join(proteomeTags, ";")])

    const restrictToReference = index > 0 && _.isString(referenceTag) && referenceProteomes.length > 0
    const proteomeMismatch = index > 0 && _.isString(panel.submission_tag) && referenceProteomes.length > 0
        && proteomeTags.length > 0 && _.intersection(proteomeTags, referenceProteomes).length === 0

    const handleSelectSubmission = (tag) => onUpdate(panel.id, { submission_tag: tag, testParams: undefined })
    const handleConfirm = (testParams) => onUpdate(panel.id, { testParams: { ...testParams, _nonce: Date.now() } })

    return (
        <Card compact={true} className="margin-top--little">
            <div className="flex center-items justify-space-between">
                <h4>Volcano plot {index + 1}</h4>
                {canRemove ? <RemoveButton onRemove={() => onRemove(panel.id)} /> : null}
            </div>
            <span className="font-size--small">Submission</span>
            {restrictToReference ?
                <BaseInput
                    selected_tags={_.isString(panel.submission_tag) ? [panel.submission_tag] : []}
                    render_children={(tag) => <SubmissionTitle tag={tag} showCopyToClipboard={false} showEdit={false} />}
                    api_hook={useGetSubmissionsByProteome}
                    api_hook_params={{ proteome_tags: referenceProteomes }}
                    onSelect={handleSelectSubmission}
                    placeholder={_.isString(panel.submission_tag) ? panel.submission_tag : "Select submission (same proteome)..."} /> :
                <BaseInput
                    selected_tags={_.isString(panel.submission_tag) ? [panel.submission_tag] : []}
                    render_children={(tag) => <SubmissionTitle tag={tag} showCopyToClipboard={false} showEdit={false} />}
                    api_hook={api.submissions.query.useGetSubmissionByQuery}
                    api_hook_params={{ group_by_state: false, limit: 50 }}
                    onSelect={handleSelectSubmission}
                    placeholder={_.isString(panel.submission_tag) ? panel.submission_tag : "Select submission..."} />}
            {_.isString(panel.submission_tag) ? (
                <div className="margin-top--little">
                    <div className="flex center-items" style={{ gap: "0.3rem", flexWrap: "wrap" }}>
                        <SubmissionTitle tag={panel.submission_tag} showCopyToClipboard={false} showEdit={false} />
                    </div>
                    {proteomeTags.length > 0 ?
                        <div className="font-size--smallest flex center-items" style={{ gap: "0.3rem", flexWrap: "wrap" }}>
                            <span>Proteome:</span>
                            {proteomeTags.map(t => <ProteomeTag key={t} tag={t} />)}
                        </div> : null}
                    {restrictToReference ?
                        <div className="font-size--smallest">Only submissions sharing the proteome of {referenceTag} are listed.</div> : null}
                    {proteomeMismatch ?
                        <Callout intent="danger" icon="warning-sign" className="margin-top--little">
                            This submission does not share a proteome with {referenceTag}. Comparing volcano plots across different proteomes is not meaningful.
                        </Callout> : null}
                </div>
            ) : null}
            {_.isString(panel.submission_tag) ?
                <div className="margin-top--little">
                    <ConditionApplicationSelection
                        submission_tag={panel.submission_tag}
                        onConfirm={handleConfirm}
                        reset_after_confirm={true}
                        isLoadingData={isFetching}
                        confirmButtonText="Plot volcano"
                        confirmButtonHighlighted={true} />
                </div> : null}
            {_.isObject(panel.testParams) ?
                <div className="margin-top--little font-size--small flex center-items" style={{ gap: "0.3rem", flexWrap: "wrap" }}>
                    <span>Plotted:</span>
                    {_.split(panel.testParams.ca_tag_left, ";").map(t => <ConditionApplicationsView key={`l-${t}`} tag={t} />)}
                    <span>vs</span>
                    {_.split(panel.testParams.ca_tag_right, ";").map(t => <ConditionApplicationsView key={`r-${t}`} tag={t} />)}
                </div> : null}
        </Card>
    )
}


function CompareVolcanoCharts({ panels, volcano, isFetching, errorQuery, favoriteProteinSelection, markedProteinList,
    onToggleProteinLabel, onLabelProteinList, onMarkProteinList, onRemoveAllLabels,
    proteinTagMap, proteinIsLoading, proteinSearchResults, setRequiredProteinTags }) {

    const { data, suffixes, selection, panelBySuffix, rawStats } = volcano

    const numericKeyNames = _.isArray(data) && data.length > 0 ? _.keys(data[0]).filter(keyName => _.isNumber(data[0][keyName])) : []
    const extraLimits = useMemo(() => _.flatten(selection.map(s => [s.colorName, s.sizeName])).filter(k => _.isString(k) && numericKeyNames.includes(k)), [selection, numericKeyNames])
    const chartKeyNames = useMemo(() => suffixes.map((suffix, idx) => ({
        xaxisName: selection[idx].xaxisName,
        yaxisName: selection[idx].yaxisName
    })), [suffixes, selection])
    const isPointChart = useMemo(() => suffixes.map(() => true), [suffixes])

    const externalLabelResult = useMemo(() => {
        const values = _.uniq(favoriteProteinSelection?.values || [])
        return { values, trigger: values.join("|"), key: "tag" }
    }, [favoriteProteinSelection])

    const passOnProps = useMemo(() => ({ setRequiredProteinTags, proteinTagMap, proteinIsLoading }), [setRequiredProteinTags, proteinTagMap, proteinIsLoading])

    return (
        <div
            className="div--expand flex flex--wrap"
            style={{ overflowY: "auto", maxHeight: "90vh", gap: "0.5rem", margin: "1rem", alignContent: "flex-start" }}>
            {isFetching ? <Loading /> : null}
            {errorQuery ?
                <Callout intent="danger" title="Error in volcano plot generation" className="margin--medium">
                    <APIError error={errorQuery.error} />
                </Callout> : null}
            {suffixes.length > 0 ?
                <div className="flex center-items" style={{ gap: "0.5rem" }}>
                    <span className="font-size--small">Download comparison:</span>
                    <DownloadData
                        elements={[data, ...suffixes.map((suffix, idx) => `compare-volcano-${idx}`)]}
                        elementTypes={["data", ...suffixes.map(() => "svg")]}
                        elementNames={[
                            `Merged data of all ${suffixes.length} volcano plot(s)`,
                            ...suffixes.map(suffix => `SVG plot ${suffix}`)
                        ]}
                        fileNames={[
                            "compare-volcano-plots-data.txt",
                            ...suffixes.map((suffix, idx) => `compare-volcano-plot-${idx + 1}.svg`)
                        ]}
                        itemIsAttribute={false} />
                </div> : null}
            <InteractiveChart
                data={data}
                extraLimitNames={extraLimits}
                externalSearchResult={proteinSearchResults}
                externalLabelResult={externalLabelResult}
                keyNames={chartKeyNames}
                isPointChart={isPointChart}
                passOnProps={passOnProps}
                labelIndicesKey="compareVolcanoLabelIndices"
                labelIndicesDataKey="compare"
            >
                {(chartData) => chartData.map(({
                    data: chartRows,
                    chartIdx,
                    xaxisName,
                    yaxisName,
                    valid,
                    limits,
                    findDataInRectangle,
                    setHoverDataInRectangle,
                    findClosestPoint,
                    hoverProps,
                    filterProps,
                    labelProps,
                    externalHoverProps,
                    externalLabelProps,
                    triggerResetAxis,
                    chartIsZoomed,
                    onZoomedChange,
                    setTriggerResetAxisZoom,
                    setRequiredProteinTags: setRequiredTags,
                    proteinTagMap: tagMap,
                    proteinIsLoading: tagMapIsLoading
                }, didx) => {
                    const suffix = suffixes[chartIdx]
                    const panel = panelBySuffix[chartIdx]
                    if (!_.isString(suffix) || !_.isObject(panel)) return null

                    const plotWidth = 500
                    const plotHeight = 480
                    const yAxisLabel = `-log10 p-value ${suffix}`
                    const estimatedLabelWidth = yAxisLabel.length * 6.5
                    const labelWrapWidth = 0.8 * (plotHeight - 10 - 100)
                    const wrappedLabelLines = Math.max(1, Math.ceil(estimatedLabelWidth / labelWrapWidth))
                    const yAxisLabelExtraMargin = (wrappedLabelLines - 1) * 13

                    return (
                        <Card
                            compact={true}
                            style={{ width: `${plotWidth + 100}px`, maxWidth: "750px", height: "500px", position: "relative" }}
                            key={chartIdx}>
                            <div className="flex center-items" style={{ gap: "0.4rem" }}>
                                <span className="font-weight--bold">{panel.submission_tag}</span>
                                <VolcanoListButton
                                    data={data}
                                    suffix={suffix}
                                    submission_tag={panel.submission_tag}
                                    proteinTagMap={tagMap}
                                    setRequiredProteinTags={setRequiredTags}
                                    favoriteProteinSelection={favoriteProteinSelection}
                                    onToggleProteinLabel={onToggleProteinLabel}
                                    onLabelProteinList={onLabelProteinList}
                                    markedProteinTags={markedProteinList?.values ?? []}
                                    onMarkProteinList={onMarkProteinList}
                                    onRemoveAllLabels={onRemoveAllLabels} />
                                <DownloadData
                                    elements={[`compare-volcano-${chartIdx}`, rawStats[chartIdx] ?? []]}
                                    elementTypes={["svg", "data"]}
                                    elementNames={["SVG", `Data (${(rawStats[chartIdx] ?? []).length} rows)`]}
                                    fileNames={[`${panel.submission_tag}-VolcanoPlot.svg`, `${panel.submission_tag}-VolcanoPlot-Data.txt`]}
                                    itemIsAttribute={false} />
                            </div>
                            {_.isObject(panel.testParams) ?
                                <div className="font-size--smallest flex center-items" style={{ gap: "0.3rem", flexWrap: "wrap" }}>
                                    {_.split(panel.testParams.ca_tag_left, ";").map(t => <ConditionApplicationsView key={`l-${chartIdx}-${t}`} tag={t} />)}
                                    <span>vs</span>
                                    {_.split(panel.testParams.ca_tag_right, ";").map(t => <ConditionApplicationsView key={`r-${chartIdx}-${t}`} tag={t} />)}
                                </div> : null}
                            <ScatterPlot
                                key={`compare-volcano-plot-${chartIdx}`}
                                {...{
                                    chartIdx,
                                    width: plotWidth,
                                    height: plotHeight,
                                    margins: {
                                        left: 50 + yAxisLabelExtraMargin,
                                        top: 10,
                                        right: 5,
                                        bottom: 100
                                    },
                                    colorName: selection[didx].colorName,
                                    sizeName: selection[didx].sizeName,
                                    data: chartRows,
                                    valid,
                                    centerXAxisAtZero: true,
                                    findDataInRectangle,
                                    setHoverDataInRectangle,
                                    findClosestPoint,
                                    xaxisName,
                                    yaxisName,
                                    limits,
                                    tooltipSmall: true,
                                    tooltipNames: ["tag"],
                                    ...hoverProps,
                                    ...filterProps,
                                    ...labelProps,
                                    ...externalHoverProps,
                                    ...externalLabelProps,
                                    legend: true,
                                    legendWithAttributes: false,
                                    svgID: `compare-volcano-${chartIdx}`,
                                    triggerResetAxis,
                                    onZoomedChange,
                                    setTriggerResetAxisZoom,
                                    annotationMarkers: [],
                                    proteinTagMap: tagMap,
                                    setRequiredProteinTags: setRequiredTags,
                                    proteinIsLoading: tagMapIsLoading,
                                    labelIsProtein: true
                                }} />
                        </Card>
                    )
                })}
            </InteractiveChart>
        </div>
    )
}


/**
 * @description Cross-submission volcano plot comparison. The user selects a submission and a
 * pairwise condition application comparison (the same flow as the submission volcano view),
 * then adds further submissions - restricted to the same proteome as the first submission -
 * and all selected volcano plots are shown side by side with shared axes for comparison.
 */
export function CompareVolcano() {
    const [panels, setPanels] = useState([{ id: nextPanelId(), submission_tag: undefined, testParams: undefined }])
    const [proteomesByPanelId, setProteomesByPanelId] = useState({})
    const [requiredProteinTags, setRequiredProteinTags] = useState([])
    const [favoriteProteinSelection, setFavoriteProteinSelection] = useState({ values: [], trigger: undefined, key: "tag" })
    const [markedProteinList, setMarkedProteinList] = useState({ values: [], trigger: undefined, key: "tag" })

    const handleUpdatePanel = (id, update) => {
        setPanels(prevValues => prevValues.map(p => p.id === id ? { ...p, ...update } : p))
    }
    const handleRemovePanel = (id) => {
        setPanels(prevValues => prevValues.filter(p => p.id !== id))
        setProteomesByPanelId(prevValues => {
            const next = { ...prevValues }
            delete next[id]
            return next
        })
    }
    const handleAddPanel = () => {
        setPanels(prevValues => [...prevValues, { id: nextPanelId(), submission_tag: undefined, testParams: undefined }])
    }
    const handleProteomes = (id, proteomeTags) => {
        setProteomesByPanelId(prevValues => {
            const current = prevValues[id] ?? []
            if (_.isEqual(current, proteomeTags)) return prevValues
            return { ...prevValues, [id]: proteomeTags }
        })
    }

    const handleFavoriteSelect = (proteinTag) => {
        setFavoriteProteinSelection(prevValues => ({ ...prevValues, values: addStringToArrayOrRemove({ array: prevValues.values, string: proteinTag }), trigger: Math.random() }))
    }
    const handleLabelProteinList = (proteinTags) => {
        if (!_.isArray(proteinTags) || proteinTags.length === 0) return
        setFavoriteProteinSelection(prevValues => ({ ...prevValues, values: _.uniq([...prevValues.values, ...proteinTags]), trigger: Math.random() }))
    }
    const handleMarkProteinList = (proteinTags) => {
        if (!_.isArray(proteinTags)) return
        setMarkedProteinList(prevValues => {
            const isToggleOff = prevValues.values.length === proteinTags.length && _.difference(prevValues.values, proteinTags).length === 0
            return { values: isToggleOff ? [] : proteinTags, trigger: Math.random(), key: "tag" }
        })
    }
    const handleRemoveAllLabels = () => {
        setFavoriteProteinSelection(prevValues => ({ ...prevValues, values: [], trigger: Math.random() }))
    }

    const { plottablePanels, testParamsList, referenceTag, referenceProteomes } = useMemo(() => {
        const firstWithSubmission = panels.find(p => _.isString(p.submission_tag))
        const refProteomes = firstWithSubmission ? (proteomesByPanelId[firstWithSubmission.id] ?? []) : []
        const plottable = panels
            .filter(p => _.isString(p.submission_tag) && _.isObject(p.testParams) && !_.isEmpty(_.omit(p.testParams, "_nonce")))
            .filter(p => !firstWithSubmission || p.id === firstWithSubmission.id || refProteomes.length === 0
                || (proteomesByPanelId[p.id] ?? []).some(t => refProteomes.includes(t)))
        return {
            plottablePanels: plottable,
            testParamsList: plottable.map(p => ({ tag: p.submission_tag, ..._.omit(p.testParams, "_nonce") })),
            referenceTag: firstWithSubmission?.submission_tag,
            referenceProteomes: refProteomes
        }
    }, [panels, proteomesByPanelId])

    const { isReady, tagQueries } = usePrefetchVolcanoData(testParamsList)
    const isFetching = testParamsList.length > 0 && !isReady
    const errorQuery = _.isArray(tagQueries) ? tagQueries.find(q => q.isError) : undefined

    const volcano = useMemo(() => {
        const suffixes = [], selection = [], panelBySuffix = [], rawStats = [], merged = new Map()
        if (isReady && _.isArray(tagQueries)) {
            tagQueries.forEach((q, idx) => {
                const panel = plottablePanels[idx]
                if (!panel || !q.isSuccess || !_.isObject(q.data) || !_.isArray(q.data.stats)) return
                const backendSuffix = _.isString(q.data.suffix) ? q.data.suffix : `plot ${idx + 1}`
                const suffix = `${panel.submission_tag} (${backendSuffix})`
                q.data.stats.forEach(row => {
                    if (!_.isObject(row) || !_.isString(row.tag)) return
                    const existing = merged.get(row.tag) || { tag: row.tag }
                    existing[log2FCFieldName(suffix)] = row[log2FCFieldName(backendSuffix)]
                    existing[pValueFieldName(suffix)] = row[pValueFieldName(backendSuffix)]
                    existing[significantFieldName(suffix)] = row[significantFieldName(backendSuffix)]
                    merged.set(row.tag, existing)
                })
                suffixes.push(suffix)
                panelBySuffix.push(panel)
                rawStats.push(q.data.stats)
                selection.push({
                    xaxisName: log2FCFieldName(suffix),
                    yaxisName: pValueFieldName(suffix),
                    colorName: significantFieldName(suffix),
                    tooltipNames: [],
                    sizeName: undefined,
                    filterSetNames: []
                })
            })
        }
        const allKeys = _.uniq(["tag", ...suffixes.flatMap(suffix => [log2FCFieldName(suffix), pValueFieldName(suffix), significantFieldName(suffix)])])
        const data = Array.from(merged.values()).map(row => _.fromPairs(allKeys.map(key => [key, row[key]])))
        return { data, suffixes, selection, panelBySuffix, rawStats }
    }, [isReady, tagQueries, plottablePanels])

    return (
        <div className="div--expand flex">
            <div className="padding--medium" style={{ height: "90vh", overflowY: "auto", minWidth: "340px", maxWidth: "460px" }}>
                <h2>Compare volcano plots</h2>
                <span>Select a submission and define a pairwise comparison to plot its volcano plot. Then add further submissions of the same proteome (two or more plots can be compared) and plot their volcano plots as well - all plots are shown side by side for comparison.</span>
                {panels.map((panel, idx) => (
                    <PanelSetup
                        key={panel.id}
                        panel={panel}
                        index={idx}
                        referenceTag={referenceTag}
                        referenceProteomes={referenceProteomes}
                        isFetching={isFetching}
                        onUpdate={handleUpdatePanel}
                        onRemove={handleRemovePanel}
                        onProteomes={handleProteomes}
                        canRemove={panels.length > 1} />
                ))}
                <Button icon="plus" variant="minimal" className="margin-top--little" onClick={handleAddPanel}>
                    Add another volcano plot
                </Button>
            </div>
            <div className="div--expand">
                {plottablePanels.length > 0 ?
                    <WithTagMaps
                        Component={CompareVolcanoCharts}
                        protein_tags={requiredProteinTags}
                        showProteinSearch={true}
                        proteinSearchProps={{ submission_tag: plottablePanels[0].submission_tag }}
                        searchExtra={volcano.suffixes.length > 1 ?
                            ({ proteinTagMap }) => (
                                <VolcanoCompareButton
                                    data={volcano.data}
                                    suffixes={volcano.suffixes}
                                    submission_tag={plottablePanels[0].submission_tag}
                                    submission_tags={plottablePanels.map(p => p.submission_tag)}
                                    proteinTagMap={proteinTagMap}
                                    setRequiredProteinTags={setRequiredProteinTags}
                                    favoriteProteinSelection={favoriteProteinSelection}
                                    onToggleProteinLabel={handleFavoriteSelect}
                                    onLabelProteinList={handleLabelProteinList}
                                    markedProteinTags={markedProteinList.values}
                                    onMarkProteinList={handleMarkProteinList}
                                    onRemoveAllLabels={handleRemoveAllLabels} />
                            ) : null}
                        {...{
                            panels: plottablePanels,
                            volcano,
                            isFetching,
                            errorQuery,
                            favoriteProteinSelection,
                            markedProteinList,
                            onToggleProteinLabel: handleFavoriteSelect,
                            onLabelProteinList: handleLabelProteinList,
                            onMarkProteinList: handleMarkProteinList,
                            onRemoveAllLabels: handleRemoveAllLabels,
                            setRequiredProteinTags
                        }} /> :
                    <NonIdealState
                        icon="comparison"
                        title="No volcano plot selected"
                        description="Select a submission on the left and confirm a pairwise comparison with 'Plot volcano' to show its volcano plot here. Add further submissions of the same proteome to compare two or more plots." />
                }
            </div>
        </div>
    )
}
