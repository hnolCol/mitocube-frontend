import { useGetFeatureByTag } from "../../../../hooks/queries/feature.hooks"
import _ from "lodash"
import { motion } from "framer-motion"
import { isHexColorLight } from "../../../../services/checks/color"
import { Popover } from "@blueprintjs/core"
import { useNavigate } from "react-router"



export function ProteinGroup({ tag, highlight = false, disableTooltip = false, popoverPosition = "top", minimal = false, redirect_to_protein_site = true, onClick }) {

    const tags = _.isString(tag) ? tag.split(";").map(t => t.trim()) : []
    return <div className="flex">
        {tags.slice(1).map((t, i) => (
            <div key={`protein-${i}-${t}`} className="flex" >
                <Protein tag={t}
                    minimal={minimal}
                    highlight={highlight}
                    disableTooltip={disableTooltip}
                    popoverPosition={popoverPosition}
                    redirect_to_protein_site={redirect_to_protein_site} onClick={onClick} />
                
            </div>
        ))}
        </div>
}


export function Protein({ tag, highlight = false, disableTooltip = false, popoverPosition = "top", redirect_to_protein_site = true, minimal = false, onClick, style }) {
    const redirect = useNavigate()
    const { data: feature, isSuccess, isLoading, isError } = useGetFeatureByTag({ tag }, { enabled: _.isString(tag), staleTime: Infinity })
    
    
    const backgroundColor = highlight ? "#466688" : "#efefef"
    const motionBackgroundColor = highlight ? "#efefef" : "#466688"
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"
    const motionFontColor = isHexColorLight(motionBackgroundColor) ? "#000000" : "#fff"


    const handleClick = () => {
        if (_.isFunction(onClick)) {
            onClick(tag)
        }
        if (redirect_to_protein_site && _.isString(tag) && tag.length > 0) {
            redirect(`/protein/${tag}`)
        }
    }

    if (isError || isLoading) return null
    if (minimal && isSuccess) return <div className="margin-right--little">{feature.gene_name}</div>
    return <div>
        {isSuccess ? <motion.div
            style={{ ...style, backgroundColor: backgroundColor, color: fontColor, fontSize: "0.75rem", } } //lighter ? "#efefef" :
            className="flex center-items padding--tiny cursor--default div--round margin-right--tiny"
            whileHover={{ backgroundColor: motionBackgroundColor, color: "#ffffff", scale: 1.05 }}
        >
            <Popover disabled={disableTooltip}
                popoverClassName="margin--little"
                content={
                <div className="padding--little bg--grey margin--little" style={{ maxWidth: "28rem" }}>
                        <h4>{feature.gene_name} ({feature.tag})</h4>
                        <div>{feature.gene_names}</div>
                    <div className="div--expand">
                            <div>
                                <div>{feature.protein_name}</div>
                            </div>
                    </div>
                </div>}
                minimal={false}
                compact={false}
                interactionKind="hover"
                inheritDarkTheme={false}
                hoverOpenDelay={400}
                hoverCloseDelay={100}
                position={popoverPosition}>
                <button className="flex" style={{border : "none", backgroundColor :"transparent", color : fontColor}} onClick={handleClick}>
                    <div>{feature.gene_name}</div>
                    {/* {attribute.has_unit && !hasInput ? <div className="margin-left--little margin-right--little"> <Icon icon="info-sign" intent="danger" /> </div> : null} */}
                </button>
            </Popover>
        
        
        </motion.div> : null} 
        </div>

}