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
    onChange : PropTypes.func.isRequired,
    colorKey: PropTypes.string
}

/**
 * @description - A combobox that allow for the selection of a single item out of multiple options
 * @param {Object} props 
 * @param {Boolean} props.small - If the appearance should be small. 
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
 * @param {String} props.colorKey - The ```keyName``` that contains the color value for the menu item
 * @param {Number} props.minQueryLength - The minimal length of a filter query. Defaults to 2. 
 * @param {String} props.value_suffix A string that is added to the value. 
 * @returns {import("react").ReactElement} The JSX element for a combobox. 
 */
export function Combobox({
    items,
    onChange,
    value,
    selectedItems = [],
    placeholder = "Please select",
    callbackKey,
    includeKey = "tag",
    textKey = "text",
    labelKey = undefined,
    colorKey = "color",
    noResultsText = "No items available.",
    disabled = false,
    small = false,
    matchTargetWidth = false,
    showNoResults = true,
    minQueryLength = 2,
    value_suffix = "",
    minimal = false,
    buttonProps = {
        
    },
    fill = true}) {

    const keyNames = [textKey,labelKey].filter(keyName => _.isString(keyName))
    const sortedItems = selectedItems.length > 0 ? [...items.filter(i => selectedItems.includes(i[includeKey])),
        ...items.filter(i => !selectedItems.includes(i[includeKey]))] : items
    
    const renderItems = (item) => {
        //render items as a Menu item. 
        let selected = false
        if (_.isString(value)) {
            selected = value === item[textKey]
        }
        else if (selectedItems.length > 0) {
            selected = selectedItems.length > 0 && selectedItems.includes(item["tag"])

        }


        const itemColor = colorKey && item[colorKey] ? item[colorKey] : undefined;
        
        return(
            <MenuItem 
                key = {item[textKey]} 
                text={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {itemColor && (
                            <div 
                                style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    borderRadius: '50%', 
                                    backgroundColor: itemColor,
                                    border: '1px solid #ccc'
                                }}
                            />
                        )}
                        {item[textKey]}
                    </div>
                }
                labelElement={<div style={{ maxWidth: "12rem", fontSize: "0.75rem" }}>
                    {_.isString(labelKey) ? item[labelKey] : ""}</div>}
                onClick={e => {
                    e.stopPropagation()
                    onItemSelection(item)
                }}
                multiline={true}
                intent={selected? "primary" : "blank"} 
                icon={selected? "small-tick" : "blank"}/>
        )
    }

    const filterItems = (query, items) => {
        if (query.length < minQueryLength) return items 
        else return filterArrayBySearchString({array : items, searchString : query, keyNames})
    }

    const onItemSelection = (item) => {
        //handles item selection
        if (isFunction(onChange) && callbackKey === undefined) onChange(item)
        else if (isFunction(onChange) && callbackKey !==undefined) onChange(callbackKey,item)
    }

    return (
        <Select
            fill={true}
            noResults={showNoResults ? <MenuItem text={noResultsText} disabled={true}/> : null}
            filterable={items.length > 5 ? true : false}
            items={sortedItems}
            resetOnSelect={true}
            itemListPredicate={filterItems}
            itemRenderer={renderItems}
            onItemSelect={onItemSelection}
            inputProps={{small:small}}
            popoverProps={{ matchTargetWidth, minimal: true }}
            popoverContentProps={{
                onWheelCapture: (event) => event.stopPropagation()
            }}
            disabled={disabled}>
            <Button style={{ width: fill ? "100%" : "auto" }} disabled={disabled} className={`basic-button ${minimal ? "basic-button--small" : ""}`} {...buttonProps}>{_.isString(value) ? value + value_suffix : placeholder}</Button>
        </Select>
    )
}