import { Alert, Button, Callout, Dialog, DialogBody, DialogFooter, Intent, Tag } from "@blueprintjs/core";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import _ from "lodash";
import { useNavigate } from "react-router";
import { api } from "@/api";
import { apiClient } from "@/api/client";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { UserFullName } from "@/comps/core/input/api/UserInput";
import useDebounce from "@/hooks/useDebounce";
import {
    ExecutionPlateExportDialog, downloadMetricsTemplate, parseMetricsFile, parseMetricsClipboard,
} from "@/comps/modularprocedures/ModularProcedureExecutionDialog";
import {
    ExecutionStateChip, ExecutionStateControls, ProcedureTitle, ProcedureOptionTitle, formatExecutionTime,
    isUserAtLeast, STATE_CHANGE_ROLE, EXECUTION_STATE_TAGS, StateHistory, WellTable, ExecutionDraftControls,
} from "./Shared";

function ExecutionDetails({ execution, canChangeState, onStateChanged, onDeleted }) {
    const [exportSide, setExportSide] = useState(null)
    const [valuesDialogOpen, setValuesDialogOpen] = useState(false)
    return <div className="flex flex-column gap--small" style={{ borderTop: "1px solid #ddd", paddingTop: "0.75rem" }}>
        <div className="flex center-items justify-between gap--tiny flex--wrap">
            <div className="flex center-items gap--tiny">
                <h4 style={{ margin: 0 }}>Execution {execution.tag}</h4>
                <ExecutionStateChip status={execution.status} />
            </div>
            {canChangeState && execution.status !== "DRAFT" ?
                <div className="flex" style={{ alignItems: "center", whiteSpace: "nowrap" }}>
                    <ExecutionStateControls execution_tag={execution.tag} status={execution.status} compact
                        done_submission_tags={execution.done_submission_tags} onDone={onStateChanged} />
                </div> : null}
            {canChangeState && execution.status === "DRAFT" ?
                <ExecutionDraftControls execution_tag={execution.tag} onDeleted={onDeleted} /> : null}
        </div>
        <StateHistory execution_tag={execution.tag} />
        <div className="flex font-size--smallest flex--wrap gap--tiny" style={{ color: "#666" }}>
            <span className="flex center-items gap--tiny">Procedure: <ProcedureTitle procedure_tag={execution.procedure_tag} /></span>
            <span>Input plate: {execution.input_plate_tag}</span>
            <span>Output plate: {execution.output_plate_tag}</span>
            <span>Responsible: {_.isString(execution.responsible_user_tag) ?
                <UserFullName tag={execution.responsible_user_tag} /> : "–"}</span>
            <span>Created: {formatExecutionTime(execution.created_at)} by {execution.user_tag}</span>
        </div>
        {execution.finish_comment ? <div className="font-size--small" style={{ color: "#666" }}>Comment: {execution.finish_comment}</div> : null}
        <div>
            <div className="flex center-items justify-between">
                <h5 style={{ margin: "0.25rem 0" }}>Input plate details</h5>
                <button className="basic-button basic-button--small"
                    title="Download the sample -> well table of the input plate like the runlist export"
                    onClick={() => setExportSide("input")}>Export input plate</button>
            </div>
            <WellTable wells={execution.input_wells} side="input" />
        </div>
        <div>
            <div className="flex center-items justify-between">
                <h5 style={{ margin: "0.25rem 0" }}>Output plate details</h5>
                <div className="flex center-items gap--tiny">
                    {canChangeState && (execution.status === "RUNNING" || execution.status === "SUCCEEDED") ?
                        <button className="basic-button basic-button--small"
                            title="Record the measured result values on the output wells - often only known after the run succeeded"
                            onClick={() => setValuesDialogOpen(true)}>Measured values</button> : null}
                    <button className="basic-button basic-button--small"
                        title="Download the sample -> well table of the output plate like the runlist export"
                        onClick={() => setExportSide("output")}>Export output plate</button>
                </div>
            </div>
            <WellTable wells={execution.output_wells} side="output" />
            {canChangeState ? <ExecutionWellValuesDialog execution={execution} isOpen={valuesDialogOpen}
                onClose={() => setValuesDialogOpen(false)} onSaved={onStateChanged} /> : null}
        </div>
        <ExecutionPlateExportDialog isOpen={_.isString(exportSide)} side={exportSide}
            execution={execution} onClose={() => setExportSide(null)} />
    </div>
}

/**
 * Dashboard-style overview of all modular procedure executions the user may see:
 * every execution with its state and state history, a search for a submission
 * and all details that were entered for the input and output plates (samples,
 * per-well values and metrics, condition applications). Only curators and
 * admins see the state change controls; standard users only see their own
 * submissions' data — the backend masks everything else.
 */
