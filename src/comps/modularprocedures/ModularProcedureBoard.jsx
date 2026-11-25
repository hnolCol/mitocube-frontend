import { Callout } from "@blueprintjs/core";
import { useNavigate } from "react-router";
import moment from "moment";
import _ from "lodash";
import { api } from "@/api";
import { TinyXButton } from "@/comps/modularprocedures/Shared"
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import {
    CURATOR_ROLE, STATE_CHANGE_ROLE, ExecutionStateChip, ExecutionStateControls, ExecutionDraftControls,
    ProtocolChip, isUserAtLeast,
} from "./Shared";

/**
 * Horizontal overview of the published modular procedures and the
 * submissions linked to them. Each column is a modular procedure, each card
 * a linked submission with its created_at date and done state.
 */
export function ModularProcedureBoard({ userRole, userTag }) {

    const isCurator = isUserAtLeast(userRole, CURATOR_ROLE)
    const canChangeState = isUserAtLeast(userRole, STATE_CHANGE_ROLE)
    const navigate = useNavigate()

    const { data: procedure_tags, isLoading, isError, error } =
        api.modularProcedures.query.useGetModularProceduresByQuery({ status: "PUBLISHED", latest_only: true })

    const { mutate: markDone, isError: doneIsError, error: doneError } =
        api.modularProcedures.modify.useMarkModularProcedureSubmissionDone()
    const { mutate: reopen } =
        api.modularProcedures.modify.useReopenModularProcedureSubmission()

    if (isLoading) return <div className="padding--medium">Loading modular procedures ...</div>
    if (isError) return <div className="padding--medium"><APIAxiosError error={error} /></div>

    return <div className="div--expand padding--medium">
        <div className="flex flex-column margin--medium padding--medium gap--medium-small">
            <div className="flex justify-between center-items">
                <h3>Modular Procedures</h3>
                <button className="basic-button basic-button--small"
                    onClick={() => navigate("/modular-procedures/executions")}>Executions overview</button>
            </div>
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
                        isCurator={isCurator} canChangeState={canChangeState} onMarkDone={markDone} onReopen={reopen}
                        onSetupNew={() => navigate(`/modular-procedures/setup?procedure=${procedure_tag}`)} />)}
        </div>
    </div>
}

function ProcedureColumn({ procedure_tag, isCurator, canChangeState, onMarkDone, onReopen, onSetupNew }) {

    const navigate = useNavigate()
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
                        title="Create a new execution draft of this module and design it on the setup page"
                        onClick={onSetupNew}>Setup New</button>
                    <button className="basic-button basic-button--small"
                        title="The admin overview: the definition, status and full information of this module"
                        onClick={() => navigate("/admin/modular-procedures")}>Admin</button>
                </div> : null}
            </div>
            {procedure?.description ? <p className="font-size--small" style={{ color: "#666", margin: 0 }}>
                {procedure.description.substring(0, 120)}{procedure.description.length > 120 ? "..." : ""}
            </p> : null}
            {procedure?.protocol_tags?.length > 0 ? <div className="flex gap--tiny flex--wrap margin-top--little">
                {procedure.protocol_tags.map((protocol_tag) => <ProtocolChip key={protocol_tag} protocol_tag={protocol_tag} />)}
            </div> : null}
            <ExecutionsPanel procedure_tag={procedure_tag} canChangeState={canChangeState} />
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

function ExecutionRow({ execution_tag, canChangeState, onDone }) {
    const { data: execution } = api.modularProcedures.execute.useGetModularProcedureExecution(
        { tag: execution_tag }, { enabled: _.isString(execution_tag) })
    const status = execution?.status || "RUNNING"
    return <div className="flex center-items justify-between gap--tiny margin-top--tiny">
        <span className="font-size--smallest" title={execution_tag}>{execution_tag}</span>
        <ExecutionStateChip status={status} />
        {canChangeState ? (status === "DRAFT" ?
            <ExecutionDraftControls execution_tag={execution_tag} onDeleted={onDone} /> :
            <ExecutionStateControls execution_tag={execution_tag} status={status} compact onDone={onDone} />) : null}
    </div>
}

export function ExecutionsPanel({ procedure_tag, canChangeState }) {
    const { data: execution_tags, refetch: refetchExecutions } =
        api.modularProcedures.execute.useGetModularProcedureExecutions(
            { tag: procedure_tag }, { enabled: _.isString(procedure_tag) })
    if (!_.isArray(execution_tags) || execution_tags.length === 0) return null
    return <div className="margin-top--little" style={{ borderTop: "1px dashed #ddd", paddingTop: "0.25rem" }}>
        <div className="font-size--smallest" style={{ color: "#888" }}>Executions</div>
        {execution_tags.map((execution_tag) =>
            <ExecutionRow key={execution_tag} execution_tag={execution_tag} canChangeState={canChangeState}
                onDone={refetchExecutions} />)}
    </div>
}

export function SubmissionCard({ link, isCurator, onMarkDone, onReopen, onUnlink }) {

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
        {isCurator ? <div className="flex center-items" style={{ gap: "0.5rem", marginTop: "0.25rem" }}>
            {!link.done ?
                <button className="basic-button basic-button--small" onClick={onMarkDone}>Mark done</button> :
                <button className="basic-button basic-button--small" onClick={onReopen}>Reopen</button>}
            {onUnlink ? <TinyXButton title="Unassign this submission from the module" onClick={onUnlink} /> : null}
        </div> : null}
    </div>
}
