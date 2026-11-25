import { useState } from "react";
import { useNavigate } from "react-router";
import _ from "lodash";
import moment from "moment";
import { api } from "@/api";
import { APIAxiosError } from "@/comps/core/base/states/APIError";

export const CURATOR_ROLE = 2;
export const STATE_CHANGE_ROLE = 3;

export const EXECUTION_STATUS_STYLE = {
    DRAFT: { color: "#8f99a8" },
    RUNNING: { color: "#c87619" },
    SUCCEEDED: { color: "#43a047" },
    FAILED: { color: "#cd4246" },
    ABORTED: { color: "#888" },
}

export const EXECUTION_STATE_TAGS = ["DRAFT", "RUNNING", "SUCCEEDED", "FAILED", "ABORTED"]

export const isUserAtLeast = (userRole, role) =>
    _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= role



export function formatExecutionTime(value) {
    return _.isNumber(value) ? moment.unix(value).format("YYYY-MM-DD HH:mm") : "–"
}

/**
 * @description Colored chip indicating the state of a procedure execution
 * (RUNNING / SUCCEEDED / FAILED / ABORTED), styled like the submission state
 * indicators: the background is the state color with a readable text color.
 */
export function ExecutionStateChip({ status, padding = "tiny" }) {
    const style = EXECUTION_STATUS_STYLE[status] || EXECUTION_STATUS_STYLE.RUNNING
    return <span title={status} className={`font-size--smallest div--round padding--${padding}`}
        style={{ color: "white", backgroundColor: style.color, whiteSpace: "nowrap" }}>
        {status}
    </span>
}

/**
 * @description Resolves a modular procedure tag to its title.
 */
/**
 * @description A tiny "x" button to remove an item from a list (e.g. to unlink a submission from a
 * modular procedure or to drop a pooled submission from an execution setup). Stands next to long
 * lists of tags so every entry can be removed right where it is listed. The click does not
 * propagate into the surrounding card (no accidental navigation).
 * @param {Object} props
 * @param {Function} props.onClick - Called when the button is clicked
 * @param {String} [props.title] - The tooltip text
 * @returns {JSX.Element} The tiny x button.
 */
export function TinyXButton({ onClick, title = "Remove" }) {
    return <button onClick={(event) => { event.stopPropagation(); onClick() }}
        title={title} aria-label={title}
        style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0.1rem",
            lineHeight: 0, color: "#888", fontSize: "0.85rem", fontWeight: 600 }}>
        &#215;
    </button>
}

export function ProcedureTitle({ procedure_tag }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 300000 })
    return <span>{_.isObject(procedure) && _.isString(procedure.title) ? procedure.title : procedure_tag}</span>
}

/**
 * @description Small chip resolving a protocol tag to its title, used to
 * visualize the utilized protocols of a modular procedure.
 */
export function ProtocolChip({ protocol_tag }) {
    const { data: protocol } = api.protocols.query.useGetProtocolByTag(
        { tag: protocol_tag }, { enabled: _.isString(protocol_tag), staleTime: 300000 })
    const title = _.isObject(protocol) && _.isString(protocol.title) ? protocol.title : protocol_tag
    return <span className="font-size--smallest div--round padding--tiny flex center-items gap--tiny"
        title={protocol_tag} style={{ color: "#5c7080", background: "#f5f8fa" }}>
        📄 {title}
    </span>
}

/**
 * @description State change buttons of a procedure execution for curators and
 * admins only (backend enforces the curator role). Finishing a RUNNING
 * execution frees the assigned submissions; finished executions can be
 * corrected. onDone is called after a successful change. If compact, short
 * labels (Successful / Failed / Aborted) are used as on the board.
 */
/**
 * The controls of a DRAFT execution: edit its saved setup on the setup page or delete it.
 * Drafts are setup work, not recorded facility history - started executions get the outcome
 * controls (ExecutionStateControls) instead.
 */
export function ExecutionDraftControls({ execution_tag, onDeleted }) {
    const navigate = useNavigate()
    const { mutate: deleteDraft, isPending: deleteIsPending, isError: deleteIsError, error: deleteError } =
        api.modularProcedures.execute.useDeleteExecutionDraft({
            onSuccess: () => { if (onDeleted) onDeleted() }
        })
    return <div className="flex center-items gap--tiny" style={{ flexShrink: 0 }}>
        <button className="basic-button basic-button--small"
            title="Continue the saved setup: plates, samples, transfer map, values"
            onClick={() => navigate(`/modular-procedures/setup/${execution_tag}`)}>Edit</button>
        <button className="basic-button basic-button--small"
            title="Delete this draft (only drafts can be deleted)"
            disabled={deleteIsPending}
            onClick={() => deleteDraft({ tag: execution_tag })}>Delete</button>
        {deleteIsError ? <span className="font-size--smallest" style={{ color: "#cd4246" }}>
            <APIAxiosError error={deleteError} /></span> : null}
    </div>
}

