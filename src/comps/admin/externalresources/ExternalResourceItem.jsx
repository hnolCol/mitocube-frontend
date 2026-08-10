import { api } from "@/api"
import _ from "lodash"

const TYPE_LABELS = {
    crosslink_resource: "External Crosslink Resource",
    in_lab_experiment: "Internal Experiment",
    other: "Other",
}

function getTypeLabel(resource) {
    if (TYPE_LABELS[resource.type]) return TYPE_LABELS[resource.type]
    if (resource.external) return "External Resource"
    return resource.type
}

export function ExternalResourceItem({ tag }) {
    const { data: resource, isSuccess } = api.crosslinks.externalresources.useGetExternalResourceByTag({ tag })
    const { data: conditionTexts } = api.crosslinks.externalresourcesModify.useGetExternalResourceConditionApplications({ tag })

    if (!isSuccess || !resource) {
        return null
    }

    const hasConditions = _.isArray(conditionTexts) && conditionTexts.filter(Boolean).length > 0

    const resourceUrl = resource.link || (resource.doi ? "https://doi.org/" + resource.doi : null)
    const resourceUrlLabel = resource.link || resource.doi

    return (
        <div className="flex justify-space-between align-start" style={{ width: "100%", backgroundColor: "#fff", border: "1px solid #eee", borderRadius: "6px", padding: "1rem 1.2rem" }}>
            <div className="flex flex-column" style={{ gap: "0.45rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{resource.title}</span>

                <div className="flex flex-column" style={{ gap: "0.2rem", fontSize: "0.82rem" }}>
                    {resource.author ? (
                        <span><strong>Author:</strong> {resource.author}</span>
                    ) : null}

                    {resource.publication_date ? (
                        <span><strong>Year:</strong> {resource.publication_date}</span>
                    ) : null}

                    {resourceUrl ? (
                        <span>
                            <strong>Link:</strong>{" "}
                            <a href={resourceUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                {resourceUrlLabel}
                            </a>
                        </span>
                    ) : null}

                    {hasConditions ? (
                        <span><strong>Experimental Conditions:</strong> {conditionTexts.filter(Boolean).join(", ")}</span>
                    ) : null}
                </div>
            </div>

            <div className="flex align-center" style={{ gap: "0.5rem", flexShrink: 0 }}>
                <span style={{ fontSize: "0.7rem", color: "#666", backgroundColor: "#f2f2f2", borderRadius: "4px", padding: "0.2rem 0.5rem" }}>
                    {getTypeLabel(resource)}
                </span>
            </div>
        </div>
    )
}