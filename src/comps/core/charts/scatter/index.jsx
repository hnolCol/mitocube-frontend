import PropTypes from "prop-types"
import Point from "./Point"
import AxisWithBackground from "../axis"
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size"
import { useMemo, useRef } from "react"
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects, getMaxAbsoluteValue } from "../../../../services/arrays/boundaries"
import { scaleLinear } from "@visx/scale"
import { SVG } from "../SVGHeader"
import { useTooltip, useTooltipInPortal, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import _ from "lodash"
import MetricTable from "../../base/metrictable"
import ScatterPoints from "./ScatterPoints"

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
        right: 5,
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
    setHoverDataInRectangle,
    centerXAxisAtZero = false,
    defaultRadius = 5,
    rerenderHover,
    hoverPosition,
    rerenderBackground,
    filterIndices,
    searchIndices}) {
    // Plots an array of points. Each item in the array 
    // must be an object including the following keys: x, y, r
    const svgRef = useRef(null);
    const tooltipOpen = hoverPosition.length === 2 && hoverData.length > 0
    const rectDist = Object.fromEntries([xaxisName,yaxisName].map(keyName => {
        let keyNameLimits = limits[keyName]
        let dist = Math.sqrt(Math.pow(keyNameLimits.max - keyNameLimits.min, 2)) * 0.005
        return [keyName,  dist]}))
    // const {
    //     tooltipData,
    //     tooltipLeft,
    //     tooltipTop,
    //     tooltipOpen,
    //     showTooltip,
    //     hideTooltip,
    // } = useTooltip();
      const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
      })
    
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins(width,height,margins)
    
    const yScale = useMemo(() => {
        // y scale for the scatter
    
        const yDomain = limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain})

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
        const maxValue = getMaxAbsoluteValue({data : [xDomainWithMargin.max, xDomainWithMargin.min]})
        
        return scaleLinear(
            {
                domain: centerXAxisAtZero ?  [-maxValue,maxValue] : [xDomainWithMargin.min,xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice: true
            }
        )
    }, [xaxisName, chartWidth])

    const colorScale = useMemo(() => {
        return scaleLinear({
            domain : [0,100],
            range : ['#75fcfc', '#3236b8']
        })
    }, [colorName])

    const sizeScale = useMemo(() => {
        return () => defaultRadius
    },[sizeName])

    const handeMouseHover = (e) => {
        const mouseCoord = localPoint(svgRef.current,e)
        
        const x = xScale.invert(mouseCoord.x)
        const y = yScale.invert(mouseCoord.y)
       
        setHoverDataInRectangle(chartIdx,
            x - rectDist[xaxisName],
            y - rectDist[yaxisName],
            x + rectDist[xaxisName],
            y + rectDist[yaxisName], [e.clientX, e.clientY])
        //const findDataInRectangle = (chartIdx,minX,minY,maxX,maxY) => {

    }
    
    // const points = useMemo(() => _.map(data, d => { return { p: [xScale(d[xaxisName]), yScale(d[yaxisName])], r: defaultRadius } }),
    //     [xaxisName, yaxisName,sizeName,colorName])

    return (
        <div>
        <SVG {...{ width, height, svgID, svgRef}}>
            
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
            <ScatterPoints {...{data,valid,xScale,yScale,xaxisName,yaxisName,sizeScale,sizeName, colorName, colorScale, rerenderDependency : rerenderBackground, filterIndices, searchIndices}} />
            </g>
            <g>
            {/* Rerender hover points */}
            <ScatterPoints {...{data : hoverData,valid,xScale,yScale,xaxisName,yaxisName,sizeScale,sizeName, colorName : undefined, fill:"red",rerenderDependency : rerenderHover}} />
            </g>
            <rect x={0} y={0} width={width} height={height} onMouseMove={handeMouseHover} fill="transparent"/>
        </SVG >
            {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={hoverPosition[1]}
                left={hoverPosition[0]}
                >   
                    <div className="flex flex-column justify-start">
                        {hoverData.map((v,idx) => idx < 10?<div key={`${idx}-hover`}>
                            {v[tooltipNames[0]]}</div>:null)}
                    </div>
                </TooltipInPortal>
            )}
        </div>
        

    )
}