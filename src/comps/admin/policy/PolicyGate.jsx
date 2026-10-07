import { useState } from "react"
import { Button, Checkbox, Card } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import Loading from "@/comps/core/base/loading"
import APIError from "@/comps/core/error/APIerror"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

/**
 * Blocks the app until the user has agreed to the policy (if the policy is required).
 * Wrap the logged-in part of the app with it.
 */
export function PolicyGate({ children, enabled = true }) {
    const queryClient = useQueryClient()
    const [checked, setChecked] = useState(false)

    const { data: status, isLoading: isStatusLoading, isError: isStatusError, error: statusError } =
    api.policy.useGetPolicyStatus({}, { staleTime: 1000 * 60 * 5, enabled })

    const mustAgree = status?.must_agree === true

    const { data: policy, isLoading: isPolicyLoading } =
        api.policy.useGetPolicy({}, { enabled: mustAgree, retry: false })

    const { mutate: agree, isPending: isAgreeing } = api.policy.useAgreePolicy()

    const handleAgree = () => {
        agree(undefined, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["getPolicyStatus"] })
            }
        })
    }
            
    if (!enabled) return children
    if (isStatusLoading) return <Loading />
    if (isStatusError) return <APIError error={statusError} />

    // Not required or already agreed → normal app
    if (!mustAgree) return children

    if (isPolicyLoading) return <Loading />

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem", height: "100%", overflow: "auto" }}>
            <Card style={{ maxWidth: 900, maxHeight: 700, width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h2 style={{ margin: 0 }}>{policy?.title || "Policy"}</h2>
                <div className="bp5-text-muted">
                    Please read and accept the policy to continue using MitoCube.
                </div>

                <div style={{
                    // whiteSpace: "pre-wrap",
                    maxHeight: "55vh",
                    overflowY: "auto",
                    padding: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: 4
                }}>
                    {/* {policy?.text} */}
                    <Markdown remarkPlugins={[remarkGfm]}>{policy?.text || ""}</Markdown>
                </div>

                <Checkbox
                    checked={checked}
                    label="I have read and agree to the policy"
                    onChange={(e) => setChecked(e.target.checked)}
                />

                <div className="flex justify-end">
                    <Button intent="primary" disabled={!checked} loading={isAgreeing} onClick={handleAgree}>
                        Agree and continue
                    </Button>
                </div>
            </Card>
        </div>
    )
}