import _ from "lodash"
import { useMemo } from "react"
import { useNavigate } from "react-router"
import { api } from "@/api"
import { usePrefetchProteins } from "@/api/orchestrated/proteins"

/**
 * Lists all unique proteins that are connected to a condition application or genotype of the
 * submission's samples (e.g. knockdown, overexpression or immunoprecipitation targets), so one
 * can directly check whether the manipulation worked. Hidden entirely if no such proteins exist.
 */
export function ManipulationTargets({ submission_tag }) {
    const navigate = useNavigate()

    const { data: qcTargets, isError } = api.submissions.analysis.useGetSubmissionQCTargets(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: Infinity, retry: false }
    )

    const targets = useMemo(() => (_.isObject(qcTargets) && _.isArray(qcTargets.targets) ? qcTargets.targets : []), [qcTargets])

    const proteinTags = useMemo(() => targets.map(target => target.protein_tag).filter(_.isString), [targets])
    const { tagQueries } = usePrefetchProteins(proteinTags)

    const geneNameByTag = useMemo(() => {
        const map = new Map()
        proteinTags.forEach((tag, idx) => {
            const data = tagQueries[idx]?.data
            if (_.isObject(data) && _.isString(data.gene_name) && data.gene_name.length > 0) map.set(tag, data.gene_name)
        })
        return map
    }, [proteinTags, tagQueries])

    // the endpoint answers 404 when no connected proteins exist - then this section is simply not shown
    if (isError || targets.length === 0) return null

    return <div>
        <h3>Manipulation targets</h3>
        <span className="font-size--small">
            Proteins connected to the genotypes or condition applications of this submission (e.g. knockdown, overexpression or immunoprecipitation targets). Check their abundance to verify that the manipulation worked.
        </span>
        <div className="flex flex--wrap margin-top--little" style={{ gap: "0.3rem" }}>
            {targets.map(target => {
                const geneName = geneNameByTag.get(target.protein_tag) ?? target.protein_tag
                return <div key={target.protein_tag}
                    className="flex center-items font-size--small"
                    style={{ cursor: "pointer", gap: "0.3rem", padding: "0.2rem 0.5rem", backgroundColor: "#e1e5e9", border: "1px solid #c1c7cd", borderRadius: "8px" }}
                    onClick={() => navigate(`/protein/${target.protein_tag}`)}>
                    <strong>{geneName}</strong>
                    {(_.isArray(target.sources) ? target.sources : []).map(source => (
                        <span key={`${source.type}-${source.tag}`} className="font-size--smallest" style={{ color: "#495057" }}>
                            {_.isString(source.text) && source.text.length > 0 ? source.text : source.tag}
                        </span>
                    ))}
                </div>
            })}
        </div>
    </div>
}
