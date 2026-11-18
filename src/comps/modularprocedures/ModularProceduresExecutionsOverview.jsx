import { Alert, Callout, Tag } from "@blueprintjs/core";
import { useState } from "react";
import moment from "moment";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import useDebounce from "@/hooks/useDebounce";

const CURATOR_ROLE = 3 // must match the backend user role encoding: only curators (3) and admins (4) may change the execution state

const EXECUTION_STATUS_STYLE = {
    RUNNING: { color: "#c87619", intent: "warning" },
    SUCCEEDED: { color: "#43a047", intent: "success" },
    FAILED: { color: "#cd4246", intent: "danger" },
    ABORTED: { color: "#888", intent: "none" },
}

const formatTime = (value) => _.isNumber(value) ? moment.unix(value).format("YYYY-MM-DD HH:mm") : "–"

function StateChip({ status }) {
    const style = EXECUTION_STATUS_STYLE[status] || EXECUTION_STATUS_STYLE.RUNNING
    return <span title={status} style={{
        color: style.color, border: `1px solid ${style.color}`, borderRadius: "4px",
        padding: "0 0.35rem", fontSize: "0.75rem", whiteSpace: "nowrap"
    }}>{status}</span>
}

function ProcedureTitle({ procedure_tag }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 300000 })
    return <span>{_.isObject(procedure) && _.isString(procedure.title) ? procedure.title : procedure_tag}</span>
}

function WellTable({ wells, side }) {
    if (!_.isArray(wells) || wells.length === 0) return <div className="font-size--small" style={{ color: "#888" }}>No {side} wells.</div>
    return <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.75rem" }}>
        <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th style={{ padding: "0.25rem" }}>Well</th>
                <th style={{ padding: "0.25rem" }}>Samples</th>
                {side === "input" ? <th style={{ padding: "0.25rem" }}>Mapped to</th> : <th style={{ padding: "0.25rem" }}>Condition applications</th>}
                <th style={{ padding: "0.25rem" }}>Values</th>
            </tr>
        </thead>
        <tbody>
            {wells.map((well) => <tr key={well.position} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.25rem" }}><strong>{well.position}</strong></td>
                <td style={{ padding: "0.25rem" }}>
                    {well.sample_tags?.length > 0 ? well.sample_tags.join(", ") : "–"}
                </td>
                {side === "input" ?
                    <td style={{ padding: "0.25rem" }}>{well.output_positions?.join(", ") || "–"}</td> :
                    <td style={{ padding: "0.25rem" }}>{well.condition_application_tags?.join(", ") || "–"}</td>}
                <td style={{ padding: "0.25rem" }}>
                    {well.metrics?.length > 0 ? well.metrics.map((metric) =>
                        <span key={metric.trait_tag} style={{ marginRight: "0.35rem" }}>
                            {`${metric.trait_tag}: ${metric.value}`}
                        </span>) : "–"}
                </td>
            </tr>)}
        </tbody>
    </table>
}

function StateHistory({ execution_tag }) {
    const { data: states, isLoading, isError, error } =
        api.modularProcedures.execute.useGetModularProcedureExecutionStates({ tag: execution_tag })
    if (isLoading) return <div className="font-size--small" style={{ color: "#888" }}>Loading states ...</div>
    if (isError) return <APIAxiosError error={error} />
    return <ol style={{ paddingLeft: "1rem" }}>
        {states?.map((entry, index) => <li key={`${entry.state}-${index}`} className="font-size--small">
            <StateChip status={entry.state} />
            <span style={{ color: "#666", marginLeft: "0.35rem" }}>
                {entry.created_at ? formatTime(entry.created_at) : ""}{entry.user_tag ? ` by ${entry.user_tag}` : ""}
            </span>
        </li>)}
    </ol>
}

