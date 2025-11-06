
import hooks from "@mitocube/api-hooks"
import { useState } from "react"
import { AddButton } from "../base/buttons/AddButton"
import { getRandomID } from "../../../services/random"
import { RemoveButton } from "../base/buttons/RemoveButton"
import { InsertGeneticApplication } from "./InsertGeneticApplication"
import { findAndInsertTree, findChildrenByPath, findNode, deleteByPath } from '../../submission/new/sample_attributes/select/SamplesAttributeWrapper';
import _ from "lodash"


const INITIAL_GENOTYPE = { text: "", description: "", publication: "", components: [] } 
/**
 * InsertGenotype components. 
 * @returns 
 */
export function InsertGenotype({ }) {

    const [genotype, setGenotype] = useState(INITIAL_GENOTYPE)
    const [selectedTraits, setSelectedTraits] = useState([])
    const { mutate : postGenotype, isLoading, isError, isSuccess }  = hooks.genotypes.usePostGenotype()
        
   
    
    const handleTraitSelection = (trait_tag, referenceID) => {
        let selected_traits = selectedTraits.slice() //mission.selected_traits
        findAndInsertTree(selected_traits, [{ "type": "attribute", "tag": 'att_gene_engineering', 'id' : referenceID }, { "type": "trait", "tag": trait_tag, "id": referenceID }], 0, true, false, false)
        
        setSelectedTraits(selected_traits)
    }

    const getTraitSelection = (referenceID) => {
        const selectedTrait = getSelectionByPath([{ "type": "attribute", "tag": 'att_gene_engineering', 'id' : referenceID }])
        if (_.isArray(selectedTrait) && selectedTrait.length > 0) {
            return selectedTrait[0].tag
        }
        return undefined
    }

    const handleSelection = (path) => {

        let selected_traits = selectedTraits.slice() //mission.selected_traits
        findAndInsertTree(selected_traits, path, 3, true, true, false, 0)
        setSelectedTraits(selected_traits)
    }


    const getSelectionByPath = (path) => {
        let selected_traits = selectedTraits.slice() //mission.selected_traits
        const selection = findChildrenByPath(selected_traits, path)
        return selection
    }

    /**
     * Clear genotype or specific component by referenceID
     * @param {String} referenceID 
     */
    const handleClear = (referenceID) => {

        if (referenceID === undefined)
        {
            let selected_traits = selectedTraits.slice()
            deleteByPath(selected_traits, [{ "type": "attribute", "tag": 'att_gene_engineering', 'id' : referenceID }])
            setGenotype(INITIAL_GENOTYPE)
            setSelectedTraits(selected_traits)
        }
        
        else setGenotype(prevValues => {
            return {
                ...prevValues,
                components: prevValues.components.filter(c => c.referenceID !== referenceID)
            }
        })
    }

    const checkAttributeRequiredTraits = (attribute_tag, trait_tags, referenceID) => {
        let selected_traits = selectedTraits.slice()
        const foundNode = trait_tags.map(trait_tag => findNode(selected_traits, "trait", trait_tag, referenceID))
        return _.some(foundNode)
    }


    const handleRemoveByPath = (path) => {
        if (!_.isArray(path)) return
        let selected_traits = selectedTraits.slice() //mission.selected_traits
        //delete by path
        deleteByPath(selected_traits, path)
        setSelectedTraits(selected_traits)
    }


    const insertGenotype = () => {

        const data = {
            text: genotype.text,
            description: genotype.description,
            publication: genotype.publication,
            components: selectedTraits.slice()
        }
        console.log(selectedTraits.slice())
        postGenotype(data, {
            onSuccess: (response) => {
                // reset form state on success
                setGenotype(INITIAL_GENOTYPE)
                setSelectedTraits([])
                // optionally show a toast or close a dialog here
            },
            onError: (error) => {
                console.error("Failed to insert genotype", error)
            }
        })
    }
        
    return (
        <div className="flex flex-column div--expand margin--medium padding--medium" style={{ gap: "0.4rem" }}>
            <h3>Genotype Insertion</h3>
            <span>Genotypes are defined by <strong>genetic components</strong>. A component is for example a specific gene knock out, while a knockout and a re-expression of the protein (WT) would be in total two components.</span>
            <span> Multiple point mutations must also be defined in multiple components (one for each mutation). </span>
            <div className="flex flex-column" style={{gap : "0.5rem"}}>
                <input className="text-input" type="text" placeholder="Enter genotype name that describes all components" onChange={(e) => setGenotype(prevValues => ({ ...prevValues, text: e.target.value }))} />
                <input className="text-input" type="text" placeholder="Enter genotype description/information" onChange={(e) => setGenotype(prevValues => ({ ...prevValues, description: e.target.value }))} />
                <input className="text-input" type="text" placeholder="Enter genotype external reference (e.g. PMID) if applicable." onChange={(e) => setGenotype(prevValues => ({ ...prevValues, publication: e.target.value }))} />
            </div>
            <div className="flex center-items"><div>
                <span>Insert component</span></div><div className="flex flex-column"><AddButton onSelect={() => setGenotype(prevValues => {return {...prevValues, components: [...prevValues.components, {"referenceID" : getRandomID(5)}]}})}/></div></div>
           <span>{isSuccess && genotype.components.length === 0 ? <span>Genotype inserted successfully!</span> : null}</span>
            <div className="flex" style={{gap : "1rem", flexWrap : "wrap"}}>
                {genotype.components.map((component, idx) => {
                    return (
                        <div className="padding--medium bg--lightgrey flex flex-column"
                            key={`$${component.referenceID}-${idx}`}
                            style={{ borderRadius: "5px", minWidth: "200px" }}>
                            
                            <div className="flex justify-space-between" ><div>{idx + 1}. Genetic Applications</div><RemoveButton onRemove={() => handleClear(component.referenceID)} /></div>
                            
                            <InsertGeneticApplication
                                handleRemoveByPath={handleRemoveByPath}
                                selectedTraits={selectedTraits}
                                handleTraitSelection={handleTraitSelection}
                                getSelectionByPath={getSelectionByPath}
                                getTraitSelection={getTraitSelection}
                                handleSelection={handleSelection}
                                checkAttributeRequiredTraits={checkAttributeRequiredTraits}
                                referenceID={component.referenceID} />
                        </div>
                    )
                })}
            </div> 
            <div className="flex justify-end">
                <button className="dialog-button" disabled={isLoading} onClick={insertGenotype}>{isLoading ? "Inserting..." : "Insert"}</button>
                <button className="dialog-button">Close</button>
            </div>
            

         
        
        </div>
    )
}
