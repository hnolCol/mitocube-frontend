import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { api } from "@/api"
import Loading from "../base/loading"
import APIError from "../error/APIerror"

/**
 * Renders the impressum managed by the admin (GET /api/impressum).
 */
export function Impressum() {
    const { data: impressum, isLoading, isError, error } = api.impressum.useGetImpressum(
        {},
        { retry: false }
    )

    if (isLoading) return <Loading />
    if (isError) return <APIError error={error} />

    return (
        <div className="margin--medium padding--medium" style={{ maxWidth: "800px" }}>
            <h2>{impressum?.title || "Impressum"}</h2>
            <Markdown remarkPlugins={[remarkGfm]}>{impressum?.text || ""}</Markdown>
        </div>
    )
}
