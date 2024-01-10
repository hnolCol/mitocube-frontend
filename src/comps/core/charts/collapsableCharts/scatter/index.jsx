



import PropTypes from "prop-types"
import _ from "lodash"
import { Text } from "@visx/text"
import { motion } from "framer-motion"
import { scaleLinear } from "@visx/scale"
import { Group } from "@visx/group"
import { useTooltip, useTooltipInPortal } from "@visx/tooltip"
import { localPoint } from "@visx/event"
import { AxisLeft } from "@visx/axis"
import { Button, InputGroup } from "@blueprintjs/core"
import { useState } from "react"
import CollapsableAxes from ".."
import { SVG } from "../../SVGHeader"
import { getDomainWithBoundaries } from "../../../../../services/arrays/boundaries"
import { getDefaultStrokeProps } from "../../../svg/styles/strokes"
import AxisBackground from "../../background"
import MetricTable from "../../../base/metrictable"
import DownloadIcon from "../../../svg/icons/chartSelection/Download"
import { downloadTxtFile } from "../../../../../services/downloads/txt"
import { arrayOfObjectsToString } from "../../../../../services/arrays/transforms"
import { downloadSVG } from "../../../../../services/downloads/svg"
import AnimatedPoint from "../../scatter/AnimatedPoint"
import { Combobox } from "../../../input/Combobox"
import TagBasedSearch from "../../../base/search/TagSearch"
import GroupingSelection from "../../../base/attribute_selection/Selection"

