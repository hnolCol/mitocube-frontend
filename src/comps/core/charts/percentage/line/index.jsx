import PropTypes from "prop-types"
import { SVG } from "../../SVGHeader"
import { useMemo } from "react"
import { getChartWidthAndHeightWithMargins } from "../../../../../services/plotting/size"
import { scaleLinear } from "@visx/scale"
import { Text } from "@visx/text"
import { motion } from "framer-motion"
import _ from "lodash"


function PercentageLine({
    width = 250,
    height = 40,
    margins = {
        left: 5,
        top: 5,
        right: 5,
        bottom : 5
    },
    value = 0.554,
    stroke = "#466688",
    backgroundStroke = "#fafafa",
    strokeWidth = 5,
    label = "Sample Submission"
}) {
    const { chartHeight, chartWidth } = getChartWidthAndHeightWithMargins({width, height, margins})
    const y = margins.top + chartHeight/2
    const valueScale = useMemo(() => scaleLinear({
        domain: [0, 1],
        range: [margins.left, margins.left + chartWidth],
        nice : true
    }), [chartWidth, margins.left])
    const xValue = valueScale(value)

    return (
        <SVG {...{ width, height }}>
            <Text x={margins.left} y={margins.top} verticalAnchor="middle" textAnchor="start">{label}</Text> 
            <Text x={xValue} y={y+strokeWidth + 1} verticalAnchor="start" textAnchor="middle">{`${_.round(value*100,2)}%`}</Text>
            <line x1={margins.left} x2={margins.left+chartWidth}  y1={y} y2={y} {...{strokeWidth,stroke: backgroundStroke}} strokeLinecap="round"/>
            <motion.line
                x1={margins.left}
                x2={xValue} y1={y} y2={y}
                {...{ strokeWidth, stroke }}
                strokeLinecap="round"
                transition={{ duration: 0.8 }}
                pathLength={0}
                animate={{ pathLength: 1 }} />
            

        </SVG>
    )
}

export default PercentageLine