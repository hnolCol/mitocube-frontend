import "../api/style.css"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import { getRandomID } from "../../../../services/random"


/***
 * @param {Object} props 
 * @param {String} props.tag - The tag of the trait.
 * @param {String} props.attribute_tag - The associated attribute_tag
 * @param {Function} props.onClick 
 * @param {Boolean} props.active 
 * @param {Boolean} props.selected  
 */
export function TraitMenuItem({ tag, attribute_tag, onClick, active = false, selected = false }) {
    const {data : trait, isSuccess} = hooks.traits.useGetTraitByTag({tag : tag}, { enabled: _.isString(tag), staleTime: Infinity  })
    return (
    <div>
            {isSuccess ?
                <div className="flex flex-column">
                    <button className={`menu_item ${selected ? "menu_item__selected" : ""} ${active ? "menu_item__active" : ""} `}
                        onClick={(e) => onClick([{ "type": "attribute", "tag": attribute_tag, "id" : attribute_tag}, { "type": "trait", "tag": tag, "id" : getRandomID()}])}>

                        <div className={`flex justify-space-between " ${selected ? "" : ""}`}>
                            <div className="menu_item_text">{trait.text}</div>
                                <div className="menu_item_description">{trait.description}</div>
                            </div>
                    </button>
                </div >

                : null}
        </div>
    )
}
