
import { scaleLinear, scaleOrdinal } from '@visx/scale';
import { LinePath} from '@visx/shape'
import { useMemo } from 'react';
import * as allCurves from '@visx/curve';
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects } from '../../../../services/arrays/boundaries';
import { AxisBottom, AxisLeft } from '@visx/axis';
import _ from "lodash"
import { getColorPalette } from '../../colors/colorPalette';
import { SVG } from '../SVG';
import { GridColumns, GridRows } from '@visx/grid';

export function LineChart({
    width = 400,
    height = 300,
    margins = {
        left: 50,
        right: 15,
        bottom: 40,
        top: 10
    },
    data = [{ x: 1, y: 2, z: 2, m: 15 }, { x: 2, y: 4, z: 15, m: 5 }, { x: 4, y: 1, z: 30, m: 9 }, { x: 7, y: 1, z: 30, m: 9 }],
    xaxisName = "x",
    yaxisNames = ["y", "z", "m"],
    curveType = "curveNatural",
    showPoints = true,
    circleRadius = 5,
    strokeWidth = 2,
    circleStrokeWidth = 0.3,
    highlightedYAxisName = undefined,
    showGrid = false,
    svgID = undefined }) {
   
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom
    const lineHighlighted = highlightedYAxisName !== undefined && yaxisNames.includes(highlightedYAxisName)
    const sortedyaxisNames = lineHighlighted ? _.concat(yaxisNames.filter(yaxisName => yaxisName !== highlightedYAxisName), [highlightedYAxisName]) : yaxisNames //resort names to have highlighted line on top (e.g. last)
    
    const xScale = useMemo(() => {
        const xDomain = getBoundariesFromArrayOfObjects({ data, keyName: xaxisName })
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain })
       
        return scaleLinear(
            {
                domain: [xDomainWithMargin.min, xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice: true
            }
        )
    }, [xaxisName, width])

    const yScale = useMemo(() => {
        const yDomain = getBoundariesFromArrayOfObjects({ data, keyName: yaxisNames })
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain })
        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisNames, height])
    
    const colorScale = useMemo(() => {
        return (
            scaleOrdinal(
                {
                    domain: yaxisNames,
                    range: getColorPalette(yaxisNames.length)
                }
            )
        )
    }, yaxisNames)

    if (width < 10) return null
    return (

            <SVG height={height} width={width} svgID={svgID}>
                <rect x="0" y="0" width={width} height={height} fill="#efefef" />
                <AxisLeft scale={yScale} left={margins.left} label={_.join(yaxisNames, " ")} labelOffset={30} numTicks={8} />
                <AxisBottom scale={xScale} top={margins.top + chartHeight} label={xaxisName} numTicks={8} />
            {showGrid ? <g>
                <GridRows scale={yScale} stroke="black" width={chartWidth} numTicks={16} left={margins.left} strokeWidth={0.1} />
                <GridColumns scale={xScale} stroke="black" height={chartHeight} numTicks={16} top={margins.top} strokeWidth={0.1} />
            </g> : null}
                {
                    sortedyaxisNames.map((yaxisName, lineIdx) => {
                    
                        const yaxisColor = lineHighlighted && yaxisName === highlightedYAxisName ? colorScale(yaxisName) : !lineHighlighted ? colorScale(yaxisName) : "darkgrey"
                        return (
                            <g key={`${yaxisName}-${lineIdx}`}>
                            
                                <LinePath
                                    data={data}
                                    x={(d) => xScale(d[xaxisName])}
                                    y={(d) => yScale(d[yaxisName])}
                                    stroke={yaxisColor}
                                    fill="none"
                                    curve={allCurves[curveType]}
                                    shapeRendering="geometricPrecision"
                                    {...{ strokeWidth }} />
                            
                                {showPoints ? data.map((point,pointIdx) =>
                                    <circle
                                        key={`${yaxisName}-p-${pointIdx}`}
                                        cx={xScale(point[xaxisName])}
                                        cy={yScale(point[yaxisName])}
                                        r={circleRadius}
                                        fill={yaxisColor}
                                        strokeWidth={circleStrokeWidth}
                                        stroke="black" />) : null}
                            </g>
                        )
                    })
                }
            
            

            </SVG>
    )
}

