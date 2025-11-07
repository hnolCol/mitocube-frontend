import { Tooltip } from "@blueprintjs/core"
import { TagWithTooltip } from "../base/tags/TagWithTooltip"
import { isHexColorLight } from "../../../services/colors"
import { motion } from "framer-motion"

export function FilterSummary({ filter_tag }) {
    console.log(filter_tag)

    const backgroundColor = "#e5e5e5"
    const motionBackgroundColor = "#466688" //highlight ? "#e5e5e5" : 
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"
    const motionFontColor = isHexColorLight(motionBackgroundColor) ? "#000000" : "#fff"
    return (
        <div>
            {/* <TagWithTooltip tagText={filter.text}
                tooltipText={`${filter.description} (Features = ${filter.N})`} /> */}
            <Tooltip
                inheritDarkTheme={false}
                content={<div >
                    <h4>{filter_tag}</h4>
                    {/* <p>Number of features: <strong>{filter.N}</strong></p>
                    <p>{filter.description} <br/>
                     Filter based on publication: {filter.publication}</p> */}
                </div>
                }>
                <motion.div
                    whileHover={{backgroundColor : motionBackgroundColor, color: motionFontColor}}
                    style={{backgroundColor : backgroundColor, color: fontColor, fontSize:"0.75rem"}} 
                    className="flex center-items padding--tiny cursor--default div--round margin-right--tiny">{filter.text}</motion.div>
            </Tooltip>
        </div>
    )
}