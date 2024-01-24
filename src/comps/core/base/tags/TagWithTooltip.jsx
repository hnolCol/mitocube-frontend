import { Button, Icon, Menu, MenuDivider, MenuItem, Popover, Tooltip } from "@blueprintjs/core"
import { motion } from "framer-motion"
import _ from "lodash"
import { mapAttributeValueTagsToAttributes } from "../../../../services/attributes"
import "./style.css"

export function TagWithTooltip({ tooltipText = "", tagText = "", lighter = false }) {
    
    return (
        
        <Popover content={<div className="padding--little">
            <Menu>
                {tooltipText.split("\n").map(splitString => <MenuItem key={splitString} text={splitString} />)}
            </Menu>
        </div>}
            minimal={false}
            compact={true}
            popoverClassName = ""
            interactionKind="hover"
            inheritDarkTheme={false}
            hoverOpenDelay={100}
            position="top">
            <motion.div
                style={{backgroundColor : lighter ? "#efefef" :"#d1d1d1", color:"#000000", fontSize:"0.75rem"}}
                className="padding--little cursor--default div--round intent-margin-right--tiny"
                whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
                            {tagText}</motion.div>
            </Popover>
    )
}


/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/attributes").AttributeValue} props.attributeValue
 * @param {import("../../../../types/attributes").Attribute} props.attribute
 * @param {Boolean} props.disableTooltip 
 * @param {Function} prop.onRemove 
 * @returns 
 */
export function AttributeTagWithTooltip({ attributeValue = {}, attribute = {}, disableTooltip  = false, onRemove = undefined}) {
    
    return (
        
        <Popover disabled={disableTooltip} content={
            <div className="padding--little" style={{ maxWidth: "24rem" }}>
                <Menu small={true}>
                    <MenuItem text={attribute.text} disabled={true} />
                    <MenuDivider />
                    <MenuItem text={attributeValue.description} multiline={true}/>
                </Menu>
            </div>}
            minimal={false}
            compact={true}
            popoverClassName = ""
            interactionKind="hover"
            inheritDarkTheme={false}
            hoverOpenDelay={400}
            hoverCloseDelay={100}
            position="top">
            <motion.div
                style={{backgroundColor : "#e5e5e5", color:"#000000", fontSize:"0.75rem"}} //lighter ? "#efefef" :
                className="padding--tiny cursor--default div--round intent-margin-right--tiny"
                whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
                <div>{attributeValue.text}</div>
                {_.isFunction(onRemove) ? <button
                    onClick={(e) => onRemove(attributeValue)}
                    style={{ margin: "0px", padding: "0px", border: "none", background: "transparent", outline: "none" }}>
                    <div className="close-div" />
                        
                </button> : null}
            </motion.div>
            </Popover>
    )
}


/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/feature").Feature} props.feature 
 * @param {import("../../../../types/attributes").Attribute} props.attribute
 * @param {Boolean} props.disableTooltip 
 * @param {Function} prop.onRemove 
 * @returns 
 */
export function FeatureTagWithTooltip({ feature = {}, attribute = {}, disableTooltip = false, onRemove = undefined}) {
    
    return (
        <Popover disabled={disableTooltip}
            content={<div className="padding--little" style={{maxWidth : "24rem"}}>
            <Menu small={true}>
                <MenuItem text={attribute.text} disabled={true} />
                <MenuDivider />
                    <MenuItem text={feature.gene_name} label={feature.uniprot_id} />
                    <MenuItem text={feature.protein_name} multiline={true} />
            </Menu>
        </div>}
            minimal={false}
            compact={true}
            popoverClassName = ""
            interactionKind="hover"
            inheritDarkTheme={false}
            hoverOpenDelay={400}
            hoverCloseDelay={200}
            position="top">
            <motion.div
                style={{backgroundColor : "#e5e5e5", color:"#000000", fontSize:"0.75rem"}} //lighter ? "#efefef" :
                className="padding--tiny cursor--default div--round intent-margin-right--tiny"
                whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
            <div>{_.isString(feature.gene_name)?feature.gene_name.split(" ").at(0):null}</div>
            {_.isFunction(onRemove) ? <button
                onClick={(e) => onRemove(attributeValue)}
                style={{ margin: "0px", padding: "0px", border: "none", background: "transparent", outline: "none" }}>
                <div className="close-div" />
                    
            </button> : null}
            </motion.div>
            </Popover>
    )
}



export function SampleAttributeTagWithTooltip({ name, values, sampleNames, attrValuesByTag }) {
    return (
        
        <Popover content={<div className="padding--little">
            <Menu small={true}>
                <MenuItem text={name} disabled={true} />
                <MenuDivider />
                {_.keys(values).map(attrValueTag => {
                    const mappedAttributeValue = mapAttributeValueTagsToAttributes({ attrValueTag, attrValuesByTag })
                    const label = mappedAttributeValue.isAttrValue ? mappedAttributeValue.attrValues.map(attrValue => attrValue.description) : ""
                    return <MenuItem
                        key={attrValueTag}
                        text={`${mappedAttributeValue.asString} (${values[attrValueTag].length})`}
                        labelElement={<div className="labelelement-wrap--fixed-width">{label}</div>}>
                        {values[attrValueTag].map(sampleIdx => {
                            return <MenuItem text={sampleIdx}
                                key={`${attrValueTag}-${sampleIdx}`}
                                labelElement={<div className="labelelement-wrap--fixed-width" style={{wordWrap : "break-word"}}>{sampleNames[sampleIdx]}</div>} />
                        })}
                        </MenuItem>
                })}
            </Menu>
        </div>}
            minimal={false}
            compact={true}
            popoverClassName = ""
            interactionKind="hover"
            inheritDarkTheme={false}
            hoverOpenDelay={400}
            position="top">
            <motion.div
                style={{backgroundColor : "#e5e5e5", color:"#000000", fontSize:"0.75rem"}} //lighter ? "#efefef" :
                className="padding--little cursor--default div--round intent-margin-right--tiny"
                whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
                            {name}</motion.div>
            </Popover>
    )
}
