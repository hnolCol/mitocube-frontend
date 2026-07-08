import { api } from "@/api"
import _ from "lodash"
import { motion } from "framer-motion"
import PropTypes from "prop-types"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog } from "@blueprintjs/core"
import { EditTraitDialog } from "./EditTraitDialog"

TraitItem.propTypes = {
    tag: PropTypes.string.isRequired,
    attribute_tag: PropTypes.string.isRequired,
}

export function TraitItem({ tag, attribute_tag }) {
    const [mouseIsOver, setMouseIsOver] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const queryClient = useQueryClient()

    const { data: trait, isSuccess } = api.traits.queryTraits.useGetTraitByTag(
        { tag },
        { enabled: _.isString(tag) && tag.length > 0, staleTime: 600000 }
    )

    const { data: permissions, isSuccess: permissionsLoaded } =
    api.traits.queryTraits.useGetTraitPermissions()

    const canEdit = permissionsLoaded && permissions?.edit
    const canDelete = permissionsLoaded && permissions?.delete
    const showActions = canEdit || canDelete

    const { mutate: deleteTrait, isLoading: isDeleting } =
        api.traits.modifyTraits.useDeleteTrait({
            onSuccess: () => {
                setConfirmOpen(false)
                queryClient.invalidateQueries(["traitsByTag", attribute_tag])
            },
            onError: (e) => {
                setConfirmOpen(false)
                setErrorMessage(
                    e?.response?.data?.detail ||
                        e.message ||
                        "Failed to delete trait"
                )
                setErrorOpen(true)
            },
        })

    const handleEdited = () => {
        queryClient.invalidateQueries(["getTraitByTag", tag])
        queryClient.invalidateQueries(["traitsByTag", attribute_tag])
    }

    const handleConfirmDelete = () => {
        deleteTrait({ attribute_tag, trait_tag: tag })
    }

    return (
        <>
            <motion.div
                onMouseEnter={() => setMouseIsOver(true)}
                onMouseLeave={() => setMouseIsOver(false)}
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 3fr auto",
                    gap: "16px",
                    alignItems: "center",
                    width: "100%",
                    padding: "8px 12px",
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: "#fff",
                }}
                whileHover={{ backgroundColor: "#f5f5f5" }}
                transition={{ duration: 0.1 }}
            >
                {_.isObject(trait) && isSuccess && (
                    <>
                        <span
                            style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontWeight: 500,
                            }}
                        >
                            {trait.text}
                        </span>
                        <span
                            style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: "#666",
                            }}
                        >
                            {trait.description || (
                                <span style={{ color: "#ccc" }}>no description</span>
                            )}
                        </span>
                        {showActions && (
                            <div
                                className="flex gap--small align-center"
                                style={{
                                    gap: "0.4rem"
                                }}
                            >
                                {canEdit && (
                                    <button
                                        onClick={() => setEditOpen(true)}
                                        className="basic-button"
                                        disabled={isDeleting}
                                    >
                                        Edit
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={() => setConfirmOpen(true)}
                                        className="basic-button"
                                        disabled={isDeleting}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </motion.div>

            <EditTraitDialog
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                attribute_tag={attribute_tag}
                trait={trait}
                onSuccess={handleEdited}
            />

            <Dialog
                isOpen={confirmOpen}
                onClose={() => !isDeleting && setConfirmOpen(false)}
                title="Delete trait"
            >
                <div className="padding--medium">
                    <p>
                        Are you sure you want to delete trait{" "}
                        <strong>{trait?.text}</strong>?
                    </p>
                    <p style={{ color: "#666" }}>
                        This will permanently remove the trait{" "}
                        <code>{trait?.tag}</code> from the database. It can only
                        be deleted if it is not connected to any Condition
                        Application.
                    </p>
                    <div
                        className="flex justify-end gap-2 margin-top--small"
                        style={{ gap: "0.5rem" }}
                    >
                        <button
                            className="dialog-button"
                            onClick={() => setConfirmOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            className="dialog-button"
                            style={{ backgroundColor: "#ec7160ff" }}
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </Dialog>

            <Dialog
                isOpen={errorOpen}
                onClose={() => setErrorOpen(false)}
                title="Cannot delete trait"
            >
                <div className="padding--medium">
                    <p>
                        The trait <code>{trait?.tag}</code> cannot be deleted.
                    </p>
                    <p style={{ color: "#666" }}>{errorMessage}</p>
                    <div
                        className="flex justify-end gap-2 margin-top--small"
                        style={{ gap: "0.5rem" }}
                    >
                        <button
                            className="dialog-button"
                            onClick={() => setErrorOpen(false)}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}