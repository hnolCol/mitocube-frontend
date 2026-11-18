import { Alert, Callout } from "@blueprintjs/core";
import { useState } from "react";
import moment from "moment";
import _ from "lodash";
import { api } from "@/api";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { ModularProcedureExecutionDialog } from "./ModularProcedureExecutionDialog";
import { ModularProcedureExecutionMetricsDialog } from "./ModularProcedureExecutionMetricsDialog";

const CURATOR_ROLE = 2 // must match the backend user role encoding; curators and admins are >= 2

/**
 * Horizontal overview of the published modular procedures and the
 * submissions linked to them. Each column is a modular procedure, each card
 * a linked submission with its created_at date and done state.
 */
export function ModularProcedureBoard({ userRole, userTag }) {

    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const [alertProps, setAlertProps] = useState({ isOpen: false })
    const [executionDialogProps, setExecutionDialogProps] = useState({ isOpen: false, procedure_tag: null })
    const [metricsDialogProps, setMetricsDialogProps] = useState({ isOpen: false, procedure_tag: null })

    const { data: procedure_tags, isLoading, isError, error } =
        api.modularProcedures.query.useGetModularProceduresByQuery({ status: "PUBLISHED", latest_only: true })

    const { mutate: markDone, isError: doneIsError, error: doneError } =
        api.modularProcedures.modify.useMarkModularProcedureSubmissionDone()
    const { mutate: reopen } =
        api.modularProcedures.modify.useReopenModularProcedureSubmission()

    if (isLoading) return <div className="padding--medium">Loading modular procedures ...</div>
    if (isError) return <div className="padding--medium"><APIAxiosError error={error} /></div>

    return <div className="div--expand padding--medium">
        <Alert isOpen={alertProps.isOpen} intent="success" confirmButtonText="OK"
            onClose={() => setAlertProps({ isOpen: false })}>
            <p>{alertProps.message}</p>
        </Alert>
        {executionDialogProps.isOpen ?
            <ModularProcedureExecutionDialog
                procedure_tag={executionDialogProps.procedure_tag}
                isOpen={executionDialogProps.isOpen}
                onClose={() => setExecutionDialogProps({ isOpen: false, procedure_tag: null })}
                current_user_tag={userTag}
                onExecuted={() => {
                    setExecutionDialogProps({ isOpen: false, procedure_tag: null })
                    setAlertProps({ isOpen: true, message: "The execution is running. Confirm its outcome (successful / failed / aborted) in the executions section of the procedure: this frees the assigned submissions for the next procedure." })
                }} /> : null}
        {metricsDialogProps.isOpen ?
            <ModularProcedureExecutionMetricsDialog
                procedure_tag={metricsDialogProps.procedure_tag}
                isOpen={metricsDialogProps.isOpen}
                onClose={() => setMetricsDialogProps({ isOpen: false, procedure_tag: null })}
                onSaved={() => setMetricsDialogProps({ isOpen: false, procedure_tag: null })} /> : null}
        <div className="flex flex-column margin--medium padding--medium gap--medium-small">
            <h3>Modular Procedures</h3>
            <p className="font-size--small" style={{ color: "#888" }}>
                Facility workflow modules the submissions travel through. Each column shows the submissions
                assigned to the procedure with their assignment date and done state.
            </p>
            {doneIsError ? <APIAxiosError error={doneError} /> : null}
        </div>
        <div className="flex" style={{ gap: "1rem", alignItems: "flex-start", overflowX: "auto", padding: "1rem" }}>
            {procedure_tags?.length === 0 ?
                <Callout intent="warning" icon="warning-sign">
                    No published modular procedures yet.
                </Callout> :
                procedure_tags?.map((procedure_tag) =>
                    <ProcedureColumn key={procedure_tag} procedure_tag={procedure_tag}
                        isCurator={isCurator} onMarkDone={markDone} onReopen={reopen}
                        onExecute={() => setExecutionDialogProps({ isOpen: true, procedure_tag })}
                        onMetrics={() => setMetricsDialogProps({ isOpen: true, procedure_tag })} />)}
        </div>
    </div>
}

