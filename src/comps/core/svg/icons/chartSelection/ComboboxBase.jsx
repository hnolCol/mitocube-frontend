import { Menu } from "@blueprintjs/core"
import { SVG } from "../../../charts/SVGHeader"
import { getColorPalette } from "../../../colors/colorPalette"
import AnimatedText from "../../AniamtedText"
import { Popover2, MenuItem2 } from "@blueprintjs/popover2"
import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { Group } from "@visx/group"

function ComboboxIconBase({ height = 25, placeholder = "Please select", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined, callbackValueOnly = false, children }) {
    const [mouseOver, setMouseOver] = useState(false)
    const width = 33 + placeholder.length * 9
    const checkedItems = _.isString(items[0])?items.map(v => {return {text : v}}):items

    const handleSelection = (item) => {
        if (_.isFunction(callback)) {
            if (callbackValueOnly) 
                callback(item.text)
            else {
                callback(callbackKey, item.text)
            }
        }
    }

    return (
        <div> 
            <Popover2 position="bottom-left" content={<Menu>
            {checkedItems.map((itemProps, itemIdx) => {
                const itemSelected = _.has(itemProps,"selected")?itemProps.selected:itemProps.text === placeholder
                return (
                    <MenuItem2
                    key={`dash-menu-${itemIdx}`}
                    icon={itemSelected ? "tick" : "none"}
                    intent={itemSelected ? "primary" : "none"}
                    {...itemProps}
                    onClick={() => handleSelection(itemProps)} />)
            })}
        </Menu>}>
                <div className="flex flex-columns">
                <SVG {...{ width, height }}>
                
                <Group cursor={"pointer"} onMouseEnter={() => setMouseOver(true)} onMouseLeave={() => setMouseOver(false)}>
                    <motion.rect x={0} y={0} {...{ width, height }} fill={mouseOver ? "#fafafa" : "#e5e5e5"} rx={4} ry={4} />
                    <Group  left={2} top={4} >
                                {children}
                    
                    <AnimatedText x={25} y={10} text={placeholder} />
                    </Group>
            </Group>
                    </SVG>
                    </div>
                </Popover2>
                </div>
       
    )
}

export default ComboboxIconBase