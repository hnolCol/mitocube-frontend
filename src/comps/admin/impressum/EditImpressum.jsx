import { useState, useEffect } from "react"
import { Button } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"

const VIEW_MODES = [{ tag: "text", label: "Text" }, { tag: "preview", label: "Preview" }]

/**
 * Form to edit the impressum. Used inside a dialog.
 * @param {Object} props
 * @param {Object} props.impressum - existing impressum, or undefined when none exists yet
 * @param {Function} props.onSuccess
 */
export function EditImpressum({ impressum, onSuccess = () => {} }) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({ title: "", text: "" })
    const [markdownView, setMarkdownView] = useState("text")
    const { mutate: updateImpressum, isPending: isSaving } = api.impressum.useUpdateImpressum()

    useEffect(() => {
        setFormData({
            title: impressum?.title || "",
            text: impressum?.text || ""
        })
    }, [impressum])

    const handleSave = () => {
        updateImpressum(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["getImpressum"] })
                onSuccess()
            }
        })
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", height: "100%", minHeight: 0 }}>
            <input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-input"
                type="text"
                placeholder="Title"
            />
            <div className="flex" style={{ gap: "1rem" }}>
                {VIEW_MODES.map(option => (
                    <OptionButton key={option.tag} isSelected={markdownView === option.tag} onClick={() => setMarkdownView(option.tag)}>
                        {option.label}
                    </OptionButton>
                ))}
            </div>
            <div style={{ flex: 1, minHeight: 300, overflow: "hidden", border: "1px solid #ccc", padding: "8px" }}>
                {markdownView === "text" && (
                    <textarea
                        value={formData.text}
                        onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                        className="text-input padding--medium"
                        placeholder="Impressum text (markdown)"
                        style={{ width: "100%", height: "100%" }}
                    />
                )}
                {markdownView === "preview" && (
                    <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
                        <Markdown remarkPlugins={[remarkGfm]}>{formData.text}</Markdown>
                    </div>
                )}
            </div>
            <div className="flex justify-end">
                <Button
                    intent="success"
                    loading={isSaving}
                    onClick={handleSave}
                    disabled={formData.text.trim() === ""}
                >
                    Save
                </Button>
            </div>
        </div>
    )
}
