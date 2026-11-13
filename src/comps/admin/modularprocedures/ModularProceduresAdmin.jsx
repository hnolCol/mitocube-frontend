import { Alert, Callout, Dialog, DialogBody } from "@blueprintjs/core";
import { useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { AddButton } from "@/comps/core/base/buttons/AddButton";
import { ModularProcedureForm } from "@/comps/modularprocedures/ModularProcedureForm";

const CURATOR_ROLE = 2 // must match the backend user role encoding; curators and admins are >= 2

/**
 * Admin view to create, edit and publish modular procedures
 * (facility workflow modules similar to SOPs).
 */
export function ModularProceduresAdmin({ userRole }) {

    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE

    const [dialogProps, setDialogProps] = useState({ isOpen: false, editMode: false, procedure_tag: null })
    const [linkDialogProps, setLinkDialogProps] = useState({ isOpen: false, procedure_tag: null })
    const [linkSubmissionTag, setLinkSubmissionTag] = useState("")
    const [alertProps, setAlertProps] = useState({ isOpen: false })
    const [refetchTrigger, setRefetchTrigger] = useState(undefined)

    const { data: procedure_tags, isLoading, isError, error, refetch } =
        api.modularProcedures.query.useGetModularProceduresByQuery({})

    const { mutate: postProcedure, isPending: insertIsPending, isError: insertIsError, error: insertError } =
        api.modularProcedures.modify.usePostModularProcedure()
    const { mutate: updateProcedure, isPending: updateIsPending, isError: updateIsError, error: updateError } =
        api.modularProcedures.modify.useUpdateModularProcedure()
    const { mutate: publishProcedure, isError: publishIsError, error: publishError } =
        api.modularProcedures.modify.usePublishModularProcedure()
    const { mutate: linkSubmission, isError: linkIsError, error: linkError } =
        api.modularProcedures.modify.useLinkModularProcedureToSubmission()

    const handleInsert = (procedure) => {
        postProcedure(procedure, {
            onSuccess: () => {
                setDialogProps({ isOpen: false })
                setAlertProps({ isOpen: true, message: "Modular procedure created as draft." })
                refetch()
            }
        })
    }

    const handleUpdate = (procedure) => {
        updateProcedure({ tag: dialogProps.procedure_tag, ...procedure }, {
            onSuccess: () => {
                setDialogProps({ isOpen: false, editMode: false, procedure_tag: null })
                setAlertProps({ isOpen: true, message: "Modular procedure updated." })
                refetch()
            }
        })
    }

    const handlePublish = (procedure_tag) => {
        publishProcedure({ tag: procedure_tag }, {
            onSuccess: () => {
                setAlertProps({ isOpen: true, message: "Modular procedure published. It is now immutable and has a content hash." })
                refetch()
            }
        })
    }

    const handleLink = () => {
        linkSubmission({ tag: linkDialogProps.procedure_tag, submission_tag: linkSubmissionTag }, {
            onSuccess: () => {
                setLinkDialogProps({ isOpen: false, procedure_tag: null })
                setLinkSubmissionTag("")
                setAlertProps({ isOpen: true, message: "Submission assigned to the modular procedure." })
            }
        })
    }

    return <div className="div--expand padding--medium flex-column--full-height">
        <Alert isOpen={alertProps.isOpen} intent="success" confirmButtonText="OK"
            onClose={() => setAlertProps({ isOpen: false })}>
            <p>{alertProps.message}</p>
        </Alert>

        <Dialog style={{ width: "min(950px,70vw)" }} isOpen={dialogProps.isOpen}
            onClose={() => setDialogProps({ isOpen: false })} title="Modular Procedure"
            canOutsideClickClose={false} canEscapeKeyClose={true}>
            <DialogBody>
                {dialogProps.isOpen ?
                    <ModularProcedureForm
                        procedure_tag={dialogProps.editMode ? dialogProps.procedure_tag : null}
                        isPending={dialogProps.editMode ? updateIsPending : insertIsPending}
                        isError={dialogProps.editMode ? updateIsError : insertIsError}
                        error={dialogProps.editMode ? updateError : insertError}
                        onSubmit={dialogProps.editMode ? handleUpdate : handleInsert}
                        onCancel={() => setDialogProps({ isOpen: false, editMode: false, procedure_tag: null })} /> : null}
            </DialogBody>
        </Dialog>

        <Dialog isOpen={linkDialogProps.isOpen}
            onClose={() => setLinkDialogProps({ isOpen: false, procedure_tag: null })}
            title="Assign Submission" canOutsideClickClose={false} canEscapeKeyClose={true}>
            <DialogBody>
                <p>Enter the tag of the submission to assign to this modular procedure.</p>
                <input className="text-input" type="text" placeholder="Submission tag"
                    value={linkSubmissionTag} onChange={(e) => setLinkSubmissionTag(e.target.value)} />
                {linkIsError ? <APIAxiosError error={linkError} /> : null}
                <div className="flex center-items justify-end" style={{ gap: "1rem", marginTop: "1rem" }}>
                    <button className="basic-button basic-button--highlighted"
                        disabled={linkSubmissionTag.length === 0} onClick={handleLink}>Assign</button>
                    <button className="basic-button"
                        onClick={() => setLinkDialogProps({ isOpen: false, procedure_tag: null })}>Cancel</button>
                </div>
            </DialogBody>
        </Dialog>

        <div className="flex flex-column margin--medium padding--medium gap--medium-small">
            <h3>Modular Procedures</h3>
            {!isCurator ?
                <Callout className="margin-bottom--medium" intent="warning" icon="warning-sign">
                    Restricted area : modular procedure management is reserved for curators and admins.
                    You can view the procedures, but creating, editing and publishing is disabled for your account.
                </Callout> : null}
            <p className="font-size--small" style={{ color: "#888" }}>
                Modular procedures are facility workflow modules (similar to SOPs) built from a title, a description,
                condition applications and linked protocols. Drafts can be edited; publishing freezes the procedure
                with a SHA-256 content hash.
            </p>
            {isCurator ? <div className="flex">
                <AddButton onSelect={() => setDialogProps({ isOpen: true, editMode: false })} />
                <div>Insert Modular Procedure</div>
            </div> : null}
            {isError ? <APIAxiosError error={error} /> : null}
        </div>

        {isLoading ? <div className="padding--medium">Loading modular procedures ...</div> :
            <div className="flex flex-column" style={{ gap: "0.5rem", padding: "0 2rem" }}>
                {procedure_tags?.map((procedure_tag) =>
                    <AdminProcedureItem key={procedure_tag} procedure_tag={procedure_tag}
                        isCurator={isCurator} trigger={refetchTrigger}
                        onEdit={() => setDialogProps({ isOpen: true, editMode: true, procedure_tag })}
                        onPublish={() => handlePublish(procedure_tag)}
                        onLink={() => setLinkDialogProps({ isOpen: true, procedure_tag })} />)}
                {procedure_tags?.length === 0 ?
                    <div className="padding--medium" style={{ color: "#888" }}>No modular procedures yet.</div> : null}
            </div>}

        {publishIsError ? <div className="padding--medium"><APIAxiosError error={publishError} /></div> : null}
    </div>
}

function AdminProcedureItem({ procedure_tag, isCurator, onEdit, onPublish, onLink }) {

    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag({ tag: procedure_tag })
    const isDraft = procedure?.status === "DRAFT"

    return <div style={{
        border: "1px solid #ccc", borderRadius: "6px", background: "#fff",
        padding: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem"
    }}>
        <div>
            <div className="flex center-items" style={{ gap: "0.5rem" }}>
                <strong>{procedure?.title || procedure_tag}</strong>
                <span style={{
                    fontSize: "0.75rem", borderRadius: "4px", padding: "0 0.25rem",
                    color: isDraft ? "#c87619" : "#238551",
                    border: `1px solid ${isDraft ? "#c87619" : "#238551"}`
                }}>{procedure?.status || ""}</span>
            </div>
            <div className="font-size--small" style={{ color: "#666" }}>
                {procedure?.description ? procedure.description.substring(0, 140) : ""}
            </div>
            <div className="font-size--small" style={{ color: "#888" }}>
                {procedure?.condition_application_tags?.length || 0} condition applications,
                {" "}{procedure?.protocol_tags?.length || 0} protocols
                {procedure?.content_hash ? `, hash ${procedure.content_hash.substring(0, 12)}...` : ""}
            </div>
        </div>
        {isCurator ? <div className="flex" style={{ gap: "0.5rem", flexShrink: 0 }}>
            {isDraft ? <button className="basic-button basic-button--small" onClick={onEdit}>Edit</button> : null}
            {isDraft ? <button className="basic-button basic-button--small basic-button--highlighted" onClick={onPublish}>Publish</button> : null}
            <button className="basic-button basic-button--small" onClick={onLink}>Assign submission</button>
        </div> : null}
    </div>
}
