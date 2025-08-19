import { Suggest, Select} from "@blueprintjs/select";
import  hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import { Button, Menu, MenuItem } from "@blueprintjs/core";



/**
 * @description A menu for a trait by its tag. 
 * @param {Object} props 
 * @param {String} props.tag - The trait tag 
 * @param {Object} props.menuItemProps - The properties for a menu item (blueprint)
 * @returns
 */
function TraitMenuItem({ tag, menuItemProps, selected }) {

    const { data: trait, isSuccess } = hooks.traits.useGetTraitByTag({ tag })

    if (!isSuccess) return null 

    return <MenuItem
        icon={ selected ? "tick" : "blank"}
        text={trait.text}
        labelElement={<div className="font-size--smallest"
            style={{ maxWidth: "8rem" }}>
            {trait.description}
        </div>}
        active={menuItemProps.modifiers.active} 
        onClick={(e) => menuItemProps.handleClick(e,tag)} />
}

/**
 * 
 * @param {Object} props 
 * @param {String} props.attribute_tag 
 * @param {String} props.text - The text shown in the button
 * @param {Function} props.onItemSelect A function that handles a trait selection. This handles also the deselection if
 * an item has been already selected.  
 * @returns 
 */
export function TraitInput({ attribute_tag, text = "", onItemSelect, selected_trait, onTraitLoadSuccess }) {
    const [query, setQuery] = useState("")
    const debouncedString = useDebounce(query, 30)
    
    const { data: traits, isError, isLoading } = hooks.traits.useGetTraitBySearchString({ search_string: debouncedString, attribute_tag, limit: 50 }, {
        enabled: _.isString(attribute_tag), onSuccess: (data) => {
            if (_.isFunction(onTraitLoadSuccess)) onTraitLoadSuccess(data)
        }
    })


    const handleSelect = (trait_tag, e) => {

        if (_.isFunction(e.stopPropagation)) e.stopPropagation()
        
        onItemSelect(attribute_tag, trait_tag)
    }
    
    const renderItem = (item, itemProps) => {
        return <TraitMenuItem key={item}  tag={item} menuItemProps={itemProps} selected={_.isString(selected_trait) && item === selected_trait}  />
    }
    const handleQueryChange = (query) => {
        setQuery(query)
    }

    return ( 
        <div>
            <Select
                disabled={isError}
                items={_.isArray(traits) ? traits : []}
                itemRenderer={renderItem}
            
                inputValueRenderer={(i) => i.text}
                onQueryChange={handleQueryChange}
                onItemSelect={handleSelect}>
                
                <Button small minimal text={text} loading={isLoading} icon={"chevron-down"}/>
            
            </Select>
        </div>
    )

}