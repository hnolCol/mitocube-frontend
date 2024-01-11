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

/**
 * @description - A combobox that allow for the selection of a single item out of multiple options
 * @param {Object} props 
 * @param {Object[]} props.items - The items to be displayed. The combobox display each item and represents it by accessing the ```textKey``` and the ```labelKey```. The text is the main name, while the label can display additional info.
 * @param {String} props.value - The selected value which is the string of the text. To find the selected item the ```item[textKey]``` is compared to ```value```.
 * @param {String} props.callbackKey - Optional key that is returned upon selection to help to store the selection by its ```callbackKey```. Please see onChange for more info. 
 * @param {Function} props.onChange - Function to be called when a selection is made. If the ```callbackKey``` is undefined simply the selected item of the ``onChange(item)``` is returned, otherwise ```onChange(callbackKey,item)```. 
 * @param {String} props.placeholder - The place holder string that is displayed to the user if value is undefined. 
 * @param {Boolean} props.isRequired - If true, the user is notified that this field is required. The combobox itself does not perform any checking if it is selected. 
 * @param {String} props.hint - The hint text to be displayed to the user for additional information.  
 * @param {Boolean} props.disabled - If true, the combobox is disabled. 
 * @param {String} props.textKey - The ```keyName``` used to display the item in items to the user. 
 * @param {String} props.labelKey - The ```keyName``` that is used to display in the label MenuItem
 * @returns {import("react").ReactElement} The JSX element for a combobox. 
 */
export function Combobox({
    items,
    onChange,
    value,
    placeholder = "Plase select",
    isRequired = true,
    hint = "",
    callbackKey,
    textKey = "text",
    labelKey = undefined,
    disabled = false,
    formGroupMargin = true,
    matchTargetWidth = false,
    buttonProps = {
        minimal : false,
        small : true
    },
    fill = true}) {

    const keyNames = [textKey,labelKey].filter(keyName => _.isString(keyName))
    
    const renderItems = (item, { handleClick, modifiers, query }) => {
        //render items as a Menu item. 
        const selected = value === item[textKey]
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
            style={formGroupMargin ? {} : {marginBottom : "0px"}}
            label={hint}
            labelInfo={isRequired ? "(required)" : "(optional)"}
            inline={false}
            helperText={undefined}>
            <Select
                fill={fill}
                noResults={<MenuItem text="No items/attributes available." disabled={true}/>}
                filterable={items.length > 5 ? true : false}
                items={items}
                resetOnSelect={true}
                itemListPredicate={filterItems}
                itemRenderer={renderItems}
                onItemSelect={onItemSelection}
                popoverProps={{ matchTargetWidth, minimal: true}}
                disabled={disabled}>
                <Button text={value !== undefined ? value : placeholder} disabled={disabled} {...buttonProps} fill={fill} />
            </Select>
        </FormGroup>
    )
}