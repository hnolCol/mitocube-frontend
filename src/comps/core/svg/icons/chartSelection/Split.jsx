import { getColorPalette } from "@mitocube/viz/src/colors/palette"
import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Split-selection icon. Opens a dropdown to select the key name used to split the data.
 */
function SplitIconWithName({ height = 25, width = 25, ...props }) {
    const colorPalette = getColorPalette(3)
    const marginx = width / 8
    const margin = height / 7
    const barwidth = width / 3
    const maxheight = height - 4 * margin
    return (
        <ComboboxIconBase {...{ height, width, minimal: true, ...props }}>
            {[
                { x: marginx, fill: colorPalette[0], height: maxheight / 2 },
                { x: 2 * marginx + barwidth, fill: colorPalette[0], height: maxheight }
            ].map((rectProps, idx) => <rect key={`${idx}-rectP`} {...rectProps} y={height - 2 * margin - rectProps.height} width={barwidth} stroke="black" strokeWidth={0.5} opacity={0.95} />)}
        </ComboboxIconBase>
    )
}

export default SplitIconWithName
