import { Text } from "@visx/text"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

/**
 * 
 * @param {Object} props 
 * @param {Number} props.height 
 * @param {Number} props.width 
 * @param {String} props.placeholder 
 * @param {String | Number} props.callbackKey
 * @returns {import("react").ReactElement} - The combobox for the tooltip selection. 
 */
export function TextIconWithName({ height = 25, width = 25, text = "T", placeholder = "", items = [{ text: "Menu1" }], selectedItems = [], callbackKey = undefined, callback = undefined, callbackValueOnly = false, margin = 7,  minimal = false }) {
    const iconHeight = height - margin
    const middleX = height / 2
    const splitCenter = iconHeight / 1.4
    return (
        <ComboboxIconBase {...{ height, width, placeholder, items, callback, callbackKey, callbackValueOnly, selectedItems, minimal }}>
            <Text x={width / 2} y={height / 2} verticalAnchor="middle" textAnchor="middle">{text}</Text>

        </ComboboxIconBase>)
}
