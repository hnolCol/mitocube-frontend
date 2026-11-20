import PropTypes from "prop-types"
import _ from "lodash"
import { Spinner } from "@blueprintjs/core"
import { api } from "@/api"
import { overviewBoxStyle } from "@/comps/analysis/overview/overviewBoxStyle"
import { ExecutionStateChip, ProcedureTitle, formatExecutionTime } from "@/comps/modularprocedures/Shared"

SubmissionSampleLocations.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

/**
 * @description Shows where the samples of a submission are physically located: for every
 * sample the wells of its most recent procedure execution (input and output plate) with
 * the procedure and the execution state — the samples stay on the plate even if the run
 * failed or was aborted. Submissions whose samples were never placed show no box at all.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The sample locations container.
 */
export function SubmissionSampleLocations({ submission_tag }) {
    const { data: locations, isLoading } = api.modularProcedures.query.useGetSubmissionSampleLocations(
        { submission_tag }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false }
    )
    if (_.isArray(locations) && locations.length === 0) return null
    return <div className="container--shadow padding--little margin-top--little" style={overviewBoxStyle}>
        <div className="flex flex-column">
            <h3>Sample Locations</h3>
            {isLoading || !_.isArray(locations) ? <div className="flex center-items padding--medium"><Spinner size={20} /></div> :
                locations.map((location) => <div key={location.sample_tag} className="margin-top--little">
                    <div className="flex center-items gap--tiny">
                        <strong className="font-size--small">{location.sample_tag}</strong>
                        <span className="font-size--smallest" style={{ color: "#888" }}>
                            <ProcedureTitle procedure_tag={location.procedure_tag} />
                            {_.isNumber(location.created_at) ? ` · ${formatExecutionTime(location.created_at)}` : ""}
                        </span>
                        <ExecutionStateChip status={location.execution_status} />
                    </div>
                    <div className="font-size--smallest margin-left--little" style={{ color: "#666" }}>
                        {location.wells.map((well) => `${well.plate_tag} ${well.position} (${well.side.toLowerCase()})`).join(" · ")}
                    </div>
                </div>)}
        </div>
    </div>
}
