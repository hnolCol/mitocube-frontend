import { AxisBottom, AxisLeft } from "@visx/axis";
import { SVG } from "../SVGHeader";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useMemo } from "react";
import _ from "lodash"

import viz from "@mitocube/viz"
import { addMarginToBoundaries, getChartWidthAndHeightWithMargins } from "@mitocube/viz/src/utils/border";
import { ConditionApplicationLabel } from "@mitocube/viz/src/axis/ConditionApplicationLabel";

/**
 * @description Data are assume to be a list of objects with the calculated quantiles. 
 * @param {*} param0 
 * @returns 
 */
export function Boxplot({
    data,
    textKey = "text",
    xaxis_ca_tags = [],
    width = 250,
    height = 300,
    rerender, 
    yAxisLabel = "log2 Abundance",
    margin = {
        top: 15,
        left: 45,
        bottom: 82,
        right : 10
    }
    }) {
    
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins({ width, height, margins: margin })
    console.log(data)
    
    const xScale = useMemo(() => {
        const domain = _.range(data.length)
        return scaleBand({
            domain,
            range: [margin.left, margin.left + chartWidth],
            paddingInner: 0.1,
            paddingOuter: 0.1
        })
    },[rerender, margin.right, margin.left, width])

    const yScale = useMemo(() => {
        
     
        const minValue = _.min(data.map(qs => qs.min))
        const maxValue = _.max(data.map(qs => qs.max))
        const { min, max } = addMarginToBoundaries({domain : { min: minValue, max: maxValue }, frac :  0.15})
        return scaleLinear({
            domain: [ max, min],
            range: [margin.top, margin.top + chartHeight],
            nice: true
        })
    }, [rerender,chartHeight, margin.top])
    const bw = xScale.bandwidth()

    return (
        <SVG {...{ width, height }}>
            <AxisLeft scale={yScale} top={margin.top} left={margin.left} label={yAxisLabel} tickLength={1.5} labelOffset={20} numTicks={6} />
            <AxisBottom scale={xScale}
                top={height - margin.bottom}
                label={""}
                tickLength={1.5}
                labelOffset={25}
                numTicks={6}
                tickComponent={({ x, y, formattedValue }) => <ConditionApplicationLabel x={x} y={y} tag={formattedValue} textProps={{textAnchor: "end", verticalAnchor: "end", angle: -90}} />}
                tickFormat={(tickLabel) => xaxis_ca_tags[tickLabel]} />
            {data.map((qs, i) => {
                return <viz.primitives.Box
                    key={`${i}-boxplot-box`}
                    x={xScale(i)+bw/2}
                    median={yScale(qs.m)}
                    max={yScale(qs.max)}
                    q75={yScale(qs.q75)}
                    q25={yScale(qs.q25)}
                    min={yScale(qs.min)}
                    N={qs.N}
                    fill={i === 0?undefined:"#802400"}
                    width={bw} />
            })}
        </SVG>
    )
}