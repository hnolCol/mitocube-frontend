
/**
 * 
 * @param {Object} props 
 * 
 * @param {Function} props.onClick 
 * @param {Boolean} props.active 
 * @param {Boolean} props.selected  
 * @returns 
 */
export function FilterMenuItem({ filter, onClick, active = false, selected = false }) {
    
    return (
        <div className="flex flex-column">
        <button className={`menu_item ${selected?"menu_item__selected":""} ${active?"menu_item__active":""} `} onClick={(e) => onClick(filter,e)}>
                <div className="flex justify-space-between">
                    <div className="menu_item_text">{filter.tag}</div>
                    <div className="menu_item_description">{filter.description}</div>
                </div>
            </button>
        </div>
    )

}