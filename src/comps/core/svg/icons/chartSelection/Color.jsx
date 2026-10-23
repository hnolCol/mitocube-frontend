import { getColorPalette } from "@mitocube/viz/src/colors/palette"
import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Color-selection icon. Opens a dropdown to select the key name used for the color encoding.
 */
function ColorIconWithName({ height = 25, width = 25, ...props }) {
    const circleRadius = 5
    const colorPalette = getColorPalette(3)
    return (
        <ComboboxIconBase {...{ height, width, ...props }}>
            {[
                { cx: 1 + circleRadius, cy: height / 2, fill: colorPalette[0] },
                { cx: width / 2, cy: height / 3, fill: colorPalette[1] },
                { cx: width / 1.7, cy: height / 1.6, fill: colorPalette[2] }
            ].map((circleProps, idx) => <circle key={`${idx}-circleP`} {...circleProps} r={circleRadius} stroke="black" strokeWidth={0.5} opacity={0.8} />)}
        </ComboboxIconBase>
    )
}

export default ColorIconWithName
