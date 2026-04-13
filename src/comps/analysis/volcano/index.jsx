import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import _ from "lodash"
import { useEffect, useState } from "react";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { Card, Dialog } from "@blueprintjs/core";
import { isItemInArrayDeepComp } from "../../../services/arrays/transforms";
import { arrayOfObjectsToObjectByProperty } from "../../../services/arrays/groupby";
import { ConditionApplicationSelection } from "../../core/base/attribute_selection/Pairwise";
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection";

import hooks from "@mitocube/api-hooks"


function VolcanoDataHandler({ submission_tag, selectedTestParams,setIsFetching, onError }) {

    const [volcanoData, setVolcanoData] = useState({ data: [], testParams: [], selection: [], suffixes: [] })

    const handleSuccess = (data) => {
        //merge data to get super fast split
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


    const handleError = (error) => {
        setIsFetching(false)
        onError({ isOpen: true, message: error })
    }

    //fetch data
    const { isSuccess, refetch} = hooks.submissions.analysis.useGetSubmissionVolcano({tag : submission_tag, ca_tag_left : selectedTestParams.ca_tag_left, ca_tag_right : selectedTestParams.ca_tag_right, annotation_tag : selectedTestParams.annotation_tag}, {
        enabled: false,
        onSuccess: handleSuccess,
        onError: handleError
    })
    

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
    

    
    useEffect(() => {
        if (testParamsUpdate) {
            setIsFetching(true)
            refetch()
        }
    }, [testParamsUpdate])
    
    useEffect(() => {setIsFetching(false)},[isSuccess])        
    
    const numericKeyNames = _.isArray(volcanoData.data) && volcanoData.data.length > 0 ? _.keys(volcanoData.data[0]).filter(keyName => _.isNumber(volcanoData.data[0][keyName])) : []
    const extraLimits = _.flatten(_.keys(volcanoData.selection).map(k => [volcanoData.selection[k].colorName, volcanoData.selection[k].sizeName])).filter(k => _.isString(k) && numericKeyNames.includes(k))
   
    
    
    return (<div className="div--expand flex flex--wrap" style={{ overflowY: "scroll", gap: "0.5rem" }}> 
    
        

        
        <InteractiveChart
                        data={volcanoData.data}
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
                            initialLayouts,
                            handleItemSelection,
                            findIndexInRectangle,
                            findDataInRectangle,
                            setHoverDataInRectangle,
                            handleNumericFilter,
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
                            return (
                                //  <div key={chartIdx} data-grid={initialLayouts[chartIdx]}>
                                <Card compact={true} style={{maxWidth: "700px", maxHeight : "500px"}}>
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
                                        itemIsAttribute: false
                                        }} />
                                    <ScatterPlot key={`volcano-plot-${chartIdx}`}{...{
                                        chartIdx,
                                        width: 400,
                                        height : 400,
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
            <ConditionApplicationSelection {...{submission_tag, onConfirm : handleVolcano, reset_after_confirm: true, isLoadingData : isFetching }}/>
            <VolcanoDataHandler {...{ submission_tag, selectedTestParams: testParams, metadata, setIsFetching, onError: setError }} />
        </div>
    )
}



function DatasetVolcanoPlot(logout) {
    const { submission_tag } = useOutletContext()

    return <VolcanoPlotWrapper {...{ submission_tag}} />
}

export default DatasetVolcanoPlot