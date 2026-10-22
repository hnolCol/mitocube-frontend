import { getColorPalette } from "@mitocube/viz/src/colors/palette"
import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Size-selection icon. Opens a dropdown to select the key name used for the size encoding.
 */
function SizeIconWithName({ height = 25, width = 25, ...props }) {
    const colorPalette = getColorPalette(3)
    return (
        <ComboboxIconBase {...{ height, width, ...props }}>
            {[
                { cx: 7, cy: height / 1.5, fill: colorPalette[1], r: 3, opacity: 0.8 },
                { cx: width / 2.2, cy: height / 2.0, fill: colorPalette[1], r: 5, opacity: 0.8 },
                { cx: width / 1.5, cy: height / 3, fill: colorPalette[1], r: 6, opacity: 0.8 }
            ].map((circleProps, idx) => <circle key={`${idx}-circleP`} {...circleProps} stroke="black" strokeWidth={0.5} />)}
        </ComboboxIconBase>
    )
}

export default SizeIconWithName
