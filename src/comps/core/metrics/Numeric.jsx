import { useAnimatedCounter } from "../../../hooks/useAnimatedCounter"
import { abbreviateNumber } from "../../../services/format/number"
import {motion} from "framer-motion"
import _ from "lodash"


function Numeric({ metric = 400, label = "Identified Proteins", roundValue = true, roundPrecision = 1, spanClassName="h1-span", callbackOnClick = undefined}) {
    // Animates a numeric metric with a label. 
    // roundValue as a bool allows to round the value. if a value below 0.5 is given, the value will be always 0 
    // if roundValue equals true.
    const counter = useAnimatedCounter(metric,0,1.8,roundValue,roundPrecision)
    
    return (
       
        <motion.div
            className="flex flex-column center-items bg--lightgrey cursor--default padding--medium div--round font-size--large margin--little" 
            whileHover={{ scale: 1.05 }}
            onClick={_.isFunction(callbackOnClick)?callbackOnClick:undefined}>
            <div>
                <span className={spanClassName}>
                    {abbreviateNumber(counter)}
                </span>
            </div>

            <div>
                <span>
                    {label}
                </span>
            </div>
                
        </motion.div>
    )
}


export default Numeric



