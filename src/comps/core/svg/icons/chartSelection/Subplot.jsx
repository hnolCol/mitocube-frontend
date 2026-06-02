import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function SubplotIconWithName({ height = 25, width = 25, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined, callbackValueOnly = false, minimal = true, selectedItems = []}) {
    const startx = 5
    const margin = 5
    const barwidth = width / 3
    const maxheight = height - 1.5 * margin
    const leftPoints = [[startx, margin], [startx, maxheight], [startx + barwidth, maxheight]]
    const rightPoints = [[startx + barwidth + margin/2, margin], [startx + barwidth + margin/2, maxheight], [startx + 2 * barwidth + margin/2, maxheight]]

    return (
        <ComboboxIconBase {...{height,width,placeholder,items,callback,callbackKey,callbackValueOnly,minimal, selectedItems}}>
            {[{ points: _.join(leftPoints.map(p => `${p[0]},${p[1]}`), ", ") },
                { points : _.join(rightPoints.map(p => `${p[0]},${p[1]}`), ", ")},].map((pathProps, idx) => {
                return (
                    <g key={`${idx}-pathP`} >
                        <polyline {...pathProps} stroke="black" strokeWidth={0.85} fill="none" />
                    </g>)
                })}
            
        </ComboboxIconBase>
    )
}

export default SubplotIconWithName