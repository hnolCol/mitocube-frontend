import { motion } from "framer-motion"
import _ from "lodash"
import AnimatedText from "../../AniamtedText"
import { useMemo } from "react"
import { SVG } from "../../../charts/SVGHeader"


function ElectrosrayPerformanceIcon({
    width = 200,
    height = 50,
    sprayOn = true,
    sprayLength = 30,
    xStart = 5,
    ycenter = 20,
    scatter = 10,
    fillColor = "#466688",
    strokeColor = "#1d1d1b",
    numberCircles = 40,
    circleRadius = 6,
    delayChildren = 2,
    text = "Measuring"
}) {
    const msEntryStart = xStart + sprayLength
    const msEnd = msEntryStart+20
    const peakVariants = {
        hidden: {
            pathLength: 0,
        },
        visible: {
            pathLength: 1,
            }   
        }
    const circleVariansMove = {
        hidden: {
            cx: xStart - 5,
            r: circleRadius,
            opacity : 0
        },
        visible: (yPoint) => {
            return (
                {
                    cx: xStart + sprayLength,
                    r: circleRadius * 0.02,
                    cy : yPoint + (ycenter - yPoint),
                    opacity: 0.8}
        )}
    }
    let points = useMemo(() => _.range(numberCircles).map(v => {
        return {
            cy: _.random(ycenter - 1.2 * scatter, ycenter + 1.2 * scatter, true),
            cx: circleRadius,
            r: circleRadius
        }
    }), [numberCircles])

    return (
        <SVG width={width} height={height}>
        <motion.g transition={{ staggerChildren: 0.1, delayChildren : delayChildren }} animate="visible">
                
            {sprayOn?points.map((point, pIdx) => <motion.circle
                    key={`${point.cx}${pIdx}`}
                {...point}
                opacity={0}
                   // animate={"visible"}
                    fill={fillColor}
                    variants={circleVariansMove}
                    custom={point.cy}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", delay : _.random(0,2,true)+(pIdx*0.2)}} />):null} 
   
                <motion.polyline
                    points={`${msEnd} ${ycenter - scatter-3} ${msEntryStart} ${ycenter-2} ${msEntryStart} ${ycenter+2}  ${msEnd} ${ycenter + scatter+3}`}
                    fill="none"
                    animate={"visible"}
                    pathLength={0}
                    variants={peakVariants}
                    stroke={strokeColor}
                    strokeMiterlimit="10"
                    transition={{ duration: 1, delay : 0.4}}
                    strokeWidth="1" />
                <AnimatedText x={msEnd} y={ycenter} text={text} delay={0.5}/>
            </motion.g>
            </SVG>
     
    )
    
    
}

export default ElectrosrayPerformanceIcon