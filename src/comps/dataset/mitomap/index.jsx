
import _ from "lodash"
import { useGetNetwork } from "../../../hooks/queries/network.hooks"
import InteractiveChart from "../../core/charts/interactive"
import { useOutletContext } from "react-router"
import { Network } from "../../core/charts/scatter/Network"
import { useState } from "react"
import { ScatterDataSelection } from "../pca"
import { SegmentedControl } from "@blueprintjs/core"
import { AttributePairwiseSelection } from "../../core/base/attribute_selection/Pairwise"
import APIError from "../../core/error/APIerror"

export function MitomapNetwork({ }) {
    const { dataset_label, metadata, setTabHeader, tabHeader, attributesByTag } = useOutletContext() 
    const [networkProps, setNetworkProps] = useState({ type: "pathway", comp_type : "pairwise", statProps : {} })
    //const [network_data, setnetwork_data] = useState({})
       
    const { data: network_data, isLoading, isFetching, isSuccess, isError, error } = useGetNetwork({ network_type: networkProps.type, dataset_label, statProps : networkProps.statProps }, {enabled : !_.isEmpty(networkProps.statProps)})
    
    const valueNameFound = _.isObject(network_data) && _.has(network_data,"value_keyName")
    const [selection, setSelection] = useState({ xaxisName: "x", yaxisName: "y", colorName : "node_type", tooltipNames : ["id"], sizeName : undefined, filterNames : [] })
    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => {return {...prevValues,[selectionKey] : keyName}})
    }
    /**
     * 
     * @param {Object} props 
     */
    const handleSelection = (props) => {
        setNetworkProps(prevValues => {return {...prevValues,statProps : props}})
    }

    //console.log(network_data)
    // useEffect(() => {setnetwork_data(network_data)},[isSuccess,networkProps.type])
    
    const network_dataValid = _.isObject(network_data) && _.has(network_data,"nodes")
    let numericKeyNames = network_dataValid ? _.filter(_.keys(network_data.nodes[0]), keyName => _.isNumber(network_data.nodes[0][keyName])) : []
    if (valueNameFound) {
        numericKeyNames  = _.concat(numericKeyNames,[network_data["value_keyName"]])
    }

    return (<div className="div--expand" style={{overflowY:"scroll"}}>
        <div className="flex">
        <div>
            <h3>Settings</h3>
            <h4>MitoCarta Network</h4>
            <SegmentedControl
                    options={[{ label: "Pathway", value: "pathway" }, { label: "Localization", value: "localization" }]}
                    small={true}
                    fill={false}
                    value={networkProps.type}
                    onValueChange={(value) => setNetworkProps(prevValues => { return { ...prevValues, type : value } })}
                    intent="primary"
                    defaultValue="pathway"
                />
                {_.isObject(metadata) ? 
                    <AttributePairwiseSelection {...{metadata,callbackText : "Map Network Nodes.", callback : handleSelection, isLoading : isError ? false : (isFetching || isLoading)}} /> : null}
            {/* <h4>Color encoding</h4>
            <SegmentedControl
                    options={[{ label: "Pairwise", value: "pairwise" }, { label: "Multiple", value: "mulitple" }]}
                    small={true}
                    fill={false}
                    value={networkProps.comp_type}
                    onValueChange={(value) => setNetworkType(value)}
                    intent="primary"
                    defaultValue="pairwise"
                /> */}
            {isError ? <APIError error={error}/> : null}
            </div>
            {isSuccess && _.isObject(metadata) && network_dataValid ? 
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
                    handleItemSelection,
                    findIndexInRectangle,
                    findDataInRectangle,
                    setHoverDataInRectangle,
                    findClosestPoint,
                    handleNumericFilter,
                    handleStringSearch,
                    handleSearchByDataIndex,
                    filterDataInKeyByValue,
                    hoverProps,
                    filterProps,
                    labelProps
                        }, didx) => {
                    return (
                        <div>
                            <ScatterDataSelection keyNames={_.keys(network_data.nodes[0])}
                                        {...{
                                            title : "MitoCarta 3.0 Network Map",
                                        numericKeyNames,
                                        idx : 1,
                                        selection,
                                        setSelection : handleScatterSelection,
                                        handleStringSearch,
                                        downloadElements: ["network-scatter" + networkProps.type, network_data.nodes],
                                        elementNames: ["SVG","DIVIDER",`Nodes (n = ${network_data.nodes.length})`],
                                        fileNames: [`${metadata.label}-MitoMap.svg`,`${metadata.label}-Mitomap.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                            <Network key={`${chartIdx}`}{...{
                                width: 1100,
                                height : 1100,
                                chartIdx,
                                colorName: valueNameFound ? network_data["value_keyName"] : "node_type",
                                sizeName: undefined,
                                // tooltipNames : selection.tooltipNames,
                                data,
                                linkIdcs : network_data.link_idcs,
                                valid,
                                findDataInRectangle,
                                setHoverDataInRectangle,
                                xaxisName,
                                yaxisName,
                                limits,
                                findClosestPoint,
                                tooltipSmall : true,
                                tooltipNames: ["id"],
                                labelNames : ["id"],
                                dataRerender : [networkProps.type],
                                ...hoverProps,
                                ...filterProps,
                                ...labelProps,
                                attributeValuesByTag: metadata.attribute_values_by_tag,
                                attributesByTag: metadata.attributes,
                                genotypesByLabel : metadata.genotypes,
                                legend: true,
                                    handleSearchByDataIndex,
                                    filterDataInKeyByValue,
                                svgID : "network-scatter" + networkProps.type
                            
                                }} />
                        </div>)
                    })}

                </InteractiveChart> : null}
            
            </div>
            {/* <svg width={width} height={height}>
                <rect width={width} height={height} rx={14} fill={background} />
                <Graph
                graph={data}
                top={5}
                left={10}
                    nodeComponent={({ node }) => {
                        console.log(xscale(node.x), yscale(node.y))
                        return <circle cx={xscale(node.x)} cy={yscale(node.y)} r={8} fill={node.node_type === "pathway"?"white":"#21D4FD"} stroke="#000" />
                    }}
                linkComponent={({ link: { source, target, dashed } }) => (
                    <line
                    x1={xscale(source.x)}
                    y1={yscale(source.y)}
                    x2={xscale(target.x)}
                    y2={yscale(target.y)}
                    strokeWidth={2}
                    stroke="#999"
                    strokeOpacity={0.6}
                    strokeDasharray={dashed ? '8,4' : undefined}
                    />
                )}
                />
          </svg>
            // <ForceGraph graphData={data} nodeAutoColorBy={"node_type"} nodeLabel={(node) => node.id} nodeRelSize={8} />
            : null}
         */}

    </div>)
}

