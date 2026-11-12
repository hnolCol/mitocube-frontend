import _ from "lodash"
import { ResearchGroupInput } from "@/comps/core/input/api/ResearchGroupInput"
import { ResearchGroupText } from "@/comps/admin/researchgroup/ResearchGroupText"

/**
 * @description Searchable filter for research groups. Selecting a group
 * adds/removes its tag in submissionFilter.research_group_tags, which is sent to the
 * backend submissions query to restrict the submissions to submissions created by
 * members of the selected research groups. Renders nothing if the user is not
 * authenticated.
 * @param {Object} props
 * @param {Object} props.submissionFilter Current submission filter state
 * @param {Function} props.setSubmissionFilter Setter of the submission filter state
 * @param {Object} props.authenticationStatus Authentication status of the current user
 * @returns {JSX.Element|null} The research group filter.
 */
export function ResearchGroupFilter({ submissionFilter, setSubmissionFilter, authenticationStatus }) {
    if (!authenticationStatus?.isAuth) return null

    const selected = submissionFilter.research_group_tags ?? []

    const toggle = (tag) => {
        setSubmissionFilter(prev => {
            const current = prev.research_group_tags ?? []
            const next = current.includes(tag) ? _.without(current, tag) : [...current, tag]
            if (next.length === 0) {
                const { research_group_tags, ...rest } = prev
                return rest
            }
            return { ...prev, research_group_tags: next }
        })
    }

    const handleRemove = (tag) => {
        setSubmissionFilter(prev => {
            const next = (prev.research_group_tags ?? []).filter(t => t !== tag)
            if (next.length === 0) {
                const { research_group_tags, ...rest } = prev
                return rest
            }
            return { ...prev, research_group_tags: next }
        })
    }

    return (
        <div style={{ width: "100%", paddingRight: "0.1rem" }}>
            <ResearchGroupInput
                selected_rg_tags={selected}
                onSelect={toggle}
                placeholder={selected.length > 0 ? `${selected.length} Research Group(s) Selected` : "Search Research Groups ..."}
            />
            {selected.length > 0 && (
                <div className="margin-top--little">
                    {selected.map(tag => (
                        <ResearchGroupFilterDisplay key={tag} tag={tag} onRemove={() => handleRemove(tag)} />
                    ))}
                </div>
            )}
        </div>
    )
}

function ResearchGroupFilterDisplay({ tag, onRemove }) {
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
                <ResearchGroupText research_group_tag={tag} />
            </div>
            <button
                onClick={onRemove}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#666", padding: "0 0.5rem" }}
            >
                ×
            </button>
        </div>
    )
}
