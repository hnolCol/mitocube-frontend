import { Suggest, Select} from "@blueprintjs/select";
import  hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import { Button, MenuItem } from "@blueprintjs/core";
import PropTypes from "prop-types";
import { api } from "@/api";
import "./style.css"


/**
 * @description A menu for a trait by its tag. 
 * @param {Object} props 
 * @param {String} props.tag - The trait tag 
 * @param {Object} props.menuItemProps - The properties for a menu item (blueprint)
 * @returns
 */
export function AttributeMenuItem({ tag, menuItemProps, selected = false}) {

    const { data: attribute, isSuccess } = api.attributes.queryAttributes.useGetAttribute({ tag }, {staleTime : Infinity, enabled: _.isString(tag) && tag.length > 0})

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



AttributeMenuItem.propTypes = {
    tag: PropTypes.string.isRequired,
    menuItemProps: PropTypes.object.isRequired,
    selected: PropTypes.bool,
}

/**
 * @description A greyed out, non-selectable menu entry for a trait. Used to make
 * traits that matched the search visible (e.g. typing "dmso" shows the trait
 * "DMSO") without allowing to select them - only attributes can be selected.
 * @param {Object} props
 * @param {String} props.tag - The trait tag
 */
export function DisabledTraitMenuItem({ tag }) {
    const { data: trait, isSuccess } = api.traits.queryTraits.useGetTraitByTag({ tag }, { enabled: _.isString(tag) && tag.length > 0, staleTime: Infinity })

    if (!isSuccess) return null

    return <div
        className="menu_item"
        style={{ opacity: 0.45, cursor: "not-allowed", paddingLeft: "1.75rem" }}
        onClick={(e) => e.stopPropagation()}
        title="Traits cannot be selected as attributes - select the attribute instead.">
        <div className="menu_item_text">{trait.text}</div>
    </div>
}

DisabledTraitMenuItem.propTypes = {
    tag: PropTypes.string.isRequired,
}

AttributeInput.propTypes = {
    text: PropTypes.string,
    attribute_groups: PropTypes.arrayOf(PropTypes.string),
    onItemSelect: PropTypes.func.isRequired,
    min_state: PropTypes.number,
    disabled : PropTypes.bool,
    allow_input: PropTypes.bool,
    include_traits: PropTypes.bool
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
 * @param {Boolean} props.allow_input - If provided, only attributes with this allow_input flag are returned.
 * @param {Boolean} props.include_traits - If true, the search also matches traits of the attributes. Matching traits
 * are shown below their attribute in grey and are not selectable (e.g. typing "dmso" shows the attribute
 * "Chemical compound treatment" with the greyed out trait "DMSO" below it).
 * @returns 
 */
export function AttributeInput({ text, min_state, attribute_groups, onItemSelect, disabled = false, allow_input = undefined, include_traits = false }) {

    const [query, setQuery] = useState("")
    const debouncedString = useDebounce(query, 50)
    
    const { data: attribute_tags, isError, isLoading, isFetching } = api.attributes.queryAttributes.useGetAttributesByQuery({
        search_string: debouncedString,
        min_state,
        attribute_groups : _.join(attribute_groups, ";"),
        include_traits, limit: 20,
        allow_input
    }, {
        staleTime: 300000,
        placeholderData: (prev) => prev ? prev : []
    })

    const renderItem = (item, itemProps) => {
        if (!include_traits || _.isString(item)) {
            return <AttributeMenuItem key={item} tag={item} menuItemProps={itemProps}  />
        }
        const trait_tags = _.isArray(item.trait_tags) ? item.trait_tags : []
        const shownTraits = debouncedString.length > 0 ? trait_tags.slice(0, 5) : []
        return <div key={item.attribute_tag}>
            <AttributeMenuItem tag={item.attribute_tag} menuItemProps={itemProps} />
            {shownTraits.map(trait_tag => <DisabledTraitMenuItem key={`${item.attribute_tag}-${trait_tag}`} tag={trait_tag} />)}
            {debouncedString.length > 0 && trait_tags.length > shownTraits.length
                ? <div className="menu_item" style={{ opacity: 0.45, paddingLeft: "1.75rem" }} onClick={(e) => e.stopPropagation()}>
                    <div className="menu_item_text">... and {trait_tags.length - shownTraits.length} more traits</div>
                </div>
                : null}
        </div>
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
                inputValueRenderer={(i) => _.isObject(i) ? i.attribute_tag : i.text}
                onQueryChange={handleQueryChange}
                onItemSelect={(item) => onItemSelect(_.isString(item) ? item : item.attribute_tag)}>
                
                <Button icon="chevron-down" minimal small loading={isLoading || isFetching} text={text} />
            
            </Select>
        </div>
    )






}