export function ExecutionStateControls({ execution_tag, status, compact = false, onDone }) {
    // drafts have no outcome controls: their setup is edited / deleted instead, the outcome
    // buttons only exist once the execution actually started running
    if (status === "DRAFT") return null
    const [blockWells, setBlockWells] = useState(status === "SUCCEEDED")
    const { mutate: finishExecution } = api.modularProcedures.execute.useFinishModularProcedureExecution({
        onSuccess: (updatedExecution) => { if (onDone) onDone(updatedExecution) }
    })
    const labels = compact ? { SUCCEEDED: "Successful", FAILED: "Failed", ABORTED: "Aborted" } : null
    const transitions = ["SUCCEEDED", "FAILED", "ABORTED"].filter((state) => state !== status)
    return <div className="flex center-items gap--tiny flex--wrap">
        <label title="Whether the output wells stay blocked after the change: keep them blocked if the
runs left them unusable (e.g. an aborted liquid handler run with dirty wells), unblock them if
the wells can be used again."
            className="flex center-items gap--tiny font-size--smallest" style={{ color: "#666" }}>
            <input type="checkbox" checked={blockWells} onChange={(e) => setBlockWells(e.target.checked)} />
            wells stay blocked
        </label>
        {transitions.map((state) =>
            <button key={state} className="basic-button basic-button--small"
                style={{ color: EXECUTION_STATUS_STYLE[state].color }}
                title={status === "RUNNING" ?
                    `Confirms the run as ${state}: frees the assigned submissions for the next procedure` :
                    `Corrects the outcome of this finished execution to ${state}`}
                onClick={() => finishExecution({ tag: execution_tag, outcome: state, block_output_wells: blockWells })}>
                {labels ? labels[state] : state}
            </button>)}
    </div>
}

export function WellTable({ wells, side }) {
    if (!_.isArray(wells) || wells.length === 0) {
        return <div className="font-size--small" style={{ color: "#888" }}>No {side} wells.</div>
    }
    return <table className="font-size--smallest" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th className="padding--little">Well</th>
                <th className="padding--little">Samples</th>
                {side === "input"
                    ? <th className="padding--little">Mapped to</th>
                    : <th className="padding--little">Condition applications</th>}
                <th className="padding--little">Values</th>
            </tr>
        </thead>
        <tbody>
            {wells.map((well) => <tr key={well.position} style={{ borderBottom: "1px solid #eee" }}>
                <td className="padding--little"><strong>{well.position}</strong></td>
                <td className="padding--little">{well.sample_tags?.length > 0 ? well.sample_tags.join(", ") : "–"}</td>
                {side === "input"
                    ? <td className="padding--little">{well.output_positions?.join(", ") || "–"}</td>
                    : <td className="padding--little">{well.condition_application_tags?.join(", ") || "–"}</td>}
                <td className="padding--little">
                    {well.metrics?.length > 0 ? well.metrics.map((metric) =>
                        <span key={metric.trait_tag} className="margin-right--little">
                            {`${metric.trait_tag}: ${metric.value}`}
                        </span>) : "–"}
                </td>
            </tr>)}
        </tbody>
    </table>
}

export function StateHistory({ execution_tag }) {
    const { data: states, isLoading, isError, error } =
        api.modularProcedures.execute.useGetModularProcedureExecutionStates({ tag: execution_tag })
    if (isLoading) return <div className="font-size--small" style={{ color: "#888" }}>Loading states ...</div>
    if (isError) return <APIAxiosError error={error} />
    return <ol className="font-size--smallest" style={{ paddingLeft: "1rem", margin: 0 }}>
        {states?.map((entry, index) => <li key={`${entry.state}-${index}`} className="flex center-items gap--tiny margin-top--tiny">
            <ExecutionStateChip status={entry.state} />
            <span style={{ color: "#666" }}>
                {entry.created_at ? formatExecutionTime(entry.created_at) : ""}
                {entry.user_tag ? ` by ${entry.user_tag}` : ""}
            </span>
        </li>)}
    </ol>
}

