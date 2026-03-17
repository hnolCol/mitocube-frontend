import PropType from 'prop-types'
import { Menu, MenuDivider, MenuItem, Popover } from "@blueprintjs/core"
import { motion } from "framer-motion"
import _, { has } from "lodash"
import { mapAttributeValueTagsToAttributes } from "../../../../services/attributes"
import "./style.css"
import { useEffect, useState } from "react"

import { isHexColorLight } from "../../../../services/colors"
import { RemoveButton } from '../buttons/RemoveButton'
import PropTypes from 'prop-types'
import NumericValueInput from '../../input/Numeric'

import hooks from "@mitocube/api-hooks"
import { TraitInput } from '../../input/api/TraitInput'
import { findChildrenByPath } from '../../../submission/new/sample_attributes/select/SamplesAttributeWrapper'
import { MinimalTextInput } from '../../input/MinimalTextInput'
import { Loading } from '../states/Loading'
import { FeatureInput } from '../../input/api/FeatureInput'
import { Attribute } from '../attributes/Attribute'
import { Trait } from '../traits/Trait'
import { set } from 'lodash'


TraitChildren.propTypes = {
    children_tags : PropTypes.array 
}
/**
 * @description Container for displaying children of a attribute. 
 * @param {Object} props 
 * @param {String[]} props.children_tags The tags of the children.  
 * @returns 
 */
export function TraitChildren({ children_tags, onChildrenSelection, getSelectionByPath, path, selectedRows, rowIndex, index = 0, onRemove, referenceID, checkAttributeRequiredTraits, displayChildrenUponSelection = true }) {
    return (<div>
        {
            _.isArray(children_tags) && children_tags.length ?
                children_tags.map(tag => <TraitChildSelection
                    key={tag}
                    attribute_tag={tag}
                    onSelection={onChildrenSelection}
                    {...{
                        path,
                        rowIndex,
                        selectedRows,
                        index,
                        getSelectionByPath,
                        onRemove,
                        referenceID,
                        checkAttributeRequiredTraits,
                        displayChildrenUponSelection
                    }} />)
                : null
        }
    </div>)
}



/**
 * @description Displays a child trait selection input for a given attribute tag.
 * @param {Object} props 
 * @param {String} props.attribute_tag The tag of the attribute for which the children should be displayed.
 * @param {Function} props.onSelection Callback function to handle the selection of a child trait.
 * @param {String[]} props.selectedRows The currently selected rows.
 * @param {String[]} props.path The path to the current attribute and trait.
 * @param {Function} props.getSelectionByPath Function to get the selection by path.
 * @param {Number} props.rowIndex The index of the row in the table.
 * @param {Number} props.index The index of the current attribute in the hierarchy. 
 * @param {String} props.referenceID The reference ID for the current selection.
 * @returns 
 */
