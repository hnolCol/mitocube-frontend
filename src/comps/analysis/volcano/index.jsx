import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import _ from "lodash"
import { useEffect, useState } from "react";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { Button, Card, Dialog } from "@blueprintjs/core";
import { addStringToArrayIfNotPresent, isItemInArrayDeepComp } from "../../../services/arrays/transforms";
import { arrayOfObjectsToObjectByProperty } from "../../../services/arrays/groupby";
import { ConditionApplicationSelection } from "../../core/base/attribute_selection/Pairwise";
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection";
import { api } from "@/api";
import { RemoveButton } from "@/comps/core/base/buttons/RemoveButton";
import { Combobox } from "@/comps/core/input/Combobox";

function VolcanoDataHandler({ submission_tag, selectedTestParams,setIsFetching, onError, hiddenSuffix, setHiddenSuffix }) {
    const [volcanoData, setVolcanoData] = useState({ data: [], testParams: [], selection: [], suffixes: [] })
    const [annotationMarkers, setAnnotationMarkers] = useState([])
    
    const handleError = (error) => {
        setIsFetching(false)
        onError({ isOpen: true, message: error })
        }
    
    //fetch data
    const {data : testData, isSuccess, refetch, isFetching, isLoading} = api.submissions.analysis.useGetSubmissionVolcano({tag : submission_tag, ca_tag_left : selectedTestParams.ca_tag_left, ca_tag_right : selectedTestParams.ca_tag_right, annotation_tag : selectedTestParams.annotation_tag}, {
        enabled: false,
        staleTime: Infinity,
        onError: handleError
    })

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

        setIsFetching(false)
        setVolcanoData(prevValues => {
            return {
                ...prevValues, data: updatedData,
                suffixes : _.concat(prevValues.suffixes, data.suffix),
                testParams: _.concat(prevValues.testParams, selectedTestParams),
                selection : _.concat(prevValues.selection,{ xaxisName: `log2FC ${data.suffix}`, yaxisName: `-log10 p-value ${data.suffix}`, colorName : `Significant ${data.suffix}`, tooltipNames : [], sizeName : undefined, textSearchNames : ["genes"], filterSetNames : [] })
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

    const testParamsUpdate = _.isObject(selectedTestParams) &&
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

    // const numericKeyNames = _.isArray(volcanoData.data) && volcanoData.data.length > 0 ? _.keys(volcanoData.data[0]).filter(keyName => _.isNumber(volcanoData.data[0][keyName])) : []
  
    return (<div className="div--expand flex flex--wrap" style={{ overflowY: "scroll", gap: "0.5rem", marginLeft : "2rem"}}> 
        
        <InteractiveChart
    data={enrichDataWithAnnotations(volcanoData.data)}
    extraLimitNames={extraLimits}
                // _.filter([selection.colorName,selection.sizeName], keyName => numericKeyNames.includes(keyName))
                keyNames={
                    volcanoData.suffixes.map((suffix, idx) => {
                        return {
                            xaxisName: volcanoData.selection[idx].xaxisName,
                            yaxisName: volcanoData.selection[idx].yaxisName
                        }
                    })
                } 
                    isPointChart={_.range(volcanoData.testParams.length).map(_ => true)}>
                    
                    
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
                            handleStringSearch,
                            handleSearchByDataIndex,
                            filterDataInKeyByValue,
                            findClosestPoint,
                            hoverProps,
                            filterProps,
                            labelProps,
                            triggerResetAxis,
                            setTriggerResetAxisZoom
                        }, didx) => {
                            if (hiddenSuffix.includes(volcanoData.suffixes[chartIdx])) return null
                            return (
                                <Card
                                    compact={true}
                                    style={{ width: "600px", maxWidth: "750px", height: "500px", position: "relative" }}
                                    key={chartIdx}>
                                    
                                    <div style={{ position: "absolute", right: 5, top: 5 }}>
                                        <RemoveButton
                                            onRemove={() => handleHiddenSuffix(volcanoData.suffixes[chartIdx])} />
                                        
                                        </div>
                                    <ScatterDataSelection keyNames={_.keys(volcanoData.data[0])}
                                        {...{
                                        // title : "Volcano Plot",
                                        numericKeyNames : numericKeyNames,
                                        selection : volcanoData.selection[didx],
                                        setSelection: handleSelection,
                                        idx: didx,
                                        chartIdx, 
                                        setTriggerResetAxisZoom,
                                        handleStringSearch,
                                        downloadElements: [`volcano-${didx}`, volcanoData.data],
                                        elementNames: ["SVG","DIVIDER",`Data (${volcanoData.data.length} x ${_.keys(volcanoData.data[0]).length})`],
                                        fileNames: [`${submission_tag}-VolcanoPlot.svg`,`${submission_tag}-VolcanoPlot-Data.txt`],
                                        elementTypes: ["svg", "data"],
                                        itemIsAttribute: false,
                                        onAnnotationSelect: handleAnnotationSelect
                                        }} />
                                    
                                    <ScatterPlot key={`volcano-plot-${chartIdx}`}{...{
                                        chartIdx,
                                        width: 500,
                                        height : 480,
                                        margins: {          
                                            left: 80,     
                                            top: 10,
                                            right: 5,
                                            bottom: 80
                                        },
                                        colorName: volcanoData.selection[didx].colorName,
                                        sizeName: volcanoData.selection[didx].sizeName,
                                        data,
                                        valid,
                                        centerXAxisAtZero : true,
                                        labelNames : ["gene_name"],
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
                                        attributeValuesByTag: {}, //metadata.attribute_values_by_tag,
                                        attributesByTag: {}, //metadata.attributes,
                                        legend: true,
                                        legendWithAttributes: false,
                                        handleSearchByDataIndex,
                                        filterDataInKeyByValue,
                                        svgID: `volcano-${didx}`,
                                        triggerResetAxis,
                                        setTriggerResetAxisZoom,
                                        annotationMarkers: annotationMarkers
                                    }} />
                                    </Card> 
                                    // </div>
                         
                            )
                        })}

            </InteractiveChart>
        </div>)
}


