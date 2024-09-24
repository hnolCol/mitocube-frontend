import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import _ from "lodash"

import APIError from "../../core/error/APIerror";

import { useGetDatasetPCA } from "../../../hooks/queries/datasets.hooks";

import Loading from "../../core/base/loading";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { Button, Divider, InputGroup } from "@blueprintjs/core";
import SizeIconWithName from "../../core/svg/icons/chartSelection/Size";
import ColorIconWithName from "../../core/svg/icons/chartSelection/Color";
import { TextIconWithName } from "../../core/svg/icons/chartSelection/Text";
import { addItemToArrayOrRemoveItIfPresent, arrayOfObjectsToString } from "../../../services/arrays/transforms";
import DownloadIcon from "../../core/svg/icons/chartSelection/Download";
import FilterIcon from "../../core/svg/icons/chartSelection/Filter";
import useDebounce from "../../../hooks/useDebounce";
import { downloadSVG } from "../../../services/downloads/svg";
import { downloadTxtFile } from "../../../services/downloads/txt";
import { FilterSelection } from "../../core/charts/selections/FilterSelection";
import { ChartAxisSelection } from "../../core/charts/selections/ChartAxisSelection";

function ChartMarksSelection({keyNames, selection, onSelectionChange, minimal}) {
    
    return (
        <div className="flex">
            <ColorIconWithName
                items={keyNames}
                placeholder={selection.colorName}
                selectedItems={[{ text: selection.colorName }]}
                minimal={minimal}
                callbackKey="colorName" callback={(key,value) => onSelectionChange(key,value === selection["colorName"] ? undefined : value)} />
            <SizeIconWithName
                items={keyNames}
                placeholder={selection.sizeName}
                selectedItems={[{ text: selection.sizeName }]}
                minimal={minimal}
                callbackKey="sizeName" callback={(key,value) => onSelectionChange(key,value === selection["sizeName"] ? undefined : value)} />
        </div>
    )
}



function TextSelection({ keyNames, selection, onSelectionChange, minimal }) {
    return (
        <div className="flex">
            <TextIconWithName 
                items={keyNames}
                minimal={minimal}
                selectedItems={_.map(selection.tooltipNames, text => {return {text}})}
                placeholder={_.isArray(selection.tooltipNames) ? selection.tooltipNames.length === 1?selection.tooltipNames[0]:`${selection.tooltipNames.length} items`: "..."}
                callbackKey="tooltipNames"
                callback={(key, value) => onSelectionChange(key, addItemToArrayOrRemoveItIfPresent({ array: selection.tooltipNames, item : value }))}
                />
        </div>
    )
}

/**
 * 
 * @param {Object} props 
 * @param {String[]} props.keyNames 
 * @param {Object} props.selection 
 * @param {Function} props.onSearchStringChange 
 * @param {Boolean} props.minimal
 * @returns 
 */
function ChartStringSearch({ keyNames, idx, selection, onSelectionChange, handleStringSearch, minimal = true}) {
    const [searchString, setSearchString] = useState("")
    const debounceString = useDebounce(searchString, 200)

    useEffect(() => {

        if (!_.isFunction(handleStringSearch)) return 

        handleStringSearch(selection.textSearchNames,debounceString)
    }, [debounceString, _.join(selection.textSearchNames)])

    return (
        <div className="flex center-items">
            <InputGroup value={searchString} onChange={(event) => setSearchString(event.target.value)} small={true} rightElement={<Button icon="cross" minimal={true} onClick={() => setSearchString("")} />} />
            <FilterIcon
                items={keyNames}
                callbackKey={"textSearchNames"}
                selectedItems={_.map(selection.textSearchNames, text => { return { text } })}
                minimal={minimal}
                callback={(key, value) => onSelectionChange(key, addItemToArrayOrRemoveItIfPresent({ array: selection.textSearchNames, item : value }))}
                    // (key, item) => onSelectionChange(prevValues => {
                    // return {
                    //     ...prevValues,
                    //     [key]: addItemToArrayOrRemoveItIfPresent({ array: selection, item }),
                    //     //tooltipNames : addItemToArrayIfNotPresent({array : prevValues.tooltipNames, item})
                    // }
                    // })}
            />
        </div>
    )
}
 

