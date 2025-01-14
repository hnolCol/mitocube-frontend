import { AxisBottom, AxisLeft } from "@visx/axis";
import { SVG } from "../SVGHeader";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useMemo } from "react";
import _ from "lodash"
import Box from "./Box";

/**
 * @description Data are assume to be a list of objects with the calculated quantiles. 
 * @param {*} param0 
 * @returns 
 */
export function Boxplot({
    data,
    textKey = "text",
    width = 200,
    height = 200,
    rerender, 
    yAxisLabel = "log2 Abundance",
    margin = {
        top: 15,
        left: 40,
        bottom: 25,
        right : 10
    }
    }) {
    
    const xAxisTickLabels = data.map(d => d[textKey])

        
    console.log(data)
    
    const xScale = useMemo(() => {
        const domain = _.range(data.length)
        return scaleBand({
            domain,
            range: [margin.left, width-margin.left-margin.right],
            paddingInner: 0.1,
            paddingOuter: 0.1
        })
    },[rerender, margin.right, margin.left, width])

    const yScale = useMemo(() => {
        
        
        const minValue = _.min(data.map(qs => qs.min))
        const maxValue = _.max(data.map(qs => qs.max))
        console.log(minValue)
        return scaleLinear({
            domain: [maxValue, minValue],
            range: [margin.top, height - margin.bottom- margin.top],
            nice: true
        })
    }, [rerender,margin.bottom, margin.top, height])
    const bw = xScale.bandwidth()

    return (
        <SVG {...{ width, height }}>
            <AxisLeft scale={yScale} top={margin.top} left={margin.left} label={yAxisLabel} tickLength={1.5} labelOffset={20} numTicks={6} />
            <AxisBottom scale={xScale}
                top={height - margin.bottom}
                label={""}
                tickLength={1.5}
                labelOffset={20}
                numTicks={6}
                tickFormat={(tickLabel) => xAxisTickLabels[tickLabel]} />
            {data.map((qs, i) => {
                
                return <Box
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