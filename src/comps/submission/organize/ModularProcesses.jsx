import PropTypes from "prop-types"
import _ from "lodash"
import { useNavigate } from "react-router"
import { api } from "@/api"
import {
    ExecutionsPanel, SubmissionCard,
} from "@/comps/modularprocedures/ModularProcedureBoard"
import { TinyXButton } from "@/comps/modularprocedures/Shared"
import { ModularProcedureExecutionDialog } from "@/comps/modularprocedures/ModularProcedureExecutionDialog"
import { isUserAtLeast, STATE_CHANGE_ROLE } from "@/comps/modularprocedures/Shared"

ModularProcessColumn.propTypes = {
    procedure_tag: PropTypes.string.isRequired,
    isCurator: PropTypes.bool,
    canChangeState: PropTypes.bool,
    onExecute: PropTypes.func.isRequired,
    onMarkDone: PropTypes.func.isRequired,
    onReopen: PropTypes.func.isRequired,
}

/**
 * @description One column of the Modular Processes tab, in the same format as the state columns
 * of the Organize tab: the modular procedure as the header (title, version, number of assigned
 * submissions and their pending/done state), the executions of the module right below it, and
 * beneath that the assigned submissions with mark done / reopen (curators and admins).
 */
function ModularProcessColumn({ procedure_tag, isCurator, canChangeState, onExecute, onMarkDone, onReopen, onUnlink }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 300000, retry: false })
    const { data: submissions, refetch } = api.modularProcedures.query.useGetModularProcedureSubmissions(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 30000, retry: false })

    const nSubmissions = _.isArray(submissions) ? submissions.length : 0
    const nPending = _.isArray(submissions) ? submissions.filter((link) => !link.done).length : 0

    return <div style={{
        minWidth: "300px", width: "300px", border: "1px solid #ccc", borderRadius: "6px",
        background: "#fafafa", padding: "0.75rem", maxHeight: "75vh", overflowY: "auto"
    }}>
        <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "0.5rem" }}>
            <div className="flex justify-between center-items" style={{ gap: "0.5rem" }}>
                <div>
                    <strong>{procedure?.title || procedure_tag}</strong>
                    {_.isNumber(procedure?.version) && procedure.version > 1 ?
                        <span className="font-size--small" style={{ color: "#888" }}> v{procedure.version}</span> : null}
                </div>
                {isCurator ? <button className="basic-button basic-button--small basic-button--highlighted"
                    title="Set up a new execution draft of this module: input/output plates, sample placement, transfer map and per-well values"
                    onClick={onExecute}>Setup New</button> : null}
            </div>
            <div className="font-size--small" style={{ color: "#888" }}>
                {nSubmissions} submission{nSubmissions === 1 ? "" : "s"} in this module
                {nPending > 0 ? ` (${nPending} pending)` : ""}
            </div>
        </div>
        <ExecutionsPanel procedure_tag={procedure_tag} canChangeState={canChangeState} />
        {(_.isArray(submissions) ? submissions : []).map((link) =>
            <SubmissionCard key={link.submission_tag} link={link} isCurator={isCurator}
                onMarkDone={() => { onMarkDone({ tag: procedure_tag, submission_tag: link.submission_tag }, { onSuccess: refetch }) }}
                onReopen={() => { onReopen({ tag: procedure_tag, submission_tag: link.submission_tag }, { onSuccess: refetch }) }}
                onUnlink={canChangeState ? () => { onUnlink({ tag: procedure_tag, submission_tag: link.submission_tag }, { onSuccess: refetch }) } : null} />)}
        {nSubmissions === 0 ?
            <div className="font-size--small padding--little" style={{ color: "#888" }}>
                No submissions linked — assign one on the submission overview or in the admin area.
            </div> : null}
    </div>
}


/**
 * @description The Modular Processes tab of the submissions section: the same format as the
 * Organize tab, but grouped by workflow module instead of state — one column per modular
 * procedure with the executions of the module under the header and the assigned submissions
 * below. Curators and admins start the plate design ("Execute": input/output plates, sample
 * placement, transfer map and the per-well input values; "Setup New") directly from the column
 * header and can pool further submissions into the run there.
 * @param {Object} props
 * @param {Number} props.userRole The role of the signed-in user.
 * @param {String} props.userTag The tag of the signed-in user.
 * @returns {JSX.Element} The modular processes overview.
 */
export function ModularProcesses({ userRole, userTag }) {
    const navigate = useNavigate()
    const isCurator = isUserAtLeast(userRole, STATE_CHANGE_ROLE)

    const { data: procedure_tags, isLoading, isError, error } =
        api.modularProcedures.query.useGetModularProceduresByQuery(
            { status: "PUBLISHED", latest_only: true }, { staleTime: 60000, retry: false })

    const { mutate: markDone } = api.modularProcedures.modify.useMarkModularProcedureSubmissionDone()
    const { mutate: reopen } = api.modularProcedures.modify.useReopenModularProcedureSubmission()
    const { mutate: unlink } = api.modularProcedures.modify.useUnlinkModularProcedureFromSubmission()

    if (isLoading) return <div className="padding--medium">Loading modular processes ...</div>
    if (isError) return <div className="padding--medium">Modular processes not available.</div>

    return <div className="div--expand padding--medium">
        <div className="flex flex-column margin--medium padding--medium gap--medium-small">
            <h3>Modular Processes</h3>
            <p className="font-size--small" style={{ color: "#888" }}>
                The workflow modules of the submissions, in the format of the Organize tab: one column per modular
                procedure with its executions and the assigned submissions. <strong>Setup New</strong> designs the plate
                run of the module — input and output plates, sample placement, the transfer map (pooling and splitting)
                and the per-well input values; further submissions can be pooled into the run there.
                The outcomes (including corrections and whether the output wells stay blocked) are handled on the
                <button className="basic-button basic-button--small" style={{ marginLeft: "0.25rem" }}
                    onClick={() => navigate("/modular-procedures/executions")}>executions overview</button>.
            </p>
            {(_.isArray(procedure_tags) ? procedure_tags : []).length === 0 ?
                <div className="font-size--small" style={{ color: "#888" }}>
                    No published modular procedures yet — they are created under Admin / Modular Procedures.
                </div> : null}
        </div>
        <div className="flex" style={{ gap: "1rem", alignItems: "flex-start", overflowX: "auto", padding: "1rem" }}>
            {(_.isArray(procedure_tags) ? procedure_tags : []).map((procedure_tag) =>
                <ModularProcessColumn key={procedure_tag} procedure_tag={procedure_tag}
                    isCurator={isCurator} canChangeState={isCurator}
                    onExecute={() => navigate(`/modular-procedures/setup?procedure=${procedure_tag}`)}
                    onMarkDone={markDone} onReopen={reopen} onUnlink={unlink} />)}
        </div>
    </div>
}
