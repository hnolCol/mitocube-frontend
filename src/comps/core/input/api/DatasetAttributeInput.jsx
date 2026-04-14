



import PropTypes from "prop-types"
import { MultiSelect } from "@blueprintjs/select";
import _ from "lodash"
import { useState } from "react";
import { Button } from "@blueprintjs/core";
import "./style.css"
import useDebounce from "../../../../hooks/useDebounce";
import { TraitMenuItem } from "../items/AttributeValueMenu";

import hooks from "@mitocube/api-hooks"
import { api } from "@/api";

/**
 * 
 * @param {Object} props 
 * @param {String} props.tag The attribute tag 
 * @param {String[]} props.trait_tags - List of trait tags 
 * @param {String[]} props.selected_traits - List of traits that should be marked as selected.
 * @param {Function} props.handleTraitSelection Handle the selection of a trait.
 * @returns 
 */
export function AttributeWithTraitsMenuItem({ tag, trait_tags, handleTraitSelection, selected_traits }) {
    const { data: attribute, isLoading, isSuccess } = api.attributes.queryAttributes.useGetAttribute({ tag }, {enabled : _.isArray(trait_tags) && trait_tags.length > 0})
    return <div>
        {isSuccess ? <div className="menu_item_header"> {attribute.text }</div>: null}
        {_.isArray(trait_tags) ? trait_tags.map(trait_tag => {
            return <TraitMenuItem key={trait_tag} tag={trait_tag} attribute_tag={tag} onClick={handleTraitSelection} selected={_.isArray(selected_traits) && selected_traits.includes(trait_tag)} />
        }) : null}
    </div>
}



AttributesInput.propTypes = {
    // selected_traits :   PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    param_name: PropTypes.oneOf(["allow_for_dataset","allow_for_sample"]),
    min_state: PropTypes.number,
    min_search_string_length: PropTypes.number,
    showSelection: PropTypes.bool,
    matchTargetWidth: PropTypes.bool,
    placeHolderText: PropTypes.string,
}


AttributesInput.defaultProps = {
    selected_traits : [],
    min_state: 5,
    param_name: "allow_for_dataset",
    min_search_string_length: 0,
    showSelection: true,
    matchTargetWidth: true,
    placeHolderText: "Search dataset attribute (HEK, HeLa, Heart, Muscle, ...)"
}
/**
 * @description Select dataset attributes using the API backend for searching through the attributes and traits. 
 * @param {Object} props 
 * @param {import("../../../../types/attributes").AttributeValue[]} props.selectedItems 
 * @param {Number} props.min_state - The submission state for which dataset attributes should be selected. 
 * @param {Number} props.min_search_string_length - The minimum search string length before the API request ist made. 
 * @param {Boolean} props.matchTargetWidth  - If the menu item width should match the Input widget. 
 * @param {String} props.placeHolderText - The text to be displayed as a hint for the user.
 * @param {Function} props.onItemSelect - Should take two props (attribute, trait)
 * @returns 
 */
export function AttributesInput({
        min_state,
        min_search_string_length, //set to 0 if you want to search without any string... (E.g. getting all)
        param_name, // attribute have specific filtering and props. define them here and check the backend for options 
        handleTraitSelection,
        showSelection, 
        matchTargetWidth,
        placeHolderText,
        selected_traits,
}) {
    
 
    
    const [searchString, setSearchString] = useState("")
    const debouncedSearchString = useDebounce(searchString,200)
    const [itemsLoaded, setItemsLoaded] = useState(false)
    const { data: queried_attributes, isLoading, isFetching } = api.attributes.queryAttributes.useGetAttributesByQuery(
        {
            search_string: debouncedSearchString,
            limit: 50,
            include_traits: true,
            min_state: min_state,
            param_name: param_name // filters for attributes that actually allowed for a dataset ("allow_for_dataset")
        }, {
            enabled: debouncedSearchString.length >= min_search_string_length,
            staleTime: 300000,
            placeholderData: (prev) => prev
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
     * 
     * @param {Object} props 
     * @param {import("../../../../types/attributes").Attribute} props.activeItem+
     * @param {import("../../../../types/attributes").Attribute[]} props.items  
     * @param {import("../../../../types/attributes").Attribute[]} props.filteredItems
     * @returns 
     */
    const renderAttributes = ({ activeItem, items, query, filteredItems }) => {
        // if (isLoading || isFetching) return <div className="padding--medium"><p>Loading...</p></div>
        if (query.length > 0 &&  _.isArray(queried_attributes) && queried_attributes.length === 0) return <div><p>No attributes/traits match the search string ...</p></div>
        if (!itemsLoaded || items.length === 0)  return <div className = "padding--medium"><p>Start typing...</p></div>
        return <div className="padding--medium" style={{ minWidth: "40vw", maxHeight: "400px", overflowY: "scroll", maxWidth: "80vh", backgroundColor : "#efefef" }}>

            {items.map(attributeWithTraits => {
                return < AttributeWithTraitsMenuItem
                    key={attributeWithTraits.attribute_tag}
                    tag={attributeWithTraits.attribute_tag}
                    trait_tags={attributeWithTraits.trait_tags}
                    selected_traits={selected_traits}
                    handleTraitSelection={handleTraitSelection} />
            })}
        </div>
    }

    const renderValue = (item) => {
        if (showSelection) return item.text
        
    }
    
    return (
   
        <MultiSelect
            items={debouncedSearchString.length >= min_search_string_length && _.isArray(queried_attributes) ? queried_attributes : []}
            placeholder={placeHolderText}
            tagRenderer={renderValue}
            //onItemSelect={handleItemSelection}
            itemListRenderer={renderAttributes}
            resetOnSelect={true}
            resetOnQuery={true}
            onQueryChange={(searchString => setSearchString(searchString))}
           // onRemove={handleItemSelection}
            popoverProps={{minimal : true, matchTargetWidth}}
            tagInputProps={{
                rightElement : <Button icon="blank" minimal={true} loading={isLoading || isFetching} intent="primary" />,
                inputProps: { intent: "primary", onFocus : checkValues},
                tagProps: { minimal: true }
            }}
            selectedItems={_.keys(selected_traits)}
            />
    )
}