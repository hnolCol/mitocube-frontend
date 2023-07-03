import { getColorPalette } from "../../../colors/colorPalette"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function DownloadIcon({ height, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,callbackValueOnly = false}) {
    
    const colorPalette = getColorPalette(5)
    return (
        <ComboboxIconBase {...{ height, placeholder, items, callback, callbackKey, callbackValueOnly }}>
            <g>
                <circle cx={14} cy={9} r={9} stroke="black" strokeWidth={0.5} opacity={0.95} fill={colorPalette[0]} />
                <line x1={14} x2={14} y1={4} y2={12} strokeWidth="2" stroke="white" />
                <polyline points="10,8 14,12 18,8" strokeWidth="2" stroke="white" fill="none"/>
            </g>
            
        </ComboboxIconBase>
    )
}

export default DownloadIcon