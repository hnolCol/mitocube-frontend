import _ from "lodash"
import { FeatureInput } from "../../core/input/api/FeatureInput"
import { useState } from "react"
import { GenotypeList } from "./GenotypeList"
import { useGetGenotypesByFeatureTags } from "../../../hooks/queries/genotype.hooks"
import { addItemToArrayOrRemoveIfPresentByTag, addStringToArrayIfNotPresent, addStringToArrayOrRemove } from "../../../services/arrays/transforms"
import TextInput from "../../core/input/Text"
import { GeneModification } from "./GeneModification"
import { Button, ButtonGroup } from "@blueprintjs/core"

const INITIAL_GENOTYPE  = {
    features: [],
    feature_tags : [],
    proteome_tags: [],
    publication: "",
    description: "",
    gene_modifications: { }
}
export function GenotypeDefinition({ }) {

    const [baseGenotype, setBaseGenotype] = useState(undefined)
    const [genotype, setGenotype] = useState(INITIAL_GENOTYPE)

    //load existing genotypes to display them to users. 
    const {
        data: genotypeTagsByFeature,
        isLoading: genotypeByFeatureIsLoading,
        isFetching: genotypeByFeatureIsFetching } = useGetGenotypesByFeatureTags({ tags: genotype.features },
            {
                enabled: genotype.features.length > 0,
                staleTime: 30000
            })
    
    /**
     * @description Handles the input of text
     * @param {String} - Input key 
     * @param {String} value - The text/string value
     */
    const onTextInput = (key, value) => {
        setGenotype(prevValues => {return {...prevValues, [key] : value}})
    }
    
    /**
     * @description Handles the selection of a genotype in the genotype list. 
     * This will set the settings to the utilized genotype and allows the user to work from there. 
     * @param {String} genotype_tag
     */
    const onGenotypeSelect = (genotype_tag) => {
        console.log(genotype_tag)

    }

    /**
     * @description Add the selected feature to the genotype, this will trigger a search for genotypes that are using the selected
     * feature. 
     * @param {import("../../../types/feature").Feature} feature 
     */
    const onFeatureSelection = (feature) => {
        const mutation_tag = `${feature.tag}-1`
        setGenotype(prevValues => {
            return {
                ...prevValues,
                gene_modifications: { ...prevValues.gene_modifications, [feature.tag]: { mutations: { [mutation_tag] : {} }}},
                features: addItemToArrayOrRemoveIfPresentByTag({ array :  prevValues.features, item : feature}),
                proteome_tags : addStringToArrayIfNotPresent({array : prevValues.proteome_tags, string : feature.proteome_tag}),
                feature_tags: addStringToArrayOrRemove({ array: prevValues.feature_tags,  string : feature.tag })
            }
        })
    }

    //reset the genotype definition 
    const reset = () => {
        setGenotype(INITIAL_GENOTYPE)
    }


    return <div>
        <h3>Define Genotype</h3>
        <p></p>
        <div>Select the features that are modified in the genotype.</div>
        <TextInput hint="Description" value={genotype.description} callbackKey="description" placeholder="Short description of the genotype." onChange={onTextInput} /> 
        <TextInput hint="Publication" values={genotype.publication} callbackKey="publication" placeholder="Please enter the Pubmed id."onChange={onTextInput} /> 
        <FeatureInput
            selectedItems={genotype.features}
            allowUndefinedProteomes={true}
            onItemSelect={(attribute, feature) => onFeatureSelection(feature)} />
        
        <div className="flex">
            
            {genotype.feature_tags.map(feature_tag => <GeneModification {...{modification_tag : feature_tag, feature_tag, genotype, setGenotype}} />)}
            
        </div>
        <ButtonGroup>
            <Button icon="rocket" small text="Submit" intent="primary" />
            <Button icon="reset" small intent="danger" onClick={reset} />
            
        </ButtonGroup>
        <div>
            <GenotypeList
                tags={genotypeTagsByFeature}
                loading={genotypeByFeatureIsFetching || genotypeByFeatureIsLoading}
                onGenotypeSelect={onGenotypeSelect} /> 
        </div>
    </div>
}


    