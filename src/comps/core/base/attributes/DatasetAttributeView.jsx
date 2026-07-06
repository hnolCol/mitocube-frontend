import { TraitWithValueInput } from "../tags/TraitWithValueInput"
import _ from "lodash"
import { Attribute } from "./Attribute"
import { getRandomID } from "../../../../services/random"
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette"

/**
 * 
 * @param {Object} props 
 * @param {Object} props.attributeTraits {attribute_tag : trait_tag[]} 
 */
export function DatasetAttributeView({attributeTraits, handleTraitRemove, getSelectionByPath, onChildrenSelection, checkAttributeRequiredTraits}) {

    return (<div style={{ overflowY: "scroll", height: "50vh", marginTop : "1rem", paddingTop: "1rem", paddingBottom : "2rem" }}>
        {_.isArray(attributeTraits) && attributeTraits.length > 0 ? attributeTraits.map((attributeTraitHierarchy,idx) => {
            const attribute_tag = attributeTraitHierarchy.tag
            return (<div className="padding--little" key={`${attribute_tag}-${idx}`}>
                    
                {
                    attributeTraitHierarchy.children.length > 0 ?
                        <div>
                            <h4 style={{ color: HIGHLIGHT_COLOR }}><Attribute attribute_tag={attribute_tag} /></h4>
                            <div className="margin-left--little">
                            {attributeTraitHierarchy.children
                                .map((trait,iidx) => {
                                    return <TraitWithValueInput
                                        key={`trait-${trait.tag}-${trait.id}-${idx}-${iidx}`}
                                        onChildrenSelection={onChildrenSelection}
                                        attribute_tag={attribute_tag}
                                        trait_tag={trait.tag}
                                        onRemove={handleTraitRemove}
                                        getSelectionByPath={getSelectionByPath}
                                        referenceID={trait.id}
                                        checkAttributeRequiredTraits={checkAttributeRequiredTraits}
                                    />
                                })}
                            </div>
                        </div>:
                        null}
                </div>)
            }) : null}
        </div>
    )
}