
import _ from "lodash"
import { useGetNetwork } from "../../../hooks/queries/network.hooks"
import InteractiveChart from "../../core/charts/interactive"
import { useOutletContext } from "react-router"
import { ScatterPlot  } from "../../core/charts/scatter"
import ForceGraph from "react-force-graph-2d"
import { DefaultLink, DefaultNode, Graph } from "@visx/network"
import { scaleLinear } from "@visx/scale"
import { Network } from "../../core/charts/scatter/Network"
import { useEffect, useState } from "react"
import { ScatterDataSelection } from "../pca"
import { SegmentedControl } from "@blueprintjs/core"

export function MitomapNetwork({ }) {
    const { dataset_label, metadata, setTabHeader, tabHeader, attributesByTag } = useOutletContext() 
    const [networkProps, setNetworkProps] = useState({ type: "pathway", comp_type : "pairwise" })
    const [networkData, setNetworkData] = useState({})
       
    const { data: network_data, isLoading, isFetching, isSuccess } = useGetNetwork({ type: networkProps.type })
    
    console.log(network_data)

    const [selection, setSelection] = useState({ xaxisName: "x", yaxisName: "y", colorName : "node_type", tooltipNames : ["id"], sizeName : undefined, filterNames : [] })
    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => {return {...prevValues,[selectionKey] : keyName}})
    }

    useEffect(() => {setNetworkData(network_data)},[isSuccess,networkProps.type])
    
    const networkDataValid = _.isObject(networkData) && _.has(networkData,"nodes")
    const numericKeyNames = networkDataValid ? _.filter(_.keys(networkData.nodes[0]), keyName => _.isNumber(networkData.nodes[0][keyName])) : []

    return (<div className="div--expand" style={{overflowY:"scroll"}}>
        <div className="flex">
        {isSuccess && _.isObject(metadata) && networkDataValid ? 
        <InteractiveChart
            data={networkData.nodes}
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
                    filterProps
                }, didx) => {
                    return (
                        <div>
                            <ScatterDataSelection keyNames={_.keys(networkData.nodes[0])}
                                        {...{
                                            title : "MitoCarta 3.0 Network Map",
                                        numericKeyNames,
                                        idx : 1,
                                        selection,
                                        setSelection : handleScatterSelection,
                                        handleStringSearch,
                                        downloadElements: ["network-scatter" + networkProps.type, networkData.nodes],
                                        elementNames: ["SVG","DIVIDER",`Nodes (n = ${networkData.nodes.length})`],
                                        fileNames: [`${metadata.label}-MitoMap.svg`,`${metadata.label}-Mitomap.txt`],
                                        elementTypes: ["svg", "data"]
                                        }} />
                            <Network key={`${chartIdx}`}{...{
                                width: 800,
                                height : 800,
                                chartIdx,
                                colorName: "node_type",
                                sizeName: undefined,
                                // tooltipNames : selection.tooltipNames,
                                data,
                                linkIdcs : networkData.link_idcs,
                                valid,
                                findDataInRectangle,
                                setHoverDataInRectangle,
                                xaxisName,
                                yaxisName,
                                limits,
                                findClosestPoint,
                                tooltipSmall : true,
                                tooltipNames: ["id"],
                                dataRerender : [networkProps.type],
                                ...hoverProps,
                                ...filterProps,
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
                <h4>Color encoding</h4>
                <SegmentedControl
                        options={[{ label: "Pairwise", value: "pairwise" }, { label: "Multiple", value: "mulitple" }]}
                        small={true}
                        fill={false}
                        value={networkProps.comp_type}
                        onValueChange={(value) => setNetworkType(value)}
                        intent="primary"
                        defaultValue="pairwise"
                />
                
                
            </div>
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

