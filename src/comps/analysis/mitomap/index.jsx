
import _ from "lodash"
import InteractiveChart from "../../core/charts/interactive"
import { useOutletContext } from "react-router"
import { Network } from "../../core/charts/scatter/Network"
import { useState } from "react"
import APIError from "../../core/error/APIerror"
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection"
import { api } from "@/api";
import { AnnotationGroupSelectionMenu } from "./AnnotationGroupSelection"



export function MitomapNetwork({ }) {

    const { submission_tag } = useOutletContext() 
    const [networkProps, setNetworkProps] = useState({ type: "pathway", comp_type: "pairwise", statProps: {} })
    const [selectedAnnotationGroupTag, setSelectedAnnotationGroupTag] = useState(undefined)
    
    const { data : network_data, isLoading, isFetching, isSuccess, isError, error } = api.submissions.analysis.useGetSubmissionAnnotationNetwork({
        tag: submission_tag, 
        annotation_group_tag: selectedAnnotationGroupTag
    }, {
        enabled: !_.isEmpty(submission_tag) && _.isString(selectedAnnotationGroupTag)
    })


    const [selection, setSelection] = useState({ xaxisName: "x", yaxisName: "y", colorName : "node_type", tooltipNames : ["tag"], sizeName : undefined, textSearchNames : ["tag"] })
    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => {return {...prevValues,[selectionKey] : keyName}})
    }

    const handleAnnotationGroupSelection = (e, tag) => {
        setSelectedAnnotationGroupTag(tag)
    }
    // /**
    //  *
    //  * @param {Object} props
    //  */
    // const handleSelection = (props) => {
    //     setNetworkProps(prevValues => {return {...prevValues,statProps : props}})
    // }

    // //console.log(network_data)
    // // useEffect(() => {setnetwork_data(network_data)},[isSuccess,networkProps.type])
    
    // const network_dataValid = _.isObject(network_data) && _.has(network_data,"nodes")
    
    // if (valueNameFound) {
    //     numericKeyNames  = _.concat(numericKeyNames,[network_data["value_keyName"]])
    // }

    const network_dataValid = isSuccess && _.isObject(network_data) && _.has(network_data, "nodes")
    const numericKeyNames = network_dataValid ? _.filter(_.keys(network_data.nodes[0]), keyName => _.isNumber(network_data.nodes[0][keyName])) : []

    
    if (isLoading || isFetching) {
        return <div>Loading...</div>
    }

    return (<div className="div--expand" style={{overflowY:"scroll"}}>
        <div className="flex-column">
            <div className="margin-bottom--little" style={{ padding: "1rem" }}>
                <h4>Select Annotation Group</h4>
                <AnnotationGroupSelectionMenu 
                    selected_tags={_.isString(selectedAnnotationGroupTag) ? [selectedAnnotationGroupTag] : []} 
                    onSelection={handleAnnotationGroupSelection}
                    showTags={true}
                    placeholder="Select annotation group..."
                />
            </div>
            
            {isError ? <APIError error={error}/> : null}
            
            {!selectedAnnotationGroupTag ? (
                <div className="center-items" style={{ padding: "2rem" }}>
                    <span>Select an annotation group to view the network</span>
                </div>
            ) : null}
            {isSuccess && network_dataValid ? 
       
                
            <InteractiveChart
                data={network_data.nodes}
                extraLimitNames={numericKeyNames}
                dataName={networkProps.type}
                keyNames={[
                {
                    xaxisName: "x",
                    yaxisName: "y"
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
                    findDataInRectangle,
                    setHoverDataInRectangle,
                    findClosestPoint,
                    handleStringSearch,
                    handleSearchByDataIndex,
                    filterDataInKeyByValue,
                    hoverProps,
                    filterProps,
                    labelProps,
                    rerenderAxis,
                    triggerResetAxis,
                    setTriggerResetAxisZoom
                        }, didx) => {
                    return (
                        <div>
                            <ScatterDataSelection keyNames={_.keys(network_data.nodes[0])}
                                        {...{
                                            title : "Annotation Group Network",
                                numericKeyNames,
                                        itemIsAttribute : false,    
                                idx: 1,
                                        chartIdx,
                                        setTriggerResetAxisZoom,
                                        selection,
                                        setSelection : handleScatterSelection,
                                        handleStringSearch,
                                        downloadElements: ["network-scatter" + networkProps.type, network_data.nodes],
                                        elementNames: ["SVG","DIVIDER",`Nodes (n = ${network_data.nodes.length})`],
                                        fileNames: [`${submission_tag}-MitoMap.svg`,`${submission_tag}-Mitomap.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                            <Network key={`${chartIdx}`}{...{
                                width: 1100,
                                height : 1100,
                                chartIdx,
                                colorName:  "type", //valueNameFound ? network_data["value_keyName"] :
                                sizeName: undefined,
                                // tooltipNames : selection.tooltipNames,
                                data,
                                linkIdcs : network_data.links,
                                valid,
                                findDataInRectangle,
                                setHoverDataInRectangle,
                                xaxisName,
                                yaxisName,
                                limits,
                                rerenderAxis,
                                findClosestPoint,
                                tooltipSmall : true,
                                tooltipNames: ["tag"],
                                labelNames : ["tag"],
                                dataRerender : [networkProps.type, selectedAnnotationGroupTag],
                                ...hoverProps,
                                ...filterProps,
                                ...labelProps,
                                triggerResetAxis,
                                setTriggerResetAxisZoom,
                                tooltipNameIsFeature: { "tag": true },
                                // attributeValuesByTag: metadata.attribute_values_by_tag,
                                // attributesByTag: metadata.attributes,
                                // genotypesByLabel : metadata.genotypes,
                                legend: true,
                                    handleSearchByDataIndex,
                                    filterDataInKeyByValue,
                                svgID : "network-scatter" + networkProps.type
                            
                                }} />
                        </div>)
                    })}

                </InteractiveChart> : null}
            
            </div>
           

    </div>)
}

