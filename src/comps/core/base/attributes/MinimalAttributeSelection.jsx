import PropTypes from "prop-types"
import { useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import { Attribute } from "./Attribute"
import { Select } from "@blueprintjs/select"
import { useGetAttribute, useGetAttributes } from "../../../../hooks/queries/attribute.hooks"
import { Button, MenuItem } from "@blueprintjs/core"
import _ from "lodash"


MinimalAttributeSelection.propTypes = {
    onAttributeSelect: PropTypes.func.isRequired,
    selectedItem: PropTypes.object,
    debounce: PropTypes.number,

}
/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/attributes").Attribute} props.selectedItem
 * @returns 
 */
export function MinimalAttributeSelection({debounce = 100, onAttributeSelect, selectedItem}) {
    
    const [query, setQuery] = useState()
    const debouncedQuery = useDebounce(query, debounce)

    const { data : attributes, isLoading, isFetching, isSuccess } = useGetAttributes({search_string : debouncedQuery, include_traits : false, limit : 20})
    const itemIsSelected = _.isObject(selectedItem)
    /**
     * 
     * @param {import("../../../../types/attributes").Attribute} attribute 
     * @param {*} param1 
     * @returns 
     */
    const itemRenderer = (attribute, { handleClick, handleFocus, modifiers, query }) => {
        const currentItemIsSelected = selectedItem.tag === attribute.tag
        return <MenuItem
            key={attribute.tag}
            text={attribute.text}
            label={attribute.description}
            onClick={handleClick}
            onFocus={handleFocus}
            active={modifiers.active}
            disabled={modifiers.disabled}
            intent={currentItemIsSelected?"primary":"none"}
            icon={currentItemIsSelected?"tick":"blank"}
        />
    }

    const handleItemSelection = (attribute, e) => {
        console.log(e, attribute)
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
            items={isSuccess && attributes.length > 0 ? attributes.map(at => at.attribute) : []}
            onItemSelect={handleItemSelection}> 
            
            <Button intent="primary"
                text={itemIsSelected ? selectedItem.text : "Select..."}
                small
                minimal
                rightIcon="double-caret-vertical" />
            </Select>
    </div>)


}