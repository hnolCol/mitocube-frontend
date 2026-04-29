import PropTypes from "prop-types"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import { Select } from "@blueprintjs/select"
import { Button, MenuItem } from "@blueprintjs/core"
import _ from "lodash"
import { AttributeMenuItem } from "../../input/api/AttributeInput"
import hooks from "@mitocube/api-hooks"
import { Attribute } from "./Attribute"
import { api } from "@/api"

MinimalAttributeSelection.propTypes = {
    onAttributeSelect: PropTypes.func.isRequired,
    selectedItem: PropTypes.string,
    debounce: PropTypes.number,
    attribute_groups: PropTypes.arrayOf(PropTypes.string)

}
MinimalAttributeSelection.defaultProps = {
    debounce: 100
}

/**
 * 
 * @param {Object} props 
 * @param {String} props.selectedItem - attribute tag of the currently selected item. This is required to display the selected item as well as to unselect it when the same item is selected again.
 * @param {Function} props.onAttributeSelect - callback function that is called when an item is selected. The selected attribute tag is passed as an argument to the function.
 * @param {Number} props.debounce - debounce time for the search input. Default is 100ms.
 * @returns 
 */
export function MinimalAttributeSelection({debounce = 100, onAttributeSelect, selectedItem, attribute_groups}) {
    
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
        return <AttributeMenuItem tag={attribute_tag} selected={selectedItem === attribute_tag} menuItemProps={{handleClick,handleFocus,modifiers,query}}/>
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
            
            <button className="basic-button"><span>{selectedItem ? <Attribute attribute_tag={selectedItem} /> : "Select attribute"}</span></button>
            </Select>
    </div>)


}