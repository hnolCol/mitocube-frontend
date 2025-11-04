import { TraitWithValueInput } from "../tags/TagWithTooltip"
import _ from "lodash"
import { Attribute } from "./Attribute"
import { getRandomID } from "../../../../services/random"

/**
 * 
 * @param {Object} props 
 * @param {String} props.submission_tag 
 * @param {Object} props.attributeTraits {attribute_tag : trait_tag[]} 
 */
export function DatasetAttributeView({submission_tag, attributeTraits, handleTraitRemove, getSelectionByPath, onChildrenSelection}) {


    return (<div style={{ overflowY: "scroll", height: "50vh", marginTop : "1rem", paddingTop: "1rem", paddingBottom : "2rem" }}>
        {_.isArray(attributeTraits) && attributeTraits.length > 0 ? attributeTraits.map(attributeTraitHierarchy => {
            const attribute_tag = attributeTraitHierarchy.tag
            return (<div key={attribute_tag}>
                    
                {
                    attributeTraitHierarchy.children.length > 0 ?
                        <div>
                        <Attribute attribute_tag={attribute_tag} />
                            {attributeTraitHierarchy.children
                                .map(trait => {
                                    return <TraitWithValueInput
                                        key={`trait-${trait.tag}-${trait.id}`}
                                        onChildrenSelection={onChildrenSelection}
                                        attribute_tag={attribute_tag}
                                        trait_tag={trait.tag}
                                        submission_tag={submission_tag}
                                        onRemove={handleTraitRemove}
                                        getSelectionByPath={getSelectionByPath}
                                        referenceID={trait.id}
                                    />
                                })}
                        </div>:
                        null}
                </div>)
            }) : null}
        </div>
    )
}