import { Text } from "@visx/text"
import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Text-selection icon (e.g. tooltip names). Opens a dropdown to select text key names.
 * @param {String} props.text - The letter drawn inside the icon
 */
export function TextIconWithName({ height = 25, width = 25, text = "T", ...props }) {
    return (
        <ComboboxIconBase {...{ height, width, ...props }}>
            <Text x={width / 2} y={height / 2} verticalAnchor="middle" textAnchor="middle">{text}</Text>
        </ComboboxIconBase>
    )
}
