import { Button, FormGroup, MenuItem } from "@blueprintjs/core";
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
        isRequired = true,
        hint = "",
        callbackKey,
        textKey = "text",
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

        const selected = placeholder === item[textKey]
        return(
            <MenuItem 
                key = {item[textKey]} 
                text={item[textKey]} 
                labelElement={<div style={{ maxWidth: "10rem", fontSize : "0.75rem"}}>{_.isString(labelKey)?item[labelKey]:""}</div>}
                onClick={handleClick} 
                multiline={true}
                intent={selected? "primary" : "blank"} 
                icon={selected? "small-tick" : "blank"}/>
        )
    }

    const filterItems = (query, items) => {
        if (query.length < 2) return items 
        else return filterArrayBySearchString({array : items, searchString : query, keyNames})
    }

    const onItemSelection = (item) => {
        //handles item selection
        if (isFunction(onChange) && callbackKey === undefined) onChange(item)

        else if (isFunction(onChange) && callbackKey !==undefined) onChange(callbackKey,item)

    }

    return (
        <FormGroup
            label={hint}
            labelInfo={isRequired ? "(required)" : "(optional)"}
            inline={false}
            helperText={""}>
        <Select
            fill={fill}
            noResults={<MenuItem text="No items/attributes available." disabled={true}/>}
            filterable={items.length > 5 ? true : false}
            
            items={items}
            resetOnSelect={true}
            itemListPredicate={filterItems}
            itemRenderer={renderItems}
            onItemSelect={onItemSelection}
            popoverProps={{ matchTargetWidth : true, minimal: true}}
            disabled={disabled}>
            <Button text={value !== undefined ? value : placeholder} disabled={disabled} {...buttonProps} fill={fill} />
            </Select>
            </FormGroup>
    )
}