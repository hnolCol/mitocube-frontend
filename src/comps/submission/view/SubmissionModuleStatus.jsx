import PropTypes from "prop-types"
import _ from "lodash"
import moment from "moment"
import { Spinner, Tag } from "@blueprintjs/core"
import { api } from "@/api"
import { UserFullName } from "@/comps/core/input/api/UserInput"
import { overviewBoxStyle } from "@/comps/analysis/overview/overviewBoxStyle"

SubmissionModuleStatus.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

/**
 * @description Shows the workflow module status of a submission in the submission overview:
 * the active modular procedure (the open link, if any) and the history of modules the
 * submission has already passed (done links with completion date and user). Submissions
 * that are not linked to any module show no box at all.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The workflow module status container.
 */
export function SubmissionModuleStatus({ submission_tag }) {
    const { data: links, isLoading } = api.modularProcedures.query.useGetSubmissionModularProcedures(
        { submission_tag }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false }
    )
    const activeLinks = _.isArray(links) ? links.filter((link) => !link.done) : []
    const doneLinks = _.isArray(links) ? links.filter((link) => link.done) : []
    // submissions that are not linked to any module show no box at all
    if (_.isArray(links) && links.length === 0) return null
    return <div className="container--shadow padding--little margin-top--little" style={overviewBoxStyle}>
        <div className="flex flex-column">
            <h3>Workflow Modules</h3>
            {isLoading ? <div className="flex center-items padding--medium"><Spinner size={20} /></div> : <>
                {links !== undefined && !_.isArray(links) ? <div className="font-size--small">Not available.</div> : <>
                    {activeLinks.length === 0 && doneLinks.length === 0 ?
                        <div className="font-size--small">This submission is not linked to a workflow module yet.</div> : null}
                    {activeLinks.length > 0 ? <div className="flex flex-column" style={{ gap: "0.25rem" }}>
                        <div className="font-size--small" style={{ color: "#888" }}>Active module</div>
                        {activeLinks.map((link) => <ModuleLinkRow key={link.procedure_tag} link={link} active={true} />)}
                    </div> : null}
                    {doneLinks.length > 0 ? <div className="flex flex-column margin-top--little" style={{ gap: "0.25rem" }}>
                        <div className="font-size--small" style={{ color: "#888" }}>Module history</div>
                        {doneLinks.map((link) => <ModuleLinkRow key={link.procedure_tag} link={link} active={false} />)}
                    </div> : null}
                </>}
            </>}
        </div>
    </div>
}

ModuleLinkRow.propTypes = {
    link: PropTypes.object.isRequired,
    active: PropTypes.bool
}

/**
 * @description One row of the workflow module box: the procedure title with a state tag
 * (active or done), the link date and, for done links, the completion date and user.
 */
function ModuleLinkRow({ link, active }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: link.procedure_tag }, { enabled: _.isString(link.procedure_tag), staleTime: 300000, retry: false }
    )
    return <div className="flex center-items" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
        <Tag minimal={true} round={true}
            intent={active ? "primary" : "success"}
            icon={active ? "play" : "tick"}>
            {active ? "active" : "done"}
        </Tag>
        <strong>{procedure?.title || link.procedure_tag}</strong>
        {_.isNumber(procedure?.version) && procedure.version > 1 ?
            <span className="font-size--small" style={{ color: "#888" }}>v{procedure.version}</span> : null}
        {active && _.isNumber(link.created_at) ?
            <span className="font-size--small" style={{ color: "#888" }}>linked {formatTimestamp(link.created_at)}</span> : null}
        {!active && _.isNumber(link.done_at) ?
            <span className="font-size--small" style={{ color: "#888" }}>completed {formatTimestamp(link.done_at)}</span> : null}
        {!active && _.isString(link.done_by) ?
            <span className="font-size--small" style={{ color: "#888" }}>by <UserFullName tag={link.done_by} /></span> : null}
    </div>
}

function formatTimestamp(timestamp) {
    return moment.unix(timestamp).format("YYYY-MM-DD HH:mm")
}
