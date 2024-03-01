import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { useEffect, useState } from "react";
import { useGetDatasetPCA } from "../../../hooks/queries/datasets.hooks";
import _ from "lodash"
import Loading from "../../core/base/loading";

import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { useGetSubmissionAttributesByTag } from "../../../hooks/queries/submission.hooks";

import { Button, Divider, InputGroup } from "@blueprintjs/core";
import { XAxisName, YAxisName } from "../../core/svg/icons/chartSelection/ChartAxisNames";
import SizeIconWithName from "../../core/svg/icons/chartSelection/Size";
import ColorIconWithName from "../../core/svg/icons/chartSelection/Color";
import { TextIconWithName } from "../../core/svg/icons/chartSelection/Text";
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent, arrayOfObjectsToString } from "../../../services/arrays/transforms";
import DownloadIcon from "../../core/svg/icons/chartSelection/Download";
import FilterIcon from "../../core/svg/icons/chartSelection/Filter";
import useDebounce from "../../../hooks/useDebounce";
import { downloadSVG } from "../../../services/downloads/svg";
import { downloadTxtFile } from "../../../services/downloads/txt";
import { Legend } from "@visx/legend";

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
                callbackKey="tooltipNames" callback={(key, item) => onSelectionChange(prevValues =>
                {
                    return {
                        ...prevValues, [key]: addItemToArrayOrRemoveItIfPresent({ array: prevValues.tooltipNames, item})
                    }
                })} />
        </div>
    )
}


function ChartAxisSelection({ keyNames, selection, onSelectionChange, minimal }) {
    return (
        <div className="flex">
            <XAxisName
                items={keyNames}
                selectedItems={[{text : selection.xaxisName}]}
                placeholder={selection.xaxisName}
                callbackKey="xaxisName"
                minimal={minimal}
                callback={onSelectionChange} />
            <YAxisName
                items={keyNames}
                placeholder={selection.yaxisName}
                minimal={minimal}
                selectedItems={[{text : selection.yaxisName}]}
                callbackKey="yaxisName"
                callback={onSelectionChange} />
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

        handleStringSearch(selection.filterNames,debounceString)
    }, [debounceString, _.join(selection.filterNames)])

    console.log(selection.filterNames)
    return (
        <div className="flex center-items">
            <InputGroup value={searchString} onChange={(event) => setSearchString(event.target.value)} small={true} rightElement={<Button icon="cross" minimal={true} onClick={() => setSearchString("")} />} />
            <FilterIcon
                items={keyNames}
                callbackKey={"filterNames"}
                selectedItems={_.map(selection.filterNames, text => { return { text } })}
                minimal={minimal}
                callback={(key, value) => onSelectionChange(key, addItemToArrayOrRemoveItIfPresent({ array: selection.filterNames, item : value }))}
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
        const idx = elementNames.indexOf(elementName)
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
export function ScatterDataSelection({ keyNames, title = "", idx = 1, numericKeyNames = [], selection = {}, setSelection, minimal = true, handleStringSearch, downloadElements = [], elementNames = [], elementTypes = [], fileNames = []}) {
    // const [searchString, setSearchString] = useState("")
    // const debounceString = useDebounce(searchString, 200)

    const nonNumericKeyNames = keyNames.filter(keyName => !numericKeyNames.includes(keyName))
    const onSelection = (key, value) => {

        setSelection(idx,key,value)
    }
    return (
        <div><h3>{title}</h3>
        <div className="flex center-items">
            <ChartAxisSelection keyNames={numericKeyNames}
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
    const { dataset_label, metadata, setTabHeader } = useOutletContext()   

    const { data : pcaresults, isLoading, isFetching, isError, error, isSuccess } = useGetDatasetPCA({ dataset_label })
    const { data: attributesByTag, isLoading: attrByTagIsLoading, isFetching: attrByTagIsFetching, isSuccess: attrByTagIsSuccess } = useGetSubmissionAttributesByTag()
    
    const [selection, setSelection] = useState({ xaxisName: undefined, yaxisName: undefined, colorName : undefined, tooltipNames : [], sizeName : undefined, filterNames : [] })
    
    const sampleAttributeNames = _.isObject(metadata) && _.isObject(metadata.samples_attributes) ? _.keys(metadata.samples_attributes).map(v => v) : []
    const numericKeyNames = _.isObject(pcaresults) ? _.filter(_.keys(pcaresults.drivers[0]), keyName => _.isNumber(pcaresults.drivers[0][keyName])) : []
    const nonNumericKeyNames = _.isObject(pcaresults) ? _.keys(pcaresults.drivers[0]).filter(keyName => !numericKeyNames.includes(keyName)) : []
    useEffect(() => {

        if (_.isObject(metadata) && _.has(metadata, "title")) {
            setTabHeader(metadata.title)
        }
    }, [_.isObject(metadata)])

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
            {isLoading || isFetching ||  attrByTagIsLoading || attrByTagIsFetching ? <Loading /> : isError ? <APIError error={error} /> : isSuccess && attrByTagIsSuccess? 
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
                                    downloadElements: ["scatter_plot-pca-projection",pcaresults.projection],
                                    elementNames: ["SVG","DIVIDER",`Projected Data (${pcaresults.projection.length} x ${_.keys(pcaresults.projection[0]).length})`],
                                    fileNames: [`${metadata.label}-PCA.svg`,`${metadata.label}-PCA-Projection.txt`],
                                    elementTypes: ["svg","data"]
                                }} />
                               
                                <InteractiveChart
                                    data={pcaresults.projection} extraLimitNames={[selection.colorName, selection.sizeName].filter(keyName => _.isString(keyName))}
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
                                        tooltipNames : _.concat(["index"],sampleAttributeNames),
                                        ...hoverProps,
                                        ...filterProps,
                                        attributeValuesByTag: metadata.attribute_values_by_tag,
                                        attributesByTag : metadata.attributes,
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
                                        fileNames: [`${metadata.label}-PCA-drivers.svg`,`${metadata.label}-PCA-Drivers.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                                    
                                    <ScatterPlot key={`${chartIdx}-drivers-${dataset_label}`}{...{
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