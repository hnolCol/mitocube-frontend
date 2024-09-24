




import { MultiSelect } from "@blueprintjs/select";
import { useGetAttributes } from "../../../../hooks/queries/attribute.hooks";
import _ from "lodash"
import { useState } from "react";
import { Button } from "@blueprintjs/core";
import "./style.css"
import useDebounce from "../../../../hooks/useDebounce";
import { AttributeValueMenuItem } from "../items/AttributeValueMenu";
import { FeatureMenuItem } from "../items/FeatureMenu";
import { isItemInArrayDeepComp } from "../../../../services/arrays/transforms";





function AttributeWithValueMenu({ attributePair, maxItems = 5, selectedDatasetAttributes, handleDatasetAttributeSelection }) {
    const [showAll, setShowAll] = useState(false)
    
    //console.log(attributePair)
    const [attribute, attributeValues] = attributePair
    if (!_.isObject(attribute)) return null 
    const attributeInSelection = _.has(selectedDatasetAttributes, attribute.tag)
    return <div>
        <h3>{attribute.text}</h3>
        {attributeValues.map((attributeValue, valueIdx) => showAll || valueIdx < maxItems ? attribute.has_features_value ? 
            <FeatureMenuItem
                key={attributeValue.tag}
                feature={attributeValue}
                onClick={(feature, e) => handleDatasetAttributeSelection(attribute, feature)} /> 
            : <AttributeValueMenuItem
                key={attributeValue.tag}
                attributeValue={attributeValue}
                selected={attributeInSelection &&  isItemInArrayDeepComp({array : selectedDatasetAttributes[attribute.tag], item : attributeValue}) }
                onClick={(attributeValue => handleDatasetAttributeSelection(attribute, attributeValue))}
            /> : null)}
        {attributeValues.length > maxItems ? <button style={{border : "none", backgroundColor : "#efefef", marginLeft : "1rem"}} onClick={() => setShowAll(prevValue => !prevValue)}>{showAll?`Hide`:`Show all (${attributeValues.length - maxItems})`}.</button>: null }
    </div>
}



/**
 * @description Select dataset attributes using the API backend for searching through the attributes and attribute values. 
 * @param {Object} props 
 * @param {import("../../../../types/attributes").AttributeValue[]} props.selectedItems 
 * @param {Number} props.min_state - The submission state for which dataset attributes should be selected. 
 * @param {Number} props.min_search_string_length - The minimum search string length before the API request ist made. 
 * @param {Boolean} props.matchTargetWidth  - If the menu item width should match the Input widget. 
 * @param {String} props.placeHolderText - The text to be displayed as a hint for the user.
 * @returns 
 */
export function AttributesInput({
        selectedItems = [],
        onItemSelect,
        min_state = 0,
        min_search_string_length = 1, //set to 0 if you want to search without any string... (E.g. getting all)
        param_name = "allow_for_dataset", // attribute have specific filterings and props. define them here and check the backend for options 
    handleDatasetAttributeSelection,
    matchTargetWidth = true,
        placeHolderText  = "Search dataset attribute (HEK, HeLa, Heart, Muscle, ...)",
        selectedDatasetAttributes }) {
    
    const [searchString, setSearchString] = useState("")
    const debouncedSearchString = useDebounce(searchString,200)
    const [itemsLoaded, setItemsLoaded] = useState(false)
    const { data: queried_attributes, isLoading, isFetching } = useGetAttributes(
        {
            search_string: debouncedSearchString,
            min_state: min_state,
            param_name: param_name // filters for attributes that actually allowed for a dataset ("allow_for_dataset")
        }, {
        enabled: debouncedSearchString.length >= min_search_string_length
    })
    
    /**
     * 
     * @param {MouseEvent} e 
     */
    const checkValues = (e) => {
        if (!itemsLoaded) {
            setItemsLoaded(true)
        }
        
    }


    /**
     * @description Handles the item selection 
     * @param {import("../../../types/feature").Feature} item 
     */
        const handleItemSelection = (item,e) => {
            if (_.isFunction(e.stopPropagation)) {
                e.stopPropagation()
            }
            onItemSelect(attribute,item)
        }

    /**
     * 
     * @param {Object} props 
     * @param {import("../../../../types/attributes").Attribute} props.activeItem+
     * @param {import("../../../../types/attributes").Attribute[]} props.items  
     * @param {import("../../../../types/attributes").Attribute[]} props.filteredItems
     * @returns 
     */
    const renderAttributes = ({ activeItem, items, query, filteredItems }) => {
        if (query.length > 0 &&  _.isArray(queried_attributes) && queried_attributes.length === 0) return <div><p>No attributes/values match the search string ...</p></div>
        if (!itemsLoaded || items.length === 0)  return <div className = "padding--medium"><p>Start typing...</p></div>

        return <div className="padding--medium" style={{minWidth : "40vw", maxHeight : "400px", overflowY : "scroll", maxWidth : "100%"}}>
            {items.map(attributePair => {
                return <AttributeWithValueMenu attributePair={attributePair} {...{attributePair,selectedDatasetAttributes,handleDatasetAttributeSelection, key : attributePair[0].tag}} />
            })}
        </div>
    }

    const renderValue = (item) => {
        return item.text
    }
    
    return (
   
        <MultiSelect
            items={debouncedSearchString.length >= min_search_string_length && _.isArray(queried_attributes) ? queried_attributes : []}
            placeholder={placeHolderText}
            tagRenderer={renderValue}
            onItemSelect={handleItemSelection}
            itemListRenderer={renderAttributes}
            resetOnSelect={true}
            resetOnQuery={true}
            onQueryChange={(searchString => setSearchString(searchString))}
            onRemove={handleItemSelection}
            popoverProps={{minimal : true, matchTargetWidth}}
            tagInputProps={{
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps: { intent: "primary", onFocus : checkValues},
                tagProps: { minimal: true }
            }}
            selectedItems={selectedItems}/>
    )
}