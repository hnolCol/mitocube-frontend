import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { Header } from "../../core/base/Header";
import { useEffect, useState } from "react";
import { useGetDatasetPCA } from "../../../hooks/queries/datasets.hooks";
import _ from "lodash"
import Loading from "../../core/base/loading";
import { isError } from "react-query";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { useGetSubmissionAttributesByTag } from "../../../hooks/queries/submission.hooks";
import GroupingSelection from "../../core/base/attribute_selection/Selection";

function DatasetPCA({ }) {
    
    const { dataset_label, metadata, setTabHeader } = useOutletContext()   
    const { data : pcaresults, isLoading, isFetching, isError, error, isSuccess } = useGetDatasetPCA({ dataset_label })
    const { data: attributesByTag, isLoading: attrByTagIsLoading, isFetching: attrByTagIsFetching, isSuccess: attrByTagIsSuccess } = useGetSubmissionAttributesByTag()
    const [selectedGroupings, setSelectedGroupings] = useState({colorName : undefined, splitName : undefined, subplotName : undefined})

    useEffect(() => {
        if (_.isObject(metadata) && _.has(metadata, "title")) {
            setTabHeader(metadata.title)
        }
    }, [_.isObject(metadata)])
    console.log(pcaresults)

    const sampleAttributeNames = _.isObject(metadata) && _.isObject(metadata.samples_attributes) ? _.values(metadata.samples_attributes).map(v => v.name) : []

    return (
        <div style={{ overflowY: "scroll", height: "80vh " }}>
            <h2>Principal Component Analysis</h2>
            <p>Please select the desired components showing the projection (left) as well the drivers (right). Selecting a point in the right point displays the feature's profile in the bottom.</p>
            {isLoading || isFetching ||  attrByTagIsLoading || attrByTagIsFetching ? <Loading /> : isError ? <APIError error={error} /> : isSuccess && attrByTagIsSuccess? 
                <div>
                    <p>{pcaresults.variance_explained.length} components calculated, explaining {_.round(_.sum(pcaresults.variance_explained)*10000)/100}% of the total variance.</p>
                    <div>
                        <h3>Projection</h3>
                        {/* if (didx === 1) return <div><ProfileChart {...{chartIdx,data,valid,findDataInRectangle,setHoverDataInRectangle,xaxisName,yaxisName,limits,...hoverProps, ...filterProps}}/></div>
                            return (<div><ScatterPlot {...{chartIdx,data,valid,findDataInRectangle,setHoverDataInRectangle,xaxisName,yaxisName,limits,...hoverProps, ...filterProps}}/>
                            {didx===0?<div>
                                <RangeSlider min={0} max={100} value={filterProps.filterRange} stepSize={5} onChange={range => handleNumericFilter(0,"x",range[0],range[1])}/><Button onClick={() => handleNumericFilter(0,"x",0.2,0.5)}/>
                                <InputGroup onChange={(e) => handleStringSearch("label",e.target.value)}/>
                                </div>:null} */}
                        {isSuccess ? <div>
                            <GroupingSelection
                                groupings={sampleAttributeNames}
                                keyNames={["colorName", "splitName", "subplotName"]}
                                handleSelection={(name,value) => setSelectedGroupings(prevValues => { return { ...prevValues, [name] : _.has(pcaresults.projection[0],value)?value:undefined}})}
                                selectedItems={selectedGroupings} />
                            <InteractiveChart data={pcaresults.projection} keyNames={[
                            {
                                xaxisName: _.keys(pcaresults.projection[0])[1],
                                yaxisName: _.keys(pcaresults.projection[0])[2]
                            }]}
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
                                handleSearchByDataIndex,
                                hoverProps,
                                filterProps
                            }, didx) => {
                                return (
                                    <div>
                                    <ScatterPlot key={`${chartIdx}`}{...{
                                        chartIdx,
                                        colorName : selectedGroupings.colorName,
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
                                        attributesByTag,
                                        legend: true,
                                        handleSearchByDataIndex
                                    }} />
                                </div>)
                            })}

                        </InteractiveChart> </div>: null}

                            {/* {Object.keys(data.samples_attributes)} */}
                        {isSuccess ? <InteractiveChart data={pcaresults.drivers} keyNames={
                            [
                                { xaxisName: _.keys(pcaresults.drivers[0])[1], yaxisName: _.keys(pcaresults.drivers[0])[2] },
                                { xaxisName: _.keys(pcaresults.drivers[0])[3], yaxisName: _.keys(pcaresults.drivers[0])[2] }
                            ]}
                            isPointChart={[true, true]}>
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
                                hoverProps,
                                filterProps
                            }, didx) => {
                                return (<div>
                                    
                                    <ScatterPlot key={`${chartIdx}-drivers-${dataset_label}`}{...{
                                        chartIdx,
                                        data,
                                        valid,
                                        
                                        findDataInRectangle,
                                        setHoverDataInRectangle,
                                        xaxisName,
                                        yaxisName,
                                        limits,
                                        tooltipNames : ["index"],
                                        ...hoverProps,
                                        ...filterProps,
                                        attributesByTag
                                    }} />
                                </div>)
                            })}

                        </InteractiveChart> : null}

                    </div>
                
                
                </div> : null}


        </div>
    )


}


export default DatasetPCA