
import _ from "lodash"
import { useEffect, useState } from "react";
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
        proteinHoverResults,
        favoriteProteinSelection,
        favoriteAnnotationSelection,
        annotationHoverResults,
        showHoverLabels = false}) {

    
    
    
    const [annotationMarkers, setAnnotationMarkers] = useState([])
    const [prefetchedTestParams, setPrefetchedTestParams] = useState([])
    const { isReady, tagQueries } = usePrefetchVolcanoData(prefetchedTestParams, { enabled: _.isObject(prefetchedTestParams) && _.isArray(prefetchedTestParams) && prefetchedTestParams.length > 0 })
       

    useEffect(() => {
        if (volcanoData.suffixes.length > 0) return //already have data, no need to wait for prefetching, and don't want to overwrite existing data with prefetching results
        if (isReady && _.isArray(tagQueries) && tagQueries.length > 0) {
            
            const arrays = tagQueries.map(q => q.data.stats)
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
            const suffixes = tagQueries.map(q => q.data.suffix)
            const selection = tagQueries.map(q => { return { xaxisName: `log2FC ${q.data.suffix}`, yaxisName: `-log10 p-value ${q.data.suffix}`, colorName: `Significant ${q.data.suffix}`, tooltipNames: [], sizeName: undefined } })
            const testParams = prefetchedTestParams.slice()
     
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
        { enabled: !!favoriteAnnotationSelection?.values?.[0], staleTime: Infinity }
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
            setPrefetchedTestParams(itemValue[submission_tag])
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

        saveInLocalStorage({
            itemName: "volcanoProps", itemValue: JSON.stringify({
                ...itemValue,
                [submission_tag]: itemFound && _.isObject(itemValue) && _.has(itemValue, submission_tag) ?
                    _.concat(itemValue[submission_tag], { ...selectedTestParams, tag: submission_tag }) : [{ ...selectedTestParams, tag: submission_tag }]
            })
        })
        
        setIsFetching(false)
        setVolcanoData(prevValues => {
            return {
                ...prevValues,
                data: updatedData,
                suffixes : _.concat(prevValues.suffixes, data.suffix),
                testParams: _.concat(prevValues.testParams, selectedTestParams),
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
        !isItemInArrayDeepComp({ array: volcanoData.testParams, item: selectedTestParams })
    
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
    const extraLimits = _.flatten(_.keys(volcanoData.selection).map(k => [volcanoData.selection[k].colorName, volcanoData.selection[k].sizeName])).filter(k => _.isString(k) && numericKeyNames.includes(k))
   
    // Add this function right before the numericKeyNames line
    const enrichDataWithAnnotations = (data) => {
        if (!_.isArray(data) || data.length === 0) {
            return data
        }
        
        if (annotationMarkers.length === 0) {
            return data
        }
        
        console.log("Enriching data with", annotationMarkers.length, "annotation markers")
        
        let enrichedCount = 0
        const enriched = data.map(dataPoint => {
            // Check if this protein's tag is in any annotation marker
            for (const marker of annotationMarkers) {
                if (marker.proteinTags.includes(dataPoint.tag)) {
                    enrichedCount++
                    return {
                        ...dataPoint,
                        annotation_color: marker.color,
                        annotation_tags: marker.annotationTags
                    }
                }
            }
            return dataPoint
        })
        
        console.log("Enriched", enrichedCount, "data points out of", data.length)
        return enriched
    }
        
    return (
        <div
            className="div--expand flex flex--wrap"
            style={{
                overflowY: "scroll",
                gap: "0.5rem",
                marginLeft: "2rem"
            }}> 
        
        <InteractiveChart
                data={volcanoData.data}
                extraLimitNames={extraLimits}
                externalSearchResult={proteinSearchResults}
                externalLabelResult={{
                    values: _.uniq([...(favoriteProteinSelection?.values || []), ...(showHoverLabels && _.isArray(selectedAnnotationProteins) ? selectedAnnotationProteins : [])]),
                    trigger: (selectedAnnotationProteins?.length > 0) ? Math.random() : (favoriteProteinSelection?.trigger || 0),
                    key: "tag"
                }}
                externalHoverResult={{
                    values: _.uniq([...(proteinHoverResults?.values || []), ...(hoveredAnnotationProteins ?? [])]),
                    trigger: (hoveredAnnotationProteins?.length > 0) ? Math.random() : (proteinHoverResults?.trigger || 0),
                    key: "tag"
                }}
                // _.filter([selection.colorName,selection.sizeName], keyName => numericKeyNames.includes(keyName))
                keyNames={
                    volcanoData.suffixes.map((suffix, idx) => {
                        return {
                            xaxisName: volcanoData.selection[idx].xaxisName,
                            yaxisName: volcanoData.selection[idx].yaxisName
                        }
                    })
                }
                isPointChart={_.range(volcanoData.testParams.length).map(_ => true)}
                passOnProps={{ setRequiredProteinTags, proteinTagMap, proteinIsLoading, showHoverLabels }}
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
                        setTriggerResetAxisZoom,
                        setRequiredProteinTags,
                        proteinTagMap,
                        proteinIsLoading,
                        showHoverLabels
                    }, didx) => {
                            if (hiddenSuffix.includes(volcanoData.suffixes[chartIdx])) return null // this suffix is hidden, don't render the chart
                            return (
                                <Card
                                    compact={true}
                                    style={{ width: "600px", maxWidth: "750px", height: "500px", position: "relative" }}
                                    key={chartIdx}>
                                    
                                    <div style={{ position: "absolute", right: 5, top: 5 }}>
                                        <RemoveButton
                                            onRemove={() => handleHiddenSuffix(volcanoData.suffixes[chartIdx])} />
                                        </div>
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
                                                // onAnnotationSelect: handleAnnotationSelect,
                                                handleSearchByDataIndex
                                            }} /> : null}
                                    
                                    <ScatterPlot
                                        key={`volcano-plot-${chartIdx}`}{...{
                                        chartIdx,
                                        width: 500,
                                        height : 480,
                                        margins: {          
                                            left: 50,     
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
                                        setTriggerResetAxisZoom,
                                        annotationMarkers: annotationMarkers,
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
