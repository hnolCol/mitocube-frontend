import _ from "lodash"
import { motion } from "framer-motion"
import { isHexColorLight } from "../../../../services/checks/color"
import { Popover } from "@blueprintjs/core"
import { useNavigate } from "react-router"
import { api } from "@/api";

import { Text } from "@visx/text"
import { ProteinFavorite } from "@/comps/protein/charts/overview/ProteinFavorite"

export function ProteinGroup({ tag, highlight = false, disableTooltip = false, popoverPosition = "top", minimal = false, redirect_to_protein_site = true, onClick}) {

    const tags = _.isString(tag) ? tag.split(";").map(t => t.trim()) : []
    return <div className="flex">
        {tags.map((t, i) => (
            <div key={`protein-${i}-${t}`} className="flex" >
                <Protein tag={t}
                    minimal={minimal}
                    highlight={highlight}
                    disableTooltip={disableTooltip}
                    popoverPosition={popoverPosition}
                    redirect_to_protein_site={redirect_to_protein_site} onClick={onClick} />
                <span>{i < tags.length - 1 ? ";" : null}</span>
                
            </div>
        ))}
        </div>
}


export function Protein({ tag, highlight = false, disableTooltip = false, popoverPosition = "top", redirect_to_protein_site = true, minimal = false, onClick, style, inSVG = false, svgTextProps = {}, showFavorite = true, fill = true, onHover, disableHover =  true }) {
    const redirect = useNavigate()
    const { data: feature, isSuccess, isLoading, isError } = api.features.tag.useGetFeatureByTag({ tag }, { enabled: _.isString(tag), staleTime: Infinity })

    const backgroundColor = "#efefef"
    const motionBackgroundColor = "#d4d4d4bf"
    const fontColor = "#000000" 


    const handleClick = () => {
        if (_.isFunction(onClick)) {
            onClick(tag)
        }
        if (redirect_to_protein_site && _.isString(tag) && tag.length > 0) {
            redirect(`/protein/${tag}`)
        }
    }

    if (isError || isLoading || _.isNull(feature)) return null
    if (inSVG) return <Text {...svgTextProps}>{feature.gene_name}</Text>
    if (minimal && isSuccess) return <div>{feature.gene_name}</div>
    return <div >
        {isSuccess ? <motion.div
            style={{ ...style, backgroundColor: highlight ? motionBackgroundColor : backgroundColor, color: fontColor, fontSize: "0.75rem" } } //lighter ? "#efefef" :
            className="flex center-items padding--tiny cursor--default div--round margin-right--tiny"
            whileHover={{ backgroundColor: motionBackgroundColor, color: "#ffffff"}}
        >
            <Popover disabled={disableTooltip}
                fill={fill}
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
                <motion.button
                    onHoverStart={disableHover ? undefined : () => onHover(tag)}
                    onHoverEnd={disableHover ? undefined : () => onHover(undefined)}
                    className="flex center-items"
                    style={{ border: "none", backgroundColor: "transparent", color: fontColor, gap: "0.2rem", width: fill ? "100%" : "auto", outline: "none", fontWeight: highlight ? "bold" : "normal" }} onClick={handleClick}>
                    <div>{showFavorite ? <ProteinFavorite tag={tag} /> : null}</div><div>{feature.gene_name}</div>
                    {/* {attribute.has_unit && !hasInput ? <div className="margin-left--little margin-right--little"> <Icon icon="info-sign" intent="danger" /> </div> : null} */}
                </motion.button>
            </Popover>
        
        
        </motion.div> : null} 
        </div>

}