import { getColorPalette } from "../../../colors/colorPalette"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function SizeIconWithName({ height, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,callbackValueOnly = false}) {
    
    const colorPalette = getColorPalette(3)
    return (
        <ComboboxIconBase {...{height,placeholder,items,callback,callbackKey,callbackValueOnly}}>
            {[
            { cx: 7, cy: 14.5, fill: colorPalette[1], r : 3, opacity : 0.8},
            { cx: 10, cy: 10, fill: colorPalette[1], r : 5, opacity : 0.8},
            { cx: 13.5, cy: 4, fill: colorPalette[1], r : 6, opacity : 0.8}].map((circleProps, idx) => <circle key={`${idx}-circleP`} {...circleProps} stroke="black" strokeWidth={0.5} />)}
            
        </ComboboxIconBase>
    )
}

export default SizeIconWithName