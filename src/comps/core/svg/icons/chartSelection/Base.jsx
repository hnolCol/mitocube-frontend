
import { SVG } from "../../../charts/SVGHeader"
import AnimatedText from "../../AniamtedText"
import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { Group } from "@visx/group"
import PropTypes from "prop-types"

IconBase.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    placeholder: PropTypes.string,
    items: PropTypes.array,
    callbackKey: PropTypes.string,
    callback: PropTypes.func,
    children: PropTypes.node
}

/**
 * @description Simple clickable icon button without a dropdown. Renders the icon (children)
 * into a rounded gray rect that highlights on hover, plus an optional animated placeholder text.
 * In contrast to ```ComboboxIconBase``` no Select menu is opened; the callback is invoked directly on mouse up.
 * @param {Number} props.height - The SVG height in pixels.
 * @param {Number} props.width - The SVG width in pixels.
 * @param {String} props.placeholder - The text shown next to the icon.
 * @param {Object[]} props.items - Unused, kept for interface parity with the other icon components.
 * @param {String} props.callbackKey - The key passed to the callback.
 * @param {Function} props.callback - Called as callback(callbackKey) on mouse up.
 * @param {SVGAElement} props.children - The icon drawn inside the SVG.
 */
function IconBase({ height = 25, width = 25, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,children }) {
    const [mouseOver, setMouseOver] = useState(false)
    
    const handleSelection = (e) => {
        e.stopPropagation()
        if (_.isFunction(callback)) {
            callback(callbackKey)
            }
        }
    
    return (
                <button className="flex margin--very-little icon__container center-items" style={{outline : "none", border : "none", width , height, padding : "0px"}} onMouseDown={e => e.stopPropagation()}>

                <SVG {...{ width, height }}>
                
                <Group cursor={"pointer"} onMouseEnter={() => setMouseOver(true)} onMouseLeave={() => setMouseOver(false)} onMouseUp={handleSelection} onMouseDown={(e) => e.stopPropagation()}>
                    <motion.rect x={0} y={0} {...{ width, height }} fill={mouseOver ? "#fafafa" : "#e5e5e5"} rx={4} ry={4} />
                    <Group left={0} top={3} >
                        {children}
                        <AnimatedText x={25} y={10} text={placeholder} />
                    </Group>
                </Group>
                    </SVG>
        </button>
                
       
    )
}

export default IconBase