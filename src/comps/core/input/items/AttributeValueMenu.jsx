import "../api/style.css"
import _ from "lodash"
import PropTypes from "prop-types"
import { api } from "@/api"
import { getRandomID } from "../../../../services/random"


/***
 * @param {Object} props 
 * @param {String} props.tag - The tag of the trait.
 * @param {String} props.attribute_tag - The associated attribute_tag
 * @param {Function} props.onClick 
 * @param {Boolean} props.active 
 * @param {Boolean} props.selected  
 * @param {Boolean} props.showDescription
 * @param {String} props.trait_path - Optional resolved trait path (root first) that is emitted on click instead of the two-element path.
 * @param {React.ReactNode} props.textSuffix - Optional node rendered after the trait text (e.g. child values of a "Used in other rows" entry).
 */
export function TraitMenuItem({ tag, attribute_tag, onClick, active = false, selected = false, showDescription = true, trait_path = undefined, textSuffix = null }) {

    const { data: trait, isSuccess } = api.traits.queryTraits.useGetTraitByTag({ tag: tag }, { enabled: _.isString(tag), staleTime: Infinity })

    const getSelectionPath = () => {
        if (_.isArray(trait_path) && trait_path.length > 0) {
            return trait_path.flatMap(step => ([{ "type": "attribute", "tag": step.attribute_tag }, { "type": "trait", "tag": step.trait_tag }]))
        }
        return [{ "type": "attribute", "tag": attribute_tag}, { "type": "trait", "tag": tag }]
    }

    return (
    <div className="flex flex-column">
            {isSuccess ?
                    <button className={`menu_item ${selected ? "menu_item__selected" : ""} ${active ? "menu_item__active" : ""} f`}
                        onClick={(e) => onClick(getSelectionPath())}>

                        <div className={`flex justify-space-between " ${selected ? "" : ""}`}>
                            <div className="menu_item_text">{selected ? <span style={{ color: "#466688", fontWeight: "bold", marginRight: "0.35rem" }}>✓</span> : null}{trait.text}{textSuffix}</div>
                                {showDescription && <div className="menu_item_description">{trait.description}</div>}
                            </div>
                    </button>

                : null}
        </div>
    )
}

TraitMenuItem.propTypes = {
    tag: PropTypes.string.isRequired,
    attribute_tag: PropTypes.string,
    onClick: PropTypes.func,
    active: PropTypes.bool,
    selected: PropTypes.bool,
    showDescription: PropTypes.bool,
    trait_path: PropTypes.arrayOf(PropTypes.shape({ attribute_tag: PropTypes.string, trait_tag: PropTypes.string })),
    textSuffix: PropTypes.node,
}
