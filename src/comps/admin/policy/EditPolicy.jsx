import { useState, useEffect } from "react"
import { Switch, Checkbox, Button, Callout } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
/**
 * Form to create or edit the policy. Used inside a dialog.
 * @param {Object} props
 * @param {Object} props.policy - existing policy, or undefined when creating
 * @param {Function} props.onSuccess
 */


const VIEW_MODES = [{ tag: "text", label: "Text" }, { tag: "preview", label: "Preview" }]


export function EditPolicy({ policy, onSuccess = () => {} }) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({ title: "", text: "", required: false, bump_version: false })
    const [markdownView, setMarkdownView] = useState("text")
    const { mutate: updatePolicy, isPending: isSaving } = api.policy.useUpdatePolicy()

    useEffect(() => {
        if (policy) {
            setFormData({
                title: policy.title || "",
                text: policy.text || "",
                required: policy.required || false,
                bump_version: true
            })
        } else {
            setFormData({ title: "", text: "", required: false, bump_version: false })
        }
    }, [policy])

    const handleSave = () => {
        updatePolicy(formData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["getPolicy"] })
                queryClient.invalidateQueries({ queryKey: ["getPolicyStatus"] })
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
            placeholder="Policy text (markdown)"
            style={{ width: "100%", height: "100%" }}
        />
    )}
    {markdownView === "preview" && (
        <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
            <Markdown remarkPlugins={[remarkGfm]}>{formData.text}</Markdown>
        </div>
    )}
</div>

            <Switch
                checked={formData.required}
                label="Required: users must agree before using MitoCube"
                onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
            />

            {policy && (
                <Checkbox
                    checked={formData.bump_version}
                    label="Require re-agreement (all users must agree again)"
                    onChange={(e) => setFormData(prev => ({ ...prev, bump_version: e.target.checked }))}
                />
            )}

            {formData.bump_version && (
                <Callout intent="warning">
                    Saving will reset the agreement of all users. Everyone will be blocked until they agree again.
                </Callout>
            )}

            <div className="flex justify-end">
                <Button intent="success" loading={isSaving} onClick={handleSave} disabled={formData.text.trim() === ""}>
                    {policy ? "Save" : "Create policy"}
                </Button>
            </div>
        </div>
    )
}