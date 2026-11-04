import { getColorPalette } from "@mitocube/viz/src/colors/palette"
import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Color-selection icon. Opens a dropdown to select the key name used for the color encoding.
 */
function ColorIconWithName({ height = 25, width = 25, ...props }) {
    const circleRadius = 4.5
    const colorPalette = getColorPalette(3)
    const centerX = width / 2
    const centerY = height / 2
    return (
        <ComboboxIconBase {...{ height, width, ...props }}>
            {[
                { cx: centerX, cy: centerY - circleRadius - 1.5, fill: colorPalette[0] },
                { cx: centerX - circleRadius - 1.5, cy: centerY + circleRadius - 1, fill: colorPalette[1] },
                { cx: centerX + circleRadius + 1.5, cy: centerY + circleRadius - 1, fill: colorPalette[2] }
            ].map((circleProps, idx) => <circle key={`${idx}-circleP`} {...circleProps} r={circleRadius} stroke="black" strokeWidth={0.5} opacity={0.8} />)}
        </ComboboxIconBase>
    )
}

export default ColorIconWithName
