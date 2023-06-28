import { getColorPalette } from "../../../colors/colorPalette"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function NormalizeIcon({ height, placeholder = "", items = [{ text: "Menu1" }], colorIdx = 0, callbackKey = undefined, callback = undefined,callbackValueOnly = false}) {
    
    const colorPalette = getColorPalette(3)
    const barWidth = 4
    return (
        <ComboboxIconBase {...{height,placeholder,items,callback,callbackKey,callbackValueOnly}}>
            {[{ height: 3 }, { height: 8 }, { height: 14 }, { height: 12 }, { height: 6 }, { height: 1 }].map((rectProps, idx) =>
                <rect key={`normr-${idx}`} {...rectProps} x={2 + idx * barWidth} y={16 - rectProps.height} height={rectProps.height} width={barWidth}
                    fill={colorPalette[colorIdx]} stroke="none" />)}
        </ComboboxIconBase>
    )
}

export default NormalizeIcon