import { useState } from "react"
import { Dialog, Button, Tag, Alert } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { AddButton } from "../../core/base/buttons/AddButton"
import Loading from "../../core/base/loading"
import APIError from "../../core/error/APIerror"
import { EditPolicy } from "./EditPolicy"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"


function PolicyCard({ policy, isAdmin, onEdit, onDelete }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="container--shadow padding--medium margin-top--little"
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

            <div className="flex" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div className="flex" style={{ alignItems: "center", gap: "0.6rem" }}>
                    <strong>{policy.title || "Untitled policy"}</strong>
                    <Tag minimal>v{policy.version}</Tag>
                    <Tag minimal intent={policy.required ? "danger" : "none"}>
                        {policy.required ? "Required" : "Not required"}
                    </Tag>
                </div>
                {isAdmin && (
                    <div className="flex" style={{ gap: "0.4rem" }}>
                        <Button icon="edit" minimal onClick={() => onEdit(policy)}>Edit</Button>
                        <Button icon="trash" minimal intent="danger" onClick={() => onDelete(policy)}>Delete</Button>
                    </div>
                )}
            </div>

            <div className="bp5-text-muted" style={{ fontSize: "0.85rem" }}>
                Last updated {policy.updated_at ? new Date(policy.updated_at).toLocaleString() : "–"}
            </div>

            <div style={{
                maxHeight: isExpanded ? "none" : 200,
                overflow: "hidden",
                maskImage: isExpanded ? "none" : "linear-gradient(to bottom, black 70%, transparent)"
            }}>
                <Markdown remarkPlugins={[remarkGfm]}>{policy.text}</Markdown>
            </div>
            <div>
                <Button minimal small onClick={() => setIsExpanded(prev => !prev)}>
                    {isExpanded ? "Show less" : "Show more"}
                </Button>
            </div>
        </div>
    )
}


/**
 * Shows all policies. Admins can add, edit and delete policies.
 * @param {Object} props
 * @param {Boolean} props.isAdmin - show the admin actions
 */
export function PolicyManagement({ isAdmin = false }) {
    const queryClient = useQueryClient()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogPolicy, setDialogPolicy] = useState(undefined)     // undefined = create
    const [policyToDelete, setPolicyToDelete] = useState(undefined)

    const { data: policies, isLoading, isError, error } = api.policy.useGetPolicies()
    const { mutate: deletePolicy, isPending: isDeleting } = api.policy.useDeletePolicy()

    const openDialog = (policy) => {
        setDialogPolicy(policy)
        setIsDialogOpen(true)
    }

    const handleDelete = () => {
        deletePolicy({ tag: policyToDelete.tag }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["getPolicies"] })
                queryClient.invalidateQueries({ queryKey: ["getPolicyStatus"] })
                setPolicyToDelete(undefined)
            }
        })
    }

    if (isLoading) return <Loading />
    if (isError) return <APIError error={error} />

    return (
        <div className="div--expand padding--medium"
            style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem" }}>
                <div className="flex" style={{ alignItems: "center", gap: "1rem" }}>
                    <h3>Policies</h3>
                    {isAdmin && <AddButton onSelect={() => openDialog(undefined)} />}
                </div>

                {isAdmin && (
                    <>
                        <Dialog
                            isOpen={isDialogOpen}
                            onClose={() => setIsDialogOpen(false)}
                            canEscapeKeyClose={true}
                            canOutsideClickClose={false}
                            title={dialogPolicy ? "Edit Policy" : "Create Policy"}
                            style={{ width: "60vw", height: "80vh", minHeight: "600px", fontSize: "1rem" }}
                        >
                            <EditPolicy policy={dialogPolicy} onSuccess={() => setIsDialogOpen(false)} />
                        </Dialog>

                        <Alert
                            isOpen={policyToDelete !== undefined}
                            intent="danger"
                            icon="trash"
                            confirmButtonText="Delete"
                            cancelButtonText="Cancel"
                            loading={isDeleting}
                            onConfirm={handleDelete}
                            onCancel={() => setPolicyToDelete(undefined)}
                        >
                            Delete "{policyToDelete?.title || "Untitled policy"}"? The agreements of all users to it are removed as well.
                        </Alert>
                    </>
                )}

                {policies.length === 0 && <div>No policy defined yet.</div>}

                {policies.map(policy => (
                    <PolicyCard
                        key={policy.tag}
                        policy={policy}
                        isAdmin={isAdmin}
                        onEdit={openDialog}
                        onDelete={setPolicyToDelete}
                    />
                ))}
            </div>
        </div>
    )
}