function ExecutionDetails({ execution, canChangeState, onNavigateToProcedure, onStateChanged }) {
    const { mutate: finishExecution, isError: finishIsError, error: finishError } =
        api.modularProcedures.execute.useFinishModularProcedureExecution({
            onSuccess: () => { if (onStateChanged) onStateChanged() }
        })
    const status = execution?.status
    const transitions = ["SUCCEEDED", "FAILED", "ABORTED"].filter((state) => state !== status)
    return <div className="flex flex-column" style={{ gap: "0.5rem", borderTop: "1px solid #ddd", paddingTop: "0.75rem" }}>
        {finishIsError ? <APIAxiosError error={finishError} /> : null}
        <div className="flex center-items justify-between" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
            <h4 style={{ margin: 0 }}>Execution {execution.tag}</h4>
            {canChangeState ?
                <div className="flex center-items" style={{ gap: "0.25rem" }}>
                    <span className="font-size--small" style={{ color: "#888" }}>Change state:</span>
                    {transitions.map((state) =>
                        <button key={state} className="basic-button basic-button--small"
                            style={{ color: (EXECUTION_STATUS_STYLE[state] || {}).color }}
                            title={status === "RUNNING" ?
                                `Confirms the run as ${state}: frees the assigned submissions for the next procedure` :
                                `Corrects the outcome of this finished execution to ${state}`}
                            onClick={() => finishExecution({ tag: execution.tag, outcome: state })}>
                            {state}
                        </button>)}
                </div> : null}
        </div>
        <StateHistory execution_tag={execution.tag} />
        <div className="flex" style={{ gap: "1rem", flexWrap: "wrap", fontSize: "0.75rem", color: "#666" }}>
            <span>Procedure: <ProcedureTitle procedure_tag={execution.procedure_tag} /> <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToProcedure(execution.procedure_tag) }}>open board column</a></span>
            <span>Input plate: {execution.input_plate_tag}</span>
            <span>Output plate: {execution.output_plate_tag}</span>
            <span>Responsible: {execution.responsible_user_tag || "–"}</span>
            <span>Created: {formatTime(execution.created_at)} by {execution.user_tag}</span>
        </div>
        {execution.finish_comment ? <div className="font-size--small" style={{ color: "#666" }}>Comment: {execution.finish_comment}</div> : null}
        <div>
            <h5 style={{ margin: "0.25rem 0" }}>Input plate details</h5>
            <WellTable wells={execution.input_wells} side="input" />
        </div>
        <div>
            <h5 style={{ margin: "0.25rem 0" }}>Output plate details</h5>
            <WellTable wells={execution.output_wells} side="output" />
        </div>
    </div>
}

/**
 * Dashboard-style overview of all modular procedure executions the user may see:
 * every execution with its state (and state history), a search for a submission,
 * and all details that were entered for the input and output plates (samples,
 * per-well values and metrics, condition applications). Only curators and admins
 * see the state change controls; standard users only see their own submissions'
 * data (the backend masks everything else).
 */
