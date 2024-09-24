import { Button, ButtonGroup, Divider, Menu, MenuDivider, MenuItem, NumericInput, Popover, Tooltip } from "@blueprintjs/core"
import { motion } from "framer-motion"
import _ from "lodash"
import { mapAttributeValueTagsToAttributes } from "../../../../services/attributes"
import "./style.css"
import { useGetAttributeUnit } from "../../../../hooks/queries/attribute.hooks"
import Loading from "../loading"
import { useEffect, useState } from "react"
import { UnitInput } from "../units/UnitInput"
import { getUnitString } from "../../../../services/unit/format"
import { isHexColorLight } from "../../../../services/colors"

export function UnitSelectionTag({ attribute, attributeValue, onSave, initValues, rowIdces}) {
    const [userInput, setUserInput] = useState({})
    const { data : attribute_units, isLoading, isFetching, isSuccess } = useGetAttributeUnit({tag : attribute.tag}, {enabled : _.isBoolean(attribute.has_unit) && attribute.has_unit})

    useEffect(() => {
        if (initValues !== undefined) setUserInput(initValues)
    }, [])
    
    /**
     * @description Wrapper function to handle saving the input made by the user. 
     */
    const handleSave = () => {
        onSave(attribute,attributeValue,userInput,rowIdces)
    }
    const handleInput = (value, unit, isPrefix = false, time_unit = false) => {
        if (isPrefix)
            setUserInput(prevValues => {
                return {
                    ...prevValues,
                    [unit.tag]: {
                        time_unit : "s",
                        ...prevValues[unit.tag],
                        prefix: value,
                        unit
                    }
                }
            })
        else if (time_unit) {

            setUserInput(prevValues => {
                return {
                    ...prevValues,
                    [unit.tag]: {
                        prefix : "NA",
                        ...prevValues[unit.tag],
                        unit,
                        time_unit : value
                    }
                }
            })

        }
        else {
            setUserInput(prevValues => {
                return {
                    ...prevValues,
                    [unit.tag]: {
                        prefix : "NA",
                        time_unit : "s",
                        ...prevValues[unit.tag],
                        value,
                        unit
                    }
                }
            })
        }
    }
   
    return (
        <div className="padding--little">
            <h4>{attributeValue.text}</h4>
            <div className="font-size--smallest">Setting for rows: {_.join(rowIdces,", ")}</div>
            <div className="padding--little">
                {isLoading || isFetching ? <Loading /> : isSuccess & _.isObject(attribute_units) ? <div>
                    {attribute_units.units.filter(au => au.attribute.tag === attribute.tag)[0].units.map((unit,idx) => {
                        return (
                            <UnitInput {...{
                                unit,
                                focusInput : idx===0,
                                prefixes: attribute_units.prefixes,
                                onValueChange: handleInput,
                                selection: _.has(userInput, unit.tag) ? userInput[unit.tag] : undefined,
                                isTime : unit.tag == "time"
                            }} />
                        )
                    })}
                    </div> : null}
                
                    <Button text="Save" small minimal intent="primary" onClick={handleSave}/>
                    {/* <Button text="Close" minimal intent="none" onClick={() => setIsOpen(false)}/> */}
                
            </div>
            <Divider />
            </div>
    )

}



function AttributeValueUnitSelection({ attribute, attributeValue, onSave, initValues}) {
    const [isOpen, setIsOpen] = useState(false)
    const [userInput, setUserInput] = useState({})
    const { data : attribute_units, isLoading, isFetching, isSuccess } = useGetAttributeUnit({tag : attribute.tag}, {enabled : _.isBoolean(attribute.has_unit) && attribute.has_unit})
    useEffect(() => {
        if (initValues !== undefined) setUserInput(initValues)
    }, [])
    //console.log(attribute_units)
    const handleInput = (value, unit, isPrefix = false, time_unit = false) => {
        if (isPrefix)
            setUserInput(prevValues => {
                return {
                    ...prevValues,
                    [unit.tag]: {
                        time_unit : "s",
                        ...prevValues[unit.tag],
                        prefix: value,
                        unit
                    }
                }
            })
        else if (time_unit) {

            setUserInput(prevValues => {
                return {
                    ...prevValues,
                    [unit.tag]: {
                        ...prevValues[unit.tag],
                        unit,
                        time_unit : value
                    }
                }
            })

        }
        else {
            setUserInput(prevValues => {
                return {
                    ...prevValues,
                    [unit.tag]: {
                        time_unit : "s",
                        ...prevValues[unit.tag],
                        value,
                        unit
                    }
                }
            })
        }
    }

    const handleSave = () => {
        onSave(attribute, attributeValue, userInput)
        setIsOpen(false)
    }
    

    if (!attribute.has_unit) return null 


    return <Popover minimal
        canEscapeKeyClose={false}
        isOpen={isOpen}
        content={
        <div className="padding--medium">
            <h4>Unit for attribute {attribute.text}</h4>
            <div className="padding--little">
                {isLoading || isFetching ? <Loading /> : isSuccess ? <div>
                    {attribute_units.units.map(unit => {
                        return (
                            <UnitInput {...{
                                key : unit.tag,
                                unit,
                                prefixes: attribute_units.prefixes,
                                onValueChange: handleInput,
                                selection: _.has(userInput, unit.tag) ? userInput[unit.tag] : undefined,
                                isTime : unit.tag == "time"
                            }} />
                        )
                    })}
                    </div> : null}
                
                <ButtonGroup alignText="right">
                    <Button text="Save" minimal intent="primary" onClick={handleSave}/>
                    <Button text="Close" minimal intent="none" onClick={() => setIsOpen(false)}/>
                </ButtonGroup>
            </div>
            </div>}>
        <button onClick={(e) => {
            // e.stopPropagation()
            console.log(e.button)

            setIsOpen(true)
        }}
            style={{ margin: "0px", padding: "0px", border: "none", background: "transparent", outline: "none" }}>
                <div className="unit-div"></div></button>
        {/* <Button small minimal intent="danger" icon="chevron-down" /> */}
    </Popover>
}




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
export function AttributeTagWithTooltip({ attributeValue = {}, attribute = {}, disableTooltip = false, onRemove = undefined, popoverPosition = "top", units = {}, addUnitsForDatasetAttributes, highlight = false }) {
    //add unit string...
  
    const backgroundColor = highlight ? "#466688" : "#e5e5e5"
    const motionBackgroundColor = highlight ? "#e5e5e5" : "#466688"
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"
    const motionFontColor = isHexColorLight(motionBackgroundColor) ? "#000000" : "#fff"
    const unitString = getUnitString(units)
    return (

            <motion.div
                style={{backgroundColor : backgroundColor, color: fontColor, fontSize:"0.75rem"}} //lighter ? "#efefef" :
                className="flex center-items padding--tiny cursor--default div--round intent-margin-right--tiny"
                whileHover={{backgroundColor : motionBackgroundColor, color: motionFontColor}}>
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
                    hoverOpenDelay={600}
                    hoverCloseDelay={100}
                    position={popoverPosition}>
                <div>{attributeValue.text}{unitString.length > 0 ? ` (${unitString})` : null}</div>
                </Popover>
                {_.isFunction(onRemove) ? <button
                    onClick={(e) => onRemove(attributeValue)}
                    style={{ margin: "0px", padding: "0px", border: "none", background: "transparent", outline: "none", color : fontColor }}>
                    <div className="close-div" />        
                </button> : null}
            
            </motion.div>
            
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
