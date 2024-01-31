import { getColorPalette } from "../../../colors/colorPalette"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

export function XAxisName({ height = 25,width = 25, placeholder = "", items = [{ text: "Menu1" }], selectedItems = [], callbackKey = undefined, callback = undefined,callbackValueOnly = false, margin = 7, minimal = false}) {
    const iconHeight = height-margin
    return (
        <ComboboxIconBase {...{height,width,placeholder,items,callback,callbackKey,callbackValueOnly,selectedItems,minimal}}>
            {[{ x1: margin, x2: iconHeight , y1: margin, y2: iconHeight  },
            { x1: margin, x2: iconHeight , y1: iconHeight , y2: margin }].map((lineProps,lineIdx) => <line key={`X-axisLine${lineIdx}`} {...lineProps} stroke="black" strokeWidth={1} />)}
        </ComboboxIconBase>
    )
}


/**
 * 
 * @param {Object} props 
 * @param {Number} props.height 
 * @param {Number} props.width 
 * @param {String} props.placeholder 
 * @param {String | Number} props.callbackKey
 * @returns 
 */
export function YAxisName({ height = 25, width = 25, placeholder = "", items = [{ text: "Menu1" }], selectedItems = [], callbackKey = undefined, callback = undefined,callbackValueOnly = false, margin = 7, minimal = false}) {
    const iconHeight = height - margin
    const middleX = height / 2 
    const splitCenter = iconHeight/1.4
    return (
        <ComboboxIconBase {...{height,width,placeholder,items,callback,callbackKey,callbackValueOnly,selectedItems,minimal}}>
            {[
                { x1: middleX, x2: middleX, y1: iconHeight, y2: splitCenter },
                { x1: middleX, x2: middleX - middleX / 2, y1: splitCenter, y2: margin },
                { x1: middleX, x2: middleX + middleX / 2, y1: splitCenter, y2: margin }
            ].map((lineProps,lineIdx) => <line key={`Y-axisLine${lineIdx}`} {...lineProps} stroke="black" strokeWidth={1} />)}

        </ComboboxIconBase>
    )
}