import { AxisBottom, AxisLeft } from "@visx/axis"
import { getNumberTicks } from "../../../../services/plotting/ticks"
import { getAxisStrokeColor } from "../../colors/colorPalette"
import AxisBackground from "../background"
import _ from "lodash"
import React from "react"
import hooks from "@mitocube/api-hooks"
import { getConditionApplicationText } from "./ConditionApplicationString"
import { Text } from "@visx/text"

function ConditionApplicationLabel({ x, y, tag, tickProps }) {
    const ca_tags = _.split(tag, ";");
    const text = tag


    const { data : condition_application_text } =  hooks.condition_applications.useGetConditionApplicationText({ tag }, { enabled: !!tag })
    // // Fetch all condition applications for all tags at once
    // const results = ca_tags.map(ca_tag =>
    //     hooks.condition_applications.useGetConditionApplication(
    //         { tag: ca_tag },
    //         { enabled: !!ca_tag }
    //     )
    // );

    // const text = results.map(({ data: condition_applications }) =>
    //     getConditionApplicationText({ condition_applications })
    // );

    // console.log(text)

    return (
        <Text
            dx={x}
            dy={y}
            aria-multiline={true}
            textAnchor="middle"
            verticalAnchor="middle"
            fontSize={12}
            fill="#333"
            {...tickProps}
        >
            {condition_application_text}
        </Text>
  );
}

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
    bandwidth,
    chartHeight,
    chartWidth,
    }) {
    
    const leftStart = leftLeft === undefined ? margins.left : leftLeft
    const topStart = topBottom === undefined ? margins.top + chartHeight : topBottom

    if (_.isNumber(bandwidth)) {
        bottomTickLabelProps["width"] = bandwidth * 1.1
        bottomTickLabelProps["scaleToFit"] = 'shrink-only'
        bottomTickLabelProps["fontSize"] ="12px"
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
                tickLabelProps={{ fontSize: "0.8rem", ...leftTickLabelProps, width : 0.8 * chartHeight}}
                tickFormat={(tickLabel) => leftTickLabelsVisible ? tickLabel : undefined}
                left={leftStart}
                scale={leftScale}
                hideTicks={leftHideTicks}
                numTicks={getNumberTicks(chartHeight)}
                stroke={getAxisStrokeColor()}
                tickLength={3} />
        
            <AxisBottom
                left={moveBottomToLeft ? leftStart : 0}
                tickComponent={({x,y,formattedValue}) => bottomHideTickLabels ? null : <ConditionApplicationLabel x={x} y={y} tag={formattedValue} tickProps={bottomTickLabelProps} />}
                top={topStart}
                label={bottomLabel}
                hideTicks={bottomHideTicks}
                labelProps={{fontSize: "0.8rem", verticalAnchor:"middle", textAnchor :"middle", dy:5, width : 0.8 * chartWidth}}
                tickLabelProps={{ fontSize: "0.8rem", dy : -2, verticalAnchor: "middle", ...bottomTickLabelProps }} //
                labelOffset={16}
                numTicks={getNumberTicks(chartWidth)}
                scale={bottomScale}
                stroke={getAxisStrokeColor()}
                tickLength={3}
                />

            
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