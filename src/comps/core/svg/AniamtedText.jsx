import PropTypes from "prop-types"
import { motion } from "framer-motion";
import _ from "lodash"

function AnimatedText({x,y,text = "", delay = 0, duration = 2, textAnchor = "start", verticalAnchor = "middle"}) {
    
    const timeStep = duration / text.length 
    return (
        <motion.text {...{x,y, textAnchor}} >
            {text.split("").map((subString, subIdx) => {
                return (
                    <motion.tspan
                    alignmentBaseline={verticalAnchor}
                    animate={{ opacity: 1 }}
                    opacity={0.0}
                    transition={{delay : timeStep * subIdx + delay, duration : timeStep }}
                        
                    >
                        {subString}
                    </motion.tspan>
                )
            })}
        </motion.text>
    )
}


export default AnimatedText