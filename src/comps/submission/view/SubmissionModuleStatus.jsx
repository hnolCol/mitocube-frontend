import PropTypes from "prop-types"
import { useState } from "react"
import _ from "lodash"
import moment from "moment"
import { Button, Dialog, DialogBody, DialogFooter, Spinner, Tag } from "@blueprintjs/core"
import { api } from "@/api"
import { UserFullName } from "@/comps/core/input/api/UserInput"
import { overviewBoxStyle } from "@/comps/analysis/overview/overviewBoxStyle"
import { isUserAtLeast, STATE_CHANGE_ROLE } from "@/comps/modularprocedures/Shared"
import { APIAxiosError } from "@/comps/core/base/states/APIError"

SubmissionModuleStatus.propTypes = {
    submission_tag: PropTypes.string.isRequired,
    userRole: PropTypes.number
}

/** Option label of the assign module dialog: resolves the procedure title on demand. */
function ProcedureOptionLabel({ procedure_tag }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 300000, retry: false })
    return `${procedure?.title || procedure_tag}${_.isNumber(procedure?.version) && procedure.version > 1 ? ` (v${procedure.version})` : ""}`
}

/**
 * Dialog that assigns the submission to a published modular procedure (the submission-centric
 * entry point of the workflow: pick submission -> assign module -> design the execution).
 * Curators and admins only; the option list contains the published procedures only (latest
 * version per lineage, retired ones are excluded by their status).
 */
function AssignModuleDialog({ submission_tag, isOpen, onClose }) {
    const [procedureTag, setProcedureTag] = useState("")
    const { data: procedure_tags } = api.modularProcedures.query.useGetModularProceduresByQuery(
        { status: "PUBLISHED", latest_only: true }, { enabled: isOpen, staleTime: 60000 })
    const { mutate: linkSubmission, isPending, isError, error, reset } =
        api.modularProcedures.modify.useLinkModularProcedureToSubmission()

    const handleAssign = () => {
        if (!_.isString(procedureTag) || procedureTag.length === 0) return
        linkSubmission({ tag: procedureTag, submission_tag }, {
            onSuccess: () => { reset(); setProcedureTag(""); onClose(true) }
        })
    }

    return <Dialog isOpen={isOpen} onClose={() => { reset(); onClose(false) }}
        title="Assign workflow module" icon="flows" style={{ width: 420 }}>
        <DialogBody>
            <p className="font-size--small">
                Assign <strong>{submission_tag}</strong> to a published workflow module.
                The submission is then processed by this module — its samples can be placed in the
                module's executions on the workflow board, and a successful run marks the module done.
                A submission can only have one open module at a time.
            </p>
            <select className="text-input" style={{ width: "100%" }} value={procedureTag}
                onChange={(e) => setProcedureTag(e.target.value)}>
                <option value="">Select a published module ...</option>
                {(_.isArray(procedure_tags) ? procedure_tags : []).map((tag) =>
                    <option key={tag} value={tag}>
                        <ProcedureOptionLabel procedure_tag={tag} />
                    </option>)}
            </select>
            {isError ? <APIAxiosError error={error} /> : null}
        </DialogBody>
        <DialogFooter actions={<>
            <Button text="Cancel" onClick={() => { reset(); onClose(false) }} />
            <Button intent="primary" icon="flows" text="Assign" loading={isPending}
                disabled={!procedureTag} onClick={handleAssign} />
        </>} />
    </Dialog>
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
export function SubmissionModuleStatus({ submission_tag, userRole }) {
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const { data: links, isLoading } = api.modularProcedures.query.useGetSubmissionModularProcedures(
        { submission_tag }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false }
    )
    const isCurator = isUserAtLeast(userRole, STATE_CHANGE_ROLE)
    const activeLinks = _.isArray(links) ? links.filter((link) => !link.done) : []
    const doneLinks = _.isArray(links) ? links.filter((link) => link.done) : []
    // submissions that are not linked to any module show no box - unless the user could assign one
    if (_.isArray(links) && links.length === 0 && !isCurator) return null
    return <div className="container--shadow padding--little margin-top--little" style={overviewBoxStyle}>
        <div className="flex flex-column">
            <div className="flex center-items justify-between" style={{ gap: "0.5rem" }}>
                <h3>Workflow Modules</h3>
                {isCurator ? <button className="basic-button basic-button--small"
                    onClick={() => setAssignDialogOpen(true)}>
                    Assign module
                </button> : null}
            </div>
            <AssignModuleDialog submission_tag={submission_tag} isOpen={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)} />
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
