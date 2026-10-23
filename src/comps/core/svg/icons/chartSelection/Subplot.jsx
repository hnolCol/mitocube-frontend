import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Subplot-selection icon. Opens a dropdown to select the key name used for subplots.
 */
function SubplotIconWithName({ height = 25, width = 25, ...props }) {
    const startx = 5
    const margin = 5
    const barwidth = width / 3
    const maxheight = height - 1.5 * margin
    const leftPoints = [[startx, margin], [startx, maxheight], [startx + barwidth, maxheight]]
    const rightPoints = [[startx + barwidth + margin / 2, margin], [startx + barwidth + margin / 2, maxheight], [startx + 2 * barwidth + margin / 2, maxheight]]
    return (
        <ComboboxIconBase {...{ height, width, minimal: true, ...props }}>
            {[leftPoints, rightPoints].map((points, idx) =>
                <g key={`${idx}-pathP`}>
                    <polyline points={_.join(points.map(p => `${p[0]},${p[1]}`), ", ")} stroke="black" strokeWidth={0.85} fill="none" />
                </g>
            )}
        </ComboboxIconBase>
    )
}

export default SubplotIconWithName
