import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"
import { getColorPalette } from "@mitocube/viz/src/colors/palette"

export function FilterSVG({ width, height, strokeColor }) {
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
 * @description Filter-selection icon. Opens a dropdown to select the key names to filter by.
 */
function FilterIcon({ height = 25, width = 25, selectedItems = [], ...props }) {
    const colorPalette = getColorPalette(3)
    const strokeColor = selectedItems.length === 0 ? "#000" : colorPalette[0]
    return (
        <ComboboxIconBase {...{ height, width, selectedItems, ...props }}>
            <FilterSVG {...{ width, height, strokeColor }} />
        </ComboboxIconBase>
    )
}

export default FilterIcon
