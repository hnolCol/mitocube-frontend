import { Menu } from "@blueprintjs/core"
import { SVG } from "../../../charts/SVGHeader"
import { getColorPalette } from "../../../colors/colorPalette"
import AnimatedText from "../../AniamtedText"
import { Popover2, MenuItem2 } from "@blueprintjs/popover2"
import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function SplitIconWithName({ height, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,callbackValueOnly = false}) {
    const colorPalette = getColorPalette(3)
    return (
        <ComboboxIconBase {...{height,placeholder,items,callback,callbackKey,callbackValueOnly}}>
            {[
                { x: 3, fill: colorPalette[0], height : 5},
                { x: 13, fill: colorPalette[0], height : 12}].map((rectProps, idx) => <rect key={`${idx}-rectP`} {...rectProps}  y = {15 - rectProps.height} width={7} stroke="black" strokeWidth={0.5} opacity={0.95} />)}
        </ComboboxIconBase>
    )

}

export default SplitIconWithName