import { getColorPalette } from "../../../colors/colorPalette"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function ColorIconWithName({ height, placeholder = "Please select", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,callbackValueOnly = false}) {
    
    const colorPalette = getColorPalette(3)
    return (
        <ComboboxIconBase {...{height,placeholder,items,callback,callbackKey,callbackValueOnly}}>
            {[
            { cx: 7, cy: 11, fill: colorPalette[0]},
            { cx: 12, cy: 7, fill: colorPalette[1]},
            { cx: 13, cy: 14, fill: colorPalette[2]}].map((circleProps, idx) => <circle key={`${idx}-circleP`} {...circleProps} r={5} stroke="black" strokeWidth={0.5} opacity={0.8} />)}
            
        </ComboboxIconBase>
    )
}

export default ColorIconWithName