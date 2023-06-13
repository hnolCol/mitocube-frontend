import { useMemo } from "react";
import { SVG } from "../SVG";
import { scaleOrdinal, scaleUtc } from "@visx/scale";
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size";
import _ from "lodash"
import { AxisLeft } from "@visx/axis";
import { Text } from "@visx/text";
import { motion } from "framer-motion"
import { getColorPalette } from "../../colors/colorPalette";
import { getUniqueValuesInArrayOfObjects } from "../../../../services/arrays/unique";
import AnimatedText from "../../svg/AniamtedText";


function TimelineChart({
    width = 200,
    height = 200,
    margins = {
        left: 50,
        top: 5,
        right: 10,
        bottom : 10
    },
    data = [],
    dateName = "Date",
    labelName = "label",
    colorName = "c",
    r = 8 }) {
    
    const {chartHeight, chartWidth} = getChartWidthAndHeightWithMargins(width,height,margins)
    const sortedData = useMemo(() => _.orderBy(data, dateName), [data, dateName])
    const xCenter = margins.left + chartWidth / 2 



    const colorScale = useMemo(() => {
        const uniqueColorCategories = getUniqueValuesInArrayOfObjects({data,keyName : colorName})
        return scaleOrdinal({
            range: getColorPalette(),
            domain: uniqueColorCategories
        })
    }, [colorName,data])

    const timeScale = useMemo(() => {
        return scaleUtc({
            range : [margins.top,chartHeight],
            domain: [sortedData[0][dateName], sortedData[sortedData.length - 1][dateName]],
            nice : true
        })

    }, [dateName, chartHeight, sortedData])
    
    return (
        
        <SVG {...{ width, height }}>
            {sortedData.length > 1 ?
                <g>
                    <AxisLeft scale={timeScale} left={margins.left} />
                    {sortedData.map((d, idx) => {
                        var y = timeScale(d[dateName])
                        var labelRight = idx % 2 == 0
                        const linePointMargin = r + 2
                        var labelMargin = labelRight?linePointMargin:-linePointMargin
                        return (
                            <g key={`${idx}-dPoint`}>
                                {idx > 0 ?
                                    <motion.line
                                        pathLength={0}
                                        animate={{ pathLength: 1 }}
                                        transition={{duration : 0.5, delay : idx + (0.5 * idx)}}
                                    x1={xCenter}
                                    x2={xCenter}
                                    y1={timeScale(sortedData[idx - 1][dateName])+linePointMargin}
                                    y2={y-linePointMargin}
                                    stroke="black"
                                    strokeWidth={0.5}/> : null}
                                <motion.circle
                                    transition={{ duration: 0.5, delay: 0.5 + idx + (0.5 * idx) }}
                                    opacity={0} animate={{ opacity: 1 }}
                                    {...{ cx: xCenter, cy: y, r, fill: _.has(d, colorName) ? colorScale(d[colorName]) : "red", stroke: "black", strokeWidth: 0.5 }} />
                                <AnimatedText x={xCenter+labelMargin } y={y} text={d[labelName]} delay={0.5 + idx + (0.5 * idx)} duration={0.5} textAnchor={labelRight?"start":"end"}/>
                                {/* <Text x={xCenter} y={y} verticalAnchor="middle" dx={labelRight?linePointMargin:-linePointMargin} textAnchor={labelRight?"start":"end"}>
                                    {d[labelName]}
                                </Text> */}
                                
                            </g>
                        )
                    })}
                </g> : null}

        </SVG>
    )
}


export default TimelineChart