import { useState, useEffect } from "react"
import { Switch, Checkbox, Button, Callout } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"

/**
 * Form to create or edit one document (terms of use / data protection). Used inside a dialog.
 * @param {Object} props
 * @param {String} props.type - "terms_of_use" or "data_protection"
 * @param {String} props.label - default title, e.g. "Terms of Use"
 * @param {Object} props.policy - existing policy, or undefined when creating
 * @param {Function} props.onSuccess
 */

const VIEW_MODES = [{ tag: "text", label: "Text" }, { tag: "preview", label: "Preview" }]


export function EditPolicy({ type, label, policy, onSuccess = () => {} }) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({ title: label, text: "", required: false, bump_version: false })
    const [markdownView, setMarkdownView] = useState("text")
    const [errorMessage, setErrorMessage] = useState(null)
    const { mutate: createPolicy, isPending: isCreating } = api.policy.useCreatePolicy()
    const { mutate: updatePolicy, isPending: isUpdating } = api.policy.useUpdatePolicy()
    const isSaving = isCreating || isUpdating

    useEffect(() => {
        setErrorMessage(null)
        if (policy) {
            setFormData({
                title: policy.title || label,
                text: policy.text || "",
                required: policy.required || false,
                bump_version: true
            })
        } else {
            setFormData({ title: label, text: "", required: false, bump_version: false })
        }
    }, [policy, label])

    const handleSave = () => {
        setErrorMessage(null)
        const options = {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["getPolicies"] })
                queryClient.invalidateQueries({ queryKey: ["getPolicyStatus"] })
                onSuccess()
            },
            onError: (err) => {
                const detail = err?.response?.data?.detail
                setErrorMessage(typeof detail === "string" ? detail : "Saving failed.")
            }
        }
        if (policy) {
            updatePolicy({ tag: policy.tag, ...formData }, options)
        } else {
            createPolicy({ type, title: formData.title, text: formData.text, required: formData.required }, options)
        }
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
                        placeholder="Text (markdown)"
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
                    label="Create a new version (all users must agree again)"
                    onChange={(e) => setFormData(prev => ({ ...prev, bump_version: e.target.checked }))}
                />
            )}

            {policy && formData.bump_version && (
                <Callout intent="warning">
                    Saving creates version {policy.version + 1}. The current version is archived, and everyone will be blocked until they agree to the new one.
                </Callout>
            )}

            {policy && !formData.bump_version && (
                <Callout intent="primary">
                    Saving edits the current version in place (for example for typos). Users do not have to agree again.
                </Callout>
            )}

            {errorMessage && <Callout intent="danger">{errorMessage}</Callout>}

            <div className="flex justify-end">
                <Button intent="success" loading={isSaving} onClick={handleSave}
                    disabled={formData.text.trim() === "" || formData.title.trim() === ""}>
                    {policy ? "Save" : "Create"}
                </Button>
            </div>
        </div>
    )
}