export function ModularProceduresExecutionsOverview({ userRole }) {
    const navigate = useNavigate()
    const canChangeState = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const [alertProps, setAlertProps] = useState({ isOpen: false })
    const [searchString, setSearchString] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selectedTag, setSelectedTag] = useState(null)

    const debouncedSearch = useDebounce(searchString, 300)

    const { data: executions, isLoading, isError, error } =
        api.modularProcedures.execute.useQueryModularProcedureExecutions({
            search_submission_tag: debouncedSearch.length > 0 ? debouncedSearch : null,
            status: statusFilter.length > 0 ? statusFilter : null,
        })
    const { data: selectedExecution, isError: selectedIsError, error: selectedError, refetch: refetchSelected } =
        api.modularProcedures.execute.useGetModularProcedureExecution(
            { tag: selectedTag }, { enabled: _.isString(selectedTag) })

    const handleSelect = (tag) => setSelectedTag(selectedTag === tag ? null : tag)

    return <div className="div--expand padding--medium">
        <Alert isOpen={alertProps.isOpen} intent="success" confirmButtonText="OK"
            onClose={() => setAlertProps({ isOpen: false })}>
            <p>{alertProps.message}</p>
        </Alert>
        <div className="flex flex-column margin--medium padding--medium gap--medium-small">
            <div className="flex justify-between center-items">
                <h3 style={{ margin: 0 }}>Modular Procedure Executions</h3>
                <button className="basic-button basic-button--small"
                    onClick={() => navigate("/modular-procedures")}>Back to the board</button>
            </div>
            <p className="font-size--small" style={{ color: "#888" }}>
                All executions of the facility's workflow modules with their states and the data of the
                input and output plates. {canChangeState ?
                    "As curator you can change the state of an execution (successful / failed / aborted)." :
                    "The state is managed by curators."}
            </p>
            <div className="flex center-items" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                <input className="text-input" type="text" placeholder="Search for a submission tag ..."
                    value={searchString} onChange={(e) => setSearchString(e.target.value)}
                    style={{ minWidth: "280px" }} />
                <select className="text-input" value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All states</option>
                    {["RUNNING", "SUCCEEDED", "FAILED", "ABORTED"].map((state) =>
                        <option key={state} value={state}>{state}</option>)}
                </select>
                {searchString.length > 0 || statusFilter.length > 0 ?
                    <button className="basic-button basic-button--small"
                        onClick={() => { setSearchString(""); setStatusFilter("") }}>Clear</button> : null}
                <Tag minimal intent="primary">{executions?.length ?? 0} execution(s)</Tag>
            </div>
        </div>
        {isLoading ? <div className="padding--medium">Loading executions ...</div> :
            isError ? <div className="padding--medium"><APIAxiosError error={error} /></div> :
            <div className="padding--medium" style={{ overflowX: "auto" }}>
                {executions?.length === 0 ? <Callout intent="warning" icon="warning-sign">
                    No executions visible{searchString.length > 0 ? " for this search. You may not have access to this submission." : " yet."}
                </Callout> : <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.8rem" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
                            <th style={{ padding: "0.4rem" }}>Procedure</th>
                            <th style={{ padding: "0.4rem" }}>Execution</th>
                            <th style={{ padding: "0.4rem" }}>State</th>
                            <th style={{ padding: "0.4rem" }}>Input plate</th>
                            <th style={{ padding: "0.4rem" }}>Output plate</th>
                            <th style={{ padding: "0.4rem" }}>Wells</th>
                            <th style={{ padding: "0.4rem" }}>Responsible</th>
                            <th style={{ padding: "0.4rem" }}>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {executions.map((execution) => <tr key={execution.tag}
                            onClick={() => handleSelect(execution.tag)}
                            style={{
                                borderBottom: "1px solid #eee",
                                background: selectedTag === execution.tag ? "#e8f4fd" : undefined,
                                cursor: "pointer"
                            }}>
                            <td style={{ padding: "0.4rem" }}><ProcedureTitle procedure_tag={execution.procedure_tag} /></td>
                            <td style={{ padding: "0.4rem" }}>{execution.tag}</td>
                            <td style={{ padding: "0.4rem" }}><StateChip status={execution.status} /></td>
                            <td style={{ padding: "0.4rem" }}>{execution.input_plate_tag}</td>
                            <td style={{ padding: "0.4rem" }}>{execution.output_plate_tag}</td>
                            <td style={{ padding: "0.4rem" }}>{execution.n_input_wells} → {execution.n_output_wells}</td>
                            <td style={{ padding: "0.4rem" }}>{execution.responsible_user_tag || "–"}</td>
                            <td style={{ padding: "0.4rem" }}>{formatTime(execution.created_at)}</td>
                        </tr>)}
                    </tbody>
                </table>}
            </div>}
        {selectedIsError ? <div className="padding--medium"><APIAxiosError error={selectedError} /></div> : null}
        {_.isObject(selectedExecution) ?
            <ExecutionDetails execution={selectedExecution} canChangeState={canChangeState}
                onNavigateToProcedure={() => {
                    setSelectedTag(null)
                    navigate("/modular-procedures")
                }}
                onStateChanged={() => refetchSelected()} /> : null}
    </div>
}