function VolcanoPlotWrapper({submission_tag, metadata}) {
    const [testParams, setTestParams] = useState({})
    const [ hiddenSuffix, setHiddenSuffix] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState({isOpen : false, message : ""})

    const handleVolcano = (props) => {
        setTestParams(props)
    }
    return (
        <div className="div--expand flex">
            <Dialog isOpen={error.isOpen} onClose={() => setError({isOpen : false, message : undefined})} title="Error in Volcano Plot Generation">
                <div className="padding--medium">
                    <span>The following error occurred while generating the volcano plot and was returned from the backend.</span>
                    <APIError error={error.message} />
                </div>
            </Dialog>
            <div style={{position : "relative"}}>
            <div style={{position: "absolute", top : 5, right : 0}}><HiddenSuffixes hiddenSuffixes={hiddenSuffix} setHiddenSuffixes={setHiddenSuffix} /></div>
                <ConditionApplicationSelection {...{ submission_tag, onConfirm: handleVolcano, reset_after_confirm: true, isLoadingData: isFetching }} />
            </div>
            <VolcanoDataHandler {...{ submission_tag, selectedTestParams: testParams, metadata, setIsFetching, onError: setError, hiddenSuffix, setHiddenSuffix }} />
        </div>
    )
}


function HiddenSuffixes({ hiddenSuffixes, setHiddenSuffixes }) {
    const handleRemoveSuffix = (suffix) => {
        setHiddenSuffixes(prevValues => prevValues.filter(s => s !== suffix))
    }
    return <Combobox
        placeholder="" items={hiddenSuffixes.map(t => ({ text: t }))}
        onChange={i => handleRemoveSuffix(i.text)}
        noResultsText="No hidden volcanos."
        buttonProps={{ icon: "eye-off", variant: "minimal", intent: _.isEmpty(hiddenSuffixes) ? "none" : "danger" }} />
}


function DatasetVolcanoPlot(logout) {
    const { submission_tag } = useOutletContext()

    return <VolcanoPlotWrapper {...{ submission_tag}} />
}

export default DatasetVolcanoPlot