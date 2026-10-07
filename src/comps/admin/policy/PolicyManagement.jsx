import { useState } from "react"
import { Dialog, Button, Tag } from "@blueprintjs/core"
import { api } from "@/api"
import { AddButton } from "../../core/base/buttons/AddButton"
import Loading from "../../core/base/loading"
import APIError from "../../core/error/APIerror"
import { EditPolicy } from "./EditPolicy"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

/**
 * Admin page: shows the current policy as a card, edit/create in a dialog.
 */
export function PolicyManagement() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const { data: policy, isLoading, isError, error } = api.policy.useGetPolicy(
        {},
        { retry: false }   // 404 = no policy yet
    )
    const noPolicyYet = isError && error?.response?.status === 404
    const currentPolicy = noPolicyYet ? undefined : policy

    if (isLoading) return <Loading />
    if (isError && !noPolicyYet) return <APIError error={error} />

    return (
        <div className="div--expand padding--medium"
            style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem" }}>
                <h3>Policy</h3>

                <Dialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    canEscapeKeyClose={true}
                    canOutsideClickClose={false}
                    title={currentPolicy ? "Edit Policy" : "Create Policy"}
                    style={{ width: "60vw", height: "80vh", minHeight: "600px", fontSize: "1rem" }}
                >
                    <EditPolicy policy={currentPolicy} onSuccess={() => setIsDialogOpen(false)} />
                </Dialog>

                {noPolicyYet ? (
                    <div className="flex" style={{ alignItems: "center", gap: "1rem" }}>
                        <div>No policy defined yet.</div>
                        <AddButton onSelect={() => setIsDialogOpen(true)} />
                    </div>
                ) : (
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
                            <Button icon="edit" minimal onClick={() => setIsDialogOpen(true)}>Edit</Button>
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
                )}
            </div>
        </div>
    )
}


