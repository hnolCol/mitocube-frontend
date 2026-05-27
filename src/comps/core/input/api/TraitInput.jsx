import { Suggest, Select} from "@blueprintjs/select";
import { api } from "@/api"
import _ from "lodash"
import { useEffect, useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import { Button, Menu, MenuItem } from "@blueprintjs/core";



/**
 * @description A menu for a trait by its tag. 
 * @param {Object} props 
 * @param {String} props.tag - The trait tag 
 * @param {Object} props.menuItemProps - The properties for a menu item (blueprint)
 * @returns
 */
function TraitMenuItem({ tag, menuItemProps, selected, descriptionWidth = "15rem" }) {
    const { data: trait, isSuccess } = api.traits.queryTraits.useGetTraitByTag({ tag } , { enabled: _.isString(tag), staleTime: Infinity })

    if (!isSuccess) return null 

    return <MenuItem
        icon={ selected ? "tick" : "blank"}
        text={trait.text}
        multiline={true}
        labelElement={<div className="font-size--smallest"
            style={{ maxWidth: descriptionWidth, maxHeight : "5rem", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "1.2rem" }}>
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
export function TraitInput({ attribute_tag, text = "", onItemSelect, selected_trait, onTraitLoadSuccess, descriptionWidth = "400px" }) {
   
    const [query, setQuery] = useState("")
    const debouncedString = useDebounce(query, 30)
    const { data: traits, isError, isLoading, isSuccess } = api.traits.queryTraits.useGetTraitBySearchString({ search_string: debouncedString, attribute_tag, limit: 50 }, {
        enabled: _.isString(attribute_tag)
    })
    useEffect(() => { if (_.isFunction(onTraitLoadSuccess)) onTraitLoadSuccess(traits) }, [isSuccess, traits])

    const handleSelect = (trait_tag, e) => {

        if (_.isFunction(e.stopPropagation)) e.stopPropagation()
        
        onItemSelect(attribute_tag, trait_tag)
    }
    
    const renderItem = (item, itemProps) => {
        
        const isSelected = _.isString(selected_trait) ? item === selected_trait : _.isArray(selected_trait) ? selected_trait.includes(item) : false
        return <TraitMenuItem key={item}  tag={item} menuItemProps={itemProps} selected={isSelected}  descriptionWidth={descriptionWidth}/>
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
                onItemSelect={handleSelect}
                menuProps={{style : {minWidth : "600px"}}}
                popoverProps={{ popoverClassName: "default_bp_menu"}}
                >
                
                <Button variant="minimal" text={text} loading={isLoading} icon={"chevron-down"}/>
            
            </Select>
        </div>
    )

}