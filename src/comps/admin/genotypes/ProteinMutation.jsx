import { Button } from "@blueprintjs/core";
import { checkForKey } from "../../../services/objects/checks";
import { AttributeTraitSelection } from "../../core/base/attributes/AttributeTraitSelection";
import { TraitWithValueInput } from "../../core/base/tags/TagWithTooltip";


export function ProteinMutation({ mutation_tag, genotype, setGenotype, modification_tag }) {
    

    const deleteMutation = () => {
        let gene_modifications = genotype.gene_modifications 
        delete gene_modifications[modification_tag].mutations[mutation_tag]
        setGenotype(prevValues => {return {...prevValues,  gene_modifications}})
    }

    const handleMutationChange = (trait) => {
        let gene_modifications = genotype.gene_modifications 
        gene_modifications[modification_tag].mutations[mutation_tag].tag = trait.tag
        setGenotype(prevValues => {return {...prevValues,  gene_modifications}})
    }
    const trait_tag = checkForKey({ object: genotype.gene_modifications[modification_tag].mutations[mutation_tag], keyName : "tag", defaultValue : ""})
    return (
        <div>
            
            <AttributeTraitSelection
                attribute_tag="att_protein_mutation"
                onChange={handleMutationChange}
                selected_traits={trait_tag} />
            
            {trait_tag !== "" ?
                
                <TraitWithValueInput trait_tag={trait_tag} attribute_tag="att_protein_mutation" /> : null}
            
                <Button onClick={deleteMutation} text="Delete"/>
        </div>
    )
}



// class ProteinMutation(BaseModel):
//     id : int 
//     tag : Literal["att_protein_mutation:frameshift","att_protein_mutation:flag","att_protein_mutation:insertion","att_protein_mutation:truncation","att_protein_mutation:none","att_protein_mutation:gfp"]
//     start : int|None #amino acid start,is always given in C-term direction, for N-term tag for example give 0, for C-term the end amino acid sequence, please note that is not the index and starts at 1 not at 0.  can only be  nOne, it tag is "att_protein_mutation:none"
//     end : int|None #amino acid end 
//     sequence : str|None #amino acids to be added or substituted (e.g. insertion or substitution)