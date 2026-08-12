import _, { values } from "lodash"
import InteractiveChart from "../../core/charts/interactive"
import { useOutletContext } from "react-router"
import { Network } from "../../core/charts/scatter/Network"
import { useState, useEffect, useMemo, useRef } from "react"
import APIError from "../../core/error/APIerror"
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection"
import { api } from "@/api";
import { AnnotationGroupSelectionMenu } from "./AnnotationGroupSelection"
import { ConditionApplicationSelection } from "../../core/base/attribute_selection/Pairwise"
import { PersistentCollapse } from "@/comps/core/base/collapse/Collapse"
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette"
import { getItemFromLocalStorage, saveInLocalStorage } from "@/services/localstorage"
import { AnnotationMapDistribution } from "./AnnotationMapDistribution"

export function MitomapNetwork({ }) {

    const { submission_tag } = useOutletContext() 
    const [networkProps, setNetworkProps] = useState({ type: "pathway", comp_type: "pairwise", statProps: {} })
    const [selectedAnnotationGroupTag, setSelectedAnnotationGroupTag] = useState(undefined)
    const [pairwiseTestParams, setPairwiseTestParams] = useState(undefined)
    const [pairwiseOpen, setPairwiseOpen] = useState(true)
    
    const [pairwiseResetKey, setPairwiseResetKey] = useState(0)
    const [hoverDistribution, setHoverDistribution] = useState({ tag: undefined, tagType: undefined, markerValue: undefined, markerLabel: undefined })
    const appliedParamsRef = useRef(null)
    const [log2FCAppliedMessage, setLog2FCAppliedMessage] = useState(false)
    const { data : network_data, isLoading, isFetching, isSuccess, isError, error } = api.submissions.analysis.useGetSubmissionAnnotationNetwork({
        tag: submission_tag, 
        annotation_group_tag: selectedAnnotationGroupTag
    }, {
        enabled: !_.isEmpty(submission_tag) && _.isString(selectedAnnotationGroupTag),
        staleTime: 60000
    })

    const { data: volcanoData, isSuccess: volcanoIsSuccess, isLoading: volcanoIsLoading, isFetching: volcanoIsFetching} = api.submissions.analysis.useGetSubmissionVolcano({
        tag: submission_tag,
        ca_tag_left: pairwiseTestParams?.ca_tag_left,
        ca_tag_right: pairwiseTestParams?.ca_tag_right,
        within_attribute_tags: pairwiseTestParams?.within_attribute_tags,
        within_ca_tags: pairwiseTestParams?.within_ca_tags
    }, {
        enabled: _.isObject(pairwiseTestParams) && _.isString(pairwiseTestParams?.ca_tag_left) && _.isString(pairwiseTestParams?.ca_tag_right),
        staleTime: 60000
    })

    const log2FCApplying = _.isObject(pairwiseTestParams) && (volcanoIsLoading || volcanoIsFetching)
    const log2FCFieldName = volcanoIsSuccess && _.isObject(volcanoData) ? `log2FC ${volcanoData.suffix}` : undefined

    const log2FCByTag = useMemo(() => {
        if (!volcanoIsSuccess || !_.isObject(volcanoData) || !_.isArray(volcanoData.stats)) return {}
        const map = {}
        volcanoData.stats.forEach(row => {
            const value = row[log2FCFieldName] ?? row["log2FC"]
            const proteinTagsInGroup = _.isString(row.tag) ? row.tag.split(";") : [row.tag]
            proteinTagsInGroup.forEach(proteinTag => {
                map[proteinTag] = value
            })
        })
        return map
    }, [volcanoIsSuccess, volcanoData])

    const [selection, setSelection] = useState({ xaxisName: "x", yaxisName: "y", colorName : "node_type", tooltipNames : ["tag"], sizeName : undefined, textSearchNames : ["tag"] })
    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => {return {...prevValues,[selectionKey] : keyName}})
    }

    const handleAnnotationGroupSelection = (e, tag) => {
        setSelectedAnnotationGroupTag(tag)
        setPairwiseTestParams(undefined)
        appliedParamsRef.current = null
        setLog2FCAppliedMessage(false)
        setSelection(prev => ({ ...prev, colorName: "node_type" }))
    }

    const handlePairwiseConfirm = (props) => {
        setLog2FCAppliedMessage(false)
        const testParams = { ...props, tag: submission_tag }
        setPairwiseTestParams(testParams)

        const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: "volcanoProps", parseJson: true })
        saveInLocalStorage({
            itemName: "volcanoProps", itemValue: JSON.stringify({
                ...itemValue,
                [submission_tag]: itemFound && _.isObject(itemValue) && _.has(itemValue, submission_tag)
                    ? _.concat(itemValue[submission_tag], testParams)
                    : [testParams]
            })
        })
    }

    const network_dataValid = isSuccess && _.isObject(network_data) && _.has(network_data, "nodes")

    const enrichedNodes = useMemo(() => {
        if (!network_dataValid) return []
        return network_data.nodes.map(node => {
            if (!log2FCFieldName || node.type !== "protein") return node
            return { ...node, [log2FCFieldName]: log2FCByTag[node.tag] }
        })
    }, [network_dataValid, network_data, log2FCFieldName, log2FCByTag])

    const numericKeyNames = network_dataValid ? _.filter(_.keys(network_data.nodes[0]), keyName => _.isNumber(network_data.nodes[0][keyName])) : []
    const extraLimitNames = log2FCFieldName ? _.uniq([...numericKeyNames, log2FCFieldName]) : numericKeyNames

    useEffect(() => {
        if (!volcanoIsSuccess || !log2FCFieldName || !_.isObject(pairwiseTestParams)) return

        const paramsKey = JSON.stringify(pairwiseTestParams)
        if (appliedParamsRef.current === paramsKey) return
        appliedParamsRef.current = paramsKey

        setSelection(prev => ({ ...prev, colorName: log2FCFieldName }))
        setPairwiseOpen(false)
        setPairwiseResetKey(prev => prev + 1)

        setLog2FCAppliedMessage(true)
    }, [volcanoIsSuccess, log2FCFieldName, pairwiseTestParams])

    if (isLoading || isFetching) {
        return <div>Loading...</div>
    }

    return (<div className="div--expand flex" style={{ alignContent: "flex-start" }}>
        <div className="padding--medium" style={{ width: "400px", flexShrink: 0, height: "90vh", overflowY: "auto" }}>
            <h4>Select Annotation Group</h4>
            <AnnotationGroupSelectionMenu 
                selected_tags={_.isString(selectedAnnotationGroupTag) ? [selectedAnnotationGroupTag] : []} 
                onSelection={handleAnnotationGroupSelection}
                showTags={true}
                placeholder="Select annotation group..."
            />

            {selectedAnnotationGroupTag ? (
                <div className="margin-bottom--little" style={{ marginTop: "1rem" }}>
                    <button className="basic-button div--expand margin--little" style={pairwiseOpen ? { backgroundColor: HIGHLIGHT_COLOR, color: "white" } : {}}
                        onClick={() => setPairwiseOpen(prev => !prev)}>
                        <span>Pairwise Comparison</span>
                    </button>
                    <PersistentCollapse isOpen={pairwiseOpen} direction="vertical" duration={0.65}>
                        <div className="padding--medium" style={{ overflowX: "auto" }}>
                            <div style={{ minWidth: "600px" }}>
                                <ConditionApplicationSelection
                                    key={pairwiseResetKey}
                                    submission_tag={submission_tag}
                                    onConfirm={handlePairwiseConfirm}
                                    reset_after_confirm={false}
                                    isLoadingData={log2FCApplying}
                                    showTable={true}
                                    showAnnotationSubset={false}
                                />
                                {log2FCAppliedMessage ? (
                                    <div className="margin--little">Log2 fold change applied</div>
                                ) : null}
                            </div>
                        </div>
                    </PersistentCollapse>
                </div>
            ) : null}

            {hoverDistribution.tag ? (
                <div className="margin--medium">
                    {_.isObject(pairwiseTestParams) && !_.isEmpty(pairwiseTestParams) ? (
                        <>
                    <span>Distribution of hovered annotation in samples:</span>
                    <AnnotationMapDistribution
                        submission_tag={submission_tag}
                        tag={hoverDistribution.tag}
                        tagType={hoverDistribution.tagType}
                        activeTestParam={pairwiseTestParams}
                        markerValue={hoverDistribution.markerValue}
                        markerLabel={hoverDistribution.markerLabel}
                    />
                        </>
                    ) : (
                        <span>Select a pairwise comparison above to view the distribution of the hovered annotation.</span>
                    )}
                </div>
            ) : null}
        </div>

        <div className="div--expand" style={{ overflowY: "scroll" }}>
            {!selectedAnnotationGroupTag ? (
                <div className="center-items" style={{ padding: "2rem" }}>
                    <span>Select an annotation group to view the network</span>
                </div>
            ) : (
                <>
                    {isError ? <APIError error={error}/> : null}

                    {network_dataValid ? 
                        <InteractiveChart
                            data={enrichedNodes}
                            extraLimitNames={extraLimitNames}
                            dataName={networkProps.type}
                            keyNames={[{ xaxisName: "x", yaxisName: "y" }]}
                            isPointChart={[true]}>
                            {
                                (chartData) => chartData.map(({
                                    data, chartIdx, xaxisName, yaxisName, valid, limits,
                                    findDataInRectangle, setHoverDataInRectangle, findClosestPoint,
                                    handleStringSearch, handleSearchByDataIndex, filterDataInKeyByValue,
                                    hoverProps, filterProps, labelProps, rerenderAxis,
                                    triggerResetAxis, setTriggerResetAxisZoom
                                }, didx) => {
                                return (
                                    <div key={chartIdx}>
                                        <ScatterDataSelection
                                            keyNames={_.keys(enrichedNodes[0])}
                                            {...{
                                                title : "Annotation Group Network",
                                                numericKeyNames: extraLimitNames,
                                                itemIsAttribute : false,    
                                                idx: 1,
                                                chartIdx,
                                                setTriggerResetAxisZoom,
                                                selection,
                                                setSelection : handleScatterSelection,
                                                showAxisSelection: false,
                                                showMarksSelection: true,
                                                downloadElements: ["network-scatter" + networkProps.type, enrichedNodes],
                                                elementNames: ["SVG","DIVIDER",`Nodes (n = ${enrichedNodes.length})`],
                                                fileNames: [`${submission_tag}-MitoMap.svg`,`${submission_tag}-Mitomap.txt`],
                                                elementTypes: ["svg", "data"]
                                            }} />
                                        <Network key={`${chartIdx}`}{...{
                                            width: 1100, height : 1100, chartIdx,
                                            colorName: selection.colorName,
                                            sizeName: undefined,
                                            data,
                                            linkIdcs : network_data.links,
                                            activeTestParam: pairwiseTestParams,
                                            submission_tag,
                                            activeAnnotationTag: selectedAnnotationGroupTag,
                                            onHoverDistributionChange: setHoverDistribution,
                                            valid, findDataInRectangle, setHoverDataInRectangle,
                                            xaxisName, yaxisName, limits, rerenderAxis, findClosestPoint,
                                            tooltipSmall : true,
                                            tooltipNames: ["tag"],
                                            tooltipNameIsNumeric: {},
                                            labelNames : ["tag"],
                                            dataRerender : [networkProps.type, selectedAnnotationGroupTag, selection.colorName],
                                            ...hoverProps, ...filterProps, ...labelProps,
                                            triggerResetAxis, setTriggerResetAxisZoom,
                                            tooltipNameIsFeature: { "tag": true },
                                            legend: true,
                                            handleSearchByDataIndex, filterDataInKeyByValue,
                                            svgID : "network-scatter" + networkProps.type
                                        }} />
                                    </div>)
                                })}
                            </InteractiveChart> : null}
                </>
            )}
        </div>
    </div>)
}


