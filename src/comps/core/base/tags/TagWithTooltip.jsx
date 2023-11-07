import { Tooltip } from "@blueprintjs/core"
import { motion } from "framer-motion"

export function TagWithTooltip({ tooltipText = "", tagText = "" }) {
    
    return (
        
        <Tooltip content={<div style={{textTransform:"capitalize"}}>{tooltipText.replaceAll("_"," ")}</div>} minimal={false} compact={true}  inheritDarkTheme={false} hoverOpenDelay={400} position="top">
            <motion.div
                className="padding--little cursor--default div--round intent-margin-right--little"
                whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
                            {tagText}</motion.div>
            </Tooltip>
    )
}