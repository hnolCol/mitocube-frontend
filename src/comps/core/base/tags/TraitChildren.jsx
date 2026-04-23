import _ from "lodash"
import "./style.css"
import { useEffect, useState } from "react"

import PropTypes from 'prop-types'

import { api } from "@/api";
import { TraitInput } from '../../input/api/TraitInput'
import { MinimalTextInput } from '../../input/MinimalTextInput'
import { FeatureInput } from '../../input/api/FeatureInput'
import { Trait } from '../traits/Trait'



const AMINO_ACID_ATTRIBUTES = new Set(["att_aa_substitution"])
const DNA_ATTRIBUTES = new Set(["att_grna", "att_crispr_hdr"])
TraitChildren.propTypes = {
    children_tags : PropTypes.array 
}
/**
 * @description Container for displaying children of a attribute. 
 * @param {Object} props 
 * @param {String[]} props.children_tags The tags of the children.  
 * @returns 
 */
export function TraitChildren({ children_tags, onChildrenSelection, getSelectionByPath, path, selectedRows, rowIndex, index = 0, onRemove, referenceID, checkAttributeRequiredTraits, displayChildrenUponSelection = true, respect_single_child_level = true }) {
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
                        displayChildrenUponSelection,
                        respect_single_child_level
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
 * @param {Boolean} props.respect_single_child_level Whether to respect the single child level.
 * @returns 
 */
export function TraitChildSelection({ attribute_tag, onSelection, path, selectedRows, index, getSelectionByPath, rowIndex, onRemove, referenceID, checkAttributeRequiredTraits, displayChildrenUponSelection}) {

    const [childTrait, setChildTrait] = useState(undefined) 

    const { data: attribute, isSuccess } = api.attributes.queryAttributes.useGetAttribute({ tag: attribute_tag }, {enabled : _.isString(attribute_tag)})
    const { data: required_traits, isSuccess : requiredTraitsChecked, isLoading : isLoadingRequirements } = api.traits.queryTraits.useGetRequiredTraits({ tag: attribute_tag }, { enabled: _.isString(attribute_tag) && isSuccess })
    const {data : children, isSuccess : childrenIsSuccess} = api.attributes.queryAttributes.useGetAttributeChildren({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && isSuccess})
    const {data : traitCount, isSuccess : isSuccessTraitCount} = api.traits.queryTraits.useGetTraitCount({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && isSuccess})

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
        
        const num_children = _.isArray(children) ? children.length : 0
        const respect_single_child_level = num_children === 1 ? false : true //if there is only one child, we do not want to respect the single child level, as the child should be displayed regardless.

        onSelection(p, [rowIndex], respect_single_child_level ? index + single_child_level : Infinity, single_child_type, join_values)
        setChildTrait(trait_tag)
    }

    const handleTraitValueInput = (value) => {
        const p = _.concat(track_path, [{ "type": "trait", "value": value, "tag": childTrait, "id": referenceID }])
        onSelection(p, [rowIndex], Infinity, false, false, false) //adding the value should not have an effect on the single child level or type, as the value is not relevant for the children display.
    }

    const handleFeatureSelection = (tag) => {
        const currentProteins = getFeatureInput()
        const updatedProteins = currentProteins.includes(tag)
            ? currentProteins.filter(p => p !== tag)
            : [...currentProteins, tag]
        const combinedValue = updatedProteins.join("||")
        onSelection(
            _.concat(track_path, [{ "type": "trait", "value": combinedValue, "tag": childTrait, "id": referenceID }]),
            [rowIndex], Infinity, true, false
        )
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
            const value = _.head(input).value
            if (!_.isString(value) || value.length === 0) return []
            return value.split("||").filter(Boolean)
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
                            
                                <FeatureInput
                                onItemSelect={(a, tag) => handleFeatureSelection(tag)}
                                onItemRemove={(a, tag) => handleFeatureSelection(tag)}
                                selectedItems={getFeatureInput()}
                            /> :
                        
                        <MinimalTextInput
                            value={getInput()}
                            disabled={(attributeHasTraits && childTrait === null)}
                                    callbackKey={attribute_tag}
                                    allowAminoAcidsOnly={AMINO_ACID_ATTRIBUTES.has(attribute.tag)}
                                    allowDNAOnly={DNA_ATTRIBUTES.has(attribute.tag)}
                            onChange={(value) => handleTraitValueInput(value)}
                            suffix_trait_tag={childTrait} />}
                           
                            {attributeHasTraits ?
                                
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
