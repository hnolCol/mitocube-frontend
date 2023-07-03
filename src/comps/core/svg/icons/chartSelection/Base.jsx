
import { SVG } from "../../../charts/SVGHeader"
import { getColorPalette } from "../../../colors/colorPalette"
import AnimatedText from "../../AniamtedText"
import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { Group } from "@visx/group"

function IconBase({ height = 25, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,children }) {
    const [mouseOver, setMouseOver] = useState(false)
    const width = 33
    
    const handleSelection = (e) => {
        if (_.isFunction(callback)) {
            callback(callbackKey)
            }
        }
    
    return (
            <div className="flex flex-columns margin--very-little">
                <SVG {...{ width, height }}>
                
                <Group cursor={"pointer"} onMouseEnter={() => setMouseOver(true)} onMouseLeave={() => setMouseOver(false)} onMouseUp={handleSelection}>
                    <motion.rect x={0} y={0} {...{ width, height }} fill={mouseOver ? "#fafafa" : "#e5e5e5"} rx={4} ry={4} />
                    <Group left={2} top={4} >
                        {children}
                        <AnimatedText x={25} y={10} text={placeholder} />
                    </Group>
            </Group>
                    </SVG>
        </div>
                
       
    )
}

export default IconBase