export function TraitChildSelection({ attribute_tag, onSelection, path, selectedRows, index, getSelectionByPath, rowIndex, onRemove, referenceID, checkAttributeRequiredTraits, displayChildrenUponSelection }) {

    const [childTrait, setChildTrait] = useState(undefined) 

    const { data: attribute, isSuccess } = hooks.attributes.useGetAttribute({ tag: attribute_tag }, {enabled : _.isString(attribute_tag)})
    const { data: required_traits, isSuccess : requiredTraitsChecked, isLoading : isLoadingRequirements } = hooks.attributes.useGetRequiredTraits({ tag: attribute_tag }, { enabled: _.isString(attribute_tag) && isSuccess })
    const {data : children, isSuccess : childrenIsSuccess} = hooks.attributes.useGetAttributeChildren({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && isSuccess})
    const {data : traitCount, isSuccess : isSuccessTraitCount} = hooks.traits.useGetTraitCount({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && isSuccess})

    const attributeHasTraits = isSuccessTraitCount && traitCount > 0
    let track_path = _.concat(path, [{ "tag": attribute_tag, "type": "attribute", "id": referenceID }])
    const selection = _.isFunction(getSelectionByPath) ? _.head(getSelectionByPath(track_path, rowIndex)) : undefined
    const has_selection = _.isObject(selection)


    useEffect(() => {
        if (has_selection && selection.type === "trait") {
            const traitInSelection = selection.tag
            if (_.isString(traitInSelection) && traitInSelection !== childTrait) {
                setChildTrait(traitInSelection)
            }

        }
    
    },[has_selection])

    const handleTraitSelection = (trait_tag, single_child_level = 3, single_child_type = false, join_values = false, referenceID) => {
        const p_remove = _.concat(track_path, [{ "type": "trait", "tag": childTrait, "id": referenceID }])
        if (_.isFunction(onRemove)) onRemove(p_remove)
        const p = _.concat(track_path, [{ "type": "trait", "tag": trait_tag, "id": referenceID }])
        onSelection(p, [rowIndex], single_child_level, single_child_type, join_values)
        setChildTrait(trait_tag)
    }

    const handleTraitValueInput = (value) => {
        const p = _.concat(track_path, [{ "type": "trait", "value": value, "tag": childTrait, "id": referenceID }])
        onSelection(p, [rowIndex], index + 3, false, false, false)
    }

    const handleFeatureSelection = (tag) => {

        onSelection(_.concat(track_path, [{ "type": "trait", "value": tag, "tag" : childTrait, "id" :  referenceID }]), [rowIndex], index + 3, false, false)
    }
    /**
     * @description Get the input value for the text input. The given path is screened to match and the value is returned.
     * @returns {String} The input value for the text input.
     */
    const getInput = () => {
        const input = getSelectionByPath(track_path, rowIndex)
        if (_.isArray(input) && input.length > 0) {

            return _.head(input).value
        }
        return ""
    }

    const getFeatureInput = () => {
        const input = getSelectionByPath(track_path, rowIndex)
        
        if (_.isArray(input) && input.length > 0) {

            return _.split(_.head(input).value, ";")
        }
        return []
    }
    if (isLoadingRequirements) return null
    if (requiredTraitsChecked && _.isFunction(checkAttributeRequiredTraits) &&  required_traits.length > 0 && !checkAttributeRequiredTraits(attribute_tag, required_traits, referenceID))  return null

    return <div> {
        isSuccess ?
            <div style={{marginLeft : `${index * 8}px`}}>
                {attribute.allow_input ?
                    <div className='flex flex-column'>
                        <div>

                            <div className='font-size--smallest'>
                                {attribute.text}
                            </div>
                        </div>
                        <div className='flex center-items'>

                            {attribute.tag === "att_protein" ?
                            
                                <FeatureInput onItemSelect={(a, tag) => handleFeatureSelection(tag)} selectedItems={getFeatureInput()} /> :
                        
                        <MinimalTextInput
                            value={getInput()}
                            disabled={(attributeHasTraits && childTrait === null)}
                            callbackKey={attribute_tag}
                            onChange={(value) => handleTraitValueInput(value)}
                            suffix_trait_tag={childTrait} />}
                            {(attributeHasTraits) ?
                                
                                <TraitInput
                                    attribute_tag={attribute_tag}
                                    onItemSelect={(attribute_tag, trait_tag) => handleTraitSelection(trait_tag, index + 3, true, false, referenceID)}
                                    selected_trait={_.isString(childTrait) ? childTrait : has_selection ? selection.tag : undefined}
                                    onTraitLoadSuccess={(d) => _.isArray(d) && d.length > 0 ? setChildTrait(d[0]) : null}
                                /> : null}
                        </div>
                    </div> :
                    <div className='flex center-items'>
                        <div>{_.isString(childTrait) ? <Trait trait_tag={childTrait} /> : null}</div>
                        <div>?</div>
                        <TraitInput
                            attribute_tag={attribute_tag}
                            text={has_selection || _.isString(childTrait) ? "" : attribute.text}
                            onItemSelect={(attribute_tag, trait_tag) => handleTraitSelection(trait_tag, index + 3, true, false, referenceID)}
                            selected_trait={has_selection ? selection.tag : _.isString(childTrait) ? childTrait : undefined} />
                        
                        </div>
                }
                {childrenIsSuccess && (!displayChildrenUponSelection || has_selection) && children.length > 0 ?
                    <TraitChildren
                        children_tags={children}
                        {...{
                            path: _.concat(track_path,[{type : "trait", tag: childTrait, id : referenceID}]),
                            rowIndex,
                            getSelectionByPath,
                            selectedRows,
                            onChildrenSelection: onSelection,
                            index: index + 1,
                            referenceID: referenceID,
                            checkAttributeRequiredTraits: checkAttributeRequiredTraits
                        }} /> : null}
                </div > : null
            }
            </div>
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
                className="padding--little cursor--default div--round margin-right--tiny"
                whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
                            {tagText}</motion.div>
            </Popover>
    )
}


