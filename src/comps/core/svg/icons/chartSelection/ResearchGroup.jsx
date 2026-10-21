import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"
import { getColorPalette } from "../../../colors/colorPalette"

export function ResearchGroupSVG({ width, height, strokeColor }) {
    const halfWidth = width / 2
    const halfHeight = height / 2
    const marginY = height / 4.5
    return (
        <g>
            <polyline points={_.join([
                [width / 5, marginY],
                [width - width / 5, marginY],
                [width - width / 5, marginY + height / 10],
                [halfWidth + width / 8, halfHeight],
                [halfWidth + width / 8, height - marginY],
                [halfWidth - width / 8, height - marginY],
                [halfWidth - width / 8, halfHeight],
                [width / 5, marginY + height / 10],
                [width / 5, marginY]
            ].map(v => _.join(v, ",")), ", ")}
                strokeWidth={1.5}
                stroke={strokeColor}
                fill="none" />
        </g>
    )
}

/**
 * @description Research-group selection icon. Opens a dropdown to select research groups.
 */
function ResearchGroupIcon({ height = 25, width = 25, selectedItems = [], ...props }) {
    const colorPalette = getColorPalette(3)
    const strokeColor = selectedItems.length === 0 ? "#000" : colorPalette[0]
    return (
        <ComboboxIconBase {...{ height, width, selectedItems, ...props }}>
            <ResearchGroupSVG {...{ width, height, strokeColor }} />
        </ComboboxIconBase>
    )
}

export default ResearchGroupIcon
