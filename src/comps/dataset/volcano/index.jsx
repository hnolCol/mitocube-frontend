import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { SamplesAttributesSelection } from "./SamplesAttributesSelection";
import _ from "lodash"
import { useGetSubmissionAttributesByTag } from "../../../hooks/queries/submission.hooks";
import { getAttributeForUserNumericInput } from "../../../services/attributes";
import Loading from "../../core/base/loading";
import { useGetDatasetVolcano } from "../../../hooks/queries/datasets.hooks";
import { useEffect, useState } from "react";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { ScatterDataSelection } from "../pca";
import { Card } from "@blueprintjs/core";
import { isItemInArrayDeepComp } from "../../../services/arrays/transforms";
import { arrayOfObjectsToObjectByProperty, groupListByProperty } from "../../../services/arrays/groupby";
import { AttributePairwiseSelection } from "../../core/base/attribute_selection/Pairwise";


function VolcanoDataHandler({ dataset_label, selectedTestParams, metadata, setIsFetching }) {
    const [volcanoData, setVolcanoData] = useState({data : [], testParams : [], selection : [], suffixes : []})
    //console.log(selectedTestParams,volcanoData.testParams)
    const handleSuccess = (data) => {
        //merge data to get super fast split
       
        let updatedData = []
        let prevData = volcanoData.data
        if (prevData.length > 1) {
            let groupBy = arrayOfObjectsToObjectByProperty(data.stats, "key")
            updatedData = prevData.map(entry => { return { ...entry, ...groupBy[entry.key]} })
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
                selection : _.concat(prevValues.selection,{ xaxisName: `log2 FC ${data.suffix}`, yaxisName: `-log10 p-value ${data.suffix}`, colorName : `Significant ${data.suffix}`, tooltipNames : [], sizeName : undefined, filterNames : ["genes"] })
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
    
    const { isLoading, isRefetching, isSuccess, refetch} = useGetDatasetVolcano({ dataset_label, testParams: selectedTestParams }, {
            enabled: false,
        onSuccess: handleSuccess
        })
    
    useEffect(() => {
        if (testParamsUpdate) {
            setIsFetching(true)
            refetch()
        }
    }, [testParamsUpdate])
    
    useEffect(() => {setIsFetching(false)},[isSuccess])
    
    const numericKeyNames = _.keys(volcanoData.data[0]).filter(keyName => _.isNumber(volcanoData.data[0][keyName]))

    const extraLimits = _.flatten(_.keys(volcanoData.selection).map(k => [volcanoData.selection[k].colorName, volcanoData.selection[k].sizeName])).filter(k => _.isString(k) && numericKeyNames.includes(k))
    
    //console.log(volcanoData)
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
                                <Card compact={true} style={{maxWidth: "700px", maxHeight : "500px"}}>
                                    <ScatterDataSelection keyNames={_.keys(volcanoData.data[0])}
                                        {...{
                                            title : "Volcano Plot",
                                        numericKeyNames : numericKeyNames,
                                        selection : volcanoData.selection[didx],
                                        setSelection: handleSelection,
                                        idx : didx,
                                        handleStringSearch,
                                        downloadElements: [`volcano-${didx}`, volcanoData.data],
                                        elementNames: ["SVG","DIVIDER",`Data (${volcanoData.data.length} x ${_.keys(volcanoData.data[0]).length})`],
                                        fileNames: [`${metadata.label}-VolcanoPlot.svg`,`${metadata.label}-VolcanoPlot-Data.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                                    <ScatterPlot key={`volcano-plot-${chartIdx}`}{...{
                                        chartIdx,
                                        width: 400,
                                        height : 400,
                                        colorName: volcanoData.selection[didx].colorName,
                                        sizeName: volcanoData.selection[didx].sizeName,
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
                                        tooltipNames: ["genes"],
                                        ...hoverProps,
                                        ...filterProps,
                                        ...labelProps,
                                        attributeValuesByTag: metadata.attribute_values_by_tag,
                                        attributesByTag: metadata.attributes,
                                        legend: true,
                                        legendWithAttributes: false,
                                        handleSearchByDataIndex,
                                        filterDataInKeyByValue,
                                        svgID: `volcano-${didx}`
                                    }} />
                                </Card>)
                        })}

                </InteractiveChart>
        </div>)
}


function VolcanoPlotWrapper({dataset_label, metadata, attributes, attributeValues, samplesGenotypes}) {

    const [testParams, setTestParams] = useState({})
    const [isFetching, setIsFetching] = useState(false)

    const handleVolcano = (props) => {
        setTestParams(props)
    }
    const genotype_defined = _.has(samplesGenotypes, "att_genotype") && samplesGenotypes["att_genotype"].length > 0 
    return (
        <div className="div--expand flex">
            <AttributePairwiseSelection {...{metadata, callbackText : "Volcano plot.", callback : handleVolcano, isLoading : isFetching}} />
            <VolcanoDataHandler {...{ dataset_label, selectedTestParams: testParams, metadata, setIsFetching }} />
            
           {/* <SamplesAttributesSelection
                attributes={attributes}
                groupAttributeValues={genotype_defined ? { ...samplesGenotypes, ...attributeValues } : attributeValues}
            
                {...{ metadata, callback: handleVolcano, isLoading: isFetching }} /> */}
        </div>
    )
}



function DatasetVolcanoPlot(logout) {
    
    const { metadata, dataset_label } = useOutletContext()
    const [testParams, setTestParams] = useState({})
    const [selection, setSelection] = useState({ xaxisName: undefined, yaxisName: undefined, colorName : undefined, tooltipNames : [], sizeName : undefined, filterNames : [] })

    const { data: attributesByTag, isLoading, isFetching, isError, error } = useGetSubmissionAttributesByTag()
   // const { data: volcanoData, isLoading : isVolcanoLoading, isFetching :  isVolcanoFetching, isSuccess : isVolcanoSuccess, refetch } = useGetDatasetVolcano({ dataset_label, testParams }, { enabled: !_.isEmpty(testParams), onSuccess : handleSuccess})
    //console.log(volcanoData)
    // if (isError) return <APIError error={error} />
    // if (isLoading) return <div>Dataset Info Loading...</div>
    // groupItems = { "Treatment": ["A", "B","WT"], "Time": ["A1", "B1"] },
    // groupingNames = ["Treatment", "Time"],

    const handleVolcano = (props) => {
        const params = {
            attribute_left_tag: _.has(props.group1,"label") ? props.group1.label: props.group1.tag,
            attribute_right_tag: _.has(props.group2,"label") ? props.group2.label: props.group2.tag,
            sample_attribute_tag: props.main.tag
        }
        setTestParams(params)
    }

    if (!_.isObject(metadata) || !_.isObject(attributesByTag)) return null

    let sampleAttributesKey = Object.keys(metadata.samples_attributes)
    let genotypeLabels = _.keys(metadata.samples_genotypes)
    let genotypeDefined = genotypeLabels.length > 0 
    let sampleAttributeValues = _.fromPairs(_.keys(metadata.samples_attributes).map(sampleAttributeTag => [sampleAttributeTag, _.keys(metadata.samples_attributes[sampleAttributeTag]).map(attribute_value_tag => metadata.attribute_values_by_tag[attribute_value_tag])]))
    let samplesGenotypes = { att_genotype: _.keys(metadata.samples_genotypes).map(genotypeLabel => metadata.genotypes[genotypeLabel]) }
    let sampleAttributes = sampleAttributesKey.map(attrTag => attributesByTag.attributes[attrTag])
    let attributes = genotypeDefined ? _.concat([attributesByTag.attributes["att_genotype"]],sampleAttributes) : sampleAttributes

    return <VolcanoPlotWrapper {...{ dataset_label, attributes, attributeValues :  sampleAttributeValues, metadata, samplesGenotypes}} />
    if (isLoading || isFetching) return <Loading />
    if (isError) return <APIError />
    
    if (!_.isObject(metadata) || !_.isObject(attributesByTag)) return null
    // let sampleAttributesKey = Object.keys(metadata.samples_attributes)
    // let sampleAttributeValues = _.fromPairs(_.keys(metadata.samples_attributes).map(sampleAttributeTag => [sampleAttributeTag, _.keys(metadata.samples_attributes[sampleAttributeTag]).map(attribute_value_tag => metadata.attribute_values_by_tag[attribute_value_tag])]))

    const numericKeyNames = _.isObject(volcanoData) && _.has(volcanoData, "stats") && _.isArray(volcanoData.stats) ?
        _.filter(_.keys(volcanoData.stats[0]), keyName => _.isNumber(volcanoData.stats[0][keyName])) : []
    return (
        <div >
            {_.isEmpty(testParams) ? <div className="flex center-items">
                <SamplesAttributesSelection
                    attributes={sampleAttributesKey.map(attrTag => attributesByTag.attributes[attrTag])}
                    groupAttributeValues={sampleAttributeValues} {...{ metadata, callback: handleVolcano }} />
            </div>   : isVolcanoLoading || isVolcanoFetching ? <Loading /> : isVolcanoSuccess ? 
                <div className="flex">
                <InteractiveChart
                        data={volcanoData.stats}
                        extraLimitNames={[_.filter([selection.colorName,selection.sizeName], keyName => numericKeyNames.includes(keyName))]}
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
                                <Card className="margin--little" compact={true}>
                                    <ScatterDataSelection keyNames={_.keys(volcanoData.stats[0])}
                                        {...{
                                            title : "Volcano Plot",
                                        numericKeyNames,
                                        selection,
                                        setSelection,
                                        handleStringSearch,
                                        downloadElements: [`volcano-${didx}`, volcanoData.stats],
                                        elementNames: ["SVG","DIVIDER",`Data (${volcanoData.length} x ${_.keys(volcanoData[0]).length})`],
                                        fileNames: [`${metadata.label}-PCA-drivers.svg`,`${metadata.label}-PCA-Drivers.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                                    <ScatterPlot key={`volcano-plot-${chartIdx}`}{...{
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
                                        legend: true,
                                        legendWithAttributes: false,
                                        handleSearchByDataIndex,
                                        filterDataInKeyByValue,
                                        svgID: `volcano-${didx}`,
                                        suffix : volcanoData.suffix
                                    }} />
                                </Card>)
                        })}

                </InteractiveChart> </div> : null }

        </div>
    )
}

export default DatasetVolcanoPlot