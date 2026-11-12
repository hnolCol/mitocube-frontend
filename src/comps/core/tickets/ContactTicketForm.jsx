import { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Callout, FormGroup, InputGroup, TextArea } from "@blueprintjs/core"
import { api } from "@/api"
import {
    TICKET_ATTACHMENT_ACCEPT,
    TICKET_ATTACHMENT_ALLOWED_EXTENSIONS,
    TICKET_ATTACHMENT_MAX_SIZE_MB,
    TicketAttachmentList,
    validateTicketAttachmentFile,
} from "./TicketAttachments"

const EMPTY = { title: "", description: "" }

export default function ContactTicketForm() {
    const [form, setForm] = useState(EMPTY)
    const [files, setFiles] = useState([])
    const [fileErrors, setFileErrors] = useState([])
    const [createdTag, setCreatedTag] = useState(null)
    const fileInputRef = useRef(null)
    const queryClient = useQueryClient()

    const createTicket = api.tickets.usePostTicket()
    const uploadAttachment = api.tickets.usePostTicketAttachment()

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
    const valid = form.title.trim().length >= 3 && form.description.trim().length >= 10

    const onFiles = async (e) => {
        const selected = Array.from(e.target.files ?? [])
        e.target.value = ""
        const errs = []
        const accepted = []
        for (const file of selected) {
            const { error } = await validateTicketAttachmentFile(file)
            if (error) errs.push(`${file.name}: ${error}`)
            else accepted.push(file)
        }
        setFileErrors(errs)
        setFiles((prev) => [...prev, ...accepted])
    }

    const submit = async (e) => {
        e.preventDefault()
        try {
            const created = await createTicket.mutateAsync(form)
            for (const file of files) {
                await uploadAttachment.mutateAsync({ ticket_tag: created.tag, file })
            }
            setForm(EMPTY)
            setFiles([])
            setFileErrors([])
            setCreatedTag(created.tag)
            queryClient.invalidateQueries({ queryKey: ["getMyTickets"] })
            queryClient.invalidateQueries({ queryKey: ["getTicketQueue"] })
            queryClient.invalidateQueries({ queryKey: ["getTicketAttachments", created.tag] })
        } catch {
            // errors are surfaced via createTicket.isError / uploadAttachment.isError
        }
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 640 }}>
            {createTicket.isSuccess && (
                <Callout intent="success" title="Message sent" style={{ marginBottom: 16 }}>
                    Your reference is <strong>{createTicket.data.reference}</strong>. Our reply will appear in your messages.
                </Callout>
            )}
            {createTicket.isError && (
                <Callout intent="danger" style={{ marginBottom: 16 }}>
                    {createTicket.error?.response?.data?.detail ?? "Could not send your message."}
                </Callout>
            )}
            {uploadAttachment.isError && (
                <Callout intent="danger" style={{ marginBottom: 16 }}>
                    {uploadAttachment.error?.response?.data?.detail ?? "An attachment could not be uploaded."}
                </Callout>
            )}

            <FormGroup label="Subject" labelFor="ticket-title">
                <InputGroup id="ticket-title" value={form.title} onChange={set("title")} maxLength={200} />
            </FormGroup>

            <FormGroup label="Message" labelFor="ticket-description" >
                <TextArea id="ticket-description" value={form.description} onChange={set("description")} rows={8} fill style={{ minHeight: "20rem" }} />
            </FormGroup>

            <FormGroup label="Attachments (optional)" labelFor="ticket-attachments"
                helperText={`Screenshots: ${TICKET_ATTACHMENT_ALLOWED_EXTENSIONS.join(", ")} only, max ${TICKET_ATTACHMENT_MAX_SIZE_MB} MB each.`}>
                <input
                    id="ticket-attachments"
                    ref={fileInputRef}
                    type="file"
                    accept={TICKET_ATTACHMENT_ACCEPT}
                    multiple
                    style={{ display: "none" }}
                    onChange={onFiles}
                />
                <Button icon="paperclip" text="Attach image" onClick={() => fileInputRef.current?.click()}
                    disabled={createTicket.isPending || uploadAttachment.isPending} />
                {files.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {files.map((f) => (
                            <span key={`${f.name}-${f.size}-${f.lastModified}`}
                                style={{ fontSize: 12, border: "1px solid rgba(0,0,0,0.15)", borderRadius: 6, padding: "2px 8px" }}>
                                {f.name}
                                <Button minimal small icon="cross" style={{ marginLeft: 4 }}
                                    onClick={() => setFiles((prev) => prev.filter((x) => x !== f))} />
                            </span>
                        ))}
                    </div>
                )}
                {fileErrors.length > 0 && (
                    <Callout intent="warning" style={{ marginTop: 6, padding: "6px 10px", fontSize: 12 }}>
                        {fileErrors.map((err, i) => <div key={i}>{err}</div>)}
                    </Callout>
                )}
            </FormGroup>

            {createdTag && (
                <div style={{ marginBottom: 16 }}>
                    <TicketAttachmentList ticket_tag={createdTag} />
                </div>
            )}

            <Button type="submit" intent="primary" icon="send-message" text="Send"
                loading={createTicket.isPending || uploadAttachment.isPending} disabled={!valid} />
        </form>
    )
}