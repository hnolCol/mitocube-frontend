import { Button, MenuItem } from "@blueprintjs/core";
import { Select2 } from "@blueprintjs/select";
import { isFunction } from "lodash";
import PropTypes from "prop-types"

Combobox.propTypes = {
    items: PropTypes.array,
    buttonText: PropTypes.string, 
    fill : PropTypes.bool,
    callback: PropTypes.func,
    disabled: PropTypes.bool,
    buttonProps : PropTypes.object 
    
}

export function Combobox(
        {items = ["I1","I2","ABC"],
        callback,
        placeholder = "Please select",
        callbackKey,
        disabled = false,
        buttonProps = {
            minimal : false,
            small : false
        },
        fill = false}) {

    const renderItems = (item, { handleClick, modifiers, query }) => {
        //render items as a Menu item. 
        const selected = placeholder === item 
        return(
            <MenuItem 
                key = {item} 
                text={item} 
                onClick={handleClick} 
                intent={selected? "primary" : "none"} 
                icon={selected? "small-tick" : "none"}/>
        )
    }

    const onItemSelection = (item) => {
        //handles item selection
        if (isFunction(callback) && callbackKey ===undefined) callback(item)

        else if (isFunction(callback) && callbackKey !==undefined) callback(callbackKey,item)

    }

    return(
        <Select2
            fill={fill}
            filterable={false}
            items={items}
            itemRenderer={renderItems}
            onItemSelect={onItemSelection}
            disabled={disabled}>
            <Button text={placeholder} disabled={disabled} {...buttonProps} fill={fill}/>
        </Select2>
    )
}