function ProcedureColumn({ procedure_tag, isCurator, onMarkDone, onReopen, onExecute, onMetrics }) {

    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag({ tag: procedure_tag })
    const { data: submissions, isLoading, refetch } =
        api.modularProcedures.query.useGetModularProcedureSubmissions({ tag: procedure_tag })

    return <div style={{
        minWidth: "280px", width: "280px", border: "1px solid #ccc", borderRadius: "6px",
        background: "#fafafa", padding: "0.5rem", maxHeight: "70vh", overflowY: "auto"
    }}>
        <div className="padding--little" style={{ borderBottom: "1px solid #ddd" }}>
            <div className="flex justify-between center-items">
                <h4 style={{ margin: 0 }}>{procedure?.title || procedure_tag}</h4>
                {isCurator ? <div className="flex" style={{ gap: "0.25rem" }}>
                    <button className="basic-button basic-button--small"
                        onClick={onExecute}>Execute</button>
                    <button className="basic-button basic-button--small"
                        onClick={onMetrics}>Metrics</button>
                </div> : null}
            </div>
            {procedure?.description ? <p className="font-size--small" style={{ color: "#666", margin: 0 }}>
                {procedure.description.substring(0, 120)}{procedure.description.length > 120 ? "..." : ""}
            </p> : null}
            {procedure?.protocol_tags?.length > 0 ? <div className="flex" style={{ gap: "0.25rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                {procedure.protocol_tags.map((protocol_tag) => <ProtocolLabel key={protocol_tag} protocol_tag={protocol_tag} />)}
            </div> : null}
            <ExecutionsPanel procedure_tag={procedure_tag} isCurator={isCurator} />
        </div>
        {isLoading ? <div className="padding--little">Loading ...</div> :
            submissions?.map((link) => <SubmissionCard key={link.submission_tag} link={link}
                isCurator={isCurator}
                onMarkDone={() => onMarkDone({ tag: procedure_tag, submission_tag: link.submission_tag }, { onSuccess: () => refetch() })}
                onReopen={() => onReopen({ tag: procedure_tag, submission_tag: link.submission_tag }, { onSuccess: () => refetch() })} />)}
        {submissions?.length === 0 ?
            <div className="padding--little font-size--small" style={{ color: "#888" }}>No submissions linked.</div> : null}
    </div>
}

function ProtocolLabel({ protocol_tag }) {
    const { data: protocol } = api.protocols.query.useGetProtocolByTag(
        { tag: protocol_tag }, { enabled: _.isString(protocol_tag), staleTime: 300000 })
    const title = _.isObject(protocol) && _.isString(protocol.title) ? protocol.title : protocol_tag
    return <span className="font-size--smallest" title={protocol_tag} style={{
        color: "#5c7080", border: "1px solid #cdcfd4", borderRadius: "4px", padding: "0 0.25rem",
        background: "#f5f8fa", display: "inline-flex", alignItems: "center", gap: "0.15rem"
    }}>📄 {title}</span>
}

const EXECUTION_STATUS_STYLE = {
    RUNNING: { color: "#c87619" },
    SUCCEEDED: { color: "#43a047" },
    FAILED: { color: "#cd4246" },
    ABORTED: { color: "#888" },
}

function ExecutionRow({ execution_tag, isCurator }) {
    const { data: execution } = api.modularProcedures.execute.useGetModularProcedureExecution(
        { tag: execution_tag }, { enabled: _.isString(execution_tag) })
    const { mutate: finishExecution } = api.modularProcedures.execute.useFinishModularProcedureExecution()
    const status = execution?.status || "RUNNING"
    const style = EXECUTION_STATUS_STYLE[status] || EXECUTION_STATUS_STYLE.RUNNING
    const finish = (outcome) => finishExecution({ tag: execution_tag, outcome })
    return <div className="flex center-items justify-between" style={{ gap: "0.25rem", margin: "0.25rem 0" }}>
        <span className="font-size--smallest" title={execution_tag}>{execution_tag}</span>
        <span className="font-size--smallest" style={{
            color: style.color, border: `1px solid ${style.color}`, borderRadius: "4px", padding: "0 0.25rem"
        }}>{status}</span>
        {isCurator && status === "RUNNING" ? <div className="flex" style={{ gap: "0.25rem" }}>
            <button className="basic-button basic-button--small" style={{ color: "#43a047" }}
                title="Confirms the run and frees the assigned submissions for the next procedure"
                onClick={() => finish("SUCCEEDED")}>Successful</button>
            <button className="basic-button basic-button--small" style={{ color: "#cd4246" }}
                title="Frees the assigned submissions but does not adopt condition applications or change the state"
                onClick={() => finish("FAILED")}>Failed</button>
            <button className="basic-button basic-button--small"
                onClick={() => finish("ABORTED")}>Aborted</button>
        </div> : null}
    </div>
}

function ExecutionsPanel({ procedure_tag, isCurator }) {
    const { data: execution_tags } = api.modularProcedures.execute.useGetModularProcedureExecutions(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag) })
    if (!_.isArray(execution_tags) || execution_tags.length === 0) return null
    return <div style={{ marginTop: "0.25rem", borderTop: "1px dashed #ddd", paddingTop: "0.25rem" }}>
        <div className="font-size--smallest" style={{ color: "#888" }}>Executions</div>
        {execution_tags.map((execution_tag) =>
            <ExecutionRow key={execution_tag} execution_tag={execution_tag} isCurator={isCurator} />)}
    </div>
}

function SubmissionCard({ link, isCurator, onMarkDone, onReopen, onMutated }) {

    const created_at = _.isNumber(link.created_at) ? moment.unix(link.created_at).format("YYYY-MM-DD HH:mm") : "–"
    const done_at = _.isNumber(link.done_at) ? moment.unix(link.done_at).format("YYYY-MM-DD HH:mm") : null

    return <div style={{
        border: "1px solid #ddd", borderRadius: "4px", background: "#fff",
        padding: "0.5rem", margin: "0.5rem 0"
    }}>
        <div className="flex justify-between center-items">
            <strong>{link.submission_tag}</strong>
            <span style={{
                color: link.done ? "#9d5bd2" : "#c87619", fontSize: "0.75rem",
                border: `1px solid ${link.done ? "#9d5bd2" : "#c87619"}`, borderRadius: "4px", padding: "0 0.25rem"
            }}>{link.done ? "done" : "pending"}</span>
        </div>
        <div className="font-size--small" style={{ color: "#666" }}>
            <div>linked: {created_at}</div>
            {link.done ? <div>done: {done_at}{link.done_by ? ` by ${link.done_by}` : ""}</div> : null}
        </div>
        {isCurator ? <div className="flex" style={{ gap: "0.5rem", marginTop: "0.25rem" }}>
            {!link.done ?
                <button className="basic-button basic-button--small" onClick={onMarkDone}>Mark done</button> :
                <button className="basic-button basic-button--small" onClick={onReopen}>Reopen</button>}
        </div> : null}
    </div>
}
