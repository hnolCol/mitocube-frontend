import { useMemo } from "react";


import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";

import Bar from "./Bar";
import ErrorBar from "../error";
import { SVG } from "../SVG";

import { getAxisStrokeColor, getColorPalette } from "../../colors/colorPalette";
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects } from "../../../../services/arrays/boundaries";
import _ from "lodash"

function Barplot({
    width = 200,
    height = 300,
    margins = {
        left: 50,
        right: 15,
        bottom: 40,
        top: 10
    },
    data = [{ x: "Project 1", value : 4, c : "m", e : 0.2}, { x: "Project 2", value : 5, c : "m", e : 0.3}, { x: "Project 3", value : -5, c : "s", e : 0.5}, { x: "Project 4", value : -5, c : "s2", e : 0.5}],
    yaxisName = "value",
    xaxisName = "x",
    colorName = "c",
    errorName = "e",
    showGrid = false,
    addLineAtYZero = true,
    svgID = undefined}) {
    
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom
    
    const xScale = useMemo(() => {
        //x scale 
        const xDomain = _.map(data,(d => d[xaxisName]))
        return scaleBand({
            domain: xDomain,
            range: [margins.left, margins.left + chartWidth],
            round: true,
            padding : 0.3
        }
        )
    }, [width,xaxisName])
    
    const yScale = useMemo(() => {
        // y scale 
        const yDomain = getBoundariesFromArrayOfObjects({ data, keyName: yaxisName })
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain})

        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min < 0 ? yDomainWithMargin.min : 0],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, height])


    const colorScale = useMemo(() => {
        // color scale 
        if (colorName === undefined) return () => undefined //return a function that color the by in the default color if no colorName given
        const uniqueColorValues = _.uniqBy(data, colorName)

        return scaleOrdinal(
            {
                domain: uniqueColorValues,
                range: getColorPalette(uniqueColorValues.length),
            }
        )
    }, [colorName])

    
    return (
        <SVG {...{ width, height, svgID }}>
            <AxisLeft scale={yScale} left={margins.left} label={yaxisName} labelOffset={25} numTicks={8} />
            <AxisBottom scale={xScale} top={margins.top + chartHeight} label={xaxisName} numTicks={8} />
            {showGrid ? <g>
                <GridRows
                    scale={yScale}
                    stroke={getAxisStrokeColor()}
                    width={chartWidth}
                    numTicks={16}
                    left={margins.left}
                    strokeWidth={0.5} />
                
                <GridColumns
                    scale={xScale}
                    stroke={getAxisStrokeColor()}
                    height={chartHeight}
                    numTicks={16}
                    top={margins.top}
                    strokeWidth={0.5} />
                
            </g> : null}
            
            {addLineAtYZero && yScale.domain()[1] < 0 ?
                <line
                    x1={xScale.range()[0]}
                    x2={xScale.range()[1]}
                    y1={yScale(0)}
                    y2={yScale(0)}
                    stroke={getAxisStrokeColor()} /> : null}
            
            {_.map(data, (d) => {
                const x = xScale(d[xaxisName])
                const bandWidth = xScale.bandwidth()
                const y = yScale(d[yaxisName])
                return (
                    <g>
                        <Bar
                        opacity={1}
                        fill={colorScale(d[colorName])}
                        x={x}
                        y1={y}
                        y0={yScale(0)} //bar always starts at 0, if y1 is negative the bar handles that.
                        width={bandWidth}
                        />
                        {errorName !== undefined ?
                        <ErrorBar
                            x={x + bandWidth / 2}
                            y0={y} //bar start 
                            y1={d[yaxisName] > 0 ? yScale(d[yaxisName] + d[errorName]) : yScale(d[yaxisName] - d[errorName])}
                            width={bandWidth*0.5} /> : null}
                    </g>)
            })}

        </SVG>
    )
}


export default Barplot