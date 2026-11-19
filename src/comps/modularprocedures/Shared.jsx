import { useState } from "react";
import _ from "lodash";
import moment from "moment";
import { api } from "@/api";

export const CURATOR_ROLE = 2;
export const STATE_CHANGE_ROLE = 3;

export const EXECUTION_STATUS_STYLE = {
    RUNNING: { color: "#c87619" },
    SUCCEEDED: { color: "#43a047" },
    FAILED: { color: "#cd4246" },
    ABORTED: { color: "#888" },
}

export const EXECUTION_STATE_TAGS = ["RUNNING", "SUCCEEDED", "FAILED", "ABORTED"]

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
export function ExecutionStateControls({ execution_tag, status, compact = false, onDone }) {
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
