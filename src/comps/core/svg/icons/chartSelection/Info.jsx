import { Text } from "@visx/text"
import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Info icon. Opens a dropdown with additional information items.
 */
function InfoIcon({ height = 25, width = 25, ...props }) {
    const center = { x: width / 2, y: height / 2 }
    return (
        <ComboboxIconBase {...{ height, width, filterable: false, itemIsAttribute: false, ...props }}>
            <g>
                <circle cx={center.x} cy={center.y} r={width * 0.75 / 2} fill="#fafafa" stroke="#000" strokeWidth={0.5} fillOpacity={0.7} />
                <Text x={center.x} y={center.y} textAnchor="middle" verticalAnchor="middle" fontWeight={500} fontSize={height * 0.7}>i</Text>
            </g>
        </ComboboxIconBase>
    )
}

export default InfoIcon
