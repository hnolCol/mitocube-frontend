
import hooks from "@mitocube/api-hooks"
import { useEffect, useState } from "react"
import { AddButton } from "../base/buttons/AddButton"
import { getRandomID } from "../../../services/random"
import { RemoveButton } from "../base/buttons/RemoveButton"
import { InsertGeneticApplication } from "./InsertGeneticApplication"
import { findAndInsertTree, findChildrenByPath, findNode, deleteByPath } from '../../submission/new/sample_attributes/select/SamplesAttributeWrapper';
import _ from "lodash"
import APIError from "../error/APIerror"
import { HIGHLIGHT_COLOR } from "../colors/colorPalette"




const INITIAL_GENOTYPE = { text: "", description: "", publication: "", components: [] } 
/**
 * InsertGenotype components. 
 * @returns 
 */
export function InsertEditGenotype({ onClose, isEditing = false, tag, preSelectedTraits = [], preText = "", preDescription = "", prePublication = "" }) {

    const [genotype, setGenotype] = useState(INITIAL_GENOTYPE)
    const [selectedTraits, setSelectedTraits] = useState([])
    const { mutate : postGenotype, isLoading, isError, error, isSuccess }  = hooks.genotypes.usePostGenotype()
    const { mutate : updateGenotype, isLoading : isUpdateLoading } = hooks.genotypes.useEditGenotype()


    useEffect(() => {

        if (isEditing && _.isArray(preSelectedTraits) && preSelectedTraits.length > 0) {
            setGenotype(prevValues => { return { ...prevValues, 
                text : preText,
                description : preDescription,
                publication : prePublication, 
                components : preSelectedTraits.map(ca => { return {"referenceID" : ca.id}}) } })
            setSelectedTraits(preSelectedTraits)
        }
    }, [isEditing])
   
    
    const handleTraitSelection = (trait_tag, referenceID) => {
        let selected_traits = selectedTraits.slice() //mission.selected_traits
        findAndInsertTree(selected_traits, [
            { "type": "attribute", "tag": 'att_gene_engineering', 'id': referenceID },
            { "type": "trait", "tag": trait_tag, "id": referenceID }], 0, true, false, false)

        setSelectedTraits(selected_traits)
    }



    const getTraitSelection = (referenceID) => {
        const selectedTrait = getSelectionByPath([{ "type": "attribute", "tag": 'att_gene_engineering', 'id' : referenceID }])
        if (_.isArray(selectedTrait) && selectedTrait.length > 0) {
            return selectedTrait[0].tag
        }
        return undefined
    }

    const handleSelection = (path, _ , single_child_level = 5) => {
        let selected_traits = selectedTraits.slice() //mission.selected_traits
        findAndInsertTree(selected_traits, path, single_child_level, true, true, true, 0)
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
            tag: tag,
            text: genotype.text,
            description: genotype.description,
            publication: genotype.publication,
            components: selectedTraits
        }
        postGenotype(data, {
            onSuccess: (response) => {
                const genotype_tag = response?.tag
            
                setGenotype(INITIAL_GENOTYPE)
                setSelectedTraits([])
            
                onClose()

            },
            onError: (error) => {
                console.error("Failed to insert genotype", error)
            }
        })
    }

    const editGenotype = () => {
        const data = {
            tag: tag,
            text: genotype.text,
            description: genotype.description,
            publication: genotype.publication,
            components: selectedTraits.slice()
        }


        updateGenotype(data, {
            onSuccess: (newTag) => {
                onClose(true, newTag)
            }
        })
    }


    console.log(selectedTraits)

    
    return (
        <div className="flex flex-column div--expand margin--medium padding--medium" style={{ gap: "0.4rem"}}>
            <h3>{isEditing?"Genotype Editing":"Genotype Insertion"}</h3>
            <span>Genotypes are defined by <strong>genetic components</strong>. A component is for example a specific gene knock out, while a knockout and a re-expression of the protein (WT) would be in total two components.</span>
            <span> Multiple point mutations must also be defined in multiple components (one for each mutation). </span>
            <div className="flex flex-column" style={{gap : "0.5rem"}}>
                <input className="text-input" type="text" value={genotype.text} placeholder="Enter genotype name that describes all components" onChange={(e) => setGenotype(prevValues => ({ ...prevValues, text: e.target.value }))} />
                <input className="text-input" type="text" value={genotype.description} placeholder="Enter genotype description/information" onChange={(e) => setGenotype(prevValues => ({ ...prevValues, description: e.target.value }))} />
                <input className="text-input" type="text" value={genotype.publication} placeholder="Enter genotype external reference (e.g. PMID) if applicable." onChange={(e) => setGenotype(prevValues => ({ ...prevValues, publication: e.target.value }))} />
            </div>
            <div className="flex center-items"><div>
                <span>Insert component</span></div><div className="flex flex-column"><AddButton onSelect={() => setGenotype(prevValues => { return { ...prevValues, components: [...prevValues.components, { "referenceID": getRandomID(5) }] } })} /></div>
            </div>
            <div className="margin--medium" style={{color: HIGHLIGHT_COLOR}}>{isSuccess && genotype.components.length === 0 ? <h3>Genotype inserted successfully!</h3> : null}</div>
            <div>{isError ? <APIError error={error} /> : null}</div>
           <div className="div--expand flex flex-column " style={{justifyContent: "space-between"}}>
            <div className="flex" style={{ gap: "1rem", flexWrap: "wrap", overflowY: "scroll" }}>
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
                    <button className="dialog-button" style={{backgroundColor : "#ec7160ff"}} onClick={onClose}>Close</button>
                    {isEditing ?
                        <button className="dialog-button"  disabled={isUpdateLoading} onClick={editGenotype}>{isUpdateLoading  ? "Editing..." : "Edit"}</button> :
                        <button className="dialog-button"  disabled={isLoading} onClick={insertGenotype}>{isLoading ? "Inserting..." : "Insert"}</button> }
                </div>
                </div>
            

         
        
        </div>
    )
}