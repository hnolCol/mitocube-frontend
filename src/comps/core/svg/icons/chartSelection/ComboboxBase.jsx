import { Menu, MenuDivider, Popover, MenuItem } from "@blueprintjs/core"
import { SVG } from "../../../charts/SVGHeader"
import { getColorPalette } from "../../../colors/colorPalette"
import AnimatedText from "../../AniamtedText"
import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { Group } from "@visx/group"
import { Text } from "@visx/text"
import "./style.css"
/**
 * 
 * @param {Object} props 
 * @param {Number} props.height - The SVG height 
 * @param {String[]} props.items - The list of selectable items
 * @param {String} props.callbackKey - The callbackkey to be included in the callback function upon selection change. 
 * @param {Function} props.callback - The callback function by default a change in the selection callback(callbackkey,value)
 * @param {Boolean} props.callbackValueOnly - If true only the callbackValue will be included not the callbackKey. 
 * @param {SVGAElement} props.children - The children to be displayed in the SVG
 * @returns 
 */
function ComboboxIconBase({ height = 25, width = 25, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined, callbackValueOnly = false, children }) {
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
            <Popover position="bottom-left" content={<Menu>
                {checkedItems.map((itemProps, itemIdx) => {
                    if (itemProps.text === "DIVIDER") return <MenuDivider key={`${itemIdx}-comboMenuDiv`} />
                const itemSelected = _.has(itemProps,"selected")?itemProps.selected:itemProps.text === placeholder
                    return (
                    
                    <MenuItem
                        key={`dash-menu-${itemIdx}`}     
                        icon={itemSelected ? "tick" : "blank"}
                        intent={itemSelected ? "primary" : "blank"}
                        {...itemProps}
                        onClick={() => handleSelection(itemProps)} />)
            })}
        </Menu>}>
                <div className="flex margin--very-little icon__container center-items">
                    <div style={{height,width}}>
                <SVG {...{ width, height }}>
                    <Group  left={2} top={0} >
                            {children}
                    </Group>
                        </SVG>
                        </div>
                    <div className="flex icon__container__text">{placeholder}</div>
                    </div>
                </Popover>
                </div>
       
    )
}

export default ComboboxIconBase