import { api } from "@/api"
import { Tag } from "@blueprintjs/core"

export function PhenotypeAssociationItem({ tag, showDetails = false }) {
    const { data: association } = api.phenotypes.associations.useGetPhenotypeAssociation(
        { tag },
        { enabled: !!tag }
    )

    const { data: disease } = api.diseases.query.useGetDisease(
        { tag: association?.disease_tag },
        { enabled: !!association?.disease_tag, staleTime: Infinity }
    )

    const { data: genotypeText } = api.genotypes.queryGenotypes.useGetGenotypeText(
        { genotype_tag: association?.genotype_tag },
        { enabled: !!association?.genotype_tag, staleTime: Infinity }
    )

    if (!association) return null

    const primaryLabel = association.description || "—"

    const secondaryLabel = disease?.text || association.disease_text || null
    
    return (
        <div className="flex flex-column padding--medium" style={{ width: "100%" }}>

            <div className="flex justify-space-between align-center" style={{ width: "100%", gap: "1rem" }}>
                <div className="flex flex-column" style={{ gap: "0.1rem", flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "0.9rem" }}>{primaryLabel}</span>
                    {secondaryLabel && (
                        <span style={{ fontSize: "0.78rem", color: "#777" }}>{secondaryLabel}</span>
                    )}
                </div>
                <div className="flex align-center" style={{ gap: "0.4rem", flexShrink: 0 }}>
                    {/* {association.genotype_tag && (
                        <Tag minimal intent="warning">
                            {genotypeText || association.genotype_tag}
                        </Tag>
                    )} */}
                    {association.variant_tag && (
                        <Tag minimal intent="danger" title="Linked ClinVar variant">ClinVar</Tag>
                    )}
                </div>
            </div>

            {showDetails && (
                <table style={{ width: "fit-content", fontSize: "0.75rem", textAlign: "left", marginTop: "0.5rem" }}>
                    <tbody>
                        {association.phenotype_tag && (
                            <tr>
                                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Phenotype</th>
                                <td>{association.phenotype_tag}</td>
                            </tr>
                        )}
                        {association.description && (
                            <tr>
                                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Description</th>
                                <td>{association.description}</td>
                            </tr>
                        )}
                        {association.observation_notes && (
                            <tr>
                                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Observation notes</th>
                                <td>{association.observation_notes}</td>
                            </tr>
                        )}
                        {association.att_protein_mutation && (
                            <tr>
                                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Mutation</th>
                                <td>{association.att_protein_mutation}</td>
                            </tr>
                        )}
                        {association.genotype_tag && (
                            <tr>
                                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Genotype</th>
                                <td>{genotypeText || association.genotype_tag}</td>
                            </tr>
                        )}
                        {(disease?.text || association.disease_tag) && (
                            <tr>
                                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Disease</th>
                                <td>{disease?.text ?? association.disease_tag}</td>
                            </tr>
                        )}
                        {association.variant_tag && (
                            <tr>
                                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>ClinVar variant</th>
                                <td>{association.variant_tag}</td>
                            </tr>
                        )}
                        {association.publication && (
                            <tr>
                                <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Publication</th>
                                <td>{association.publication}</td>
                            </tr>
                        )}
                        <tr>
                            <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Created</th>
                            <td>{association.created_at ? new Date(association.created_at).toLocaleDateString() : "—"}</td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    )
}