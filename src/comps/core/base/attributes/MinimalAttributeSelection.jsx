import PropTypes from "prop-types"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import { Select } from "@blueprintjs/select"
import { Button, MenuItem } from "@blueprintjs/core"
import _ from "lodash"
import { AttributeMenuItem } from "../../input/api/AttributeInput"
import hooks from "@mitocube/api-hooks"

MinimalAttributeSelection.propTypes = {
    onAttributeSelect: PropTypes.func.isRequired,
    selectedItem: PropTypes.object,
    debounce: PropTypes.number,

}
/**
 * 
 * @param {Object} props 
 * @param {String} props.selectedItem - attribute tag
 * @returns 
 */
export function MinimalAttributeSelection({debounce = 100, onAttributeSelect, selectedItem}) {
    
    const [query, setQuery] = useState()
    const debouncedQuery = useDebounce(query, debounce)

    const { data: attribute_tags, isLoading, isFetching, isSuccess } = hooks.attributes_query.useGetAttributesByQuery({search_string : debouncedQuery, include_traits : false, limit : 30}) 
    
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
            
            <Button intent="primary"
                text={"Select"}
                small
                minimal
                rightIcon="double-caret-vertical" />
            </Select>
    </div>)


}