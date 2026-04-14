import { useState, useEffect } from "react"
import { Dialog, Tag } from "@blueprintjs/core"
import PropTypes from "prop-types"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"

EditTraitDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    attribute_tag: PropTypes.string.isRequired,
    trait: PropTypes.object,
    onSuccess: PropTypes.func,
}

export function EditTraitDialog({
    isOpen,
    onClose,
    attribute_tag,
    trait,
    onSuccess,
}) {
    const [values, setValues] = useState({
        text: "",
        description: "",
        priority: 500,
    })

    const { mutate: updateTrait, isLoading, isError, error } =
        api.traits.modifyTraits.useUpdateTrait()

    useEffect(() => {
        if (isOpen && trait) {
            setValues({
                text: trait.text || "",
                description: trait.description || "",
                priority: trait.priority ?? 500,
            })
        }
    }, [isOpen, trait])

    const canSubmit = values.text.trim().length > 0 && !isLoading

    const editTrait = () => {
        if (!canSubmit || !trait) return
        updateTrait(
            {
                attribute_tag,
                trait_tag: trait.tag,
                updates: {
                    text: values.text.trim(),
                    description: values.description.trim(),
                    priority: Number(values.priority) || 500,
                },
            },
            {
                onSuccess: () => {
                    onSuccess?.()
                    onClose()
                },
            }
        )
    }

    return (
        <Dialog
            isOpen={isOpen}
            title="Edit Trait"
            onClose={onClose}
            style={{ width: "min(700px, 85vw)" }}
            canOutsideClickClose={!isLoading}
        >
            <div style={{ padding: "20px 24px 24px 24px" }}>
                <div className="flex flex-column" style={{ gap: "0.8rem" }}>
                <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <strong>Editing trait</strong> <Tag minimal style={{fontWeight: 700 }}>{trait?.tag}</Tag>
                </div>

                    <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                        <input
                            className="text-input"
                            type="text"
                            value={values.text}
                            placeholder="Display text"
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    text: e.target.value,
                                }))
                            }
                        />
                        <input
                            className="text-input"
                            type="text"
                            value={values.description}
                            placeholder="Description"
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                        <input
                            className="text-input"
                            type="number"
                            value={values.priority}
                            placeholder="Priority"
                            onChange={(e) =>
                                setValues((prev) => ({
                                    ...prev,
                                    priority: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div>{isError ? <APIError error={error} /> : null}</div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "0.5rem",
                        }}
                    >
                        <button
                            className="dialog-button"
                            style={{ backgroundColor: "#ec7160ff" }}
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            className="dialog-button"
                            disabled={!canSubmit}
                            onClick={editTrait}
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}