/**
 * Dialog to record the measured result values on the output wells of a running or successfully
 * finished execution: the values of the procedure's declared result attributes often can only be
 * read out after the run (e.g. the concentration after a digestion). Same template/upload format
 * as the setup page (well, attribute_tag, trait_tag, value); setting a value twice updates it.
 */
function ExecutionWellValuesDialog({ execution, isOpen, onClose, onSaved }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: execution.procedure_tag }, { enabled: isOpen })
    const { mutate: setMetrics, isPending, isError, error } =
        api.modularProcedures.execute.useSetModularProcedureExecutionMetrics()
    const attributeTags = _.isArray(procedure?.output_attribute_tags) ? procedure.output_attribute_tags : []
    const traitQueries = useQueries({
        queries: attributeTags.map((attribute_tag) => ({
            queryKey: ["traitsByTag", attribute_tag, 100],
            queryFn: () => apiClient.get(`/attributes/${attribute_tag}/traits`, { params: { tag: attribute_tag, limit: 100 } })
                .then((response) => response.data),
            staleTime: 300000, retry: false, enabled: isOpen,
        }))
    })
    const traitsByAttribute = _.fromPairs(_.zip(attributeTags,
        traitQueries.map((query) => (_.isArray(query.data) ? query.data : []))))
    const allowedTraits = _.flatten(_.values(traitsByAttribute))
    const traitToAttribute = _.fromPairs(_.flatten(attributeTags.map((attribute_tag) =>
        (traitsByAttribute[attribute_tag] || []).map((trait_tag) => [trait_tag, attribute_tag]))))
    const [traitSelection, setTraitSelection] = useState({})
    const [uploadError, setUploadError] = useState(null)
    const [clipboardText, setClipboardText] = useState("")
    const [pastedMetrics, setPastedMetrics] = useState(null)
    const outputPositions = (execution.output_wells || []).map((well) => well.position)
    const selectedTraitPairs = _.compact(attributeTags.map((attribute_tag) =>
        traitSelection[attribute_tag] ? { attribute_tag, trait_tag: traitSelection[attribute_tag] } : null))

    const handleUpload = (event) => {
        setUploadError(null)
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const parsed = parseMetricsFile(String(reader.result), allowedTraits, traitToAttribute)
                const unknown = parsed.filter((metric) => !outputPositions.includes(metric.position))
                if (unknown.length > 0)
                    throw new Error(`Wells in the file are not output wells of this execution: ${unknown.map((metric) => metric.position).join(", ")}`)
                setMetrics({ tag: execution.tag, well_metrics: parsed.map((metric) => ({ ...metric, side: "OUTPUT" })) },
                    { onSuccess: () => { if (onSaved) onSaved(); onClose() } })
            } catch (e) {
                setUploadError(e.message)
            }
        }
        reader.readAsText(file)
        event.target.value = ""
    }

    return <Dialog style={{ width: "min(850px, 80vw)" }} isOpen={isOpen} onClose={onClose}
        title={`Measured result values — ${execution.tag}`} canOutsideClickClose={false} canEscapeKeyClose={true}>
        <DialogBody>
            {attributeTags.length === 0 ? <Callout intent="warning" icon="warning-sign">
                This module does not declare result attributes (output attributes) — there is nothing to record.
            </Callout> : <div className="flex flex-column gap--small">
                <div className="font-size--small">
                    The result values of the declared attributes — often only readable after the run.
                    Select the trait (unit) per attribute, download the template, fill in the value per
                    line and upload it. Setting a value twice updates it.
                </div>
                {attributeTags.map((attribute_tag) =>
                    <div key={attribute_tag} className="flex center-items gap--small">
                        <span className="font-size--small" style={{ fontWeight: 600 }}>{attribute_tag}:</span>
                        <select className="text-input" style={{ width: "auto" }}
                            value={traitSelection[attribute_tag] || ""}
                            onChange={(e) => setTraitSelection((prev) => ({ ...prev, [attribute_tag]: e.target.value || null }))}>
                            <option value="">Select trait ...</option>
                            {(traitsByAttribute[attribute_tag] || []).map((trait_tag) =>
                                <option key={trait_tag} value={trait_tag}>{trait_tag}</option>)}
                        </select>
                    </div>)}
                <div className="flex center-items gap--small">
                    <button className="basic-button basic-button--small" disabled={selectedTraitPairs.length === 0 || outputPositions.length === 0}
                        onClick={() => downloadMetricsTemplate(outputPositions, selectedTraitPairs, "execution_result_values_template.txt")}>
                        Template
                    </button>
                    <label className={`basic-button basic-button--small ${selectedTraitPairs.length === 0 ? "basic-button--excluded" : ""}`}
                        style={{ cursor: selectedTraitPairs.length === 0 ? "not-allowed" : "pointer" }}>
                        {isPending ? "Saving..." : "Upload values"}
                        <input type="file" accept=".txt,.tsv,.csv" disabled={selectedTraitPairs.length === 0 || isPending}
                            style={{ display: "none" }} onChange={handleUpload} />
                    </label>
                </div>
                <div className="flex flex-column gap--tiny">
                    <div className="font-size--smallest" style={{ color: "#888" }}>
                        ... or paste rows copied from Excel: well&nbsp;+&nbsp;value (select the trait first),
                        well&nbsp;+&nbsp;trait&nbsp;+&nbsp;value, or the template's four columns — a "well" header row is
                        detected automatically, and a single values column fills the output wells in order.
                    </div>
                    <textarea className="text-input padding--tiny font-size--small" rows={3}
                        style={{ width: "100%" }} placeholder="A1<TAB>2.5" value={clipboardText}
                        onChange={(event) => { setClipboardText(event.target.value); setPastedMetrics(null); setUploadError(null) }} />
                    <div className="flex center-items gap--tiny">
                        <button className="basic-button basic-button--small" disabled={clipboardText.trim().length === 0}
                            onClick={() => {
                                setUploadError(null)
                                setPastedMetrics(null)
                                try {
                                    const parsed = parseMetricsClipboard(clipboardText, {
                                        wellPositions: outputPositions,
                                        selectedTraitPairs, allowedTraits, traitToAttribute })
                                    if (parsed.length === 0) throw new Error("No values found in the pasted rows.")
                                    setPastedMetrics(parsed)
                                } catch (e) { setUploadError(e.message) }
                            }}>Parse pasted values</button>
                        {pastedMetrics ? <span className="font-size--small">
                            {pastedMetrics.length} value(s): {pastedMetrics.map((metric) =>
                                `${metric.position}=${metric.value}`).join(", ")}
                        </span> : null}
                        {pastedMetrics ? <button className="basic-button basic-button--small basic-button--highlighted"
                            disabled={isPending}
                            onClick={() => setMetrics({ tag: execution.tag,
                                well_metrics: pastedMetrics.map((metric) => ({
                                    position: metric.position, trait_tag: metric.trait_tag,
                                    value: metric.value, side: "OUTPUT" })) },
                                { onSuccess: () => { if (onSaved) onSaved(); onClose() } })}>
                            {isPending ? "Saving..." : "Save pasted values"}
                        </button> : null}
                    </div>
                </div>
                {uploadError ? <div className="font-size--small font-color--error">{uploadError}</div> : null}
                {isError ? <APIAxiosError error={error} /> : null}
                <div>
                    <div className="font-size--small" style={{ fontWeight: 600, margin: "0.25rem 0" }}>Recorded values</div>
                    {(execution.output_wells || []).filter((well) => (well.metrics || []).length > 0).map((well) =>
                        <div key={well.position} className="flex center-items gap--tiny font-size--small">
                            <strong>{well.position}</strong>
                            {well.metrics.map((metric) =>
                                <span key={`${metric.trait_tag}`} className="margin-right--little">
                                    {`${metric.trait_tag}: ${metric.value}`}
                                </span>)}
                        </div>)}
                </div>
            </div>}
        </DialogBody>
        <DialogFooter><Button text="Close" onClick={onClose} /></DialogFooter>
    </Dialog>
}

