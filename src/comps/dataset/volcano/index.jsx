import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { SamplesAttributesSelection } from "./SamplesAttributesSelection";
import _ from "lodash"
import { useGetSubmissionAttributesByTag } from "../../../hooks/queries/submission.hooks";
import { getAttributeForUserNumericInput } from "../../../services/attributes";
import Loading from "../../core/base/loading";
import { useGetDatasetVolcano } from "../../../hooks/queries/datasets.hooks";
import { useState } from "react";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { ScatterDataSelection } from "../pca";


function VolcanoPlot({dataset_label}) {
    const { data, isVolcanoLoading, isVolcanoFetching } = useGetDatasetVolcano({ dataset_label, testParams: {} })
    
}


function DatasetVolcanoPlot(logout) {
    
    const { metadata, dataset_label } = useOutletContext()
    const [testParams, setTestParams] = useState({})
    const [selection, setSelection] = useState({ xaxisName: undefined, yaxisName: undefined, colorName : undefined, tooltipNames : [], sizeName : undefined, filterNames : [] })

    const { data: attributesByTag, isLoading, isFetching, isError, error } = useGetSubmissionAttributesByTag()
    const { data: volcanoData, isLoading : isVolcanoLoading, isFetching :  isVolcanoFetching, isSuccess : isVolcanoSuccess, refetch } = useGetDatasetVolcano({ dataset_label, testParams }, { enabled: !_.isEmpty(testParams), onSuccess : handleSuccess})
    //console.log(volcanoData)
    // if (isError) return <APIError error={error} />
    // if (isLoading) return <div>Dataset Info Loading...</div>
    // groupItems = { "Treatment": ["A", "B","WT"], "Time": ["A1", "B1"] },
    // groupingNames = ["Treatment", "Time"],

    function handleSuccess(){
        setSelection(prevValues => {
            //TO DO: Modify
            return {
                ...prevValues,
                xaxisName: "log2 FC",
                yaxisName: "-log10 p-value",
                colorName: "significant",
                tooltipNames: ["genes"]
            }
        })
    }

    const handleVolcano = (props) => {
        const params = {
            attribute_left_tag: props.group1.tag,
            attribute_right_tag: props.group2.tag,
            sample_attribute_tag: props.main.tag
        }
        setTestParams(params)
        
    }
    
    if (isLoading || isFetching) return <Loading />
    if (isError) return <APIError />
    
    if (!_.isObject(metadata) || !_.isObject(attributesByTag)) return null
    let sampleAttributesKey = Object.keys(metadata.samples_attributes)
    let sampleAttributeValues = _.fromPairs(_.keys(metadata.samples_attributes).map(sampleAttributeTag => [sampleAttributeTag, _.values(metadata.samples_attributes[sampleAttributeTag].attribute_values)]))

    //console.log(sampleAttributeValues)
    //console.log(metadata)
    const numericKeyNames = _.isArray(volcanoData) ? _.filter(_.keys(volcanoData[0]), keyName => _.isNumber(volcanoData[0][keyName])) : []

    return (
        <div>
            {_.isEmpty(testParams) ? <div className="flex center-items justify-center div--expand">
                <SamplesAttributesSelection
                    attributes={sampleAttributesKey.map(attrTag => attributesByTag.attributes[attrTag])}
                    groupAttributeValues={sampleAttributeValues} {...{ metadata, callback: handleVolcano }} />
            </div>   : isVolcanoLoading || isVolcanoFetching ? <Loading /> : isVolcanoSuccess ? 
                <div>
                <InteractiveChart
                        data={volcanoData}
                        extraLimitNames={[]}
                    keyNames={[
                        {
                            xaxisName: selection.xaxisName,
                            yaxisName: selection.yaxisName
                        }]}
                    isPointChart={[true]}>
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
                            labelProps
                        }, didx) => {
                            return (
                                <div>
                                    <ScatterDataSelection keyNames={_.keys(volcanoData[0])}
                                        {...{
                                            title : "Volcano Plot",
                                        numericKeyNames,
                                        selection,
                                        setSelection,
                                        handleStringSearch,
                                        downloadElements: ["volcanoplottly", volcanoData],
                                        elementNames: ["SVG","DIVIDER",`Data (${volcanoData.length} x ${_.keys(volcanoData[0]).length})`],
                                        fileNames: [`${metadata.label}-PCA-drivers.svg`,`${metadata.label}-PCA-Drivers.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                                    <ScatterPlot key={`${chartIdx}`}{...{
                                        chartIdx,
                                        colorName: selection.colorName,
                                        sizeName: selection.sizeName,
                                        data,
                                        valid,
                                        labelNames : ["genes"],
                                        findDataInRectangle,
                                        setHoverDataInRectangle,
                                        findClosestPoint,
                                        xaxisName,
                                        yaxisName,
                                        limits,
                                        tooltipSmall: true,
                                        tooltipNames: selection.tooltipNames,
                                        ...hoverProps,
                                        ...filterProps,
                                        ...labelProps,
                                        attributeValuesByTag: metadata.attribute_values_by_tag,
                                        attributesByTag: metadata.attributes,
                                        legend: false,
                                        handleSearchByDataIndex,
                                        filterDataInKeyByValue,
                                        svgID: "volcanoplottly"
                
                                    }} />
                                </div>)
                        })}

                </InteractiveChart> </div> : null }

        </div>
    )
}

export default DatasetVolcanoPlot