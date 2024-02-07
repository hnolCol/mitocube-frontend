import { Menu, MenuDivider, Popover, MenuItem } from "@blueprintjs/core"
import { SVG } from "../../../charts/SVGHeader"
import { getColorPalette } from "../../../colors/colorPalette"
import AnimatedText from "../../AniamtedText"
import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { Group } from "@visx/group"
import { Text } from "@visx/text"
import "./style.css"
import { Select } from "@blueprintjs/select"
import { filterArrayBySearchStringBySingleKey } from "../../../../../services/arrays/filter"
import { isItemInArrayDeepComp } from "../../../../../services/arrays/transforms"
/**
 * 
 * @param {Object} props 
 * @param {Number} props.height - The SVG height 
 * @param {String[]} props.items - The list of selectable items
 * @param {String} props.callbackKey - The callbackkey to be included in the callback function upon selection change. 
 * @param {Function} props.callback - The callback function by default a change in the selection callback(callbackkey,value)
 * @param {Boolean} props.callbackValueOnly - If true only the callbackValue will be included not the callbackKey. 
 * @param {SVGAElement} props.children - The children to be displayed in the SVG
 * @returns 
 */
function ComboboxIconBase({
    height = 25,
    width = 25,
    placeholder = "",
    items = [{ text: "Menu1" }],
    textKey = "text",
    selectedItems = [],
    callbackKey = undefined,
    callback = undefined,
    callbackValueOnly = false,
    minimal = true,
    filterable = true,
    children }) {
    
    const itemsAreObjects = _.isObject(items[0])
    const checkedItems = _.isString(items[0])?items.map(v => {return {[textKey] : v}}):items

    const handleSelection = (item, e) => {
        const returnItem = itemsAreObjects ? item : item.text
        if (_.isFunction(callback)) {
            if (callbackValueOnly) 
                callback(returnItem )
            else {
                callback(callbackKey, returnItem )
            }
        }
    }
    /**
     * 
     * @param {String} query 
     * @param {Object[]} items 
     * @returns {Object[]} Filtered array using the query string and the text object.
     */
    const filterItems = (query, items) => {
        return filterArrayBySearchStringBySingleKey({array : items, keyName : textKey, searchString : query}).data
    }
    /**
     * @description Renders the MenuItem to show individual items. 
     * @param {Object} item 
     * @param {Object} itemProps 
     * @returns {React.ReactElement}
     */
    const renderItem = (item, { handleClick, handleFocus, index, modifiers, query, ref }) => {
        const selected = isItemInArrayDeepComp({array : selectedItems, item})
        if (item.text === "DIVIDER") return <MenuDivider key={`${index}-comboMenuDiv`} />
        return <MenuItem
            key={`${item.text}-${index}`}
            text={item.text}
            active={modifiers.active}
            disabled={modifiers.disabled}
            onClick={handleClick}
            onFocus={handleFocus}
            icon={selected ? "tick" : "blank"} />
    }

    return (
        <div> 
            <Select items={checkedItems} itemListPredicate={filterItems} filterable={filterable} itemRenderer={renderItem} onItemSelect={handleSelection} disabled={items.length === 0}>
                <div className="flex margin--very-little icon__container center-items">
                    <div style={{height,width}}>
                    <SVG {...{ width, height }}>
                        <Group  left={0} top={0} >
                                {children}
                        </Group>
                    </SVG>
                    </div>
                    {!minimal ?
                        <div className="flex icon__container__text">
                            {placeholder}
                        </div> : null}
                    </div>
                    </Select>
        </div>
        
       
    )
}

export default ComboboxIconBase