function CollapsableScatter({
    width = 1000,
    height = 400,
    headerHeight = 40,
    marginBetweenHeaderAndChart = 5,
    data,
    yaxisName,
    subplotName,
    yLabel = "log2 fold change",
    sizeName = undefined,
    colorName = undefined,
    tooltipNames = [],
   // highlightMatches = { GeneNames: "SQOR" },
    margins = { left: 40, right: 10, bottom: 5, top: 2 },
    totalSubplotValues = {}
}) {
    const [sort, setSort] = useState(false)
    const [tagBasedSearch, setTagBasedSearch] = useState({})
    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip();
    getDomainWithBoundaries
    
    const yAxisDomain = getDomainWithBoundaries({ data : data, keyName: yaxisName })
    const svgID = `collapsableScatter_${yLabel}`
    const highlightSpecificPoints = _.isObject(tagBasedSearch) && Object.keys(tagBasedSearch).length > 0
    const keyNames = Object.keys(data[0])


    const yScale = scaleLinear({
        range : [headerHeight+marginBetweenHeaderAndChart,height],
        domain : [yAxisDomain.max,yAxisDomain.min]
    })
    
    
    
      const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
      })

    const handleMouseOver = (event, data) => {
        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: data
        });
    };
    
    const getToolTipData = (data) => {
        //return data for tooltip (array of objects )
        return _.map(tooltipNames, tooltipName => { return { text: tooltipName, value : data[tooltipName]} }).filter(v => v.value !== undefined)

    }
    
    const downloadCallback = (callbackValue) => {
        //handle download requests
        if (callbackValue === "Raw data") {
            
            downloadTxtFile(arrayOfObjectsToString(data, Object.keys(data[0])), `rawData.txt`)
        }

        else if (callbackValue === "SVG") {

            downloadSVG(document.getElementById(`${svgID}`), `collapsableGraph.svg`)
        }
    }

    const handleSearchTagChange = (tags) => {
        //tag based search enabled to search for specific columns
        setTagBasedSearch(tags)
    }

    return (
        <div>
            <Button text="Sort" onClick={() => setSort(!sort)} />
            
            <TagBasedSearch {...{data, onTagChange : handleSearchTagChange, tags : tagBasedSearch}} />

            <GroupingSelection keyNames={["colorName","sizeName"]} selectedItems={{}} groupings={data[0]} />
            <DownloadIcon items={["Raw data", "DIVIDER", "SVG"]} callback={downloadCallback} callbackValueOnly={true} />
            <SVG {...{ width, height: height, svgRef: containerRef, svgID }}>
                <AxisLeft scale={yScale} left={margins.left} tickLength={2} label={yLabel} labelOffset={20}
                    tickLabelProps={{
                        fontSize: 12,
                        fill: "black",
                        fillOpacity: 1,
                        textAnchor: 'end',
                    }} />
                
                <CollapsableAxes {...{
                        data: sort ? _.orderBy(data, yaxisName) : data,
                        subplotName,
                        margins,
                        colorName,
                        sizeName,
                        width,
                        highlightMatches: tagBasedSearch,
                        highlightSpecificPoints
                }}>
                    
                {(subplots) => subplots.map(({
                    width,
                    startWidth,
                    divIsCollapsed,
                    toggleCollapse,
                    subplotIdx,
                    subplotName,
                    subplotCategory,
                    subplotCategories,
                    subplotCategoriesCounts,
                    highlightDataPoint,
                    subplotData, colorScale, sizeScale, xScale,
                    subplotColor }, idx) => {


                    const coverageText = _.has(totalSubplotValues,subplotCategory) ? `(${subplotData.length}/${totalSubplotValues[subplotCategory]})` : `(${subplotData.length})`
                    return (
                        <Group key={`${subplotCategory}-${{width}}`}  left={margins.left}>
                            
                            {!divIsCollapsed ?
                                <Group>
                                    <AxisBackground x={startWidth} y={headerHeight + marginBetweenHeaderAndChart} width={width} height={height - 40} />
                                </Group> : null}
                            <g onClick={() => toggleCollapse(subplotIdx)} cursor={"default"}>
                                
                                <motion.rect x={0} y={0} width={0} height={headerHeight} fill={subplotColor} rx={6}
                                    animate={{ width, x: startWidth }} opacity={0.85} whileHover={{ opacity: 1 }} />
                                {_.has(totalSubplotValues, subplotCategory) && !divIsCollapsed ?
                                    <rect
                                        x={startWidth + 2}
                                        height={30}
                                        y={5}
                                        rx={5}
                                        width={width * subplotCategoriesCounts[subplotCategory] / totalSubplotValues[subplotCategory]}
                                        fill="white"
                                        opacity={0.3} /> :
                                    null
                                }
                                
                                {divIsCollapsed ? null :
                                    <Text x={startWidth + width / 2}
                                        y={20}
                                        verticalAnchor="middle" textAnchor="middle"
                                        scaleToFit={'shrink-only'} width={width}>
                                            {`${subplotCategory} ${coverageText}`}
                                    </Text>
                                }
                        </g>
                        <g>
                                {divIsCollapsed ? null : subplotData.map((d, ix) => {
                                    const circleRadius = sizeName ? sizeScale(d[sizeName]) : sizeScale()
                                    
                                    var opacity = 1
                                    if (highlightSpecificPoints){
                                        opacity =  highlightDataPoint[ix] ? 1 : 0.3 
                                    }
                                    return (
                                        <AnimatedPoint
                                            key={`${ix}-${subplotCategory}`}
                                            {...{
                                                cx0: startWidth,
                                                r: circleRadius,
                                                opacity,
                                                cx1 : xScale(ix),
                                                cy : yScale(d[yaxisName]),
                                                onHoverStart : e => handleMouseOver(e, getToolTipData(d)),
                                                onHoverEnd : hideTooltip,
                                                fill : subplotColor
                                        }} />
                        
                                )})} 
                        </g>
                        </Group>
                    )
                }
                )
                }
            </CollapsableAxes>
            </SVG>

            


            {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                >   
                    <div className="flex flex-column center-items">
                        <MetricTable data={tooltipData} />
                    </div>
                </TooltipInPortal>
            )}
            {/* subplotName,
    sizeName,
    sizeRange = [3, 10],
    colorName,
    rowHeight = 50,
    subplotDefaultWidth = 200,
    subplotBasicWidth = 70,
    collapsedWidth = 50,
    subplotScalesItems = true,
    widthPerItem = 25,
    defaultSize = 8, */}
        </div>
        
    )
}

export default CollapsableScatter