import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function GroupIconWithName({ height = 25, width = 25, placeholder = "", hightlightBox ,items = [{ text: "Menu1" }],textKey ="text", selectedItems = [], callbackKey = undefined, callback = undefined,callbackValueOnly = false, minimal = true}) {
    const boxwidth = width / 3
    const boxheight = height / 2
    const horizotalmargin = 2
    return (
        <ComboboxIconBase {...{ height, placeholder, items, callback, callbackKey, callbackValueOnly, selectedItems, minimal, textKey }}>
            <line x1={horizotalmargin + boxwidth/2} x2={width - horizotalmargin - boxwidth/2} y1={height / 2} y2={height / 2} stroke="black" strokeWidth={1} />
            <rect x={horizotalmargin} y={height/2 - boxheight / 2} fill={hightlightBox ? "#fff" : hightlightBox === "left" ? "red" : "#fff"} width={boxwidth} height={boxheight} stroke="#000" rx={2} /> 
            <rect x={width - horizotalmargin - boxwidth} y={height/2 - boxheight/2} fill={hightlightBox?"#fff":hightlightBox === "right" ? "red" : "#fff"} width={boxwidth} height={boxheight} stroke="#000" rx={2}/> 
        </ComboboxIconBase>
    )
}

export default GroupIconWithName