export function ModularProceduresExecutionsOverview({ userRole }) {
    const navigate = useNavigate()
    const canChangeState = isUserAtLeast(userRole, STATE_CHANGE_ROLE)
    const [alertProps, setAlertProps] = useState({ isOpen: false })
    const [searchString, setSearchString] = useState("")
    const [plateFilter, setPlateFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selectedTag, setSelectedTag] = useState(null)
    const [newDraftDialogOpen, setNewDraftDialogOpen] = useState(false)
    const [newDraftProcedureTag, setNewDraftProcedureTag] = useState("")
    const debouncedSearch = useDebounce(searchString, 300)
    const debouncedPlateFilter = useDebounce(plateFilter, 300)

    const { data: procedure_tags } = api.modularProcedures.query.useGetModularProceduresByQuery(
        { status: "PUBLISHED", latest_only: true }, { enabled: newDraftDialogOpen, staleTime: 60000 })
    const { mutate: createDraft, isPending: createDraftIsPending, isError: createDraftIsError, error: createDraftError } =
        api.modularProcedures.execute.useCreateExecutionDraft()
    const { mutate: deleteDraft } = api.modularProcedures.execute.useDeleteExecutionDraft()

    const handleCreateDraft = () => {
        if (!_.isString(newDraftProcedureTag) || newDraftProcedureTag.length === 0) return
        createDraft({ tag: newDraftProcedureTag }, {
            onSuccess: (draftExecution) => {
                setNewDraftDialogOpen(false)
                setNewDraftProcedureTag("")
                navigate(`/modular-procedures/setup/${draftExecution.tag}`)
                refetchExecutions()
            }
        })
    }

    const { data: executions, isLoading, isError, error, refetch: refetchExecutions } =
        api.modularProcedures.execute.useQueryModularProcedureExecutions({
            search_submission_tag: debouncedSearch.length > 0 ? debouncedSearch : null,
            search_plate_tag: debouncedPlateFilter.length > 0 ? debouncedPlateFilter : null,
            status: statusFilter.length > 0 ? statusFilter : null,
        })
    const { data: selectedExecution, isError: selectedIsError, error: selectedError, refetch: refetchSelected } =
        api.modularProcedures.execute.useGetModularProcedureExecution(
            { tag: selectedTag }, { enabled: _.isString(selectedTag) })

    return <div className="div--expand padding--medium">
        <Alert isOpen={alertProps.isOpen} intent="success" confirmButtonText="OK"
            onClose={() => setAlertProps({ isOpen: false })}>
            <p>{alertProps.message}</p>
        </Alert>
        <div className="flex flex-column margin--medium padding--medium gap--medium-small">
            <div className="flex justify-between center-items">
                <h3 style={{ margin: 0 }}>Modular Procedure Executions</h3>
                <div className="flex center-items" style={{ gap: "0.5rem" }}>
                    {canChangeState ? <button className="basic-button basic-button--small basic-button--highlighted"
                        title="Create an empty execution with a backend-generated ID, set up the plate design, save it and start it later"
                        onClick={() => setNewDraftDialogOpen(true)}>New execution</button> : null}
                    <button className="basic-button basic-button--small"
                        onClick={() => navigate("/modular-procedures")}>Back to the board</button>
                </div>
            </div>
            <p className="font-size--small" style={{ color: "#888" }}>
                All executions of the facility's workflow modules with their states and the data of the
                input and output plates. {canChangeState ?
                    "As curator you can change the state of an execution (successful / failed / aborted)." :
                    "The state is managed by curators."}
            </p>
            <div className="flex center-items gap--medium-small flex--wrap">
                <input className="text-input" type="text" placeholder="Search for a submission tag ..."
                    title="Filters the executions to those involving this submission"
                    value={searchString} onChange={(event) => setSearchString(event.target.value)}
                    style={{ minWidth: "220px" }} />
                <input className="text-input" type="text" placeholder="Search for a plate tag ..."
                    title="Filters the executions to those whose input or output plate tag contains this fragment"
                    value={plateFilter} onChange={(event) => setPlateFilter(event.target.value)}
                    style={{ minWidth: "220px" }} />
                <select className="text-input" value={statusFilter} title="Filters the executions by their current state"
                    onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="">All states</option>
                    {EXECUTION_STATE_TAGS.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
                {searchString.length > 0 || plateFilter.length > 0 || statusFilter.length > 0 ?
                    <button className="basic-button basic-button--small"
                        onClick={() => { setSearchString(""); setPlateFilter(""); setStatusFilter("") }}>Clear</button> : null}
                <Tag minimal intent="primary">{executions?.length ?? 0} execution(s)</Tag>
            </div>
        </div>
        {isLoading ? <div className="padding--medium">Loading executions ...</div> :
            isError ? <div className="padding--medium"><APIAxiosError error={error} /></div> :
            <div className="padding--medium" style={{ overflowX: "auto" }}>
                {executions?.length === 0 ?
                    <Callout intent="warning" icon="warning-sign">
                        No executions visible{searchString.length > 0 || plateFilter.length > 0 || statusFilter.length > 0 ? " for these filters — try clearing them. You may not have access to this submission or plate." : " yet."}
                    </Callout> :
                    <table className="font-size--small" style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
                                <th className="padding--little">Procedure</th>
                                <th className="padding--little">Execution</th>
                                <th className="padding--little">State</th>
                                <th className="padding--little">Input plate</th>
                                <th className="padding--little">Output plate</th>
                                <th className="padding--little">Wells</th>
                                <th className="padding--little">Responsible</th>
                                <th className="padding--little">Created</th>
                                {canChangeState ? <th className="padding--little">Setup</th> : null}
                            </tr>
                        </thead>
                        <tbody>
                            {executions.map((execution) => <tr key={execution.tag}
                                onClick={() => setSelectedTag(selectedTag === execution.tag ? null : execution.tag)}
                                style={{
                                    borderBottom: "1px solid #eee",
                                    background: selectedTag === execution.tag ? "#e8f4fd" : undefined,
                                    cursor: "pointer"
                                }}>
                                <td className="padding--little"><ProcedureTitle procedure_tag={execution.procedure_tag} /></td>
                                <td className="padding--little">{execution.tag}</td>
                                <td className="padding--little"><ExecutionStateChip status={execution.status} /></td>
                                <td className="padding--little">{execution.input_plate_tag}</td>
                                <td className="padding--little">{execution.output_plate_tag}</td>
                                <td className="padding--little">{execution.n_input_wells} → {execution.n_output_wells}
                                    <span title="Distinct submissions placed in the input wells" style={{ color: "#888" }}>
                                        &nbsp;({execution.n_submissions || 0} submission{(execution.n_submissions || 0) !== 1 ? "s" : ""})</span></td>
                                <td className="padding--little">{_.isString(execution.responsible_user_tag) ?
                                    <UserFullName tag={execution.responsible_user_tag} /> : "–"}</td>
                                <td className="padding--little">{formatExecutionTime(execution.created_at)}</td>
                                {canChangeState ? <td className="padding--little" onClick={(event) => event.stopPropagation()}>
                                    {execution.status === "DRAFT" ?
                                        <div className="flex" style={{ gap: "0.5rem", flexWrap: "nowrap",
                                            alignItems: "center", whiteSpace: "nowrap" }}>
                                            <button className="basic-button basic-button--small"
                                                style={{ margin: 0, padding: "0.15rem 0.5rem" }}
                                                title="Continue the saved setup: plates, samples, transfer map, values and start"
                                                onClick={() => navigate(`/modular-procedures/setup/${execution.tag}`)}>
                                                Edit
                                            </button>
                                            <button className="basic-button basic-button--small"
                                                style={{ margin: 0, padding: "0.15rem 0.5rem" }}
                                                title="Delete this draft (only drafts can be deleted)"
                                                onClick={() => deleteDraft({ tag: execution.tag }, {
                                                    onSuccess: () => {
                                                        setSelectedTag(null)
                                                        refetchExecutions()
                                                    }
                                                })}>Delete</button>
                                        </div> : null}
                                </td> : null}
                            </tr>)}
                        </tbody>
                    </table>}
            </div>}
        {selectedIsError ? <div className="padding--medium"><APIAxiosError error={selectedError} /></div> : null}
        {newDraftDialogOpen ? <Dialog isOpen={newDraftDialogOpen}
            onClose={() => setNewDraftDialogOpen(false)} title="New execution" icon="flows">
            <DialogBody>
                <p className="font-size--small">
                    Create an empty execution of a published module with a backend-generated ID. The setup
                    (plates, sample placement, transfer map and per-well values) can be saved and continued
                    anytime; starting the run validates everything in full.
                </p>
                <select className="text-input" style={{ width: "100%" }} value={newDraftProcedureTag}
                    onChange={(event) => setNewDraftProcedureTag(event.target.value)}>
                    <option value="">Select a published module ...</option>
                    {(_.isArray(procedure_tags) ? procedure_tags : []).map((tag) =>
                        <option key={tag} value={tag}><ProcedureOptionTitle procedure_tag={tag} /></option>)}
                </select>
                {createDraftIsError ? <APIAxiosError error={createDraftError} /> : null}
            </DialogBody>
            <DialogFooter actions={<>
                <Button text="Cancel" onClick={() => setNewDraftDialogOpen(false)} />
                <Button intent={Intent.PRIMARY} icon="flows" text="Create draft" loading={createDraftIsPending}
                    disabled={newDraftProcedureTag.length === 0} onClick={handleCreateDraft} />
            </>} />
        </Dialog> : null}
        {_.isObject(selectedExecution) ?
            <ExecutionDetails execution={selectedExecution} canChangeState={canChangeState}
                onEditDraft={() => navigate(`/modular-procedures/setup/${selectedExecution.tag}`)}
                onStateChanged={(updatedExecution) => {
                    refetchSelected()
                    refetchExecutions()
                    setAlertProps({ isOpen: true, message: `Execution state changed to ${updatedExecution.status}.` })
                }}
                onDeleted={() => {
                    setSelectedTag(null)
                    refetchExecutions()
                    setAlertProps({ isOpen: true, message: "Execution draft deleted." })
                }} /> : null}
    </div>
}
