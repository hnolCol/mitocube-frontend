import { useState } from "react"
import _ from "lodash"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { GenotypeInput } from "../../core/input/api/GenotypeInput"
import { api } from "@/api"

export function GenotypeDatasetFilter({ setSubmissionFilter, submissionFilter }) {
    const [genotypeSelection, setGenotypeSelection] = useState({ selectedGenotypes: [] })
    
    const onGenotypeSelection = (attribute, item) => {
        const newArray = addItemToArrayOrRemoveItIfPresent({
            array: genotypeSelection.selectedGenotypes, 
            item
        })
        
        setGenotypeSelection(prevValues => ({
            ...prevValues, 
            selectedGenotypes: newArray
        }))
        
        setSubmissionFilter(prevValues => ({ 
            ...prevValues, 
            genotype_tag: newArray 
        }))
    }

    const handleRemove = (genotypeTag) => {
        const newArray = genotypeSelection.selectedGenotypes.filter(g => g !== genotypeTag)
        
        setGenotypeSelection(prevValues => ({
            ...prevValues, 
            selectedGenotypes: newArray
        }))
        
        setSubmissionFilter(prevValues => ({ 
            ...prevValues, 
            genotype_tag: newArray 
        }))
    }

    return (
        <div style={{ width: "100%", paddingRight: "0.1rem" }}>
            <h4>Genotypes</h4>
            <GenotypeInput 
                selectedGenotypes={genotypeSelection.selectedGenotypes} 
                onItemSelect={onGenotypeSelection}
                showSelection={false}
            />
            <div className="font-size--smallest" style={{ marginTop: "0.25rem" }}>
                Datasets in which the genotype was utilized will be displayed.
            </div>
            
            {/* Show selected genotypes below */}
            {genotypeSelection.selectedGenotypes.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                    {genotypeSelection.selectedGenotypes.map(tag => (
                        <GenotypeDisplay key={tag} tag={tag} onRemove={() => handleRemove(tag)} />
                    ))}
                </div>
            )}
        </div>
    )
}

function GenotypeDisplay({ tag, onRemove }) {
    const { data: genotypeText } = api.genotypes.queryGenotypes.useGetGenotypeText(
        { genotype_tag: tag }, 
        { staleTime: 300000, enabled: !!tag }
    )

    return (
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "3px"
        }}>
            <div style={{ fontWeight: "500" }}>
                {genotypeText || tag}
            </div>
            <button
                onClick={onRemove}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    color: "#666",
                    padding: "0 0.5rem"
                }}
            >
                ×
            </button>
        </div>
    )
}