/**
 * 
 * @param {Object} props
 * @param {('svg'|'data')[]} props.elementTypes - The element types based on which the download function is set. 
 * @param {String[]} props.elementNames - The file element names .e.g what is shown to the user in a selection menu.
 * @param {String[]} props.fileNames - The actual file names.
 * @returns 
 */
function DownloadData({ elements = [], elementNames = [], elementTypes = [], fileNames = [] }) {
    const handleDownload = (elementName) => {
        const idx = elementNames.filter(name => name !== "DIVIDER").indexOf(elementName)
        if (elementTypes[idx] === "svg") {
            downloadSVG(document.getElementById(elements[idx]), fileNames[idx])
        }
        else if (elementTypes[idx] === "data") {

            if (_.isArray(elements[idx]) && _.isObject(elements[idx][0])) {
                const txtData = arrayOfObjectsToString({ data: elements[idx], keyNames : _.keys(elements[idx][0]) })
                downloadTxtFile(txtData,fileNames[idx])
            }
            
        }
    }
    
    return(
        <DownloadIcon items={elementNames} callbackValueOnly={true} callback={handleDownload} callbackKey={"download"}/>
    )
}

/**
 * 
 * @param {Object} props
 * @param {String[]} props.keyNames All keyNames that can be selected.
 * @param {String[]} props.numericKeyNames Numeric keyNames
 * @param {Object} props.selection The current selection.
 * @param {('svg'|'data')[]} props.elementTypes - The element types based on which the download function is set. 
 * @param {String[]} props.fileNames - The file names to download.

 * @returns 
 */
export function ScatterDataSelection({ keyNames, title = "", idx = 1, proteome_ids = [], numericKeyNames = [], selection = {}, setSelection, minimal = true, handleStringSearch, downloadElements = [], elementNames = [], elementTypes = [], fileNames = []}) {
    // const [searchString, setSearchString] = useState("")
    // const debounceString = useDebounce(searchString, 200)

    const nonNumericKeyNames = keyNames.filter(keyName => !numericKeyNames.includes(keyName))
    const onSelection = (key, value) => {

        setSelection(idx,key,value)
    }
    return (
        <div><h3>{title}</h3>
        <div className="flex center-items">
                <ChartAxisSelection
                    keyNames={numericKeyNames}
                    selection={selection}
                    onSelectionChange={onSelection}
                    minimal={minimal} />
            <ChartMarksSelection
                keyNames={keyNames}
                selection={selection}
                onSelectionChange={onSelection}
                minimal={minimal}/>
            <TextSelection 
                keyNames={nonNumericKeyNames}
                selection={selection}
                onSelectionChange={onSelection}
                    minimal={minimal} />
            <FilterSelection
                    proteome_tags = {proteome_ids}
                    keyNames={nonNumericKeyNames}
                    selection={selection}
                    onSelectionChange={onSelection}
                    minimal={minimal} />
        
            {/* {_.isFunction(handleStringSearch) ?
                <InputGroup value={searchString} onChange={(event) => setSearchString(event.target.value)} small={true} rightElement={<Button icon="cross" minimal={true} onClick={() => setSearchString("")}/>}/> :
                null} */}
                {_.isFunction(handleStringSearch) ? <ChartStringSearch
                    idx = {idx}
                    keyNames={nonNumericKeyNames}
                    selection={selection}
                    onSelectionChange={onSelection}
                    minimal={minimal} handleStringSearch={handleStringSearch} /> : null }
                
     
            <div className="flex">
                <Divider/>
                <DownloadData elements={downloadElements} elementNames={elementNames} elementTypes={elementTypes} fileNames={fileNames} />
            </div>

            </div>
            </div>
    )

}



