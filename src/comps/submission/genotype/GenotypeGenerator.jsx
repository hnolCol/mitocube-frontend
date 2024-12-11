import { useState } from "react"
import { useGetAttributes } from "../../../hooks/queries/attribute.hooks"
import { AttributeTraitSelection } from "../../core/base/attributes/AttributeTraitSelection"
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms"
import { TraitWithValueInput } from "../../core/base/tags/TagWithTooltip"
import _ from "lodash"


export function GenotypeGen() {

    const [genotype, setGenotype] = useState({})
    const { data : attributes, isLoading, isFetching, isSuccess } = useGetAttributes({param_name : "allow_for_genotype"})
    console.log(attributes)

    const handleSelection = (trait) => {
        const updated_traits = addStringToArrayOrRemove({array : genotype[trait.attribute_tag], string : trait.tag})
        setGenotype(prevValues => {return {...prevValues, [trait.attribute_tag] : updated_traits}})
    }

    return (
        <div>
            <h2>Setup Genotype</h2>
            {isSuccess && _.isArray(attributes) ? attributes.map(as => {
                return (
                    <div>
                        <AttributeTraitSelection attribute_tag={as.attribute.tag} selected_traits={genotype[as.attribute.tag]} onChange={handleSelection}/>
                    </div>

                )
            }) : null}
            <div>
                {_.keys(genotype).map(attribute_tag => {
                    console.log(attribute_tag,genotype[attribute_tag])
                    return <TraitWithValueInput attribute_tag={attribute_tag} trait_tag={genotype[attribute_tag]} />
                })}
            </div>

        </div>
    )
}