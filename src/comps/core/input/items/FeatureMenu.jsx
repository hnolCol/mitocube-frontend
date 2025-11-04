import hooks from "@mitocube/api-hooks"
import _ from "lodash"
/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/feature").Feature} props.feature 
 * @param {Function} props.onClick 
 * @param {Boolean} props.active 
 * @param {Boolean} props.selected  
 * @returns 
 */
export function ProteinMenuItem({ tag, onClick, active = false, selected = false }) {

    const { data : protein, isSuccess } = hooks.features.proteins.useGetProteinByTag({ tag }, { enabled: _.isString(tag), staleTime: Infinity })

    return (
        <div className="flex flex-column">
            <button className={`menu_item ${selected ? "menu_item__selected" : ""} ${active ? "menu_item__active" : ""} `}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick(tag, e)
                }}>
                {_.isObject(protein) && isSuccess ? <div className="flex justify-space-between">
                    <div className="menu_item_text">{protein.gene_name} | {protein.tag}</div>
                    <div className="menu_item_description">{protein.protein_name}</div>
                </div> : null}
            </button>
        </div>
    )

}