import { Code } from "@blueprintjs/core";
import { AttributesInput } from "../../core/input/api/DatasetAttributeInput";
import { GenotypeInput } from "../../core/input/api/GenotypeInput";
import { useState } from "react";
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms";
import { DatasetAttributeView } from "../../core/base/attributes/DatasetAttributeView";
import { PhenotypeInput } from "../../core/input/api/PhenotypeInput";


export function ConnectPhenotype({ }) {

    const [phenotype, setPhenotype] = useState({attributes : {}})

    const handleChange = (key, value) => {
        
        console.log(value)
        setPhenotype(prevValues => { return { ...prevValues, [key]: addStringToArrayOrRemove({ array: prevValues[key], string: value }) } })
    }

    const handleAttributeChange = (attribute, trait) => {
        let updatedPhenotype = { ...phenotype }
        //add string if updatedPhenotype[attribute.tag] is undefined, an array with string will be returned. 
        const updatedTraits = addStringToArrayOrRemove({ array: updatedPhenotype.attributes[attribute.tag], string: trait.tag })
        updatedPhenotype.attributes[attribute.tag] = updatedTraits
        setPhenotype(prevValues => { return { ...prevValues, attributes : updatedPhenotype.attributes } })
    }
    const handleTraitRemove = (trait) => {
        let updatedPhenotype = { ...phenotype }
        //add string if updatedPhenotype[attribute.tag] is undefined, an array with string will be returned. 
        const updatedTraits = addStringToArrayOrRemove({array: updatedPhenotype[trait.attribute_tag], string : trait.tag})
        setPhenotype(prevValues => { return { ...prevValues, [trait.attribute_tag] : updatedTraits } })
    }
    console.log(phenotype)
    return (<div>
        <h2>Connect Phenotype to Genotype</h2>

        <div>
            <div className="flex flex-column" style={{ maxWidth: "max(33vw,300px)" }}>
                <h4>Phenotype</h4>
                <PhenotypeInput selectedItems={phenotype["tag"]} onPhenotypeSelection={(phenotype_tag) => { handleChange("tag", phenotype_tag) }} />
                <h4>Genotype</h4>
                <GenotypeInput onItemSelect={handleAttributeChange}/>
            </div>
            <div>
                Describe the connection from genotype to phenotype with a set of attributes. 
                For example, define the cellline, a method of how you quantified the phenotype. The goal is to find common protein regulations across datasets. 

            </div>
            <div className="flex flex-column" style={{ maxWidth: "max(33vw,300px)" }}>
            <h4>Attributes</h4>
            <AttributesInput selectedAttributes={phenotype.attributes} min_state={5} min_search_string_length={0} handleAttributeSelection={handleAttributeChange} matchTargetWidth={false} />
            <DatasetAttributeView attributeTraits={phenotype.attributes} handleTraitRemove={handleTraitRemove} />
            </div>

        </div>
        </div>)
}