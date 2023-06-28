import PropTypes from "prop-types"
import { motion } from "framer-motion";
import _ from "lodash"
import { useMemo } from "react";

function AnimatedText({x,y,text = "", delay = 0, duration = 1, textAnchor = "start", verticalAnchor = "middle", reverse = false}) {
    
    const timeStep = duration / text.length 
    const splitText = useMemo(() => text.split(""), [text])

    return (
        <motion.text {...{x,y, textAnchor}} >
            {splitText.map((subString, subIdx) => {
                var charDelay = reverse ? timeStep * (text.length - subIdx) + delay : timeStep * subIdx + delay
                return (
                    <motion.tspan
                    key = {`${text}-${subIdx}-${subString}`}
                    alignmentBaseline={verticalAnchor}
                    animate={{ opacity: 1 }}
                    opacity={0.0}
                    transition={{delay : charDelay, duration : timeStep }}
                        
                    >
                        {subString}
                    </motion.tspan>
                )
            })}
        </motion.text>
    )
}


export default AnimatedText