import { MenuDivider } from "@blueprintjs/core"
import _ from "lodash"
import "./OmnibarStyles.css"

/**
 * 
 * @param {Object} props 
 * @param {import("../../../types/feature").Feature} props.item
 * @returns 
 */
export function OmnibarItem(props) {
        
    const { item, onSelect, handleClose } = props

    const handleSelectAndClose = (e) => {
        let featureURL = `/protein/${item.key}`
        onSelect({ text: item.genes.split(" ").at(0), to : featureURL })
        handleClose(e,featureURL)
        }

    return (
        
        <div key={item["Entry"]} onClick={handleSelectAndClose} style={{maxWidth:"90vh"}}>
        <div className={"omnibar__item__container"} >

            <div className="margin--little">
                    <div className="h0-span" style={{ float: "left" }}>
                <p>{item.key}</p>
            </div>
            <div style={{float:"right",paddingRight:"3px",paddingTop:"4px",color:"#737373"}}>
                <p>{item.genes}</p>
            </div>
            </div>
            <div style={{fontSize:"10px",marginTop:"2px",marginLeft:"10px",paddingBottom:"4px",clear: "both", wordWrap:"break-word"}}>
                <p>{`${item.genes}`}</p>
                        <p className="h2-span">{item.organism}</p>
                <div>
                <p>{item.proteins}</p>
                </div>
            </div>

        </div>

        <MenuDivider/>

    </div>)
}
