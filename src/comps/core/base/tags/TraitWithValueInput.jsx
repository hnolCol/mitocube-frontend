
import { motion } from "framer-motion"
import _ from "lodash"
import "./style.css"

import { isHexColorLight } from "../../../../services/colors"
import { RemoveButton } from '../buttons/RemoveButton'
import PropTypes from 'prop-types'

import { api } from "@/api";
import { Loading } from '../states/Loading'
import { AttributeTraitInput, TraitChildren } from "./TraitChildren"



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
    const allows_multiple_traits = true //wanted to make this an attribute property, but it is not yet implemented in the backend. For now, we will assume that all attributes allow multiple traits.

    /**
     * @description Get the input value for the text input. The given path is screened to match and the value is returned.
     * @returns {String} The input value for the text input.
     */
    const getInput = () => {
        const input = getSelectionByPath([{ "tag": attribute_tag, "type": "attribute", "id" : referenceID }], rowIndex)
        if (_.isArray(input) && input.length > 0) {

            return allows_multiple_traits ? input.map(i => i.value) : _.head(input).value
        }
        return ""
        }
    
    const handleTraitSelection = (trait_tag, referenceID, enforceSingleVariantPerGroup = false, replaceChildrenAtLeaf = false) => {
        
        if (has_selection && allow_multiple_selection === true && selection.map(s => s.tag).includes(trait_tag)) {
                
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
                                    has_selection={true}
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
                                <RemoveButton fontColor={fontColor} onRemove={(e) => onRemove([{ "tag": attribute_tag, "type": "attribute", "id" : referenceID }], [rowIndex], referenceID)} />
                            </div>
                            : null}
                </motion.div> : null }
        </div>
    )
}


