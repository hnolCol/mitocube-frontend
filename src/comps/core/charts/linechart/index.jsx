
import { scaleLinear, scaleOrdinal, scaleUtc } from '@visx/scale';
import { LinePath} from '@visx/shape'
import { useMemo } from 'react';
import * as allCurves from '@visx/curve';
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects } from '../../../../services/arrays/boundaries';
import { AxisBottom, AxisLeft } from '@visx/axis';
import _ from "lodash"
import { getColorPalette } from '../../colors/colorPalette';
import { SVG } from '../SVGHeader';
import { GridColumns, GridRows } from '@visx/grid';
import { getChartWidthAndHeightWithMargins } from '../../../../services/plotting/size';
import PropTypes from "prop-types"
import { getMedian } from '../../../../services/statistics/quantiles';
import { getValueFromArrayOfObjectsByKey } from '../../../../services/arrays/transforms';
import { Text } from '@visx/text';
import { abbreviateNumber } from "../../../../services/format/number"
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import AxisWithBackground from '../axis';
import MetricTable from '../../base/metrictable';

LineChart.propTypes = {
    xaxisName: PropTypes.string,
    yaxisNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    xAxisIsTime: PropTypes.bool,
    data: PropTypes.arrayOf(PropTypes.object).isRequired
}


function LineChart({
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
    xAxisIsTime = false,
    yaxisNames = ["y", "z", "m"],
    curveType = "curveNatural",
    showPoints = true,
    circleRadius = 5,
    strokeWidth = 2,
    circleStrokeWidth = 0.3,
    highlightedYAxisName = undefined,
    showGrid = false,
    showMean = true,
    tooltipCircleNames = ["x", "z","y"],
    svgID = undefined }) {
    const {
            tooltipData,
            tooltipLeft,
            tooltipTop,
            tooltipOpen,
            showTooltip,
            hideTooltip,
                } = useTooltip();
                
    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
    })
    
    const {chartHeight, chartWidth} = getChartWidthAndHeightWithMargins(width,height,margins)
    const lineHighlighted = highlightedYAxisName !== undefined && yaxisNames.includes(highlightedYAxisName)
    const sortedyaxisNames = lineHighlighted ? _.concat(yaxisNames.filter(yaxisName => yaxisName !== highlightedYAxisName), [highlightedYAxisName]) : yaxisNames //resort names to have highlighted line on top (e.g. last)
    const sortedData = useMemo(() => _.isArray(data) ? _.orderBy(data, xaxisName) : [], [xAxisIsTime, xaxisName])
    

    const handleMouseOver = (event, datum) => {
        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: datum
        });
      };

    const xScale = useMemo(() => {

        if (xAxisIsTime) {

            return scaleUtc({
                range : [margins.left,chartWidth+margins.left],
                domain: [sortedData[0][xaxisName], sortedData[sortedData.length - 1][xaxisName]],
                nice : true
            })
        }

        const xDomain = getBoundariesFromArrayOfObjects({ data : sortedData, keyName: xaxisName })
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain })
       
        return scaleLinear(
            {
                domain: [xDomainWithMargin.min, xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice: true
            }
        )
    }, [xaxisName, width, xAxisIsTime])

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
        <div>
            <SVG height={height} width={width} svgID={svgID} svgRef={containerRef}>
                <AxisWithBackground
                    {...{
                        margins,
                        chartWidth,
                        chartHeight,
                        leftScale: yScale,
                        bottomScale: xScale,
                        moveBottomToLeft: false
                    }} />
                
            {showGrid ? <g>
                <GridRows scale={yScale} stroke="black" width={chartWidth} numTicks={16} left={margins.left} strokeWidth={0.1} />
                <GridColumns scale={xScale} stroke="black" height={chartHeight} numTicks={16} top={margins.top} strokeWidth={0.1} />
            </g> : null}
                {
                    sortedyaxisNames.map((yaxisName, lineIdx) => {
                        var lineData = sortedData.filter(d => d[xaxisName] !== undefined && d[yaxisName] !== undefined)
                        const yaxisColor = lineHighlighted && yaxisName === highlightedYAxisName ? colorScale(yaxisName) : !lineHighlighted ? colorScale(yaxisName) : "darkgrey"
                        var median = getMedian(getValueFromArrayOfObjectsByKey({ data: lineData, keyName: yaxisName }))
                        var scaledMedian = yScale(median)
                        return (
                            <g key={`${yaxisName}-${lineIdx}`}>
                            
                                <LinePath
                                    data={lineData}
                                    x={(d) => xScale(d[xaxisName])}
                                    y={(d) => yScale(d[yaxisName])}
                                    stroke={yaxisColor}
                                    onMouseOver={(e) => handleMouseOver(e, yaxisName)}
                                    onMouseLeave={hideTooltip}
                                    fill="none"
                                    curve={allCurves[curveType]}
                                    shapeRendering="geometricPrecision"
                                    {...{ strokeWidth }} />
                            
                                {showPoints ? lineData.map((point,pointIdx) =>
                                    <circle
                                        key={`${yaxisName}-p-${pointIdx}`}
                                        cx={xScale(point[xaxisName])}
                                        cy={yScale(point[yaxisName])}
                                        r={circleRadius}
                                        fill={yaxisColor}
                                        strokeWidth={circleStrokeWidth}
                                        onMouseLeave={hideTooltip}
                                        onMouseOver={(e) => handleMouseOver(e, _.map(tooltipCircleNames, keyName => { return { name : keyName, value : point[keyName]} }))}
                                        stroke="black" />) : null}
                                {showMean ? <g>
                                    <line
                                        x1={margins.left}
                                        x2={chartWidth + margins.left}
                                        y1={scaledMedian}
                                        y2={scaledMedian}
                                        stroke={yaxisColor}
                                        {...{ strokeWidth }} />
                                    <Text x={margins.left + chartWidth} y={scaledMedian} textAnchor='start' verticalAnchor='middle'>
                                        {abbreviateNumber(median)}
                                    </Text>
                                </g> : null}
                            </g>
                        )
                    })
                }
            
            

            </SVG>
            {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                >
                   
                    {_.isObject(tooltipData) ? <MetricTable data={tooltipData} showClipboard={false} />:null}
                </TooltipInPortal>
            )}
            </div>
    )
}

export default LineChart
