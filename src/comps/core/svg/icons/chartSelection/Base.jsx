
import { SVG } from "../../../charts/SVGHeader"
import AnimatedText from "../../AniamtedText"
import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { Group } from "@visx/group"

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