function DatasetPCA({ }) {

    /**
     * @type {import("../../../types/datasets").DatasetContextOutlet}
     */
    const { dataset_tag, metadata, setTabHeader } = useOutletContext() 
    console.log(metadata)
    const { data : pcaresults, isLoading, isFetching, isError, error, isSuccess } = useGetDatasetPCA({ dataset_tag })
    // const { data: attributesByTag, isLoading: attrByTagIsLoading, isFetching: attrByTagIsFetching, isSuccess: attrByTagIsSuccess } = useGetSubmissionAttributesByTag()
    
    const [selection, setSelection] = useState({ xaxisName: undefined, yaxisName: undefined, colorName : undefined, tooltipNames : [], sizeName : undefined, textSearchNames : [] })
    const metaDataFound = _.isObject(metadata) && !_.isEmpty(metadata)
    const sampleAttributeNames = metaDataFound && _.isObject(pcaresults) && _.isObject(pcaresults.samples_attributes) ? _.keys(pcaresults.samples_attributes).map(v => v) : []
    const hasGenotypes = metaDataFound ? !_.isEmpty(metadata.genotypes) : false 
    const numericKeyNames = _.isObject(pcaresults) ? _.filter(_.keys(pcaresults.drivers[0]), keyName => _.isNumber(pcaresults.drivers[0][keyName])) : []
    const nonNumericKeyNames = _.isObject(pcaresults) ? _.keys(pcaresults.drivers[0]).filter(keyName => !numericKeyNames.includes(keyName)) : []
    const numericKeyNamesProjection = _.isObject(pcaresults) ? _.filter(_.keys(pcaresults.projection[0]), keyName => _.isNumber(pcaresults.projection[0][keyName])) : []
    
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
                        
                        <div className="flex justify-space-around">
                            {isSuccess ? <div>
                                <ScatterDataSelection keyNames={_.keys(pcaresults.projection[0])} {...{
                                    title: "Projection",
                                    idx : 0,
                                    numericKeyNames,
                                    selection,
                                    proteome_ids : metadata.proteome_ids,
                                    setSelection : handleScatterSelection,
                                    downloadElements: ["scatter_plot-pca-projection", pcaresults.projection],
                                    elementNames: ["SVG","DIVIDER",`Projected Data (${pcaresults.projection.length} x ${_.keys(pcaresults.projection[0]).length})`],
                                    fileNames: [`${dataset_tag}-PCA.svg`,`${dataset_tag}-PCA-Projection.txt`],
                                    elementTypes: ["svg","data"]
                                }} />
                               
                                <InteractiveChart
                                    data={pcaresults.projection}
                                    extraLimitNames={
                                        [
                                            selection.colorName,
                                            selection.sizeName].filter(keyName => _.isString(keyName) && numericKeyNamesProjection.includes(keyName))}
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
                                            attributeValuesByTag: {},  // metadata.attribute_values_by_tag,
                                        attributesByTag: {},  //metadata.attributes,
                                        genotypesByLabel : {},  //metadata.genotypes,
                                        legend: true,
                                            handleSearchByDataIndex,
                                            filterDataInKeyByValue,
                                        svgID : "scatter_plot-pca-projection"
                                    
                                        }} />
                                </div>)
                            })}

                        </InteractiveChart> </div>: null}

                            {isSuccess ? <InteractiveChart data={pcaresults.drivers}
                                extraLimitNames={numericKeyNames}
                                keyNames={
                                [
                                        {
                                            xaxisName: selection.xaxisName,
                                            yaxisName: selection.yaxisName
                                        }
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
                                        fileNames: [`${dataset_tag}-PCA-drivers.svg`,`${dataset_tag}-PCA-Drivers.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                                    
                                    <ScatterPlot key={`${chartIdx}-drivers-${dataset_tag}`}{...{
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
                                        attributeValuesByTag: {}, // metadata.attribute_values_by_tag,
                                        attributesByTag: {}, // metadata.attributes,
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