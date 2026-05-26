import { api } from "@/api"
import { useEffect, useState } from "react"
import _ from "lodash"
import { Dialog } from "@blueprintjs/core"

const INITIAL_GROUP = {
    text: "",
    description: "",
    source: "",
    url: "",
}

export function EditAnnotationGroup({ isOpen, onClose, tag, onSuccess }) {
    const [annotationGroup, setAnnotationGroup] = useState(INITIAL_GROUP)

    const { data: existingGroup, isSuccess } = api.annotations.queryAnnotations.useGetAnnotationGroupByTag(
        { tag },
        { enabled: _.isString(tag) && isOpen }
    )

    const { mutate: editGroup, isLoading, isError, error } = 
        api.annotations.modifyAnnotations.useEditAnnotationGroup()

    useEffect(() => {
        if (isSuccess && existingGroup) {
            setAnnotationGroup({
                text: existingGroup.text ?? "",
                description: existingGroup.description ?? "",
                source: existingGroup.source ?? "",
                url: existingGroup.url ?? "",
            })
        }
    }, [isSuccess, existingGroup])

    if (!isOpen || !isSuccess) return null

    const handleEdit = () => {
        editGroup(
            { tag, ...annotationGroup },
            {
                onSuccess: () => {
                    onSuccess?.()
                    onClose()
                },
                onError: (err) => console.error("Failed to edit annotation group", err),
            }
        )
    }

    return (
        <div className="flex flex-column gap--small padding--medium">
            <h3>Edit Annotation Group</h3>

            <input
                className="text-input"
                placeholder="Annotation group name"
                value={annotationGroup.text}
                onChange={(e) => setAnnotationGroup(prev => ({ ...prev, text: e.target.value }))}
            />
            <input
                className="text-input"
                placeholder="Description"
                value={annotationGroup.description}
                onChange={(e) => setAnnotationGroup(prev => ({ ...prev, description: e.target.value }))}
            />
            <input
                className="text-input"
                placeholder="Source (e.g. UniProt, MitoCarta)"
                value={annotationGroup.source}
                onChange={(e) => setAnnotationGroup(prev => ({ ...prev, source: e.target.value }))}
            />
            <input
                className="text-input"
                placeholder="API URL (optional)"
                value={annotationGroup.url}
                onChange={(e) => setAnnotationGroup(prev => ({ ...prev, url: e.target.value }))}
            />

            {isError && (
                <div style={{ color: "red" }}>
                    {error?.message ?? "Failed to update annotation group"}
                </div>
            )}

            <div className="flex justify-end gap--small">
                <button
                    className="dialog-button"
                    style={{ backgroundColor: "#ec7160ff" }}
                    onClick={onClose}
                >
                    Close
                </button>
                <button
                    className="dialog-button"
                    disabled={isLoading || !annotationGroup.text.trim()}
                    onClick={handleEdit}
                >
                    {isLoading ? "Editing…" : "Edit"}
                </button>
            </div>
        </div>
    )
}

export function EditAnnotationGroupDialog({ isOpen, onClose, tag, onSuccess }) {
    return (
        <Dialog
            isOpen={isOpen}
            title="Edit Annotation Group"
            onClose={onClose}
            style={{ width: "min(600px,85vw)", height: "min(35vh, 1500px)"}}
            canOutsideClickClose={false}
        >
            <div className="padding--medium" style={{ height: "100%", overflowY: "auto" }}>
                <EditAnnotationGroup
                    isOpen={isOpen}
                    tag={tag}
                    onClose={onClose}
                    onSuccess={onSuccess}
                />
            </div>
        </Dialog>
    )
}