import _ from "lodash"
import { useMemo } from "react"
import { api } from "@/api"
import { FeatureDataView } from "../features/DataView"

/**
 * Shows all unique proteins that are connected to a condition application or genotype of the
 * submission's samples (e.g. knockdown, overexpression or immunoprecipitation targets) directly
 * with their quantification data of this submission (same feature data view as on the protein page),
 * so one can check directly in the QC whether the manipulation worked. Hidden entirely if no such
 * proteins exist.
 */
export function ManipulationTargets({ submission_tag }) {
    const { data: qcTargets, isError } = api.submissions.analysis.useGetSubmissionQCTargets(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: Infinity, retry: false }
    )

    const targets = useMemo(() => (_.isObject(qcTargets) && _.isArray(qcTargets.targets) ? qcTargets.targets : []), [qcTargets])

    // feature data is resolved by protein tag, same as on the protein page
    const featureTags = useMemo(() => targets.map(target => target.protein_tag).filter(_.isString), [targets])
    const submissionTags = useMemo(() => featureTags.map(() => submission_tag), [featureTags, submission_tag])

    // the endpoint answers 404 when no connected proteins exist - then this section is simply not shown
    if (isError || featureTags.length === 0) return null

    return <div>
        <h3>Manipulation targets</h3>
        <span className="font-size--small">
            Proteins connected to the genotypes or condition applications of this submission (e.g. knockdown, overexpression or immunoprecipitation targets). Check their data to verify that the manipulation worked.
        </span>
        <div className="margin-top--little">
            <FeatureDataView
                feature_tags={featureTags}
                submission_tags={submissionTags}
                showTitle={false}
                metrics={"raw"}
                layoutStorageKey={`qc-targets-${submission_tag}`}
            />
        </div>
    </div>
}
