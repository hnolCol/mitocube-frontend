
import { motion } from "framer-motion"
import _ from "lodash"
import "./style.css"
import React from "react"
import { isHexColorLight } from "../../../../services/colors"
import { RemoveButton } from '../buttons/RemoveButton'
import PropTypes from 'prop-types'

import { api } from "@/api";
import { Loading } from '../states/Loading'
import { AttributeTraitInput, TraitChildren } from "./TraitChildren"



TraitWithValueInputComponent.propTypes = {
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
function TraitWithValueInputComponent({
        rowIndex,
        trait_tag, 
        attribute_tag = "",
        onRemove = undefined,
        highlight = false,
        onChildrenSelection,
        getSelectionByPath,
        referenceID,
        checkAttributeRequiredTraits,
        selected_proteome_tags = [],
        sel }) {
    
    
    const { data: attribute, isLoading: attributeIsLoading, isSuccess : attributeIsSuccess } = api.attributes.queryAttributes.useGetAttribute({tag : attribute_tag}, {enabled : _.isString(attribute_tag), staleTime: Infinity})
    const { data: trait, isLoading: traitIsLoading, isSuccess: traitIsSuccess } = api.traits.queryTraits.useGetTraitByTag({tag : trait_tag}, {enabled : _.isString(trait_tag), staleTime: Infinity})
    const {data : children, isLoading : childrenIsLoading, isSuccess : childrenIsSuccess} = api.attributes.queryAttributes.useGetAttributeChildren({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && traitIsSuccess})
    const hasChildren = childrenIsSuccess && _.isArray(children) && children.length > 0
    //handle colors 
    const backgroundColor = highlight ? "#466688" : "#e5e5e5"
    const fontColor = isHexColorLight(backgroundColor) ? "#000000" : "#fff"
    const traitPath = [{ "tag": attribute_tag, "type": "attribute", "id" : referenceID }, { "tag": trait_tag, "type": "trait", "id": referenceID }]
    const allow_multiple_selection = true
    const attributeSelection = _.isFunction(getSelectionByPath) ? getSelectionByPath([{ "tag": attribute_tag, "type": "attribute", "id" : referenceID }], rowIndex) : undefined
    const selection = _.isFunction(getSelectionByPath) ? getSelectionByPath(traitPath, rowIndex) : undefined 
    // a trait counts as selected when its node is a child of the attribute node; for flat
    // allow_input attributes the trait itself carries the value, so its own children stay empty
    const traitIsSelected = _.isArray(attributeSelection) && _.some(attributeSelection, s => s.tag === trait_tag)
    const has_selection = traitIsSelected || (_.isArray(selection) && selection.length > 0 && _.isString(selection[0].tag))
    /**
     * @description Get the input value for the text input. The value of this trait is returned.
     * @returns {String} The input value for the text input.
     */
    const getInput = () => {
        if (_.isArray(attributeSelection)) {
            const node = attributeSelection.find(i => i.tag === trait_tag)
            if (node && node.value !== undefined && node.value !== null) {
                return _.isString(node.value) ? node.value : String(node.value)
            }
        }
        return ""
        }
    
    const handleTraitSelection = (trait_tag, referenceID, enforceSingleVariantPerGroup = false, replaceChildrenAtLeaf = false) => {
        
        if (has_selection && allow_multiple_selection === true && _.isArray(selection) && selection.map(s => s.tag).includes(trait_tag)) {
                
                const p_remove = _.concat(traitPath, [{ "type": "trait", "tag": trait_tag, "id": referenceID }])
                if (_.isFunction(onRemove)) onRemove(p_remove, [rowIndex], referenceID)
                return
            }
            
            const p = _.concat(traitPath, [{ "type": "trait", "tag": trait_tag, "id": referenceID }])
            onChildrenSelection(p, [rowIndex], enforceSingleVariantPerGroup, replaceChildrenAtLeaf)
        }
    
    const handleTraitValueInput = (value, enforceSingleVariantPerGroup = false, replaceChildrenAtLeaf = false) => {
            const p = [{ "tag": attribute_tag, "type": "attribute", "id" : referenceID }, { "tag": trait_tag, "type": "trait", "id": referenceID, value: value }]
            onChildrenSelection(p, [rowIndex], enforceSingleVariantPerGroup, replaceChildrenAtLeaf) //adding the value should not have an effect on the single child level or type, as the value is not relevant for the children display.
        }

    return (
        <div>
            { traitIsLoading || childrenIsLoading ? <Loading /> : traitIsSuccess && childrenIsSuccess?
                <motion.div
                    style={{ backgroundColor: backgroundColor, color: fontColor, fontSize: "0.75rem", position : "relative", width : "100%" }}
                    className="flex center-items padding--tiny cursor--default div--round margin-right--tiny"
                    whileHover={{ backgroundColor: "#efefef" }}>
                
                    <div className="flex center-items" >
                        {attributeIsSuccess  ? !attribute.allow_input ? <div className="flex flex-column" style={{ width: "100%",marginRight : "1rem" }}>
                            <div><strong>{trait.text}</strong></div>
                            {hasChildren ?
                                <TraitChildren
                                    children_tags={children} {...{
                                    onChildrenSelection,
                                    rowIndex,
                                    getSelectionByPath,
                                    path:  traitPath,
                                    selectedRows: sel,
                                    onRemove,
                                    referenceID,
                                    checkAttributeRequiredTraits,
                                    selected_proteome_tags
                                }} /> : null}
                        </div> : 
                            <div className="flex flex-column" style={{ width: "100%", marginRight: "1rem" }}>
                                <AttributeTraitInput
                                    track_path={traitPath}
                                    selection={selection}
                                    has_selection={has_selection}
                                    childTrait={trait_tag}
                                    attribute = {attribute}
                                    attributeHasTraits={hasChildren}
                                    referenceID={referenceID}
                                    getInput={() => getInput()}
                                    handleTraitValueInput={handleTraitValueInput}
                                    handleSingleTraitSelection={handleTraitSelection} />
                                </div>
                        
                        : null}
                        
                    </div>
                    {_.isFunction(onRemove) ?
                            <div style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem", position: "absolute", right: 0, top : 2}}>
                                <RemoveButton fontColor={fontColor} onRemove={(e) => onRemove([{ "tag": attribute_tag, "type": "attribute", "id" : referenceID }, { "tag": trait_tag, "type": "trait", "id": referenceID }], [rowIndex], referenceID)} />
                            </div>
                            : null}
                </motion.div> : null }
        </div>
    )
}

function areEqual(prevProps, nextProps) {

    return true
}

export const TraitWithValueInput = TraitWithValueInputComponent //React.memo(TraitWithValueInputComponent, areEqual)