import PropType from 'prop-types'
import { Button, ButtonGroup, Divider, Icon, Menu, MenuDivider, MenuItem, NumericInput, Popover, Tooltip } from "@blueprintjs/core"
import { motion } from "framer-motion"
import _, { hasIn } from "lodash"
import { mapAttributeValueTagsToAttributes } from "../../../../services/attributes"
import "./style.css"
import { useGetAttribute, useGetAttributeUnit, useGetTrait } from "../../../../hooks/queries/attribute.hooks"
import { useEffect, useState } from "react"

import { isHexColorLight } from "../../../../services/colors"
import { TraitValueWithUnitType } from "../traits/TraitValueWithUniType"
import { RemoveButton } from '../buttons/RemoveButton'

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
 * @description 
 * @param {Object} props 
 * @param {String} props.attribute_tag
 * @param {String} props.trait_tag 
 * @param {Boolean} props.disableTooltip 
 * @param {Function} prop.onRemove 
 * @param {Function} prop.onUserInput
 * @returns 
 */
export function TraitWithValueInput({
        trait_tag, 
        attribute_tag = "",
        disableTooltip = false,
        onRemove = undefined,
        popoverPosition = "top",
        highlight = false,
        submission_tag,
        onUserUnitInput,
        unitInput }) {
    const [isOpen,setIsOpen] = useState(false) //controlled popover
    const { data: attribute, isLoading, isFetching, isSuccess } = useGetAttribute({ tag: attribute_tag })
    const { data: trait, isLoading: traitIsLoading, isSuccess: traitIsSuccess } = useGetTrait({ tag: trait_tag, include_input: _.isString(submission_tag), submission_tag }, {enabled : _.isString(trait_tag)})
    
    //handle data input 
    const hasInput = _.has(unitInput, [attribute_tag, trait_tag]) && !_.isEmpty(unitInput[attribute_tag][trait_tag])
    const inputByUser = hasInput ? unitInput[attribute_tag][trait_tag] : {}
    const unittypes = !_.isEmpty(inputByUser)? _.keys(inputByUser).map(unittype  => _.isArray(inputByUser[unittype].value) ? _.join(inputByUser[unittype].value.map(v => v.gene_name),";"): `${inputByUser[unittype].value} ${inputByUser[unittype].unit_text}`): []
    const unitString = unittypes.length > 0 ? _.join(unittypes,", ") : ""
    //handle colors 
    const backgroundColor = highlight ? "#466688" : "#e5e5e5"
    const motionBackgroundColor = highlight ? "#e5e5e5" : "#466688"
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"
    const motionFontColor = isHexColorLight(motionBackgroundColor) ? "#000000" : "#fff"

    const handleUserInputSelection = (userUnitInput) => {
        onUserUnitInput(userUnitInput)
        setIsOpen(false)
    }

    useEffect(() => {
        // if units were defined already, put them to the user input in the effect.
        if (traitIsSuccess && _.isObject(trait.user_input) && !_.isEmpty(trait.user_input)) {
            onUserUnitInput({ [attribute_tag] : {[trait_tag] : trait.user_input} })
        }
    }, [traitIsSuccess])
    return (
    <div>
        { isFetching || isLoading || traitIsLoading ? <div>...</div> : isSuccess && traitIsSuccess?
                <motion.div
                style={{ backgroundColor: backgroundColor, color: fontColor, fontSize: "0.75rem" }} //lighter ? "#efefef" :
                className="flex center-items padding--tiny cursor--default div--round intent-margin-right--tiny"
                whileHover={{ backgroundColor: motionBackgroundColor, color: motionFontColor }}
                >
                <Popover disabled={disableTooltip} content={
                    <div className="padding--little bg--grey margin--little padding--little" style={{ maxWidth: "24rem" }}>
                            <h4>{attribute.text}</h4>
                            <div className="div--expand">
                                {attribute.has_unit ?
                                    <div>
                                        <div>Please enter the required information.</div>
                                        <TraitValueWithUnitType
                                            attribute_tag={attribute_tag}
                                            trait_tag={trait_tag}
                                            onSelect={handleUserInputSelection}
                                            prevValues={hasInput ? unitInput : undefined } />
                                    </div>
                                    : null}
                        </div>
                        </div>}
                    canEscapeKeyClose={true}
                    minimal={false}
                    compact={true}
                    isOpen={isOpen}
                    popoverClassName=""
                    onInteraction={(nextOpenState,e) => setIsOpen(nextOpenState)}
                    interactionKind="click-target"
                    inheritDarkTheme={false}
                    hoverOpenDelay={200}
                    hoverCloseDelay={100}
                    position={popoverPosition}>
                        <div className="flex">
                        <div>{trait.text}{unitString.length > 0 ? ` (${unitString})` : null}</div>
                        {attribute.has_unit && !hasInput ?<div className="intent-margin-left--little intent-margin-right--little"> <Icon icon="info-sign" intent="danger" /> </div>: null}
                        </div>
                    </Popover>
                    
                {_.isFunction(onRemove) ? <RemoveButton fontColor={fontColor} onRemove={(e) => onRemove(trait)} /> : null}
                    
                    
            </motion.div> : null }
    </div>
    )
}


/**
 * @description Should actually not exist anymore. Deptra
 * @deprecated SHould not be used anymore, feature are part of the units. 
 * @param {Object} props 
 * @param {import("../../../../types/feature").Feature} props.feature 
 * @param {import("../../../../types/attributes").Attribute} props.attribute
 * @param {Boolean} props.disableTooltip 
 * @param {Function} prop.onRemove 
 * @returns 
 */
export function FeatureTagWithTooltip({ feature = {}, attribute = {}, disableTooltip = false, onRemove = undefined,  popoverPosition = "top"}) {
    return (
        <Popover disabled={disableTooltip}
            content={<div className="padding--little" style={{maxWidth : "24rem"}}>
            <Menu small={true}>
                <MenuItem text={attribute.text} disabled={true} />
                <MenuDivider />
                    <MenuItem text={feature.gene_name} label={feature.key} />
                    <MenuItem text={feature.gene_names} multiline={true} />
                    <MenuItem text={feature.protein_name} multiline={true} />
            </Menu>
        </div>}
            minimal={false}
            compact={true}
            popoverClassName = ""
            interactionKind="hover"
            inheritDarkTheme={false}
            hoverOpenDelay={600}
            hoverCloseDelay={200}
            position={popoverPosition}>
            <motion.div
                style={{backgroundColor : "#e5e5e5", color:"#000000", fontSize:"0.75rem"}} //lighter ? "#efefef" :
                className="flex center-items padding--tiny cursor--default div--round intent-margin-right--tiny"
                whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
            <div>{_.isString(feature.gene_name)?feature.gene_name:null}</div>
            {_.isFunction(onRemove) ? <button
                onClick={(e) => onRemove(feature)}
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
            hoverOpenDelay={600}
            position="top">
            <motion.div
                style={{backgroundColor : "#e5e5e5", color:"#000000", fontSize:"0.75rem"}} //lighter ? "#efefef" :
                className="padding--little cursor--default div--round intent-margin-right--tiny"
                whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
                            {name}</motion.div>
            </Popover>
    )
}
