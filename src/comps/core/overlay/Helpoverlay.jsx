import { Button, Collapse } from "@blueprintjs/core"
import { useState } from "react"



function HelpOverlay({header = "Help", startsOpen = false, children}) {
    const [isOpen, setIsOpen] = useState(startsOpen)

    return (
        <div className="dashboard__grid__help--topright bg--lightgrey" style={{border: "0.1px darkgrey solid"}}>
            <div className="flex" style={{ justifyContent: isOpen?"space-between":"flex-end", width: "100%" }}>
                {isOpen ? <div>{header}</div> : null}
                <div><Button icon={isOpen ? "cross-circle" : "info-sign"} intent="primary" minimal={true} small={true} onClick={() => setIsOpen(!isOpen)}/></div></div>
            <Collapse {...{ isOpen }}>
                <div style={{width : "25vw"}}>

                    {children}
                                        
                </div>
            </Collapse>
        </div>
    )
}

export default HelpOverlay