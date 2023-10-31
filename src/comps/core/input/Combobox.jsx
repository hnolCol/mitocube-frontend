import { Button, MenuItem } from "@blueprintjs/core";
import { isFunction } from "lodash";
import PropTypes from "prop-types"
import { allKeysInObject } from "../../../services/objects/checks";
import _ from "lodash"
import { Select } from "@blueprintjs/select";
import { filterArrayBySearchString } from "../../../services/arrays/filter";

Combobox.propTypes = {
    items: PropTypes.array.isRequired,
    buttonText: PropTypes.string, 
    fill : PropTypes.bool,
    disabled: PropTypes.bool,
    buttonProps: PropTypes.object,
    onChange : PropTypes.func.isRequired
    
}

export function Combobox(
        {items,
        onChange,
        value,
        placeholder = "Plase select",
        callbackKey,
        textKey = "name",
        labelKey = undefined,
        disabled = false,
        buttonProps = {
            minimal : false,
            small : true
        },
        fill = true}) {

    const keyNames = [textKey,labelKey].filter(keyName => _.isString(keyName))
    
    const renderItems = (item, { handleClick, modifiers, query }) => {
        //render items as a Menu item. 

        const selected = placeholder === item.name
        return(
            <MenuItem 
                key = {item.name} 
                text={item[textKey]} 
                label = {_.isString(labelKey)?item[labelKey]:""}
                onClick={handleClick} 
                intent={selected? "primary" : "blank"} 
                icon={selected? "small-tick" : "blank"}/>
        )
    }

    const filterItems = (query, items) => {
        if (query.length < 2) return items 
        else return filterArrayBySearchString({array : items, searchString : query, searchColumns : keyNames})
    }

    const onItemSelection = (item) => {
        //handles item selection
        if (isFunction(onChange) && callbackKey === undefined) onChange(item)

        else if (isFunction(onChange) && callbackKey !==undefined) onChange(callbackKey,item)

    }

    return(
        <Select
            fill={fill}
            noResults={<MenuItem text="No items/attributes available." disabled={true}/>}
            filterable={items.length > 5 ? true : false }
            items={items}
            resetOnSelect={true}
            itemListPredicate={filterItems}
            itemRenderer={renderItems}
            onItemSelect={onItemSelection}
            disabled={disabled}>
            <Button text={value !== undefined ? value : placeholder} disabled={disabled} {...buttonProps} fill={fill} />
        </Select>
    )
}