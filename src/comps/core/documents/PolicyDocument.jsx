import { api } from "@/api"
import Loading from "@/comps/core/base/loading"
import APIError from "@/comps/core/error/APIerror"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

/**
 * Read-only view of one published document (the one an admin created under Platform & Content).
 * @param {Object} props
 * @param {String} props.type - "terms_of_use" or "data_protection"
 * @param {String} props.label - shown if the document has not been created yet
 */
export function PolicyDocument({ type, label }) {
    const { data: policies, isLoading, isError, error } = api.policy.useGetPolicies()

    if (isLoading) return <Loading />
    if (isError) return <APIError error={error} />

    const policy = policies.find(p => p.type === type)
    if (!policy) return <div style={{ padding: "1rem 1.5rem" }}>{label} has not been published yet.</div>

    return (
        <div style={{ maxHeight: "70vh", minWidth: "min(700px, 80vw)", overflowY: "auto", padding: "1rem 1.5rem" }}>
            <h3 style={{ marginTop: 0 }}>{policy.title || label}</h3>
            <div className="bp5-text-muted" style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
                Version {policy.version}
                {policy.updated_at ? ` · last updated ${new Date(policy.updated_at).toLocaleDateString()}` : ""}
            </div>
            <Markdown remarkPlugins={[remarkGfm]}>{policy.text}</Markdown>
        </div>
    )
}