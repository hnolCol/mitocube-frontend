
import { getColorPalette } from "../../../colors/colorPalette"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function SplitIconWithName({ height = 25, width = 25, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,callbackValueOnly = false, minimal = true, selectedItems = []}) {
    const colorPalette = getColorPalette(3)
    const marginx = width / 8
    const margin = height / 7
    const barwidth = width / 3
    const maxheight = height - 4 * margin
 
    return (
        <ComboboxIconBase {...{height,width,placeholder,items,callback,callbackKey,callbackValueOnly,minimal,selectedItems}}>
            {[
                { x: marginx, fill: colorPalette[0], height : maxheight/2},
                { x: 2*marginx + barwidth, fill: colorPalette[0], height : maxheight}].map((rectProps, idx) => <rect key={`${idx}-rectP`} {...rectProps}  y = {height - 2 * margin - rectProps.height} width={barwidth} stroke="black" strokeWidth={0.5} opacity={0.95} />)}
        </ComboboxIconBase>
    )

}

export default SplitIconWithName
