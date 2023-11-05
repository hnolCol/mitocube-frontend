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
    colorName = undefined,
    sizeName = undefined,
    svgID = "scatterplot",
    findDataInRectangle,
    setHoverDataInRectangle,
    centerXAxisAtZero = false,
    defaultRadius = 5,
    rerenderHover,
    rerenderBackground}) {
    // Plots an array of points. Each item in the array 
    // must be an object including the following keys: x, y, r
    const svgRef = useRef(null);
    const rectDist = Object.fromEntries([xaxisName,yaxisName].map(keyName => {
        let keyNameLimits = limits[keyName]
        let dist = Math.sqrt(Math.pow(keyNameLimits.max - keyNameLimits.min, 2)) * 0.01
        return [keyName,  dist]}))
    // const {
    //     tooltipData,
    //     tooltipLeft,
    //     tooltipTop,
    //     tooltipOpen,
    //     showTooltip,
    //     hideTooltip,
    // } = useTooltip();
    //   const { containerRef, TooltipInPortal } = useTooltipInPortal({
    //     // use TooltipWithBounds
    //     detectBounds: true,
    //     // when tooltip containers are scrolled, this will correctly update the Tooltip position
    //     scroll: true,
    //   })
    
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


    const sizeScale = useMemo(() => {
        return () => defaultRadius
    },[sizeName])

    const handeMouseHover = (e) => {
        const mouseCoord = localPoint(svgRef.current,e)
        const x = xScale.invert(mouseCoord.x)
        const y = yScale.invert(mouseCoord.y)
        console.log(rectDist)
        console.log(x-rectDist[xaxisName],y-rectDist[yaxisName],x+rectDist[xaxisName],y+rectDist[yaxisName])
        setHoverDataInRectangle(chartIdx,x-rectDist[xaxisName],y-rectDist[yaxisName],x+rectDist[xaxisName],y+rectDist[yaxisName])
        //const findDataInRectangle = (chartIdx,minX,minY,maxX,maxY) => {

    }

    const handleMouseOver = (event, datum, mouseOverParams) => {
        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: mouseOverParams.dataID
        });
    };
    
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
                {...{ chartHeight, chartWidth }} />
            <g onMouseMove={handeMouseHover}>
            <ScatterPoints {...{data,valid,xScale,yScale,xaxisName,yaxisName,sizeScale,sizeName, rerenderDependency : rerenderBackground}} />
            </g>
            <g>
            <ScatterPoints {...{data : hoverData,valid,xScale,yScale,xaxisName,yaxisName,sizeScale,sizeName, fill:"red",rerenderDependency : rerenderHover}} />
            </g>
        </SVG >
            {/* {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                >   
                    <div className="flex flex-column center-items">
                        <div>DataID :  <strong>{tooltipData}</strong></div>
                    </div>
                </TooltipInPortal>
            )} */}
        </div>
        

    )
}