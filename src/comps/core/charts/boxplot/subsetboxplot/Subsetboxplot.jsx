import { scaleBand, scaleLinear } from "@visx/scale"
import { useMemo } from "react"
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects } from "../../../../../services/arrays/boundaries"
import { SVG } from "../../SVGHeader"
import { getQuantileByIndices } from "../../../../../services/arrays/groupby"
import _ from "lodash"
import Box from "../cached_box"
import { AxisLeft } from "@visx/axis"
import { Text } from "@visx/text"

/**
 * @description Simple minimal boxplot to show in a tooltip, not to read exact value, jsut to get an 
 * idea of a systematic regulation. 
 * @param {Object} props 
 * @param {Object[]} props.data
 * @param {Set[]} props.subsetIndices 
 */
export function Subsetboxplot({ data, yaxisName, subsetIndices, width = 120, height = 85, rerender, subsetNames, marginleft = 25, marginRight = 30, marginTop = 10, marginBottom = 10 }) {
    
    //console.log(subsetIndices, data)
    
    const qs = useMemo(() => getQuantileByIndices({
        data,
        subsetIndices: _.concat([_.range(data.length)], subsetIndices),
        valueName: yaxisName,
        subsetNames: _.concat(["Complete"], subsetNames)
    }), [subsetNames,data.length,subsetIndices.length])
    

    const yScale = useMemo(() => {
        if (qs["Complete"].N < 2) return () => undefined
        const yDomain = getBoundariesFromArrayOfObjects({ data, keyName: yaxisName })
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain})

        return scaleLinear({
            domain: [yDomainWithMargin.max, yDomainWithMargin.min],
            range: [marginTop,height - marginBottom],
            nice: true
        })
    }, [rerender])

    const xScale = useMemo(() => {
        if (qs["Complete"].N < 2) return () => undefined
        const domain = _.range(subsetIndices.length + 1)
        return scaleBand({
            domain,
            range: [marginleft, width-marginRight],
            paddingInner: 0.2,
            paddingOuter: 0.2
        })
    },[rerender])
    if (qs["Complete"].N < 2) return null 
    return (
        <div className="flex">
        <SVG {...{ width, height }}>
            {/* plot the total data boxplot */}
            <AxisLeft left={marginleft} scale={yScale} tickLength={2} numTicks={3} strokeWidth={0.5}/>
            {_.keys(qs).map((i,idx) => {
                const qqs = _.fromPairs(_.map(qs[i].labels, (label, idx) => [label, yScale(qs[i][yaxisName][idx])]))
                return <g><Box {...qqs} x={xScale(idx) + xScale.bandwidth() / 2} width={xScale.bandwidth()} fill={idx > 0 ? "red" : undefined} />
                    {idx > 0 && _.isNumber(qqs["median"]) && _.isNumber(qs[i].N) ? <g><Text
                        x={xScale(idx) + xScale.bandwidth()}
                        verticalAnchor="middle"
                        dx={3}
                        y={qqs["median"]} fontSize={10}>
                            {_.round(qs[i][yaxisName][3],2)}
                    </Text>
                        <Text
                            x={xScale(idx) + xScale.bandwidth() / 2}
                            y={qqs["max"]}
                            fontSize={10}
                            dy={-5}
                            textAnchor="middle"
                        >
                            {`n=${qs[i].N}`}
                        </Text></g> : null}
                </g>
            })}
            </SVG>
            <div>
                
            </div>
            </div>
    )

}