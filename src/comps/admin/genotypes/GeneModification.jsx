import { Button } from "@blueprintjs/core";
import { AttributeTraitSelection } from "../../core/base/attributes/AttributeTraitSelection";
import { ProteinMutation } from "./ProteinMutation";
import { checkForKey } from "../../../services/objects/checks";
import _ from "lodash"
import TooltipButton from "../../core/base/buttons/TooltipButton";
import { InfoButton } from "../../core/base/buttons/InfoButton";

export function GeneModification({ modification_tag, genotype, setGenotype, feature_tag }) {
    

    const gene_modification = genotype.gene_modifications[modification_tag]
    const mutations = genotype.gene_modifications[modification_tag].mutations
    const addMutation = () => {
        let mutations = genotype.gene_modifications[modification_tag].mutations
        console.log(_.keys(mutations))
        let feautre_mutation_idx = _.keys(mutations).filter(v => v.startsWith(feature_tag)).map(v => _.toNumber(_.last(v.split("-"))))
        const max_idx = _.max(feautre_mutation_idx)
        console.log(_.isNaN(max_idx), max_idx)
        mutations[`${feature_tag}-${_.isNaN(max_idx) || max_idx === undefined ? 0 : max_idx + 1}`] = {}
        let gene_modifications = genotype.gene_modifications
        gene_modifications[modification_tag].mutations = mutations 
        setGenotype(prevValues => {return {...prevValues, gene_modifications}})
    }

    /**
     * @description Stores the selected trait for the genotype gene modification.
     * @param {import("../../../types/attributes").Trait} trait 
     */
    const handleTraitSelection = (trait) => {

        let gene_modifications = genotype.gene_modifications 
        let current_gene_mod = genotype.gene_modifications[modification_tag]
        current_gene_mod[trait.attribute_tag] = trait.tag
        gene_modifications[modification_tag] = current_gene_mod
        setGenotype(prevValues => {return {...prevValues,  gene_modifications}})
    }

    
    return <div>
        <h3>Select Gene Modification for {feature_tag}</h3>
        <div></div>
        <AttributeTraitSelection attribute_tag="att_gene_zygosity"
            selected_traits={checkForKey({ object: gene_modification, keyName: "att_gene_zygosity", defaultValue: [] })}
            onChange={handleTraitSelection} />
        
        <AttributeTraitSelection attribute_tag="att_gene_engineering"
            selected_traits={checkForKey({ object: gene_modification, keyName: "att_gene_engineering", defaultValue: [] })}
            onChange={handleTraitSelection} />
        
        <AttributeTraitSelection attribute_tag="att_gene_editing_method"
            selected_traits={checkForKey({ object: gene_modification, keyName: "att_gene_editing_method", defaultValue: [] })}
            onChange={handleTraitSelection} />
        
        
        <h3>Protein Mutation</h3> <InfoButton
            infoElement={<div>Select the type of mutation. For example, a CRISPR mediated knockout would introduce a frameshift as a protein mutation. Another mutation might a tag that is added to the protein a specific position.</div>}
            />
        
        {_.keys(mutations).map(mutation_tag => {
            
            return <div className="div-border-bottom"><ProteinMutation {...{genotype, setGenotype, modification_tag, mutation_tag}} /></div>
        })}
        <Button small minimal intent="primary" icon="plus" onClick={addMutation} />
        
    </div>
}



// class ProteinMutation(BaseModel):
//     id : int 
//     tag : Literal["att_protein_mutation:frameshift","att_protein_mutation:flag","att_protein_mutation:insertion","att_protein_mutation:truncation","att_protein_mutation:none","att_protein_mutation:gfp"]
//     start : int|None #amino acid start,is always given in C-term direction, for N-term tag for example give 0, for C-term the end amino acid sequence, please note that is not the index and starts at 1 not at 0.  can only be  nOne, it tag is "att_protein_mutation:none"
//     end : int|None #amino acid end 
//     sequence : str|None #amino acids to be added or substituted (e.g. insertion or substitution)
    
// class GeneModificationModel(BaseModel):
//     tag : str #feature tag (e.g. Uniprot ID )
//     zygosity : Literal["att_gene_zygosity:(+/+)","att_gene_zygosity:(-/+)","att_gene_zygosity:(-/-)","att_gene_zygosity:unknown"] #traits from att_gene_zygosity 
//     gene_engineering : Literal["att_gene_engineering:ko","att_gene_engineering:ki"] #traits from att_gene_engineering 
//     editing_method : Literal["att_gene_editing_method:crispr","att_gene_editing_method:biggybac"] #traits from att_gene_editing_method 
//     mutations : List[ProteinMutation]
    

// class GenotypeModel(BaseModel):
//     id : int 
//     created_at : int #timestamp 
//     tag : str 
//     text : str 
//     description : str|None 
//     publication : str|None #pubmed id 
//     user_tag : str|None # user who created the genotype 
//     features : List[str] #list of uniprot ids of the features that are affected by the genotype 
//     proteome_tags : List[str] #list of proteomes that are affected, for
//     gene_modifications : List[GeneModificationModel]