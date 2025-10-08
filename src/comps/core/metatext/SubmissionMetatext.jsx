import { useState } from "react"
import { MetaTextDialog } from "../dialogs/MetaText"
import { MetatextBox } from "./MetatextBox"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"

import { AddButton } from "../base/buttons/AddButton"

export function Metatexts({ submission_tag, fill = false }) {
    const [forceUpdate, setForceUpdate] = useState({tag : "", value : 0})
    const [dialogState, setDialogState] = useState({isOpen : false, title : "", text : "", tag : "", edit : false})


    const { data : permissions, isSuccess : isSuccessPermissions} = hooks.submissions.permissions.useGetSubmissionPermissionsByTag({tag : submission_tag}, { enabled : _.isString(submission_tag) && submission_tag.length > 0})
    const { data: metatexts,isLoading, isFetching, isError, refetch } = hooks.submissions.metatexts.useGetMetatexts({ submission_tag }, { enabled: !!submission_tag })
    const { mutate: deleteMetatext } = hooks.metatexts.useDeleteMetatext()

    // if (isLoading || isFetching) return <Loading />
    if (isError) return <p>Invalid response when getting metadata...</p>    
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
            
            {_.isArray(metatexts) ? metatexts.map(metatext_tag => <div
                className="container--shadow padding--little intent-margin-toplittle"
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

