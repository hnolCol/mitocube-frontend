import { Button, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { isFunction } from "lodash";
import PropTypes from "prop-types"
import { allKeysInObject } from "../../../services/objects/checks";
import _ from "lodash"

Combobox.propTypes = {
    items: PropTypes.array.isRequired,
    buttonText: PropTypes.string, 
    fill : PropTypes.bool,
    disabled: PropTypes.bool,
    buttonProps: PropTypes.object,
    onChange : PropTypes.func.isRequired
    
}

export function Combobox(
        {items = ["I1","I2","ABC"],
        onChange,
        value,
        placeholder = "Plase select",
        callbackKey,
        disabled = false,
        buttonProps = {
            minimal : false,
            small : true
        },
        fill = true}) {

    const itemsAsObject = _.isObject(items[0])
    
    const itemsValid = itemsAsObject?_.filter(items, item => allKeysInObject({object : item, keyNames : ["text", "label"]}) ): undefined
    
    const renderItems = (item, { handleClick, modifiers, query }) => {
        //render items as a Menu item. 

        const selected = itemsAsObject ? placeholder === item.text: placeholder === item
        return(
            <MenuItem 
                key = {itemsAsObject ?item.text : item} 
                text={itemsAsObject ? item.text : item} 
                label = {itemsAsObject ? item.label : ""}
                onClick={handleClick} 
                intent={selected? "primary" : "blank"} 
                icon={selected? "small-tick" : "blank"}/>
        )
    }

    const onItemSelection = (item) => {
        //handles item selection
        if (isFunction(onChange) && callbackKey === undefined) onChange(item)

        else if (isFunction(onChange) && callbackKey !==undefined) onChange(callbackKey,item)

    }

    return(
        <Select
            fill={fill}
            noResults={<MenuItem text="No more items/attributes available." disabled={true}/>}
            filterable={false}
            items={itemsAsObject ?  itemsValid : items}
            itemRenderer={renderItems}
            onItemSelect={onItemSelection}
            disabled={disabled}>
            <Button text={value!==undefined?value:placeholder} disabled={disabled} {...buttonProps} fill={fill}/>
        </Select>
    )
}