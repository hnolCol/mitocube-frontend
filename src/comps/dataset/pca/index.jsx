import _ from "lodash"
import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { useEffect, useState } from "react";
import { useGetDatasetPCA } from "../../../hooks/queries/datasets.hooks";
import Loading from "../../core/base/loading";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { getNumericKeysFromArrayOfObjects } from "../../../services/arrays/filter";
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection";



function DatasetPCA({ }) {

    /**
     * @type {import("../../../types/datasets").DatasetContextOutlet}
     */
    const { submission_tag, metadata, setTabHeader } = useOutletContext()   

    const { data : pcaresults, isLoading, isFetching, isError, error, isSuccess } = useGetDatasetPCA({ submission_tag })
    // const { data: attributesByTag, isLoading: attrByTagIsLoading, isFetching: attrByTagIsFetching, isSuccess: attrByTagIsSuccess } = useGetSubmissionAttributesByTag()
    
    const [selection, setSelection] = useState({ xaxisName: undefined, yaxisName: undefined, colorName : undefined, tooltipNames : [], sizeName : undefined, filterNames : [] })
    const metaDataFound = _.isObject(metadata) && !_.isEmpty(metadata)
    const sampleAttributeNames = metaDataFound && _.isObject(metadata.samples_attributes) ? _.keys(metadata.samples_attributes).map(v => v) : []
    const hasGenotypes = metaDataFound ? !_.isEmpty(metadata.genotypes) : false 
    const pcaResultsValid = _.isObject(pcaresults) && _.isArray(pcaresults.drivers) && _.isArray(pcaresults.projection)
    const numericKeyNames = pcaResultsValid ? getNumericKeysFromArrayOfObjects(pcaresults.drivers): []
    const nonNumericKeyNames = pcaResultsValid ? _.keys(pcaresults.drivers[0]).filter(keyName => !numericKeyNames.includes(keyName)) : []
    const numericKeyNamesProjection = pcaResultsValid ? getNumericKeysFromArrayOfObjects(pcaresults.projection) : []
    
    useEffect(() => {

        if (metaDataFound && _.has(metadata, "title")) {
            setTabHeader(metadata.title)
        }
    }, [metaDataFound])

    useEffect(() => {
        if (!_.isObject(pcaresults)) return 
        setSelection({
            xaxisName: numericKeyNames[0],
            yaxisName: numericKeyNames[1],
            tooltipNames: nonNumericKeyNames.includes("genes") ? ["genes"] : [],
            colorName : _.isObject(pcaresults.samples_attributes) && !_.isEmpty(pcaresults.samples_attributes)?_.keys(pcaresults.samples_attributes)[0]:undefined
       })
    }, [_.isObject(pcaresults)])

    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => {return {...prevValues,[selectionKey] : keyName}})
    }




    return (
        <div className="div--expand" style={{ overflowY: "scroll", height: "80vh " }}>
            <h2>Principal Component Analysis</h2>
            <p>Please select the desired components showing the projection (left) as well the drivers (right). Selecting a point in the right point displays the feature's profile in the bottom.</p>
            {isLoading || isFetching  ? <Loading /> : isError ? <APIError error={error} /> : isSuccess ? 
                <div>
                    <p>{pcaresults.variance_explained.length} components calculated, explaining {_.round(_.sum(pcaresults.variance_explained)*10000)/100}% of the total variance.</p>
                    <div>
                        

                        
                        {/* if (didx === 1) return <div><ProfileChart {...{chartIdx,data,valid,findDataInRectangle,setHoverDataInRectangle,xaxisName,yaxisName,limits,...hoverProps, ...filterProps}}/></div>
                            return (<div><ScatterPlot {...{chartIdx,data,valid,findDataInRectangle,setHoverDataInRectangle,xaxisName,yaxisName,limits,...hoverProps, ...filterProps}}/>
                            {didx===0?<div>
                                <RangeSlider min={0} max={100} value={filterProps.filterRange} stepSize={5} onChange={range => handleNumericFilter(0,"x",range[0],range[1])}/><Button onClick={() => handleNumericFilter(0,"x",0.2,0.5)}/>
                                <InputGroup onChange={(e) => handleStringSearch("label",e.target.value)}/>
                                </div>:null} */}
                        
                        <div className="flex justify-space-around">
                            {isSuccess ? <div>
                                
                                <ScatterDataSelection keyNames={_.keys(pcaresults.projection[0])} {...{
                                    title: "Projection",
                                    idx : 0,
                                    numericKeyNames,
                                    selection,
                                    setSelection : handleScatterSelection,
                                    downloadElements: ["scatter_plot-pca-projection", pcaresults.projection],
                                    elementNames: ["SVG","DIVIDER",`Projected Data (${pcaresults.projection.length} x ${_.keys(pcaresults.projection[0]).length})`],
                                    fileNames: [`${metadata.label}-PCA.svg`,`${metadata.label}-PCA-Projection.txt`],
                                    elementTypes: ["svg","data"]
                                }} />
                               
                                <InteractiveChart
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
                                return (
                                    <div>
                                        
                                    <ScatterPlot key={`${chartIdx}`}{...{
                                        chartIdx,
                                        colorName: selection.colorName,
                                        sizeName: selection.sizeName,
                                       // tooltipNames : selection.tooltipNames,
                                        data,
                                        valid,
                                        findDataInRectangle,
                                        setHoverDataInRectangle,
                                        xaxisName,
                                        yaxisName,
                                        limits,
                                        tooltipSmall : false,
                                        tooltipNames : hasGenotypes? _.concat(["index"],"att_genotype",sampleAttributeNames): _.concat(["index"],sampleAttributeNames),
                                        ...hoverProps,
                                        ...filterProps,
                                        attributeValuesByTag: metadata.attribute_values_by_tag,
                                            attributesByTag: metadata.attributes,
                                        genotypesByLabel : metadata.genotypes,
                                        legend: true,
                                            handleSearchByDataIndex,
                                            filterDataInKeyByValue,
                                        svgID : "scatter_plot-pca-projection"
                                    
                                        }} />
                                </div>)
                            })}

                        </InteractiveChart> </div>: null}

                            {isSuccess ? <InteractiveChart data={pcaresults.drivers} extraLimitNames={numericKeyNames} keyNames={
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
                                        fileNames: [`${metadata.tag}-PCA-drivers.svg`,`${metadata.tag}-PCA-Drivers.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                                    
                                    <ScatterPlot key={`${chartIdx}-drivers-${submission_tag}`}{...{
                                        chartIdx,
                                        data,
                                        valid,
                                        svgID : "scatter_plot-pca-drivers",
                                        sizeName: selection.sizeName,
                                        colorName : selection.colorName,
                                        tooltipNames: selection.tooltipNames,
                                        labelNames : ["genes"],
                                        findDataInRectangle,
                                        setHoverDataInRectangle,
                                        filterDataInKeyByValue,
                                        findClosestPoint,
                                        ...labelProps,
                                        xaxisName,
                                        yaxisName,
                                        limits,
                                        attributeValuesByTag: metadata.attribute_values_by_tag,
                                        attributesByTag : metadata.attributes,
                                        ...hoverProps,
                                        ...filterProps,
                                    }} />
                                </div>)
                            })}

                            </InteractiveChart> : null}
                        </div>

                    </div>
                
                
                </div> : null}


        </div>
    )


}


export default DatasetPCA