TraitWithValueInput.propTypes = {
    attribute_tag : PropTypes.string.isRequired,
    trait_tag: PropTypes.string.isRequired,
    disableTooltip: PropTypes.bool,
    onRemove: PropTypes.func,
    popoverPosition: PropTypes.string,
    highlight: PropTypes.bool,
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
        rowIndex,
        trait_tag, 
        attribute_tag = "",
        disableTooltip = false,
        onRemove = undefined,
        popoverPosition = "top",
        highlight = false,
        onChildrenSelection,
        getSelectionByPath,
        referenceID,
        checkAttributeRequiredTraits,
    sel }) {
    
    const { data: trait, isLoading: traitIsLoading, isSuccess: traitIsSuccess } = hooks.traits.useGetTraitByTag({tag : trait_tag}, {enabled : _.isString(trait_tag), staleTime: Infinity})
    const {data : children, isLoading : childrenIsLoading, isSuccess : childrenIsSuccess} = hooks.attributes.useGetAttributeChildren({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && traitIsSuccess})
    const hasChildren = childrenIsSuccess && _.isArray(children) && children.length > 0
    //handle colors 
    const backgroundColor = highlight ? "#466688" : "#e5e5e5"
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"

    const traitPath = [{ "tag": attribute_tag, "type": "attribute", "id" : attribute_tag }, { "tag": trait_tag, "type": "trait", "id": referenceID }]

    return (
        <div>
            { traitIsLoading || childrenIsLoading ? <Loading /> : traitIsSuccess && childrenIsSuccess?
                <motion.div
                    style={{ backgroundColor: backgroundColor, color: fontColor, fontSize: "0.75rem" }}
                    className="flex center-items padding--tiny cursor--default div--round margin-right--tiny"
                    whileHover={{ backgroundColor: "#efefef" }}>
                
                    <div className="flex">
                        <div className="flex flex-column" style={{ width: "100%" }}>
                            <div><strong>{trait.text}</strong></div>
                            {hasChildren ?
                                <TraitChildren children_tags={children} {...{
                                    onChildrenSelection,
                                    rowIndex,
                                    getSelectionByPath,
                                    path:  traitPath,
                                    selectedRows: sel,
                                    onRemove,
                                    referenceID,
                                    checkAttributeRequiredTraits
                                }} /> : null}
                        </div>
                        {_.isFunction(onRemove) ?
                            <div style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                                <RemoveButton fontColor={fontColor} onRemove={(e) => onRemove(traitPath, [rowIndex])} />
                            </div>
                            : null}
                    </div>
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
                className="flex center-items padding--tiny cursor--default div--round margin-right--tiny"
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
                className="padding--little cursor--default div--round margin-right--tiny"
                whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
                            {name}</motion.div>
            </Popover>
    )
}
