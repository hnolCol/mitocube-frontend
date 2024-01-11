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
export function TooltipIconWithName({ height = 25, width = 25, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined, callbackValueOnly = false, margin = 7 }) {
    const iconHeight = height - margin
    const middleX = height / 2
    const splitCenter = iconHeight / 1.4
    return (
        <ComboboxIconBase {...{ height, width, placeholder, items, callback, callbackKey, callbackValueOnly }}>
            {/* {[
                { x1: middleX, x2: middleX, y1: iconHeight, y2: splitCenter },
                { x1: middleX, x2: middleX - middleX / 2, y1: splitCenter, y2: margin },
                { x1: middleX, x2: middleX + middleX / 2, y1: splitCenter, y2: margin }
            ].map(lineProps => <line {...lineProps} stroke="black" linewidth={0.5} />)} */}
            <Text x={width/2} y={height/2} verticalAnchor="middle" textAnchor="middle">T</Text>

        </ComboboxIconBase>)
}
