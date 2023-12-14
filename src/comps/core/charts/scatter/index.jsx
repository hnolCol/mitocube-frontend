import PropTypes from "prop-types"
import Point from "./Point"
import AxisWithBackground from "../axis"
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size"
import { useMemo, useRef } from "react"
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects, getMaxAbsoluteValue } from "../../../../services/arrays/boundaries"
import { scaleLinear, scaleOrdinal } from "@visx/scale"
import { SVG } from "../SVGHeader"
import { useTooltip, useTooltipInPortal, TooltipWithBounds, Tooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import _ from "lodash"
import MetricTable from "../../base/metrictable"
import ScatterPoints from "./ScatterPoints"
import { getUniqueSetsOfAllValuesinArrayOfObjects, getUniqueValuesFromArrayOfObjectsByKey } from "../../../../services/arrays/groupby"
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique"
import { getColorPalette } from "../../colors/colorPalette"
import { Legend } from "../categorical/boxplot"
import { mapAttributeValueTagsToAttributes } from "../../../../services/attributes"

ScatterPlot.propTypes = {

    points : PropTypes.arrayOf(Object),
    defaultRadius: PropTypes.number,
    limits : PropTypes.object.isRequired,
    xaxisName: PropTypes.string.isRequired,
    yaxisName: PropTypes.string.isRequired,
    colorName: PropTypes.string,
    sizeName: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    centerXAxisAtZero : PropTypes.bool,
    findDataInRectangle : PropTypes.func
}


export function ScatterPlot({
    chartIdx,
    width = 500,
    height = 500,
    margins = {
        left: 40,
        top: 25,
        right: 90,
        bottom: 40
    },
    data,
    valid,
    hoverData = [],
    limits,
    xaxisName,
    yaxisName,
    colorName = "x",
    sizeName = undefined,
    svgID = "scatterplot",
    tooltipNames = ["label"],
    findDataInRectangle,
    handleSearchByDataIndex,
    resetSearchIdcs,
    setHoverDataInRectangle,
    centerXAxisAtZero = false,
    defaultRadius = 7,
    rerenderHover,
    hoverPosition,
    hoverChart,
    rerenderBackground,
    filterIndices,
    searchIndices,
    tooltipSmall = true,
    attributesByTag,
    legend = false }) {
    // Plots an array of points. Each item in the array 
    // must be an object including the following keys: x, y, r
    const tooltipOpen = hoverPosition.length === 2 && hoverData.length > 0
    const rectDist = Object.fromEntries([xaxisName, yaxisName].map(keyName => {
        let keyNameLimits = limits[keyName]
        let dist = Math.sqrt(Math.pow(keyNameLimits.max - keyNameLimits.min, 2)) * 0.007
        return [keyName, dist]
    }))
    const {
        tooltipData: legendTooltipData,
        tooltipLeft: legendTooltipLeft,
        tooltipTop: legendTooltipTop,
        tooltipOpen: legendTooltipOpen,
        showTooltip: showLegendTooltip,
        hideTooltip: hideLegendTooltip,
    
    } = useTooltip();

    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
    })
    

    
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins(width, height, margins)
    
    const yScale = useMemo(() => {
        // y scale for the scatter
    
        const yDomain = limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain })

        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, chartHeight])


    const xScale = useMemo(() => {
        // y scale for the scatter
        const xDomain = limits[xaxisName]
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain })
        const maxValue = getMaxAbsoluteValue({ data: [xDomainWithMargin.max, xDomainWithMargin.min] })
        
        return scaleLinear(
            {
                domain: centerXAxisAtZero ? [-maxValue, maxValue] : [xDomainWithMargin.min, xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice: true
            }
        )
    }, [xaxisName, chartWidth])

    const colorScale = useMemo(() => {
        if (!_.isString(colorName) || !_.has(data[0], colorName)) return () => "#efefef"
        if (_.isNumber(data[0][colorName])) {
            return scaleLinear({
                domain: [0, 100],
                range: ['#75fcfc', '#3236b8']
            })
        }
        else {
            const uniqueValues = getUniqueValuesInArrayOfObjects({ data, keyName: colorName })
            return scaleOrdinal({
                domain: uniqueValues,
                range: getColorPalette(uniqueValues.length)
            })
        }
        
    }, [colorName])

    const sizeScale = useMemo(() => {
        return () => defaultRadius
    }, [sizeName])

    const handleMouseHover = (event) => {

        const coords = localPoint(event.target.ownerSVGElement, event);
        const x = xScale.invert(coords.x)
        const y = yScale.invert(coords.y)

        setHoverDataInRectangle(chartIdx,
            x - rectDist[xaxisName],
            y - rectDist[yaxisName],
            x + rectDist[xaxisName],
            y + rectDist[yaxisName], [coords.x, coords.y])
        //const findDataInRectangle = (chartIdx,minX,minY,maxX,maxY) => {

    }

    const handleLegendMouseOver = (event, tooltipData, idcs) => {
        const coords = localPoint(event.target.ownerSVGElement, event);
        handleSearchByDataIndex(chartIdx, idcs)
        showLegendTooltip({
            tooltipLeft: coords.x,
            tooltipTop: coords.y,
            tooltipData: tooltipData
        })
    }

    const onLegendGroupLeave = () => {
        hideLegendTooltip()
        resetSearchIdcs()
    }
    

    return (
        <div>
        <SVG {...{ width, height, svgID, svgRef : containerRef}}>
            <AxisWithBackground
                margins={margins}
                leftScale={yScale}
                bottomScale={xScale}
                bottomLabel={xaxisName}
                leftHideTicks={false}
                leftLabel={yaxisName}
                moveBottomToLeft={false}
                findAttributesForBottomScale={false}
                {...{ chartHeight, chartWidth }} />
            <g >
            {/* Render data points */}
                    <ScatterPoints {...{
                        data,
                        valid,
                        xScale,
                        yScale,
                        xaxisName,
                        yaxisName,
                        sizeScale,
                        sizeName,
                        colorName,
                        colorScale,
                        rerenderDependency: _.concat(rerenderBackground,[colorName,sizeName]),
                        filterIndices,
                        searchIndices
                    }} />
            </g>
            <g>
            {/* Rerender hover points */}
                    <ScatterPoints {...{
                        data: hoverData,
                        valid,
                        xScale,
                        yScale,
                        xaxisName,
                        yaxisName,
                        sizeScale,
                        sizeName,
                        colorName: undefined,
                        fill: "red",
                        rerenderDependency: rerenderHover
                    }} />
            </g>
                <rect x={margins.left} y={margins.top} width={chartWidth} height={chartHeight} onMouseMove={handleMouseHover} fill="#ffffff" opacity={0.0}/>
                {legend ? <Legend x={width - margins.right} y={margins.top} width={margins.right} height={height - margins.bottom - margins.top}
                    {...{data,colorScale, colorName, attrValuesByTag: attributesByTag.attribute_values, handleMouseOver : handleLegendMouseOver, onLegendGroupLeave}} /> : null}
                {/* //attributesByTag */}

            </SVG >
            
            {tooltipOpen && hoverChart === chartIdx && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds this tooltip is for the points of the scatter. 
                key={Math.random()}
                top={hoverPosition[1]}
                left={hoverPosition[0]}
                >   
                    <div className="flex flex-column justify-start">
                        {hoverData.map((v, idx) => idx < 10 ? <div key={`${idx}-hover`}>
                            {tooltipSmall ? <div>
                                {
                                    tooltipNames.map(tooltipName => <div key={`${idx}-${tooltipName}`}>{v[tooltipName]}</div>)
                                }
                            </div> :
                                <div className="flex flex-column bg--lightgrey padding--medium margin--little" style={{ borderLeft: "3px solid " + colorScale(v[colorName]) }}>
                                    {
                                        tooltipNames.map(tooltipName => <div key={`${idx}-${tooltipName}`} className="margin--tiny">
                                            {mapAttributeValueTagsToAttributes({ attrValuesByTag: attributesByTag.attribute_values, attrValueTag: v[tooltipName] }).asString}
                                        </div>)
                                            
                                    }
                                </div>}
                        </div> : null )}
                        
                    </div>
                </TooltipInPortal>
            )}

            {legendTooltipOpen && (
                <TooltipInPortal top={legendTooltipTop} left={legendTooltipLeft} key={Math.random()}>
                    <MetricTable data={legendTooltipData} />
                </TooltipInPortal>)}
            
        </div>
        

    )
}