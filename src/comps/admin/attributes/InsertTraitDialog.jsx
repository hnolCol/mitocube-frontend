import { useState, useEffect } from "react"
import { Dialog, Tag } from "@blueprintjs/core"
import PropTypes from "prop-types"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"

InsertTraitDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    attribute_tag: PropTypes.string.isRequired,
    onSuccess: PropTypes.func,
}

const INITIAL_TRAIT = { value: "", text: "", description: "", priority: 500 }

export function InsertTraitDialog({
    isOpen,
    onClose,
    attribute_tag,
    onSuccess,
}) {
    const [trait, setTrait] = useState(INITIAL_TRAIT)

    const { mutate: postTrait, isLoading, isError, error } =
        api.traits.modifyTraits.usePostTrait()

    useEffect(() => {
        if (isOpen) setTrait(INITIAL_TRAIT)
    }, [isOpen])

    const canSubmit =
        trait.value.trim().length > 0 &&
        trait.text.trim().length > 0 &&
        !isLoading

    const insertTrait = () => {
        if (!canSubmit) return
        postTrait(
            {
                attribute_tag,
                trait: {
                    value: trait.value.trim(),
                    text: trait.text.trim(),
                    description: trait.description.trim(),
                    priority: Number(trait.priority) || 500,
                },
            },
            {
                onSuccess: () => {
                    setTrait(INITIAL_TRAIT)
                    onSuccess?.()
                    onClose()
                },
            }
        )
    }

    

    return (
        <Dialog
            isOpen={isOpen}
            title="Add Trait"
            onClose={onClose}
            style={{ width: "min(700px, 85vw)" }}
            canOutsideClickClose={!isLoading}
        >
            <div style={{ padding: "20px 24px 24px 24px" }}>
                <div className="flex flex-column" style={{ gap: "0.8rem" }}>
                <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <strong>Adding trait to attribute</strong> <Tag minimal style={{fontWeight: 700 }}>{attribute_tag}</Tag>
                </div>

                    <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                        <input
                            className="text-input"
                            type="text"
                            value={trait.value}
                            placeholder="Enter the value (e.g. steroid_synthesis)"
                            onChange={(e) =>
                                setTrait((prev) => ({
                                    ...prev,
                                    value: e.target.value,
                                }))
                            }
                        />
                        <input
                            className="text-input"
                            type="text"
                            value={trait.text}
                            placeholder="Enter text"
                            onChange={(e) =>
                                setTrait((prev) => ({
                                    ...prev,
                                    text: e.target.value,
                                }))
                            }
                        />
                        <input
                            className="text-input"
                            type="text"
                            value={trait.description}
                            placeholder="Enter description"
                            onChange={(e) =>
                                setTrait((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                        <input
                            className="text-input"
                            type="number"
                            value={trait.priority}
                            placeholder="Priority (default 500)"
                            onChange={(e) =>
                                setTrait((prev) => ({
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
                            onClick={insertTrait}
                        >
                            {isLoading ? "Inserting..." : "Insert"}
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}