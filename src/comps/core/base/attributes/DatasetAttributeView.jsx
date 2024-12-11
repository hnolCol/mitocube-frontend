import { TraitWithValueInput } from "../tags/TagWithTooltip"
import _ from "lodash"
import { Attribute } from "./Attribute"

/**
 * 
 * @param {Object} props 
 * @param {String} props.submission_tag 
 * @param {Object} props.attributeTraits {attribute_tag : trait_tag[]} 
 */
export function DatasetAttributeView({submission_tag, attributeTraits, handleTraitRemove, userUnitInput, onUserUnitInput}) {
    
    const attributeHasDefinedTraits = (attribute_tag) => {

        return _.isObject(attributeTraits)
                && _.has(attributeTraits, attribute_tag)
                && _.isArray(attributeTraits[attribute_tag])
                && attributeTraits[attribute_tag].length > 0 
    }
    return (<div style={{ overflowY: "scroll", height: "50vh", marginTop : "1rem", paddingTop: "1rem", paddingBottom : "2rem" }}>
                {_.isObject(attributeTraits) ? _.keys(attributeTraits).map(attribute_tag => {
                    return (<div key={attribute_tag}>
                        
                            <Attribute attribute_tag={attribute_tag} />
                            {attributeHasDefinedTraits(attribute_tag) ?

                                attributeTraits[attribute_tag]
                                    .map(trait_tag =>
                                        <TraitWithValueInput
                                            key = {trait_tag}
                                            onUserUnitInput={onUserUnitInput}
                                            unitInput={userUnitInput}
                                            attribute_tag={attribute_tag}
                                            trait_tag={trait_tag}
                                            submission_tag={submission_tag}
                                            onRemove={handleTraitRemove}
                                            />)
                                : null}
                        </div>)
                    }) : null}
        </div>
    )
}