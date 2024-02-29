import { AxisBottom, AxisLeft } from "@visx/axis"
import { getNumberTicks } from "../../../../services/plotting/ticks"
import { getAxisStrokeColor } from "../../colors/colorPalette"
import AxisBackground from "../background"
import { useGetSubmissionAttributesByTag } from "../../../../hooks/queries/submission.hooks"
import _ from "lodash"
import { mapAttributeValueTagsToAttributes } from "../../../../services/attributes"
import React from "react"

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
    bottomHideTickLabels = false,
    leftTickLabelsVisible = true,
    moveBottomToLeft = true,
    leftTickLabelProps,
    bottomTickLabelProps = {},
    findAttributesForBottomScale = true,
    bandwidth,
    chartHeight,
    chartWidth,
    attributeValuesByTag = {},
    valueIsFeature = false,
    genotypesByLabel}) {
    
    const leftStart = leftLeft === undefined ? margins.left : leftLeft
    const topStart = topBottom === undefined ? margins.top + chartHeight : topBottom
    //const { data: attributesByTag, isLoading, isFetching, isError } = useGetSubmissionAttributesByTag({}, { staleTime: Infinity, enabled: findAttributesForBottomScale })
    if (_.isNumber(bandwidth)) bottomTickLabelProps["width"] = bandwidth
    const getLabelString = (attributeValue) => {
        const attributeValuesTagSplit = attributeValue.split(" ")
        return _.join(_.map(attributeValuesTagSplit, attributeValueTag => {
            const attributeValue = attributeValuesByTag[attributeValueTag]
            if (valueIsFeature) return attributeValue.genes.split(" ").at(0)
            if (!_.isObject(attributeValue)) {
                if (_.has(genotypesByLabel, attributeValueTag)) {
                    return genotypesByLabel[attributeValueTag].text
                }
                return ""
            }
            return attributeValue.text
        })," + ")
    }

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
                tickFormat={bottomHideTickLabels ? () => "" : findAttributesForBottomScale ? (tickLabel) =>  getLabelString(tickLabel): null}
                top={topStart}
                label={bottomLabel}
                hideTicks={bottomHideTicks}
                labelProps={{fontSize: "0.8rem", verticalAnchor:"middle", textAnchor :"middle",dy:10}}
                tickLabelProps={{fontSize : "0.8rem", verticalAnchor : "middle",...bottomTickLabelProps}}
                labelOffset={10}
                numTicks={getNumberTicks(chartWidth)}
                scale={bottomScale}
                stroke={getAxisStrokeColor()}
                tickLength={3} />

            
        </g>
    )
}


function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (prevProps.bottomScale !== nextProps.bottomScale) return false 
    if (prevProps.leftScale !== nextProps.leftScale) return false 

    if (prevProps.chartHeight !== nextProps.chartHeight) return false 
    if (prevProps.chartWidth !== nextProps.chartWidth) return false
    //if (!_.isEqual(prevProps.p,nextProps.p)) return false 
    // if (!_.isEqual(prevProps.xscale.domain,nextProps.xscale.domain)) return false 
    return true
}


export default React.memo(AxisWithBackground, areEqual)