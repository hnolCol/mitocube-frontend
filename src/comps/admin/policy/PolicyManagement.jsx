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

export const TERMS_OF_USE = { type: "terms_of_use", label: "Terms of Use" }
export const DATA_PROTECTION = { type: "data_protection", label: "Data Protection" }


function PolicySection({ policyType, policy, canEdit, canDelete, onEdit, onDelete }) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!policy) {
        return (
            <div className="flex" style={{ alignItems: "center", gap: "1rem", padding: "0.5rem 0" }}>
                <div>{policyType.label} is not defined yet.</div>
                {canEdit && <AddButton onSelect={() => onEdit(policyType)} />}
            </div>
        )
    }

    return (
        <div className="container--shadow padding--medium margin-top--little"
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

            <div className="flex" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div className="flex" style={{ alignItems: "center", gap: "0.6rem" }}>
                    <strong>{policy.title || policyType.label}</strong>
                    <Tag minimal>v{policy.version}</Tag>
                    <Tag minimal intent={policy.required ? "danger" : "none"}>
                        {policy.required ? "Required" : "Not required"}
                    </Tag>
                </div>
                {(canEdit || canDelete) && (
                    <div className="flex" style={{ gap: "0.4rem" }}>
                        {canEdit && <Button icon="edit" minimal onClick={() => onEdit(policyType)}>Edit</Button>}
                        {canDelete && <Button icon="trash" minimal intent="danger" onClick={() => onDelete(policy)}>Delete</Button>}
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
 * Page for ONE document (terms of use or data protection).
 * Edit, add and delete are only shown if the backend permissions allow it.
 * @param {Object} props
 * @param {Object} props.policyType - TERMS_OF_USE or DATA_PROTECTION
 */
export function PolicyManagement({ policyType }) {
    const queryClient = useQueryClient()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const { data: permissions, isSuccess: isPermissionsSuccess } = api.policy.useGetPolicyPermissions()
    const canShowEditButton = isPermissionsSuccess && permissions.edit
    const canShowRemoveButton = isPermissionsSuccess && permissions.delete

    const { data: policies, isLoading, isError, error } = api.policy.useGetPolicies()
    const { mutate: deletePolicy, isPending: isDeleting } = api.policy.useDeletePolicy()

    if (isLoading) return <Loading />
    if (isError) return <APIError error={error} />

    const policy = policies.find(p => p.type === policyType.type)

    const handleDelete = () => {
        deletePolicy({ tag: policy.tag }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["getPolicies"] })
                queryClient.invalidateQueries({ queryKey: ["getPolicyStatus"] })
                setIsDeleteOpen(false)
            }
        })
    }

    return (
        <div className="div--expand padding--medium"
            style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem" }}>
                <h3>{policyType.label}</h3>

                {canShowEditButton && (
                    <Dialog
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                        canEscapeKeyClose={true}
                        canOutsideClickClose={false}
                        title={`${policy ? "Edit" : "Create"} ${policyType.label}`}
                        style={{ width: "60vw", height: "80vh", minHeight: "600px", fontSize: "1rem" }}
                    >
                        <EditPolicy
                            type={policyType.type}
                            label={policyType.label}
                            policy={policy}
                            onSuccess={() => setIsDialogOpen(false)}
                        />
                    </Dialog>
                )}

                {canShowRemoveButton && (
                    <Alert
                        isOpen={isDeleteOpen}
                        intent="danger"
                        icon="trash"
                        confirmButtonText="Delete"
                        cancelButtonText="Cancel"
                        loading={isDeleting}
                        onConfirm={handleDelete}
                        onCancel={() => setIsDeleteOpen(false)}
                    >
                        Delete "{policy?.title}"? Its older versions and the agreements of all users are removed as well.
                    </Alert>
                )}

                <PolicySection
                    policyType={policyType}
                    policy={policy}
                    canEdit={canShowEditButton}
                    canDelete={canShowRemoveButton}
                    onEdit={() => setIsDialogOpen(true)}
                    onDelete={() => setIsDeleteOpen(true)}
                />
            </div>
        </div>
    )
}