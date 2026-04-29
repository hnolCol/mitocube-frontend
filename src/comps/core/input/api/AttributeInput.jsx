import { Suggest, Select} from "@blueprintjs/select";
import  hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import { Button, MenuItem } from "@blueprintjs/core";
import PropTypes from "prop-types";
import { api } from "@/api";


/**
 * @description A menu for a trait by its tag. 
 * @param {Object} props 
 * @param {String} props.tag - The trait tag 
 * @param {Object} props.menuItemProps - The properties for a menu item (blueprint)
 * @returns
 */
export function AttributeMenuItem({ tag, menuItemProps, onItemSelect, selected = false}) {

    const { data: attribute, isSuccess } = api.attributes.queryAttributes.useGetAttribute({ tag })

    if (!isSuccess) return null 

    return <MenuItem
        text={attribute.text}
        icon={selected?"tick":"blank"}
        // labelElement={<div className="font-size--smallest"
        //     style={{ maxWidth: "8rem" }}>
        //     {trait.description}
        // </div>}
        active={menuItemProps.modifiers.active} 
        onClick={() => menuItemProps.handleClick(tag)} />
}



AttributeInput.propTypes = {
    onItemSelect: PropTypes.func.isRequired,
    param_name: PropTypes.string,
    min_state: PropTypes.number,
    disabled : PropTypes.bool
}


AttributeInput.defaultProps = {
    disabled : false 
}

/**
 * 
 * @param {Object} props 
 * @param {String} props.text - The text shown for the button. 
 * @param {Array<String>} props.attribute_groups - The attribute groups to filter the attributes.
 * @param {String} props.min_state
 * @param {Function} props.onItemSelect A function that handles a trait selection. This handles also the deselection if
 * an item has been already selected.  
 * @param {Boolean} props.disabled - If the selection is disabled. 
 * @returns 
 */
export function AttributeInput({ text, min_state, attribute_groups, onItemSelect, disabled }) {

    const [query, setQuery] = useState("")
    const debouncedString = useDebounce(query, 50)
    
    const { data: attribute_tags, isError, isLoading, isFetching } = api.attributes.queryAttributes.useGetAttributesByQuery({
        search_string: debouncedString,
        min_state,
        attribute_groups : _.join(attribute_groups, ";"),
        include_traits: false, limit: 20
    }, {
        staleTime: 300000,
        placeholderData: (prev) => prev ? prev : []
    })

    const renderItem = (item, itemProps) => {
        
        return <AttributeMenuItem key={item} tag={item} menuItemProps={itemProps}  />
    }
    const handleQueryChange = (query) => {
        setQuery(query)
    }

    return ( 
        <div>
            <Select
                disabled={disabled || isError}
                items={_.isArray(attribute_tags) ? attribute_tags : []}
                itemRenderer={renderItem}
                inputValueRenderer={(i) => i.text}
                onQueryChange={handleQueryChange}
                onItemSelect={onItemSelect}>
                
                <Button icon="chevron-down" minimal small loading={isLoading || isFetching} text={text} />
            
            </Select>
        </div>
    )






}