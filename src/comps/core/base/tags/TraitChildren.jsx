import _, { has } from "lodash"
import "./style.css"
import { useEffect, useState } from "react"

import PropTypes from 'prop-types'

import { api } from "@/api";
import { TraitInput } from '../../input/api/TraitInput'
import { MinimalTextInput } from '../../input/MinimalTextInput'
import { FeatureInput } from '../../input/api/FeatureInput'
import { Trait } from '../traits/Trait'
import { use } from "react";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";
import { RemoveButton } from "../buttons/RemoveButton";



const AMINO_ACID_ATTRIBUTES = new Set(["att_aa_substitution"])
const DNA_ATTRIBUTES = new Set(["att_grna", "att_crispr_hdr","att_sirna_sequence"])
TraitChildren.propTypes = {
    children_tags : PropTypes.array 
}
/**
 * @description Container for displaying children of a attribute. 
 * @param {Object} props 
 * @param {String[]} props.children_tags The tags of the children.  
 * @returns 
 */
export function TraitChildren({ children_tags, onChildrenSelection, getSelectionByPath, path, selectedRows, rowIndex, index = 0, onRemove, referenceID, displayChildrenUponSelection = true, selected_proteome_tags = []}) {
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
                        displayChildrenUponSelection,
                        selected_proteome_tags
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
export function TraitChildSelection({ attribute_tag, onSelection, path, selectedRows, index, getSelectionByPath, rowIndex, onRemove, referenceID, displayChildrenUponSelection, selected_proteome_tags = []}) {
    const [requiredTraitsValid, setRequiredTraitsValid] = useState()
    const { data: attribute, isSuccess } = api.attributes.queryAttributes.useGetAttribute({ tag: attribute_tag }, {enabled : _.isString(attribute_tag)})
    const { data: required_traits, isSuccess : requiredTraitsChecked, isLoading : isLoadingRequirements } = api.traits.queryTraits.useGetRequiredTraits({ tag: attribute_tag }, { enabled: _.isString(attribute_tag) && isSuccess })
    const {data : children, isSuccess : childrenIsSuccess} = api.attributes.queryAttributes.useGetAttributeChildren({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && isSuccess})
    const {data : traitCount, isSuccess : isSuccessTraitCount} = api.traits.queryTraits.useGetTraitCount({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && isSuccess})
    const allows_multiple_traits = false //["att_duration","att_concentration"].includes(attribute_tag) ? false : true
    const default_proteome = selected_proteome_tags.length > 0 ? selected_proteome_tags.length > 1 ? selected_proteome_tags.filter(t => t !== "ctrl")[0] : selected_proteome_tags[0] : undefined
    const attributeHasTraits = isSuccessTraitCount && traitCount > 0
    let track_path = _.concat(path, [{ "tag": attribute_tag, "type": "attribute", "id": referenceID }])
    const selection = _.isFunction(getSelectionByPath) ? getSelectionByPath(track_path, rowIndex) : undefined 
   
    const allow_multiple_selection  = true 
    const has_selection = _.isArray(selection) && selection.length > 0 && _.isString(selection[0].tag)
    const childTrait = has_selection && _.isString(selection[0].tag) ? selection[0].tag : undefined

    useEffect(() => { 
        if (attribute_tag === "att_protein") {
        }
    } , [attribute_tag] ) 

    const handleTraitSelection = (trait_tag, referenceID, enforceSingleVariantPerGroup = false, replaceChildrenAtLeaf = false) => {
    
        if (has_selection && allow_multiple_selection === false) {
            //check if multiple allowed??
            const p_remove = _.concat(track_path, [{ "type": "trait", "tag": selection[0].tag, "id": referenceID }])
            if (_.isFunction(onRemove)) onRemove(p_remove, [rowIndex], referenceID)
        }
        else if (has_selection && allow_multiple_selection === true && selection.map(s => s.tag).includes(trait_tag)) {
            const p_remove = _.concat(track_path, [{ "type": "trait", "tag": trait_tag, "id": referenceID }])
            if (_.isFunction(onRemove)) onRemove(p_remove, [rowIndex], referenceID)
            return
        }
        
        const p = _.concat(track_path, [{ "type": "trait", "tag": trait_tag, "id": referenceID }])
        onSelection(p, [rowIndex], enforceSingleVariantPerGroup, replaceChildrenAtLeaf)
    }

    const handleTraitValueInput = (value, enforceSingleVariantPerGroup = false, replaceChildrenAtLeaf = false) => {
        const p = _.concat(track_path, [{ "type": "trait", "value": value, "tag": selection[0].tag, "id": referenceID }])
        onSelection(p, [rowIndex], enforceSingleVariantPerGroup, replaceChildrenAtLeaf) //adding the value should not have an effect on the single child level or type, as the value is not relevant for the children display.
    }

    // handles selection of single trait! For example a unit 
    const handleSingleTraitSelection = (trait_tag, referenceID) => {
        const p = _.concat(track_path, [{ "type": "trait", "tag": trait_tag, "id": referenceID }]) 
        console.log(p)
        onSelection(p, [rowIndex], false, false, true)
    }

    const handleFeatureSelection = (tag) => {
        const currentProteins = getFeatureInput()
        const updatedProteins = currentProteins.includes(tag)
            ? currentProteins.filter(p => p !== tag)
            : [...currentProteins, tag]
        const combinedValue = updatedProteins.join("||")

        onSelection(
            _.concat(track_path, [{ "type": "trait", "value": combinedValue, "tag": selection[0].tag, "id": referenceID }]),
            [rowIndex],
            allows_multiple_traits
        )
    }
    /**
     * @description Get the input value for the text input. The given path is screened to match and the value is returned.
     * @returns {String} The input value for the text input.
     */
    const getInput = () => {
        const input = getSelectionByPath(track_path, rowIndex)
        if (_.isArray(input) && input.length > 0) {

            return allows_multiple_traits ? input.map(i => i.value) : _.head(input).value
        }
        return ""
    }

    const handleRemove = (path) => {
        if (_.isFunction(onRemove)) onRemove(path, [rowIndex], referenceID)
    }

    useEffect(() => {
        if (requiredTraitsChecked && _.isArray(required_traits) && path.length > 0) {             
            const pathTags = path.map(p => p.tag)
            // console.log(pathTags, required_traits)
            console.log(_.intersection(required_traits, pathTags))
            setRequiredTraitsValid(_.intersection(required_traits, pathTags).length > 0)
        }
        else {
            setRequiredTraitsValid(false)
        }
    }, [path.map(p => p.tag).join("-"), _.isArray(required_traits) ? required_traits.join("-") : "", requiredTraitsChecked])

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
    if (requiredTraitsChecked && required_traits.length > 0 && requiredTraitsValid === false) return null

    return <div> {
        isSuccess ?
            <div style={{marginLeft : `${index * 8}px`}}>
                {attribute.allow_input ?
                    <div className='flex flex-column'>
                        <div>

                            {/* <div className='font-size--smallest'>
                                {attribute.text}
                            </div> */}
                        </div>

                        <div className='flex center-items'>

                            {attribute_tag === "att_protein" ?
                                <div>
                                    <div className="flex center-items">
                                        <FeatureInput
                                            showFavorite={false}
                                            proteome_tags={[has_selection ? selection.map(s => s.tag) : [], ...selected_proteome_tags].flat()}
                                            onItemSelect={(a, tag) => handleFeatureSelection(tag)}
                                            onItemRemove={(a, tag) => handleFeatureSelection(tag)}
                                            selectedItems={getFeatureInput()}
                                        />
                                        <TraitInput
                                            attribute_tag={"att_proteome"}
                                            onItemSelect={(attribute_tag, trait_tag) => handleTraitSelection(trait_tag, referenceID, true)}
                                            selected_trait={selection && has_selection ? selection.map(s => s.tag) : undefined}
                                            onTraitLoadSuccess={(d) => _.isArray(d) && d.length > 0 && !has_selection ? selected_proteome_tags.length > 0 ? handleTraitSelection(default_proteome, referenceID, true) : handleTraitSelection(d[0], referenceID, true) : null}
                                        />
                                    </div>
                                    {_.isArray(selection) && selection.length === 0 && !has_selection ? <div className='font-size--smallest'>No proteome available. Please select a proteome.</div> : null}
                                    {has_selection ? <div className='font-size--smallest'><strong>Proteome: </strong>{_.join(selection.map(s => s.tag), ", ")}</div> : null}
                                
                                </div> :
                        
                                <MinimalTextInput
                                    value={getInput()}
                                    placeholder={attributeHasTraits && !has_selection ? `Select ${attribute.text} first ->` : attribute.text}
                                    disabled={!has_selection}
                                    callbackKey={attribute_tag}
                                    allowAminoAcidsOnly={AMINO_ACID_ATTRIBUTES.has(attribute.tag)}
                                    allowDNAOnly={DNA_ATTRIBUTES.has(attribute.tag)}
                                    onChange={(value) => handleTraitValueInput(value)}
                                    suffix_trait_tag={childTrait} />}
                           
                            {attributeHasTraits ?
                                
                                <TraitInput
                                    attribute_tag={attribute_tag}
                                    onItemSelect={(attribute_tag, trait_tag) => handleSingleTraitSelection(trait_tag, referenceID)} //was false true 
                                    selected_trait={has_selection ? selection[0].tag : undefined}
                                    onTraitLoadSuccess={(d) => _.isArray(d) && d.length > 0 && !has_selection ? handleSingleTraitSelection(d[0], referenceID) : null}
                                /> : null}
                        </div>
                    </div> :

                    allow_multiple_selection ?
                        
                        <div style={{marginTop : "0.1rem", paddingTop : "0.5rem", width : "100%", backgroundColor : "#f5f5f5f2", borderRadius : "0.2rem", marginBottom : "0.5rem", paddingLeft : "0.5rem", paddingRight : "0.5rem"}}>
                            <TraitInput
                                attribute_tag={attribute_tag}
                                text={attribute.text}
                                selected_trait={has_selection ? selection.map(s => s.tag) : undefined}
                                onItemSelect={(attribute_tag, trait_tag) => handleTraitSelection(trait_tag, referenceID, false, false)} />
                        
                            <div className="div--expand">
                                {selection && _.isArray(selection) && selection.length > 0 ? selection.map(s => <div className="flex flex-column " key={s.tag}>
                                    <div className="flex justify-space-between" style={{width : "100%"}}>
                                        <Trait trait_tag={s.tag} /> 
                                        <RemoveButton onRemove={() => handleRemove(_.concat(track_path, [{ type: "trait", tag: s.tag, id: referenceID }]))} /> 
                                    </div>
                                    <div className="margin-left--medium">
                                     <TraitChildren key={s.tag} children_tags={children}
                                            {...{
                                                path: _.concat(track_path, [{ type: "trait", tag: s.tag, id: referenceID }]),
                                                rowIndex,
                                                getSelectionByPath,
                                                selectedRows,
                                                onChildrenSelection: onSelection,
                                                index: index + 1,
                                                referenceID: referenceID,
                                                onRemove
                                            }} /> 
                                    </div>
                                        
                                    </div> )  : null}
                            </div>
                        </div> :
                    
                    
                            <div className='flex center-items'>
                                <div className="flex flex-column" >
                                    <div className="font-size--smallest" style={{ color: HIGHLIGHT_COLOR }}>{has_selection ? attribute.text : null}</div>
                                    <div className="flex center-items">
                                        <div>{has_selection ? <Trait trait_tag={selection[0].tag} /> : null}</div>
                                
                                        <TraitInput
                                            attribute_tag={attribute_tag}
                                            text={has_selection ? "" : attribute.text}
                                            onItemSelect={(attribute_tag, trait_tag) => handleTraitSelection(trait_tag, referenceID, true, true)}
                                            selected_trait={has_selection ? selection[0].tag : undefined} />
                                
                                    </div>
                                </div>
                            </div>
                    }



                {!allow_multiple_selection && childrenIsSuccess && (!displayChildrenUponSelection || has_selection) && children.length > 0 ?
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
                            // checkAttributeRequiredTraits: checkAttributeRequiredTraits
                        }} /> : null}
                </div > : null
            }
            </div>
}
