import { motion } from "framer-motion"

export function SimpleTag({ text = "" }) {
    
    return (
            <motion.div
                className="padding--little cursor--default div--round intent-margin-right--little"
                style = {{backgroundColor : "#efefef", color:"#000000"}}
                whileHover={{backgroundColor: "#466688",  color : "#ffffff"}}>
            {text}
            </motion.div>
    )
}

export default SimpleTag