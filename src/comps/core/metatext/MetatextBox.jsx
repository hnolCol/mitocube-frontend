
import { motion } from "framer-motion"
import { useState } from "react"
import { copyTextToClipboard } from "../../../services/clipboard"
import { Button } from "@blueprintjs/core"

export function MetatextBox({ title, content, width = "25vw" }) {
    const [mouseIn, setMouseIn] = useState(false)
    
    return (
        <motion.div onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)} className="margin--little">
        <div className="flex margin--little justify-space-between">
                <div className="flex flex-column"><div><h3>{title}</h3></div></div>
                <div><Button
                    style={{ opacity: mouseIn ? 1 : 0 }}
                    icon="clipboard"
                    small={true}
                    minimal={true}
                    onClick={() => copyTextToClipboard(content)}/></div>
        </div>
        <div
            className="intent-padding-right--little container--scroll-y-hide-x"
            style={{ textAlign: "justify", width, height: "33vh" }}>
                {content}
    </div>
    </motion.div>)

}
