import PropTypes from "prop-types"
import { motion } from "framer-motion"
import _ from "lodash"

Categorical.propTypes = {
    text: PropTypes.string.isRequired,
    label : PropTypes.string.isRequired
}

function Categorical({ metric, label, spanClassName="h1-span" }) {

    return (
        <motion.div
            className="flex flex-column center-items bg--lightgrey cursor--default padding--medium div--round font-size--larger margin--little" 
            whileHover={{scale : 1.05}}>
            <div>
                <span className={spanClassName}>
                    {metric}
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


export default Categorical
