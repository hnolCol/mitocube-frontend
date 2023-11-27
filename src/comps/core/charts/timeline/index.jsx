import { useMemo } from "react";
import { SVG } from "../SVGHeader";
import { scaleOrdinal, scaleTime } from "@visx/scale";
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size";
import _ from "lodash"
import { AxisLeft } from "@visx/axis";
import { color, motion } from "framer-motion"
import { getColorPalette } from "../../colors/colorPalette";
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique";
import AnimatedText from "../../svg/AniamtedText";
import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend";
import AxisBackground from "../background";
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { millisecondsToDays } from "../../../../services/format/dates";
import PropTypes from "prop-types"


TimelineChart.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margins: PropTypes.object,
    data: PropTypes.array.isRequired,
    dateName: PropTypes.string,
    labelName: PropTypes.string,
    colorName: PropTypes.string,
    r : PropTypes.number
}

function TimelineChart({
    width = 350,
    height = 300,
    margins = {
        left: 50,
        top: 5,
        right: 0,
        bottom : 5
    },
    data = [],
    dateName = "Date",
    labelName = "label",
    colorName = "c",
    tooltipNames = ["comment"],
    colorMapper = undefined,
    r = 8 }) {
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
    const sortedData = useMemo(() => _.orderBy(data, dateName), [data, dateName])
    const xCenter = margins.left + chartWidth / 2 

    const handleMouseOver = (event, datum) => {
        
        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: datum
        });
      };


    const colorScale = useMemo(() => {
        const uniqueColorCategories = getUniqueValuesInArrayOfObjects({ data, keyName: colorName })
        let colorValues = []
        if (!_.isEmpty(colorMapper)) {
            console.log(colorMapper)
            colorValues = uniqueColorCategories.map(category => colorMapper[category])
        }
        else {
            colorValues = getColorPalette()
        }
        return scaleOrdinal({
            range: colorValues,
            domain: uniqueColorCategories
        })
    }, [colorName,data])

    const timeScale = useMemo(() => {
        return scaleTime({
            range : [margins.top,chartHeight],
            domain: [sortedData[0][dateName], sortedData[sortedData.length - 1][dateName]],
            nice : true
        })

    }, [dateName, chartHeight, sortedData])
    
    return (
        <div className="flex">
        <SVG {...{ width, height, svgRef : containerRef }}>
            {sortedData.length > 1 ?
                <g>
                        <AxisLeft scale={timeScale} left={margins.left} numTicks={8} tickLength={2}/>
                        <AxisBackground x={margins.left} y={margins.top} width={chartWidth} height={chartHeight} />
                    {sortedData.map((d, idx) => {
                        var y = timeScale(d[dateName])
                        var labelRight = idx % 2 == 0
                        const linePointMargin = r + 2
                        var labelMargin = labelRight ? linePointMargin : -linePointMargin
                        var prevData = idx>0?sortedData[idx - 1]:undefined
                        var y1 = idx > 0 ? timeScale(prevData[dateName]) + linePointMargin : undefined
                        var y2 = y - linePointMargin
                        var distance = idx > 0 ? d[dateName].getTime() - prevData[dateName].getTime() : undefined
                        var distanceToFirstItem = d[dateName].getTime() - sortedData[0][dateName].getTime()
                        return (
                            <g key={`${idx}-dPoint`}>
                                {idx > 0 ?
                                    <motion.line
                                        pathLength={0}
                                        animate={{ pathLength: 1 }}
                                        transition={{duration : 0.5, delay : idx + (0.5 * idx)}}
                                        x1={xCenter}
                                        x2={xCenter}
                                        opacity={y1 < y2?1:0} // if distance is too short (e.g. overlapping circles, the line is hidden)
                                        y1={y1}
                                        y2={y2}
                                        // TODO: make the tooltip an own component
                                        onMouseOver={(e) => handleMouseOver(e, <div> 
                                            <div className="flex">
                                                <div style={{ color: _.has(prevData, colorName) ? colorScale(prevData[colorName]) : "black" }}>
                                                    <strong>{prevData[labelName]}</strong></div>
                                                <div> - </div>
                                                <div style={{ color: _.has(d, colorName) ? colorScale(d[colorName]) : "black" }}>
                                                    <strong>{d[labelName]}</strong></div>
                                            </div>
                                            <div>Duration : <strong>{millisecondsToDays(distance)} days</strong></div>
                                            <div>Since Start : <strong>{millisecondsToDays(distanceToFirstItem)} days</strong> </div>
                                        </div>)}
                                        onMouseLeave={hideTooltip}
                                        stroke="black"
                                        strokeWidth={1}/> : null}
                                <motion.circle
                                    transition={{ duration: 0.5, delay: 0.5 + idx + (0.5 * idx) }}
                                    opacity={0} animate={{ opacity: 1 }}
                                    onMouseOver={(e) => handleMouseOver(e, <div>
                                        {d[labelName]}
                                        <div className="flex flex-column">
                                        {tooltipNames.map(keyName => {return <div key={`${keyName}-tooltip`}>{d[keyName]}</div>})}
                                        </div>
                                    </div>)}
                                    onMouseOut={hideTooltip}
                                    {...{ cx: xCenter, cy: y, r, fill: _.has(d, colorName) ? colorScale(d[colorName]) : "red", stroke: "black", strokeWidth: 0.5 }} />
                                <AnimatedText x={xCenter + labelMargin} y={y} text={d[labelName]} delay={0.5 + idx + (0.5 * idx)} duration={0.5} textAnchor={labelRight ? "start" : "end"} reverse={!labelRight} />
                                
                                
                            </g>
                        )
                    })}
                </g> : null}

            </SVG>
            <LegendOrdinal scale={colorScale} />
            {(labels) =>
                <div className="flex flex-column">
                    {labels.map((label, i) => 
                        <LegendItem key={`timeLine-legendItem-${i}-${label}`} margin="0 5px">
                            <svg width={20} height={20}>
                                <rect fill={label.value} width={20} heght={20} stroke="black" strokeWidth={0.5}/>
                            </svg>
                            <LegendLabel align="left">{label.text}</LegendLabel>
                        </LegendItem>
                    )}
                    

                </div>
            }
            {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                >
                {tooltipData}
                </TooltipInPortal>
            )}
            </div>
    )
}


export default TimelineChart