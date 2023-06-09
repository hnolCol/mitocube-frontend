import { AxisBottom, AxisLeft } from "@visx/axis"
import { getNumberTicks } from "../../../../services/plotting/ticks"
import { getAxisStrokeColor } from "../../colors/colorPalette"
import AxisBackground from "../background"


function AxisWithBackground({
    leftLeft,
    topBottom,
    leftScale,
    bottomScale,
    margins,
    bottomLabel,
    leftLabel,
    leftHideTicks = false,
    bottomHideTicks = false,
    moveBottomToLeft = true,
    leftTickLabelProps,
    bottomTickLabelProps,
    chartHeight,
    chartWidth }) {
    
    const leftStart = leftLeft === undefined ? margins.left : leftLeft
    const topStart = topBottom===undefined?margins.top + chartHeight: topBottom
    return (
        <g>
            <AxisLeft
                label={leftLabel} //label only first axis
                labelOffset={20}
                tickLabelProps={leftTickLabelProps}
                left={leftStart}
                scale={leftScale}
                hideTicks={leftHideTicks}
                numTicks={getNumberTicks({ space: chartHeight })}
                stroke={getAxisStrokeColor()}
                tickLength={3} />
        
            <AxisBottom
                left={moveBottomToLeft?leftStart:0}
                top={topStart}
                label={bottomLabel}
                hideTicks={bottomHideTicks}
                tickLabelProps={bottomTickLabelProps}
                labelOffset={1}
                numTicks={getNumberTicks({ space: chartWidth })}
                scale={bottomScale}
                stroke={getAxisStrokeColor()}
                tickLength={3} />

            <AxisBackground
                x={leftStart}
                y={margins.top}
                height={chartHeight}
                width={chartWidth} />   
        </g>
    )
}


export default AxisWithBackground