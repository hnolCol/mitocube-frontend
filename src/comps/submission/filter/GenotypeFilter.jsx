import _ from "lodash"
import {  addStringToArrayOrRemove } from "../../../services/arrays/transforms"
import { GenotypeInput } from "../../core/input/api/GenotypeInput"
import { api } from "@/api"

export function GenotypeDatasetFilter({ setSubmissionFilter, submissionFilter }) {
    const onGenotypeSelection = (attribute, genotype_tag) => {

        setSubmissionFilter(prevValues => ({
            ...prevValues, 
            genotype_tag: addStringToArrayOrRemove({array : prevValues.genotype_tag, string : genotype_tag})
        }))
    
    }

    const handleRemove = (genotype_tag) => {
        
        setSubmissionFilter(prevValues => ({ 
            ...prevValues, 
            genotype_tag: prevValues.genotype_tag.filter(g => g !== genotype_tag)
        }))
    }

    return (
        <div style={{ width: "100%", paddingRight: "0.1rem", marginTop : "0.5rem"}}>
            <h4>Genotypes</h4>
            <span className="font-size--smallest" style={{ marginTop: "0.25rem", marginBottom: "0.5rem", display: "block" }}>
                Submissions in which the genotype was utilized will be displayed.
            </span>
            <GenotypeInput 
                selectedGenotypes={_.has(submissionFilter, "genotype_tag") && _.isArray(submissionFilter.genotype_tag) ? submissionFilter.genotype_tag : []} 
                onItemSelect={onGenotypeSelection}
                showSelection={false}
                usedInSubmissionOnly={true}
            />
            
            {/* Show selected genotypes below */}
            {_.has(submissionFilter, "genotype_tag") && _.isArray(submissionFilter.genotype_tag) && submissionFilter.genotype_tag.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                    {submissionFilter.genotype_tag.map(tag => (
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