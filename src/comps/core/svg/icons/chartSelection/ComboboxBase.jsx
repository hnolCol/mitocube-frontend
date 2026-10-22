import { MenuItem, MenuDivider } from "@blueprintjs/core"
import { Select } from "@blueprintjs/select"
import _ from "lodash"
import { SVG } from "../../../charts/SVGHeader"
import { Group } from "@visx/group"
import { api } from "@/api"
import { filterArrayBySearchStringBySingleKey } from "../../../../../services/arrays/filter"
import "./style.css"

/**
 * Renders a menu item for an attribute tag by fetching its display text from the backend.
 * Renders nothing until the attribute was successfully loaded.
 */
function AttributeMenuItem({ attribute_tag, handleClick, active = false, selected = false, disabled = false }) {
    const { data: attribute, isSuccess } = api.attributes.queryAttributes.useGetAttribute(
        { tag: attribute_tag },
        { enabled: _.isString(attribute_tag) && attribute_tag.length > 0, staleTime: Infinity }
    )
    if (!isSuccess) return null
    return <MenuItem
        text={attribute.text}
        icon={selected ? "tick" : "blank"}
        onClick={handleClick}
        active={active}
        disabled={disabled} />
}

const TEXT_KEY = "text"

/**
 * @description Shared base for all chart-selection combobox icons. Renders a small icon button
 * (children) that opens a Blueprint Select dropdown.
 * @param {Number} props.height - The SVG height
 * @param {Number} props.width - The SVG width
 * @param {String} props.placeholder - Text shown next to the icon when minimal is false
 * @param {(String[]|Object[])} props.items - The selectable items. Strings are converted to `{text}` objects.
 * @param {String} props.textKey - The key of the item that holds the display text
 * @param {String} props.labelKey - Optional key of the item that holds the menu item label
 * @param {(String|Number)[]} props.selectedItems - The currently selected item texts
 * @param {String} props.callbackKey - Key passed to the callback on selection
 * @param {Function} props.callback - Called as callback(callbackKey, item) or callback(item) if callbackValueOnly
 * @param {Boolean} props.callbackValueOnly - If true only the value is passed to the callback
 * @param {Boolean} props.minimal - If true the placeholder text is hidden
 * @param {Boolean} props.filterable - If true the dropdown can be filtered by a search string
 * @param {Boolean} props.itemIsAttribute - If true items are treated as attribute tags and fetched from the backend
 * @param {SVGAElement} props.children - The icon drawn inside the SVG
 */
function ComboboxIconBase({
    height = 25,
    width = 25,
    placeholder = "",
    items = [],
    textKey = TEXT_KEY,
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
    const checkedItems = _.isString(items[0]) ? items.map(v => ({ [textKey]: v })) : items

    const handleSelection = (item) => {
        if (!_.isFunction(callback)) return
        const returnItem = itemsAreObjects ? item : item[textKey]
        callbackValueOnly ? callback(returnItem) : callback(callbackKey, returnItem)
    }

    const filterItems = (query, items) => {
        return filterArrayBySearchStringBySingleKey({ array: items, keyName: textKey, searchString: query }).data
    }

    const renderItem = (item, { handleClick, handleFocus, index, modifiers }) => {
        const selected = selectedItems.includes(item[textKey])
        if (item[textKey] === "DIVIDER") return <MenuDivider key={`${index}-comboMenuDiv`} />
        if (itemIsAttribute) {
            return <AttributeMenuItem
                key={`${item[textKey]}-${index}`}
                attribute_tag={item[textKey]}
                active={modifiers.active}
                selected={selected}
                handleClick={handleClick} />
        }
        return <MenuItem
            key={`${item[textKey]}-${index}`}
            text={item[textKey]}
            label={_.isString(labelKey) && _.has(item, labelKey) ? item[labelKey] : undefined}
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
                disabled={items.length === 0}>
                <button
                    className="flex margin--very-little icon__container center-items"
                    style={{ outline: "none", border: "none", width, height, padding: "0px" }}
                    onMouseDown={e => e.stopPropagation()}>
                    <SVG {...{ width, height }}>
                        <Group left={0} top={0}>
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
