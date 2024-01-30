import { Menu } from "@blueprintjs/core"
import { SVG } from "../../../charts/SVGHeader"
import { getColorPalette } from "../../../colors/colorPalette"
import AnimatedText from "../../AniamtedText"
import { Popover2, MenuItem2 } from "@blueprintjs/popover2"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function SplitIconWithName({ height = 25, width = 25, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,callbackValueOnly = false, minimal = true}) {
    const colorPalette = getColorPalette(3)
    const margin = height / 7
    const barwidth = width / 3
    const maxheight = height - 4 * margin
 
    return (
        <ComboboxIconBase {...{height,width,placeholder,items,callback,callbackKey,callbackValueOnly,minimal}}>
            {[
                { x: margin, fill: colorPalette[0], height : maxheight/2},
                { x: margin + barwidth + margin, fill: colorPalette[0], height : maxheight}].map((rectProps, idx) => <rect key={`${idx}-rectP`} {...rectProps}  y = {height - 2 * margin - rectProps.height} width={barwidth} stroke="black" strokeWidth={0.5} opacity={0.95} />)}
        </ComboboxIconBase>
    )

}

export default SplitIconWithName
