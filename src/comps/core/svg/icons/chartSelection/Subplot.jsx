import { getColorPalette } from "../../../colors/colorPalette"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function SubplotIconWithName({ height, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,callbackValueOnly = false}) {
    
    const colorPalette = getColorPalette(3)
    
    return (
        <ComboboxIconBase {...{height,placeholder,items,callback,callbackKey,callbackValueOnly}}>
            {[{ points : "3,4 3,14, 12,14"},
                { points : "15,4 15,14, 24,14"},].map((pathProps, idx) => {
                return (
                    <g key={`${idx}-pathP`} >
                        <polyline {...pathProps} stroke="black" strokeWidth={0.85} fill="none" />
                    </g>)
                })}
            
        </ComboboxIconBase>
    )
}

export default SubplotIconWithName