import { useState } from "react"
import { useGetAttributes } from "../../../hooks/queries/attribute.hooks"
import { AttributeTraitSelection } from "../../core/base/attributes/AttributeTraitSelection"
import { addStringToArray, addStringToArrayOrRemove } from "../../../services/arrays/transforms"
import { TraitWithValueInput } from "../../core/base/tags/TagWithTooltip"
import _ from "lodash"






export function GenotypeGen() {

    const [genotype, setGenotype] = useState({userUnitInput : {}})
    const { data : attributes, isLoading, isFetching, isSuccess } = useGetAttributes({param_name : "allow_for_genotype"})

    const handleSelection = (trait) => {

        const attribute_tag = trait.attribute_tag 
        const updated_traits = attribute_tag !== "att_protein_mutation" ?
                addStringToArrayOrRemove({ array: genotype[attribute_tag], string: trait.tag }) :
                addStringToArray({array : genotype[attribute_tag], string: trait.tag })
            
        setGenotype(prevValues => {return {...prevValues, [attribute_tag] : updated_traits}})
    }


    const handleUserUnitInput = (input) => {

        const attribute_tag = _.keys(input)[0]
        let ui = genotype.userUnitInput 
        ui[attribute_tag] = {...genotype.userUnitInput[attribute_tag], ...input[attribute_tag]}

        setGenotype(prevValues => {
            return { ...prevValues, "userUnitInput": ui }
        })
    }

    const handleRemove = (attribute_tag, trait, index) => {

        if (attribute_tag !== "att_protein_mutation") {
            // this means that only one trait can be selected 
            // then just use the handleSelection as it will remove the tags 
            handleSelection(trait)
        }
        else {
            let protein_mutations = genotype[attribute_tag]
            let protein_mutations_updated = protein_mutations.filter((_,i) => i !== index)
            setGenotype(prevValues => {return {...prevValues, [attribute_tag] : protein_mutations_updated}})
        }
    }

    const attributesLoaded = isSuccess && _.isArray(attributes)
    return (
        <div>
            <h2>Setup Genotype</h2>
            {attributesLoaded ? attributes.map(as => {
                return (
                    <div>
                        {!(_.has(genotype, as.attribute.tag)
                            && _.isArray(genotype[as.attribute.tag])
                            && genotype[as.attribute.tag].length > 0
                            && as.attribute.tag !== "att_protein_mutation")?

                            <AttributeTraitSelection
                                attribute_tag={as.attribute.tag}
                                selected_traits={genotype[as.attribute.tag]}
                                onChange={handleSelection} />
                            
                            : null}
                    </div>

                )
            }) : null}
            <div>
                <h2>Attr</h2>
                {attributesLoaded && !_.isEmpty(genotype)? attributes.map((as,attribute_index) => {
                    const attribute_tag = as.attribute.tag
                    if (!_.has(genotype,attribute_tag) || genotype[attribute_tag].length === 0) return null 
                    // console.log(attribute_tag, genotype[attribute_tag])
                    return _.isArray(genotype[attribute_tag]) ? <div className="intent-margin-left--little intent-margin-top--tiny"
                        style={{ paddingLeft: `${attribute_index * 0.5}rem` }}>
                        {genotype[attribute_tag].map((trait_tag, index) => <TraitWithValueInput
                            key={`${attribute_tag}-${trait_tag}-${index}`}
                            attribute_tag={attribute_tag}
                            trait_tag={trait_tag}
                            prefix={`${index+1}.`}
                            unitInput={genotype.userUnitInput}
                            onRemove={attribute_tag === "att_protein_mutation" ?
                                (trait) => handleRemove(attribute_tag, trait, index) :
                                (trait) => handleRemove(attribute_tag, trait)}
                            onUserUnitInput={handleUserUnitInput} />)}
                    </div> : null
                }) : null}

            </div>

        </div>
    )
}