import { AxisBottom, AxisLeft } from "@visx/axis"
import { getNumberTicks } from "../../../../services/plotting/ticks"
import { getAxisStrokeColor } from "../../colors/colorPalette"
import AxisBackground from "../background"
import { useGetSubmissionAttributesByTag } from "../../../../hooks/queries/submission.hooks"
import _ from "lodash"
import { mapAttributeValueTagsToAttributes } from "../../../../services/attributes"

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
    leftTickLabelsVisible = true,
    moveBottomToLeft = true,
    leftTickLabelProps,
    bottomTickLabelProps = {},
    findAttributesForBottomScale = true,
    bandwidth,
    chartHeight,
    chartWidth }) {
    
    const leftStart = leftLeft === undefined ? margins.left : leftLeft
    const topStart = topBottom === undefined ? margins.top + chartHeight : topBottom
    const { data: attributesByTag, isLoading, isFetching, isError } = useGetSubmissionAttributesByTag({}, { staleTime: Infinity, enabled: findAttributesForBottomScale })
    if (isLoading || isFetching) return null 
    if (isError && findAttributesForBottomScale) return null 
    if (_.isNumber(bandwidth)) bottomTickLabelProps["width"] = bandwidth
    return (
        <g>
            <AxisBackground
                x={leftStart}
                y={margins.top}
                height={chartHeight}
                width={chartWidth} />   
            <AxisLeft
                label={leftLabel} //label only first axis
                labelOffset={30}
                labelProps={{fontSize: "0.8rem", textAnchor : "middle"}}
                tickLabelProps={{ fontSize: "0.8rem", ...leftTickLabelProps }}
                tickFormat={(tickLabel) => leftTickLabelsVisible ? tickLabel : undefined}
                left={leftStart}
                scale={leftScale}
                hideTicks={leftHideTicks}
                numTicks={getNumberTicks(chartHeight)}
                stroke={getAxisStrokeColor()}
                tickLength={3} />
        
            <AxisBottom
                left={moveBottomToLeft ? leftStart : 0}
                tickFormat={findAttributesForBottomScale ? (tickLabel) => mapAttributeValueTagsToAttributes({attrValueTag : tickLabel, attrValuesByTag : attributesByTag.attribute_values}).asString : null}
                top={topStart}
                label={bottomLabel}
                hideTicks={bottomHideTicks}
                labelProps={{fontSize: "0.8rem", verticalAnchor:"middle", textAnchor :"middle"}}
                tickLabelProps={{fontSize : "0.8rem", verticalAnchor : "middle",...bottomTickLabelProps }}
                labelOffset={30}
                numTicks={getNumberTicks(chartWidth)}
                scale={bottomScale}
                stroke={getAxisStrokeColor()}
                tickLength={3} />

            
        </g>
    )
}


export default AxisWithBackground