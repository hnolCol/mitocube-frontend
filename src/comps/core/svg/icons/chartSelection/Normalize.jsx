import ComboboxIconBase from "./ComboboxBase"
import { getColorPalette } from "../../../colors/colorPalette"

/**
 * @description Normalize-selection icon. Opens a dropdown to select the normalization method.
 * @param {Number} props.colorIdx - Index into the color palette used for the icon bars.
 */
function NormalizeIcon({ height, width = 25, colorIdx = 0, ...props }) {
    const colorPalette = getColorPalette(3)
    const barWidth = width / 7
    return (
        <ComboboxIconBase {...{ height, width, ...props }}>
            {[{ height: 3 }, { height: 8 }, { height: 14 }, { height: 12 }, { height: 6 }, { height: 1 }].map((rectProps, idx) =>
                <rect key={`normr-${idx}`} {...rectProps} x={idx * barWidth + 3} y={18 - rectProps.height} height={rectProps.height} width={barWidth}
                    fill={colorPalette[colorIdx]} stroke="none" />)}
        </ComboboxIconBase>
    )
}

export default NormalizeIcon
