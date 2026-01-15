import hooks from "@mitocube/api-hooks";
import { useEffect, useState } from "react";
import _ from "lodash";
import { Dialog } from "@blueprintjs/core";

const INITIAL_ANNOTATION_GROUP = {
    text: "",
    description: "",
};

export function InsertAnnotationGroup({ 
    onClose,
    onSuccess,
    isEditing = false,
    preText = "",
    preDescription = "",
}) {

    const [annotationGroup, setAnnotationGroup] = useState(INITIAL_ANNOTATION_GROUP);

    const {
        mutate: postAnnotationGroup,
        isLoading,
        isError,
        error,
        isSuccess,
    } = hooks.annotations.usePostAnnotationGroup({
        onSuccess: () => {
            setAnnotationGroup(INITIAL_ANNOTATION_GROUP);
        },
    });

    useEffect(() => {
        if (isEditing) {
            setAnnotationGroup({
                text: preText,
                description: preDescription,
            });
        }
    }, [isEditing, preText, preDescription]);

    const insertAnnotationGroup = () => {
        const data = {
            text: annotationGroup.text,
            description: annotationGroup.description,
        };

        postAnnotationGroup(data, {
            onSuccess: (group_tag) => {
                setAnnotationGroup(INITIAL_ANNOTATION_GROUP);

                if (_.isFunction(onSuccess)) {
                    onSuccess(group_tag);
                }

                onClose();
            },
            onError: (err) => {
                console.error("Failed to insert annotation group", err);
                console.log(annotationGroup);
            },
        });
    };

    return (
        <div
            className="flex flex-column div--expand margin--medium padding--medium"
            style={{ gap: "0.4rem" }}
        >
            <h3>
                {isEditing
                    ? "Annotation Group Editing"
                    : "Annotation Group Insertion"}
            </h3>

            <span>Annotation group</span>

            <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                <input
                    className="text-input"
                    type="text"
                    value={annotationGroup.text}
                    placeholder="Enter annotation group name"
                    onChange={(e) =>
                        setAnnotationGroup((prev) => ({
                            ...prev,
                            text: e.target.value,
                        }))
                    }
                />

                <input
                    className="text-input"
                    type="text"
                    value={annotationGroup.description}
                    placeholder="Enter annotation group description"
                    onChange={(e) =>
                        setAnnotationGroup((prev) => ({
                            ...prev,
                            description: e.target.value,
                        }))
                    }
                />
            </div>

            <div className="margin--medium">
                {isSuccess && !isEditing ? (
                    <h3 style={{ color: "#68a063" }}>
                        Annotation Group inserted successfully!
                    </h3>
                ) : null}
            </div>

            {isError ? (
                <div style={{ color: "red" }}>
                    {error?.message ?? "Failed to insert annotation group"}
                </div>
            ) : null}

            <div className="div--expand flex flex-column" style={{ justifyContent: "space-between" }}>
                <div className="flex justify-end" style={{ gap: "1rem" }}>
                    <button
                        className="dialog-button"
                        style={{ backgroundColor: "#ec7160ff" }}
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button
                        className="dialog-button"
                        disabled={isLoading}
                        onClick={insertAnnotationGroup}
                    >
                        {isLoading
                            ? isEditing
                                ? "Updating..."
                                : "Inserting..."
                            : isEditing
                                ? "Update"
                                : "Insert"}
                    </button>
                </div>
            </div>
        </div>
    );
}



export function AddAnnotationGroupDialog({ isOpen, onClose, onSuccess }) {

    return (
        <Dialog isOpen={isOpen} title="Add Annotation Group" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(90vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width: "95%" }}>
                    <InsertAnnotationGroup onClose={onClose} onSuccess={onSuccess} />
                </div>
            </div>
        </Dialog>
    );
}