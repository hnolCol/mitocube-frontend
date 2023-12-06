import { motion } from "framer-motion"

export function SimpleTag({ text = "" }) {
    return (
        <motion.div
            transition={{delay : 0.15}}
                className="padding--little cursor--default div--round intent-margin-right--little"
                style = {{backgroundColor : "#efefef", color:"#000000", display : "inline-block" , whiteSpace : "nowrap"}}
                whileHover={{backgroundColor: "#466688",  color : "#ffffff"}}>
            <span>{text}</span>
            </motion.div>
    )
}

export default SimpleTag