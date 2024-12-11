
/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/feature").Feature} props.feature 
 * @param {Function} props.onClick 
 * @param {Boolean} props.active 
 * @param {Boolean} props.selected  
 * @returns 
 */
export function FeatureMenuItem({ feature, onClick, active = false, selected = false }) {
    
    return (
        <div className="flex flex-column">
            <button className={`menu_item ${selected ? "menu_item__selected" : ""} ${active ? "menu_item__active" : ""} `}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick(feature, e)
                }}>
                <div className="flex justify-space-between">
                    <div className="menu_item_text">{feature.gene_name}({feature.tag})</div>
                    <div className="menu_item_description">{feature.protein_name}</div>
                </div>
            </button>
        </div>
    )

}