import { addMarginToBoundaries, getMaxAbsoluteValue } from "../../../../services/arrays/boundaries";
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size";
import { SVG } from "../SVGHeader";
import AxisWithBackground from "../axis";
import { useMemo, useRef } from "react";
import { localPoint } from "@visx/event";
import { scaleLinear } from "@visx/scale";

import ProfileLine from "./Line"




export function ProfileChart({
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
    yaxisName = [],
    xaxisName,
    limits,
    svgID,
    rerenderHover,
    hoverData
    
}) {

    console.log(data, limits,yaxisName, valid)

    const svgRef = useRef(null);
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins(width, height, margins)
    
    const yScale = useMemo(() => {
        // y scale for the profile

    
        const yDomain = { min: 0, max: 5000 }//limits[yaxisName]
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain})
        console.log(yDomainWithMargin)
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
        console.log(xDomain)
        return scaleLinear(
            {
                domain: [0,yaxisName.length],
                range: [margins.left, margins.left + chartWidth],
                nice: true
            }
        )
    }, [xaxisName, chartWidth])

    const handeMouseHover = (e) => {
        const mouseCoord = localPoint(svgRef.current,e)
        
        const x = xScale.invert(mouseCoord.x)
        const y = yScale.invert(mouseCoord.y)
       
        // setHoverDataInRectangle(chartIdx,
        //     x - rectDist[xaxisName],
        //     y - rectDist[yaxisName],
        //     x + rectDist[xaxisName],
        //     y + rectDist[yaxisName], [e.clientX, e.clientY])
        //const findDataInRectangle = (chartIdx,minX,minY,maxX,maxY) => {

    }

    return (
        
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
                <ProfileLine {...{valid,data : hoverData,xScale,yScale,yaxisName,xaxisName,rerenderDependency : rerenderHover}} />
            </g>
            <rect x={0} y={0} width={width} height={height} onMouseMove={handeMouseHover} fill="transparent"/>
        </SVG >
    )
}