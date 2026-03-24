import _ from "lodash"
import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";

import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { getNumericKeysFromArrayOfObjects } from "../../../services/arrays/filter";
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection";

import hooks from "@mitocube/api-hooks";

function DatasetPCA({ }) {

    /**
     * @type {import("../../../types/datasets").DatasetContextOutlet}
     */
    const { submission_tag } = useOutletContext()   
    const [selection, setSelection] = useState({ xaxisName: undefined, yaxisName: undefined, colorName : undefined, tooltipNames : [], sizeName : undefined, filterTag : undefined })
    const { data : pcaresults, isSuccess } = hooks.submissions.analysis.useGetSubmissionPCA({tag : submission_tag, filter_tag : selection.filterTag}, {enabled : _.isString(submission_tag), staleTime: Infinity})
    

    // const { data : pcaresults, isLoading, isFetching, isError, error, isSuccess } = useGetDatasetPCA({ submission_tag })
    
    // const sampleAttributeNames = metaDataFound && _.isObject(metadata.samples_attributes) ? _.keys(metadata.samples_attributes).map(v => v) : []
    // const hasGenotypes = metaDataFound ? !_.isEmpty(metadata.genotypes) : false 
    const pcaResultsValid = _.isObject(pcaresults) && _.isArray(pcaresults.drivers) && _.isArray(pcaresults.projection)
    const numericKeyNames = pcaResultsValid ? getNumericKeysFromArrayOfObjects(pcaresults.drivers): []
    const nonNumericKeyNames = pcaResultsValid ? _.keys(pcaresults.drivers[0]).filter(keyName => !numericKeyNames.includes(keyName)) : []
    const numericKeyNamesProjection = pcaResultsValid ? getNumericKeysFromArrayOfObjects(pcaresults.projection) : []
    
    // useEffect(() => {

    //     if (metaDataFound && _.has(metadata, "title")) {
    //         setTabHeader(metadata.title)
    //     }
    // }, [metaDataFound])

    useEffect(() => {
        if (!_.isObject(pcaresults) && !isSuccess) return 
        setSelection({
            xaxisName: numericKeyNames[0],
            yaxisName: numericKeyNames[1],
            tooltipNames: [], 
            colorName : undefined,
       })
    }, [_.isObject(pcaresults)])

    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => {return {...prevValues,[selectionKey] : keyName}})
    }


    return (<div className="div--expand" style={{ overflowY: "scroll", height: "90vh " }}>
        <h2>Principal Component Analysis</h2>
        {_.isObject(pcaresults) && _.isArray(pcaresults.variance_explained) ? <span>{pcaresults.variance_explained.length} components calculated, explaining {_.round(_.sum(pcaresults.variance_explained) * 10000) / 100}% of the total variance.</span> : null}

        {isSuccess && _.isObject(pcaresults) && _.isArray(pcaresults.projection) && pcaresults.projection.length > 0 ?
            <ScatterDataSelection
                keyNames={_.keys(pcaresults.projection[0])}
                {...{
                    title: "Projection",
                    idx : 0,
                    numericKeyNames,
                    selection,
                    setSelection : handleScatterSelection,
                    downloadElements: ["scatter_plot-pca-projection", pcaresults.projection],
                    elementNames: ["SVG","DIVIDER",`Projected Data (${pcaresults.projection.length} x ${_.keys(pcaresults.projection[0]).length})`],
                    fileNames: [`${submission_tag}-PCA.svg`,`${submission_tag}-PCA-Projection.txt`],
                    elementTypes: ["svg","data"]
            }} /> : 
            null}
            { pcaResultsValid ? <InteractiveChart
                                    data={pcaresults.projection}
                                    extraLimitNames={[selection.colorName, selection.sizeName].filter(keyName => _.isString(keyName) && numericKeyNamesProjection.includes(keyName))}
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
                                    hoverProps,
                                    filterProps
                                }, didx) => {
                                    console.log(findDataInRectangle,data,xaxisName,yaxisName, limits, "FIND DATA IN RECTANGLE??")
                                    return (
                                        <div>
                                            
                                        <ScatterPlot key={`${chartIdx}`}{...{
                                            chartIdx,
                                            colorName: selection.colorName,
                                            sizeName: selection.sizeName,
                                            data,
                                            valid,
                                            findDataInRectangle,
                                            setHoverDataInRectangle,
                                            xaxisName,
                                            yaxisName,
                                            limits,
                                            tooltipSmall : false,
                                            tooltipNames : [],
                                            ...hoverProps,
                                            ...filterProps,
                                            // attributeValuesByTag: metadata.attribute_values_by_tag,
                                            // attributesByTag: metadata.attributes,
                                            // genotypesByLabel : metadata.genotypes,
                                            legend: true,
                                                handleSearchByDataIndex,
                                                filterDataInKeyByValue,
                                            svgID : "scatter_plot-pca-projection"
                                        
                                            }} />
                                    </div>)
                                })}

        </InteractiveChart> : null}
                                {/* Drivers plot. */}
         {isSuccess && pcaResultsValid ? <InteractiveChart data={pcaresults.drivers} extraLimitNames={numericKeyNames} keyNames={
                            [
                                { xaxisName: selection.xaxisName, yaxisName: selection.yaxisName }
                            ]}
                                isPointChart={[true]}>
                            {(chartData) => chartData.map(({
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
                                filterDataInKeyByValue,
                                hoverProps,
                                filterProps,
                                labelProps,
                                findClosestPoint
                            }, didx) => {
                                return (<div key={`${didx}-driver-pca-${xaxisName}`}>
                                    <ScatterDataSelection keyNames={_.keys(pcaresults.drivers[0])}
                                        {...{
                                            title : "Drivers",
                                        numericKeyNames,
                                        idx : 1,
                                        selection,
                                        setSelection : handleScatterSelection,
                                        handleStringSearch,
                                        downloadElements: ["scatter_plot-pca-drivers", pcaresults.drivers],
                                        elementNames: ["SVG","DIVIDER",`Data (${pcaresults.drivers.length} x ${_.keys(pcaresults.drivers[0]).length})`],
                                        fileNames: [`${submission_tag}-PCA-drivers.svg`,`${submission_tag}-PCA-Drivers.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                                    
                                    <ScatterPlot key={`${chartIdx}-drivers-${submission_tag}`}{...{
                                        chartIdx,
                                        data,
                                        valid,
                                        svgID : "scatter_plot-pca-drivers",
                                        sizeName: selection.sizeName,
                                        colorName : selection.colorName,
                                        tooltipNames: ["tag"],
                                        labelNames : [],
                                        findDataInRectangle,
                                        setHoverDataInRectangle,
                                        filterDataInKeyByValue,
                                        findClosestPoint,
                                        ...labelProps,
                                        xaxisName,
                                        yaxisName,
                                        limits,
                                        ...hoverProps,
                                        ...filterProps,
                                        tooltipNameIsFeatures : {tag : true}
                                    }} />
                                </div>)
                            })}

                            </InteractiveChart> : null}
    </div>)

}


export default DatasetPCA