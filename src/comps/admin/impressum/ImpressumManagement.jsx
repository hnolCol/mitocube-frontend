import { useState } from "react"
import { Dialog, Button } from "@blueprintjs/core"
import { api } from "@/api"
import Loading from "@/comps/core/base/loading"
import APIError from "@/comps/core/error/APIerror"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { EditImpressum } from "./EditImpressum"

/**
 * Admin page: shows the current impressum as a card, edit in a dialog.
 */
export function ImpressumManagement() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const { data: impressum, isLoading, isError, error } = api.impressum.useGetImpressum(
        {},
        { retry: false }
    )

    if (isLoading) return <Loading />
    if (isError) return <APIError error={error} />

    return (
        <div className="div--expand padding--medium"
            style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem" }}>
                <h3>Impressum</h3>
                <Dialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    canEscapeKeyClose={true}
                    canOutsideClickClose={false}
                    title="Edit Impressum"
                    style={{ width: "60vw", height: "80vh", minHeight: "600px", fontSize: "1rem" }}
                >
                    <EditImpressum impressum={impressum} onSuccess={() => setIsDialogOpen(false)} />
                </Dialog>
                <div className="container--shadow padding--medium margin-top--little"
                    style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <div className="flex" style={{ justifyContent: "space-between", alignItems: "center" }}>
                        <div className="flex" style={{ alignItems: "center", gap: "0.6rem" }}>
                            <strong>{impressum?.title || "Untitled impressum"}</strong>
                        </div>
                        <Button icon="edit" minimal onClick={() => setIsDialogOpen(true)}>Edit</Button>
                    </div>
                    <div style={{
                        maxHeight: isExpanded ? "none" : 200,
                        overflow: "hidden",
                        maskImage: isExpanded ? "none" : "linear-gradient(to bottom, black 70%, transparent)"
                    }}>
                        <Markdown remarkPlugins={[remarkGfm]}>{impressum?.text || ""}</Markdown>
                    </div>
                    <div>
                        <Button minimal small onClick={() => setIsExpanded(prev => !prev)}>
                            {isExpanded ? "Show less" : "Show more"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
