
import _ from "lodash"
import { useEffect, useMemo, useState } from "react";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { Card } from "@blueprintjs/core";
import { addStringToArrayIfNotPresent, isItemInArrayDeepComp } from "../../../services/arrays/transforms";
import { arrayOfObjectsToObjectByProperty } from "../../../services/arrays/groupby";
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection";
import { api } from "@/api";
import { RemoveButton } from "@/comps/core/base/buttons/RemoveButton";
import { getItemFromLocalStorage, saveInLocalStorage } from "@/services/localstorage";
import { usePrefetchVolcanoData } from "@/api/orchestrated/volcanoData";
import { VolcanoListButton } from "./SignificantProteins";
import { useAnnotationProteinSets, useAnnotationTexts } from "@/api/orchestrated/annotationProteins";



export function VolcanoDataHandler({
        submission_tag,
        selectedTestParams,
        setIsFetching,
        onError,
        hiddenSuffix,
        setHiddenSuffix,
        setRequiredProteinTags,
        proteinTagMap,
        volcanoData,
        setVolcanoData,
        proteinIsLoading,
        proteinSearchResults,
        onToggleProteinLabel,
        onLabelProteinList,
        onMarkProteinList,
        onRemoveAllLabels,
        markedAnnotations,
        markedProteinList,
        proteinHoverResults,
        favoriteProteinSelection,
        favoriteAnnotationSelection,
        annotationHoverResults,
        showHoverLabels = false,
        }) {

    
    
    
    const [annotationMarkers, setAnnotationMarkers] = useState([])

    const markedAnnotationTags = _.isArray(markedAnnotations) ? markedAnnotations.map(m => m.tag) : []
    const { proteinTagsByAnnotation } = useAnnotationProteinSets({ submission_tag, annotation_tags: markedAnnotationTags })
    const { textByAnnotation } = useAnnotationTexts(markedAnnotationTags)

    // color data points of marked annotations: the first marked annotation containing a protein of the group wins
    const dataWithMarkedAnnotationColors = useMemo(() => {
        if (!_.isArray(markedAnnotations) || markedAnnotations.length === 0) return volcanoData.data
        if (!_.isArray(volcanoData.data)) return volcanoData.data
        return volcanoData.data.map(row => {
            const tags = _.isString(row.tag) ? row.tag.split(";") : []
            for (const { tag, color } of markedAnnotations) {
                const proteinSet = proteinTagsByAnnotation.get(tag)
                if (proteinSet instanceof Set && tags.some(t => proteinSet.has(t))) {
                    return { ...row, annotation_color: color }
                }
            }
            return row
        })
    }, [volcanoData.data, markedAnnotations, proteinTagsByAnnotation])

    const markedAnnotationMarkers = useMemo(() => (_.isArray(markedAnnotations) ? markedAnnotations
        .filter(m => proteinTagsByAnnotation.get(m.tag) instanceof Set)
        .map(({ tag, color }) => ({
            annotationTags: [tag],
            annotationNames: [textByAnnotation.get(tag)],
            color,
            proteinTags: [...proteinTagsByAnnotation.get(tag)]
        })) : []), [markedAnnotations, proteinTagsByAnnotation, textByAnnotation])
    const [prefetchedTestParams, setPrefetchedTestParams] = useState([])
    const { isReady, tagQueries } = usePrefetchVolcanoData(prefetchedTestParams, { enabled: _.isObject(prefetchedTestParams) && _.isArray(prefetchedTestParams) && prefetchedTestParams.length > 0 })
       

    useEffect(() => {
        if (volcanoData.suffixes.length > 0) return //already have data, no need to wait for prefetching, and don't want to overwrite existing data with prefetching results
        if (isReady && _.isArray(tagQueries) && tagQueries.length > 0) {
            const seenSuffixes = new Set()
            const uniquePairs = []
            prefetchedTestParams.forEach((testParams, idx) => {
                const q = tagQueries[idx]
                if (!_.isObject(q?.data) || !_.isString(q.data.suffix) || seenSuffixes.has(q.data.suffix)) return
                seenSuffixes.add(q.data.suffix)
                uniquePairs.push({ testParams, query: q })
            })
            if (uniquePairs.length === 0) return

            const arrays = uniquePairs.map(({ query }) => query.data.stats)
            const updatedData = Array.from(
            arrays
                .flat()
                .reduce((map, obj) => {
                const existing = map.get(obj.tag) || {};

                map.set(obj.tag, {
                    ...existing,
                    ...obj
                });

                return map;
                }, new Map())
                .values()
            );

            const { itemFound, itemValue } = getItemFromLocalStorage({ itemName : "volcanoLabelIndices", parseJson : true }) // we want to keep the same labeled indices when prefetching data, so we need to get the labeled indices from local storage and save them again after we have the prefetching results, to trigger a rerender of the charts with the new data but the same labeled indices
            const labelIndices = itemFound && _.isObject(itemValue) && _.has(itemValue, submission_tag) ? new Set(itemValue[submission_tag]) : new Set()
            const suffixes = uniquePairs.map(({ query }) => query.data.suffix)
            const selection = uniquePairs.map(({ query }) => { return { xaxisName: `log2FC ${query.data.suffix}`, yaxisName: `-log10 p-value ${query.data.suffix}`, colorName: `Significant ${query.data.suffix}`, tooltipNames: [], sizeName: undefined } })
            const testParams = uniquePairs.map(({ testParams }) => testParams)
     
            setVolcanoData(prevValues => {
                return {
                    ...prevValues,
                    data: updatedData,
                    initialLabelIndices: labelIndices,
                    suffixes,
                    testParams,
                    selection
                }
            })
        }
    }, [isReady, tagQueries])



    const { data: selectedAnnotationProteins } = api.annotations.queryAnnotations.useGetProteinsByAnnotation(
        { tag: favoriteAnnotationSelection?.values?.[0] },
        { enabled: !!favoriteAnnotationSelection?.values?.[0] && showHoverLabels, staleTime: Infinity }
    )
    const { data: hoveredAnnotationProteins } = api.annotations.queryAnnotations.useGetProteinsByAnnotation(
        { tag: annotationHoverResults?.values?.[0] },
        { enabled: !!annotationHoverResults?.values?.[0], staleTime: Infinity }
    )
        
    const handleError = (error) => {
        setIsFetching(false)
        onError({ isOpen: true, message: error })
        }
    
    //fetch data
    const { data: testData, isSuccess, refetch } = api.submissions.analysis.useGetSubmissionVolcano({
        tag: submission_tag,
        ca_tag_left: selectedTestParams.ca_tag_left,
        ca_tag_right: selectedTestParams.ca_tag_right,
        annotation_tag: selectedTestParams.annotation_tag,
        within_attribute_tags: selectedTestParams.within_attribute_tags,
        within_ca_tags: selectedTestParams.within_ca_tags
    }, {
        enabled: false,
        staleTime: Infinity,
        onError: handleError
    })


    useEffect(() => {
        const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: "volcanoProps", parseJson: true })
        if (itemFound && _.isObject(itemValue) && _.has(itemValue, submission_tag)) {
            const storedParams = _.uniqWith(
                itemValue[submission_tag].map(item => _.omit(item, "_nonce")),
                _.isEqual
            )
            setPrefetchedTestParams(storedParams)
        }
    }, [])


    useEffect(() => {
        if (isSuccess && _.isObject(testData) ) {
            handleSuccess(testData)
        }
    }, [isSuccess])
    
    const handleSuccess = (data) => {
        //merge data to get super fast split
        if (volcanoData.suffixes.includes(data.suffix)) return //already have this data, no need to merge again
        let updatedData = []
        let prevData = volcanoData.data
        if (prevData.length > 1) {
            let groupBy = arrayOfObjectsToObjectByProperty(data.stats, "tag")
            updatedData = prevData.map(entry => { return { ...entry, ...groupBy[entry.tag]} })
        }
        else {
            updatedData = data.stats
        }
        const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: "volcanoProps", parseJson: true })

        // Check if the item already exists to prevent duplicates
        const newItem = { ..._.omit(selectedTestParams, "_nonce"), tag: submission_tag }
        let updatedItems = [newItem]
        if (itemFound && _.isObject(itemValue) && _.has(itemValue, submission_tag)) {
            const existingItems = itemValue[submission_tag].map(item => _.omit(item, "_nonce"))
            updatedItems = _.uniqWith(_.concat(existingItems, newItem), _.isEqual)
        }

        saveInLocalStorage({
            itemName: "volcanoProps",
            itemValue: JSON.stringify({
                ...itemValue,
                [submission_tag]: updatedItems
            })
        })
        
        setIsFetching(false)
        setVolcanoData(prevValues => {
            return {
                ...prevValues,
                data: updatedData,
                suffixes : _.concat(prevValues.suffixes, data.suffix),
                testParams: _.concat(prevValues.testParams, _.omit(selectedTestParams, "_nonce")),
                selection: _.concat(prevValues.selection,
                    {
                    xaxisName: `log2FC ${data.suffix}`,
                    yaxisName: `-log10 p-value ${data.suffix}`,
                    colorName: `Significant ${data.suffix}`,
                    tooltipNames: [],
                    sizeName: undefined,
                    // textSearchNames: ["genes"],
                    filterSetNames: []
                    }
                )
            }
        })
    }
    

    const handleSelection = (idx,key,value) => {
        setVolcanoData(prevValues => {
            let selection = prevValues.selection
            selection[idx] = {...selection[idx], [key] : value}

            return {
                ...prevValues,
                selection,
        }})
    }

    const testParamsUpdate = _.isObject(selectedTestParams)  &&
        !_.isEmpty(selectedTestParams) &&
        !isItemInArrayDeepComp({ array: volcanoData.testParams, item: _.omit(selectedTestParams, "_nonce") })
    
    const handleHiddenSuffix = (suffix) => {
        setHiddenSuffix(prevValues => addStringToArrayIfNotPresent({ array: prevValues, string: suffix }))
    }
    
    const handleAnnotationSelect = async (annotationTags, color, proteinTags) => {
        console.log("Annotation selected:", { annotationTags, color, proteinCount: proteinTags.length })
        
        // Fetch annotation names
        const annotationNames = []
        for (const tag of annotationTags) {
            try {
                const response = await fetch(`/api/annotations/${tag}`)
                if (response.ok) {
                    const annotation = await response.json()
                    annotationNames.push(annotation.text || tag)
                } else {
                    annotationNames.push(tag)
                }
            } catch (err) {
                annotationNames.push(tag)
            }
        }
        
        const markerKey = annotationTags.sort().join(',') + '_' + color
        
        setAnnotationMarkers(prevMarkers => {
            const existingIndex = prevMarkers.findIndex(m => {
                const existingKey = m.annotationTags.sort().join(',') + '_' + m.color
                return existingKey === markerKey
            })
            
            if (existingIndex >= 0) {
                const updated = [...prevMarkers]
                updated[existingIndex] = { annotationTags, annotationNames, color, proteinTags }
                return updated
            } else {
                return [...prevMarkers, { annotationTags, annotationNames, color, proteinTags }]
            }
        })
    }
    
    
    useEffect(() => {
        if (testParamsUpdate) {
            setIsFetching(true)
            refetch()
        }
    }, [testParamsUpdate])
    
    useEffect(() => {setIsFetching(false)},[isSuccess])        
    
    const numericKeyNames = _.isArray(volcanoData.data) && volcanoData.data.length > 0 ? _.keys(volcanoData.data[0]).filter(keyName => _.isNumber(volcanoData.data[0][keyName])) : []
    const extraLimits = useMemo(() => _.flatten(_.keys(volcanoData.selection).map(k => [volcanoData.selection[k].colorName, volcanoData.selection[k].sizeName])).filter(k => _.isString(k) && numericKeyNames.includes(k)), [volcanoData.selection, numericKeyNames])

    const chartKeyNames = useMemo(() => volcanoData.suffixes.map((suffix, idx) => ({
        xaxisName: volcanoData.selection[idx].xaxisName,
        yaxisName: volcanoData.selection[idx].yaxisName
    })), [volcanoData.suffixes, volcanoData.selection])

    const isPointChart = useMemo(() => _.range(volcanoData.testParams.length).map(() => true), [volcanoData.testParams])

    const externalLabelResult = useMemo(() => {
        const values = _.uniq([...(favoriteProteinSelection?.values || []), ...(showHoverLabels && _.isArray(selectedAnnotationProteins) ? selectedAnnotationProteins : [])])
        return { values, trigger: values.join("|"), key: "tag" }
    }, [favoriteProteinSelection, selectedAnnotationProteins, showHoverLabels])

    const externalHoverResult = useMemo(() => {
        const values = _.uniq([...(proteinHoverResults?.values || []), ...(markedProteinList?.values || []), ...(hoveredAnnotationProteins ?? [])])
        return { values, trigger: values.join("|"), key: "tag" }
    }, [proteinHoverResults, markedProteinList, hoveredAnnotationProteins])

    const passOnProps = useMemo(() => ({ setRequiredProteinTags, proteinTagMap, proteinIsLoading, showHoverLabels }), [setRequiredProteinTags, proteinTagMap, proteinIsLoading, showHoverLabels])


    return (
        <div
            className="div--expand flex flex--wrap"
            style={{
                overflowY: "auto",
                maxHeight: "90vh",
                gap: "0.5rem",
                marginLeft: "2rem"
            }}> 

        <InteractiveChart
                data={dataWithMarkedAnnotationColors}
                extraLimitNames={extraLimits}
                externalSearchResult={proteinSearchResults}
                externalLabelResult={externalLabelResult}
                externalHoverResult={externalHoverResult}
                keyNames={chartKeyNames}
                isPointChart={isPointChart}
                passOnProps={passOnProps}
                labelIndicesKey="volcanoLabelIndices"
                labelIndicesDataKey={submission_tag}
                initialLabelIndices={volcanoData.initialLabelIndices}
            >
                {
                    /**
                     * 
                     * @param {import("../../../types/charts").InteractiveChartResponse[]} chartData 
                     * @returns 
                     */
                    (chartData) => chartData.map(({
                        data,
                        chartIdx,
                        xaxisName,
                        yaxisName,
                        valid,
                        limits,
                        findDataInRectangle,
                        setHoverDataInRectangle,
                        handleSearchByDataIndex,
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
                        setRequiredProteinTags,
                        proteinTagMap,
                        proteinIsLoading,
                        showHoverLabels
                    }, didx) => {
                            if (hiddenSuffix.includes(volcanoData.suffixes[chartIdx])) return null // this suffix is hidden, don't render the chart

                            // the annotation markers are shown in the AnnotationLegend below the chart,
                            // so no extra right margin is needed for them
                            const chartSuffix = _.isString(volcanoData.suffixes[chartIdx]) ? volcanoData.suffixes[chartIdx] : ""
                            const plotWidth = 500

                            // the y-axis label wraps at 0.8 * chartHeight (see XYaxis in @mitocube/viz); a wrapped
                            // label needs additional left margin so it is not clipped by the SVG edge.
                            const plotHeight = 480
                            const yAxisLabel = `-log10 p-value ${chartSuffix}`
                            const estimatedLabelWidth = yAxisLabel.length * 6.5
                            const labelWrapWidth = 0.8 * (plotHeight - 10 - 100)
                            const wrappedLabelLines = Math.max(1, Math.ceil(estimatedLabelWidth / labelWrapWidth))
                            const yAxisLabelExtraMargin = (wrappedLabelLines - 1) * 13

                            return (
                                <Card
                                    compact={true}
                                    style={{ width: `${plotWidth + 100}px`, maxWidth: "750px", height: "500px", position: "relative" }}
                                    key={chartIdx}>
                                    
                                    <div style={{ position: "absolute", right: 5, top: 5 }} className="flex center-items">
                                        <RemoveButton
                                            onRemove={() => handleHiddenSuffix(volcanoData.suffixes[chartIdx])} />
                                    </div>
                                    <div className="flex center-items">
                                    {_.isArray(volcanoData.data) && volcanoData.data.length > 0 && _.isObject(volcanoData.data[0]) ?
                                        <ScatterDataSelection keyNames={_.keys(volcanoData.data[0])}
                                            {...{
                                                numericKeyNames: numericKeyNames,
                                                selection: volcanoData.selection[didx],
                                                setSelection: handleSelection,
                                                idx: didx,
                                                chartIdx,
                                                setTriggerResetAxisZoom,
                                                downloadElements: [`volcano-${didx}`, volcanoData.data],
                                                elementNames: ["SVG", "DIVIDER", `Data (${volcanoData.data.length} x ${_.keys(volcanoData.data[0]).length})`],
                                                fileNames: [`${submission_tag}-VolcanoPlot.svg`, `${submission_tag}-VolcanoPlot-Data.txt`],
                                                elementTypes: ["svg", "data"],
                                                itemIsAttribute: false,
                                                numericIsAttribute: false,
                                                zoomActive: chartIsZoomed,
                                                // onAnnotationSelect: handleAnnotationSelect,
                                                handleSearchByDataIndex
                                            }} /> : null}
                                        <VolcanoListButton
                                            data={volcanoData.data}
                                            suffix={volcanoData.suffixes[chartIdx]}
                                            submission_tag={submission_tag}
                                            proteinTagMap={proteinTagMap}
                                            setRequiredProteinTags={setRequiredProteinTags}
                                            favoriteProteinSelection={favoriteProteinSelection}
                                            onToggleProteinLabel={onToggleProteinLabel}
                                            onLabelProteinList={onLabelProteinList}
                                            markedProteinTags={markedProteinList?.values ?? []}
                                            onMarkProteinList={onMarkProteinList}
                                            onRemoveAllLabels={onRemoveAllLabels} />
                                    </div>
                                    
                                    <ScatterPlot
                                        key={`volcano-plot-${chartIdx}`}{...{
                                        chartIdx,
                                        width: plotWidth,
                                        height : 480,
                                        margins: {
                                            left: 50 + yAxisLabelExtraMargin,
                                            top: 10,
                                            right: 5,
                                            bottom: 100
                                        },
                                        colorName: volcanoData.selection[didx].colorName,
                                        sizeName: volcanoData.selection[didx].sizeName,
                                        data,
                                        valid,
                                        centerXAxisAtZero : true,
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
                                        svgID: `volcano-${didx}`,
                                        triggerResetAxis,
                                        onZoomedChange,
                                        setTriggerResetAxisZoom,
                                        annotationMarkers: _.concat(annotationMarkers, markedAnnotationMarkers),
                                        proteinTagMap,
                                        setRequiredProteinTags,
                                        proteinIsLoading,
                                        labelIsProtein: true,
                                        showHoverLabels
                                    
                                    }} />
                                    </Card> 
                                    // </div>
                         
                            )
                        })}

            </InteractiveChart>
        </div>)
}
