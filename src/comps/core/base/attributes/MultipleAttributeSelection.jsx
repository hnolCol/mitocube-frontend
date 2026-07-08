import PropTypes from "prop-types"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import { Select } from "@blueprintjs/select"
import _ from "lodash"
import { AttributeMenuItem } from "../../input/api/AttributeInput"
import { Attribute } from "./Attribute"
import { api } from "@/api"

MultipleAttributeSelection.propTypes = {
    onAttributeSelect: PropTypes.func.isRequired,
    selectedItems: PropTypes.arrayOf(PropTypes.string),
    debounce: PropTypes.number,
    attribute_groups: PropTypes.arrayOf(PropTypes.string)

}

/**
 * 
 * @param {Object} props 
 * @param {Array<String>} props.selectedItems - attribute tags of the currently selected items. This is required to display the selected items as well as to unselect them when the same items are selected again.
 * @param {Function} props.onAttributeSelect - callback function that is called when an item is selected. The selected attribute tag is passed as an argument to the function.
 * @param {Number} props.debounce - debounce time for the search input. Default is 100ms.
 * @returns 
 */
export function MultipleAttributeSelection({debounce = 100, onAttributeSelect, selectedItems, attribute_groups}) {
    
    const [query, setQuery] = useState()
    const debouncedQuery = useDebounce(query, debounce)

    const { data: attribute_tags,isSuccess } = api.attributes.queryAttributes.useGetAttributesByQuery({search_string : debouncedQuery, include_traits : false, limit : 30, attribute_groups}) 
    
    /**
     * 
     * @param {import("../../../../types/attributes").Attribute} attribute 
     * @param {*} param1 
     * @returns 
     */
    const itemRenderer = (attribute_tag, { handleClick, handleFocus, modifiers, query }) => {
        return <AttributeMenuItem tag={attribute_tag} selected={selectedItems.includes(attribute_tag)} menuItemProps={{handleClick,handleFocus,modifiers,query}}/>
    }

    const handleItemSelection = (attribute, e) => {
        if (_.isFunction(e.stopPropagation)) e.stopPropagation() 
            onAttributeSelect(attribute)
    }

    return (<div>
        <Select
            placeholder = "Select attribute"
            fill={true}
            onQueryChange={(query,e) => setQuery(query)}
            query={query}
            itemRenderer={itemRenderer}
            items={isSuccess && attribute_tags.length > 0 ? attribute_tags : []}
            onItemSelect={handleItemSelection}> 
            <button className="basic-button"><span>{selectedItems.length > 0 ? selectedItems.map(tag => <Attribute key={tag} attribute_tag={tag} />) : "Select attribute"}</span></button>
            </Select>
    </div>)


}