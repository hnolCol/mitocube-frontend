import { api } from "@/api";
import { ProteinFavorite } from "@/comps/protein/charts/overview/ProteinFavorite";
import _ from "lodash"
import { Trait } from "../../base/traits/Trait";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";
/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/feature").Feature} props.feature 
 * @param {Function} props.onClick 
 * @param {Boolean} props.active 
 * @param {Boolean} props.selected  
 * @returns 
 */
export function ProteinMenuItem({ tag, onClick, active = false, selected = false, showProteome  = true}) {

    const { data : protein, isSuccess } = api.features.proteinsQuery.useGetProteinByTag({ tag }, { enabled: _.isString(tag), staleTime: Infinity })
    return (
        <div className="flex flex-column padding--little">
            {_.isObject(protein) && isSuccess ?  <button className={`menu_item ${selected ? "menu_item__selected" : ""} ${active ? "menu_item__active" : ""} `}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick(tag, e)
                }}>
                <div className="flex justify-space-between">
                    <div>
                    <div className="flex center-items">
                        <div style={{ marginRight: "0.5rem" }}><ProteinFavorite tag={tag} size={19} justIcon={true} /></div>
                        <div className="menu_item_text">{protein.gene_name} | {protein.tag}</div>
                    </div>
                    {showProteome && <div style={{marginTop : "1rem", color : HIGHLIGHT_COLOR}}><Trait trait_tag={protein.proteome_tag} /></div>}
                    </div>
                    <div className="menu_item_description">{protein.protein_name}</div>
                </div> 
            </button> : null}
        </div>
    )

}