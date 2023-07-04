import { MenuDivider } from "@blueprintjs/core"
import _ from "lodash"
import "./OmnibarStyles.css"

export function OmnibarItem(props) {
        
    const { item, onSelect, featureLabels, handleClose } = props

    const handleSelectAndClose = (e) => {
        let featureURL = `/protein/${item[featureLabels["id"]]}`
        onSelect({ text: item[featureLabels["main"]], to : featureURL })
        handleClose(e,featureURL)
        }

    return (
        
        <div key={item["Entry"]} onClick={handleSelectAndClose} style={{maxWidth:"90vh"}}>
        <div className={"omnibar__item__container"} >

            <div className="margin--little">
                    <div className="h0-span" style={{ float: "left" }}>
                <p>{item[featureLabels["main"]]}</p>
            </div>
            <div style={{float:"right",paddingRight:"3px",paddingTop:"4px",color:"#737373"}}>
                <p>{item[featureLabels["id"]]}</p>
            </div>
            </div>
            <div style={{fontSize:"10px",marginTop:"2px",marginLeft:"10px",paddingBottom:"4px",clear: "both", wordWrap:"break-word"}}>
                <p>{`${item[featureLabels["sub-main"]]}`}</p>
                        <p className="h2-span">{item[featureLabels["bold-sub-text"]]}</p>
                <div>
                <p>{item[featureLabels["info"]]}</p>
                </div>
            </div>

        </div>

        <MenuDivider/>

    </div>)
}
