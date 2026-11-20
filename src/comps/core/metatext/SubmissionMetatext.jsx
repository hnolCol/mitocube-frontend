import { useState } from "react"
import { MetaTextDialog } from "../dialogs/MetaText"
import { MetatextBox } from "./MetatextBox"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import { api } from "@/api"
import { AddButton } from "../base/buttons/AddButton"


/**
 * Displays metatexts for a submission. If permission allows editing and deleting.
 * @param {Object} props 
 * @param {String} props.submission_tag 
 * @param {Boolean} props.fill  - whether to fill the container width 
 * @returns 
 */
/**
 * Read-only descriptions of the modular processes the submission passed through, shown together
 * with the metatexts: the description of every linked modular procedure (title, version and
 * lifecycle state). Unlike metatexts these cannot be edited or deleted here — they are managed
 * as part of the (immutable) modular procedure and document the sample processing automatically.
 */
function ModuleDescriptionCard({ procedure_tag }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 300000, retry: false })
    if (!_.isObject(procedure)) return null
    const isRetired = procedure.status === "RETIRED"
    return <div className="container--shadow padding--little margin-top--little"
        style={{ width: "100%", opacity: isRetired ? 0.65 : 1 }}>
        <div className="flex center-items justify-between" style={{ gap: "0.5rem" }}>
            <div className="flex center-items" style={{ gap: "0.5rem" }}>
                <strong>{procedure.title || procedure_tag}</strong>
                {_.isFinite(_.toNumber(procedure.version)) && _.toNumber(procedure.version) > 1 ?
                    <span className="font-size--small" style={{ color: "#888" }}>v{procedure.version}</span> : null}
            </div>
            <span className="font-size--smallest" style={{
                color: isRetired ? "#8f99a8" : "#238551",
                border: `1px solid ${isRetired ? "#8f99a8" : "#238551"}`, borderRadius: "4px", padding: "0 0.25rem"
            }}>module · {isRetired ? "retired, " : ""}{procedure.status?.toLowerCase()}</span>
        </div>
        {procedure.description ?
            <div className="font-size--small" style={{ color: "#444", marginTop: "0.35rem" }}>
                {procedure.description}
            </div> : null}
        <div className="font-size--smallest" style={{ color: "#888", marginTop: "0.35rem" }}>
            Read-only: this description belongs to the modular procedure (immutable since publication) and
            documents the processing of the samples automatically. It is managed under Modular Procedures.
        </div>
    </div>
}

function ModuleDescriptionCards({ submission_tag }) {
    const { data: links } = api.modularProcedures.query.useGetSubmissionModularProcedures(
        { submission_tag }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false })
    if (!_.isArray(links) || links.length === 0) return null
    return <div style={{ width: "100%" }}>
        <div className="font-size--small" style={{ color: "#666", margin: "0.5rem 0" }}>
            Descriptions of the modular processes of this submission (read-only, from the procedure definitions)
        </div>
        {links.map((link, index) =>
            <ModuleDescriptionCard key={`${link.procedure_tag}-${index}`} procedure_tag={link.procedure_tag} />)}
    </div>
}

export function Metatexts({ submission_tag, fill = false }) {
    const [forceUpdate, setForceUpdate] = useState({tag : "", value : 0})
    const [dialogState, setDialogState] = useState({isOpen : false, title : "", text : "", tag : "", edit : false})

    // Get submission permissions and metatexts
    const { data : permissions, isSuccess : isSuccessPermissions} = api.submissions.permissions.useGetSubmissionPermissionsByTag({tag : submission_tag}, { enabled : _.isString(submission_tag) && submission_tag.length > 0, staleTime: 60000 })
    const { data: metatexts, isError, refetch } = api.submissions.metatexts.useGetMetatexts({ tag : submission_tag }, { enabled: _.isString(submission_tag) })
    
    const { mutate: deleteMetatext } = api.metatexts.useDeleteMetatext()

    const handleClose = (edited = false, tag = undefined) => {
        setDialogState({ isOpen: false, title: "", text: "", edit: false })
        refetch()
        if (edited && _.isString(tag)) {
            setForceUpdate({ tag, value: Date.now() })
        }
    }

    const handleEdit = (tag, title, text) => {
        setDialogState({ isOpen: true, title, text, tag, edit: true })
    }

    const handleDelete = (tag) => {
        if (!_.isString(tag)) return
        deleteMetatext({ tag }, {
            onSuccess: () => {
                refetch()
                
            }
        })
    }
    if (permissions?.view !== true) return <div className="margin--medium">You do not have permission to view this submission.</div>
    return (
        <div>
            <AddButton onSelect={() => setDialogState({ isOpen: true, edit: false, text: "", title: "" })} />
            
            <MetaTextDialog
                submission_tag={submission_tag}
                isOpen={dialogState.isOpen}
                onClose={handleClose}
                edit={dialogState.edit}
                title={dialogState.title}
                text={dialogState.text}
                tag={dialogState.tag} />
        
        <div className="flex flex--wrap" style={{ gap: "2rem" }}>
            <div style={{ width: fill ? "100%" : undefined }}><ModuleDescriptionCards submission_tag={submission_tag} /></div>
            {_.isArray(metatexts) ? metatexts.map(metatext_tag => <div
                className="container--shadow padding--little margin-top--little"
                key={metatext_tag}>

                <MetatextBox tag={metatext_tag}
                    forceUpdate={forceUpdate.tag === metatext_tag ? forceUpdate.value : undefined}
                    onDelete={handleDelete}
                    showDelete={isSuccessPermissions && permissions.edit}
                    showEdit={isSuccessPermissions && permissions.edit}
                    onEdit={handleEdit} {...{ width: fill ? "100%" : undefined }} />

            </div>) : null}

            </div>
            </div>
    )}

