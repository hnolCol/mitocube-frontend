import "../api/style.css"
import _ from "lodash"
/***
 * @param {Object} props 
 * @param {import("../../../../types/attributes").AttributeValue} props.attributeValue
 * @param {Function} props.onClick 
 * @param {Boolean} props.active 
 * @param {Boolean} props.selected  
 */
export function AttributeValueMenuItem({ attributeValue, onClick, active = false, selected = false }) {
    return (
        <div className="flex flex-column">
        <button className={`menu_item ${selected?"menu_item__selected":""} ${active?"menu_item__active":""} `} onClick={(e) => onClick(attributeValue,e)}>
                <div className="flex justify-space-between">
                    <div className="menu_item_text">{attributeValue.text}</div>
                    <div className="menu_item_description">{attributeValue.description}</div>
                </div>
            </button>
        </div>
    )
}
