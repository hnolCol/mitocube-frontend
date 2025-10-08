import { useGetFeatureByTag } from "../../../../hooks/queries/feature.hooks"
import _ from "lodash"
import { motion } from "framer-motion"
import { isHexColorLight } from "../../../../services/checks/color"
import { Popover } from "@blueprintjs/core"
import { useNavigate } from "react-router"

export function Protein({ tag, highlight = false, disableTooltip = false, popoverPosition = "top" }) {
    const redirect = useNavigate()
    const { data: feature, isSuccess, isError } = useGetFeatureByTag({ tag }, { enabled: _.isString(tag), staleTime: Infinity })
    
    
    const backgroundColor = highlight ? "#466688" : "#efefef"
    const motionBackgroundColor = highlight ? "#efefef" : "#466688"
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"
    const motionFontColor = isHexColorLight(motionBackgroundColor) ? "#000000" : "#fff"
    if (isError) return null 
    
    return <div>
        {isSuccess ? <motion.div
            style={{ backgroundColor: backgroundColor, color: fontColor, fontSize: "0.75rem" }} //lighter ? "#efefef" :
            className="flex center-items padding--tiny cursor--default div--round intent-margin-right--tiny"
            whileHover={{ backgroundColor: motionBackgroundColor, color: motionFontColor }}
        >
            <Popover disabled={disableTooltip}
                content={
                <div className="padding--little bg--grey margin--little padding--little" style={{ maxWidth: "24rem" }}>
                        <h4>{feature.gene_name}</h4>
                        <div>{feature.gene_names}</div>
                    <div className="div--expand">
                            <div>
                                <div>{feature.protein_name}</div>
                            </div>
                    </div>
                </div>}
                minimal={false}
                compact={true}
                interactionKind="hover"
                inheritDarkTheme={false}
                hoverOpenDelay={200}
                hoverCloseDelay={100}
                position={popoverPosition}>
                <button className="flex" style={{border : "none", backgroundColor :"transparent"}} onClick={() => redirect(`/protein/${tag}`)}>
                    <div>{feature.gene_name}</div>
                    {/* {attribute.has_unit && !hasInput ? <div className="margin-left--little intent-margin-right--little"> <Icon icon="info-sign" intent="danger" /> </div> : null} */}
                </button>
            </Popover>
        
        
        </motion.div> : null} 
        </div>

}