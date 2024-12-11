import { AxisLeft } from "@visx/axis";
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
    width = 200,
    height = 300,
    rerender, 
    yAxisLabel = "log2 Abundance",
    margin = {
        top: 5,
        left: 40,
        bottom: 20,
        right : 10
    }
    }) {
    
        
    console.log(data)
    
    const xScale = useMemo(() => {
        const domain = _.range(data.length)
        return scaleBand({
            domain,
            range: [margin.left, width-margin.left-margin.right],
            paddingInner: 0.2,
            paddingOuter: 0.2
        })
    },[rerender, margin.right, margin.left])

    const yScale = useMemo(() => {
        
        
        const minValue = _.min(data.map(qs => qs.min))
        const maxValue = _.max(data.map(qs => qs.max))
        console.log(minValue)
        return scaleLinear({
            domain: [maxValue, minValue],
            range: [margin.top, height - margin.bottom- margin.top],
            nice: true
        })
    }, [rerender])
    const bw = xScale.bandwidth()

    return (
        <SVG {...{ width, height }}>
            <AxisLeft scale={yScale} top={margin.top}  left={margin.left} label={yAxisLabel} tickLength={0.75} labelOffset={20}/>
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