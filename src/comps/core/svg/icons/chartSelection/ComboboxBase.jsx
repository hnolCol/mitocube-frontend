import { MenuDivider, MenuItem } from "@blueprintjs/core"
import { SVG } from "../../../charts/SVGHeader"
import _, { at } from "lodash"
import { Group } from "@visx/group"
import "./style.css"
import { Select } from "@blueprintjs/select"
import { filterArrayBySearchStringBySingleKey } from "../../../../../services/arrays/filter"
import { isItemInArrayDeepComp } from "../../../../../services/arrays/transforms"


import hooks from "@mitocube/api-hooks"

/**
 * 
 * @param {Objet} props 
 * @param {String} props.attribute_tag - The tag of the attribute to be displayed. 
 * @param {Function} props.handleClick - The function to be called upon click.
 * @param {Boolean} props.active - If the item is active. 
 * @param {Boolean} props.selected - If the item is selected. 
 * @param {Boolean} props.disabled - If the item is disabled. 
 * @returns 
 */
function AttributeMenuItem({ attribute_tag, handleClick, active = false, selected = false, disabled = false }) {

    const { data: attribute, isSuccess } = hooks.attributes.useGetAttribute({ tag: attribute_tag }, { enabled: _.isString(attribute_tag), staleTime: Infinity })
    return (
    <div>
            {isSuccess ? <MenuItem
                text={attribute.text}
                label={""} icon={selected ? "tick" : "blank"}
                onClick={handleClick}
                active={active}
                disabled={disabled} /> : null}
    </div>)
}


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
    labelKey = undefined,
    selectedItems = [],
    callbackKey = undefined,
    callback = undefined,
    callbackValueOnly = false,
    minimal = true,
    filterable = false,
    itemIsAttribute = true,
    children }) {
    
    const itemsAreObjects = _.isObject(items[0])
    const checkedItems = _.isString(items[0])?items.map(v => {return {[textKey] : v}}):items

    const handleSelection = (item, e) => {
        const returnItem = itemsAreObjects ? item : item[textKey]
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
        if (item[textKey] === "DIVIDER") return <MenuDivider key={`${index}-comboMenuDiv`} />
        if (itemIsAttribute) {
            return <AttributeMenuItem
                key={`${item[textKey]}-${index}`}
                attribute_tag={item.text}
                active={modifiers.active}
                selected={selected}
                handleClick={handleClick} />
        }
        return <MenuItem
            key={`${item[textKey]}-${index}`}
            text={item[textKey]}
            label = {_.isString(labelKey) && _.has(item,labelKey) ? item[labelKey] : undefined}
            active={modifiers.active}
            disabled={modifiers.disabled}
            onClick={handleClick}
            onFocus={handleFocus}
            labelClassName="labelelement-wrap--fixed-width"
            icon={selected ? "tick" : "blank"} />
    }

    return (
        <div> 
            <Select
                items={checkedItems}
                itemListPredicate={filterItems}
                filterable={filterable}
                itemRenderer={renderItem}
                onItemSelect={handleSelection}
                disabled={items.length === 0}
                >
                <button className="flex margin--very-little icon__container center-items" style={{outline : "none", border : "none", width, height, padding : "0px"}} onMouseDown={e => e.stopPropagation()}>

                    <SVG {...{ width, height }}>
                        <Group  left={0} top={0} >
                                {children}
                        </Group>
                    </SVG>
                    {!minimal ?
                        <div className="flex icon__container__text">
                            {placeholder}
                        </div> : null}
                    </button>
            </Select>
        </div>
        
                        
    )
}

export default ComboboxIconBase