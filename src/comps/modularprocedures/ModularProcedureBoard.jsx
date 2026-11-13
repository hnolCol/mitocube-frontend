import { Alert, Callout } from "@blueprintjs/core";
import { useState } from "react";
import moment from "moment";
import _ from "lodash";
import { api } from "@/api";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { ModularProcedureExecutionDialog } from "./ModularProcedureExecutionDialog";

const CURATOR_ROLE = 2 // must match the backend user role encoding; curators and admins are >= 2

/**
 * Horizontal overview of the published modular procedures and the
 * submissions linked to them. Each column is a modular procedure, each card
 * a linked submission with its created_at date and done state.
 */
export function ModularProcedureBoard({ userRole }) {

    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const [alertProps, setAlertProps] = useState({ isOpen: false })
    const [executionDialogProps, setExecutionDialogProps] = useState({ isOpen: false, procedure_tag: null })

    const { data: procedure_tags, isLoading, isError, error } =
        api.modularProcedures.query.useGetModularProceduresByQuery({ status: "PUBLISHED" })

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
                onExecuted={() => {
                    setExecutionDialogProps({ isOpen: false, procedure_tag: null })
                    setAlertProps({ isOpen: true, message: "Procedure executed. The affected submissions are done and can proceed to the next procedure." })
                }} /> : null}
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
                        onExecute={() => setExecutionDialogProps({ isOpen: true, procedure_tag })} />)}
        </div>
    </div>
}

function ProcedureColumn({ procedure_tag, isCurator, onMarkDone, onReopen, onExecute }) {

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
                {isCurator ? <button className="basic-button basic-button--small"
                    onClick={onExecute}>Execute</button> : null}
            </div>
            {procedure?.description ? <p className="font-size--small" style={{ color: "#666", margin: 0 }}>
                {procedure.description.substring(0, 120)}{procedure.description.length > 120 ? "..." : ""}
            </p> : null}
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
