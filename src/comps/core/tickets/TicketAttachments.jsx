import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Callout, Classes, Dialog, DialogBody, Spinner, Icon } from "@blueprintjs/core"
import { api } from "@/api"

// Mirrors the backend rules (PR #158, services/ticket_attachments.py): only PNG, JPEG,
// GIF and WebP images, verified by magic bytes, max 10 MB per file. The filename/extension
// alone is never trusted. Used for ticket and conversation attachments.
export const TICKET_ATTACHMENT_ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"]
export const TICKET_ATTACHMENT_ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"]
export const TICKET_ATTACHMENT_MAX_SIZE_MB = 10
export const TICKET_ATTACHMENT_ACCEPT = "image/png,image/jpeg,image/gif,image/webp,.png,.jpg,.jpeg,.gif,.webp"

const IMAGE_SIGNATURES = [
    (d) => d.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => d[i] === b),
    (d) => d.length >= 3 && d[0] === 0xff && d[1] === 0xd8 && d[2] === 0xff,
    (d) => d.length >= 6 && d[0] === 0x47 && d[1] === 0x49 && d[2] === 0x46 && d[3] === 0x38 && (d[4] === 0x37 || d[4] === 0x39) && d[5] === 0x61,
    (d) => d.length >= 12 && d[0] === 0x52 && d[1] === 0x49 && d[2] === 0x46 && d[3] === 0x46 && d[8] === 0x57 && d[9] === 0x45 && d[10] === 0x42 && d[11] === 0x50,
]

const matchesSignature = (head) => IMAGE_SIGNATURES.some((matches) => matches(head))

/**
 * @description Client-side validation of an image attachment, mirroring the backend:
 * allowed extension, allowed MIME type, size cap and magic-byte check.
 * @param {File} file Selected file
 * @returns {Promise<{error: String|null}>} error message or null when valid
 */
export async function validateTicketAttachmentFile(file) {
    const name = (file?.name ?? "").toLowerCase()
    if (!TICKET_ATTACHMENT_ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
        return { error: `Only ${TICKET_ATTACHMENT_ALLOWED_EXTENSIONS.join(", ")} images are allowed.` }
    }
    if (file.type && !TICKET_ATTACHMENT_ALLOWED_MIME_TYPES.includes(file.type)) {
        return { error: "Only PNG, JPEG, GIF or WebP images are allowed." }
    }
    if (file.size > TICKET_ATTACHMENT_MAX_SIZE_MB * 1024 * 1024) {
        return { error: `The image is larger than ${TICKET_ATTACHMENT_MAX_SIZE_MB} MB.` }
    }
    const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (!matchesSignature(head)) {
        return { error: "The file content is not a supported image (PNG, JPEG, GIF or WebP)." }
    }
    return { error: null }
}

const formatSize = (bytes) => {
    if (!Number.isFinite(bytes)) return ""
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
    return `${bytes} B`
}

const fmtTime = (ms) => (ms ? new Date(ms).toLocaleString() : "")

/**
 * @description Reads a Blob/File into a data URL. Data URLs work under CSPs that block
 * blob: URLs. `type` forces the MIME type, in case the response blob is untyped.
 * @param {Blob} blob Blob or File
 * @param {String} [type] MIME type to apply
 * @returns {{url: String|null, failed: Boolean}}
 */
function useDataUrl(blob, type) {
    const [state, setState] = useState({ url: null, failed: false })
    useEffect(() => {
        setState({ url: null, failed: false })
        if (blob == null) return undefined
        if (!(blob instanceof Blob)) {
            setState({ url: null, failed: true })
            return undefined
        }
        let cancelled = false
        const reader = new FileReader()
        reader.onload = () => { if (!cancelled) setState({ url: reader.result, failed: false }) }
        reader.onerror = () => { if (!cancelled) setState({ url: null, failed: true }) }
        reader.readAsDataURL(type ? new Blob([blob], { type }) : blob)
        return () => { cancelled = true }
    }, [blob, type])
    return state
}

/**
 * @description Uploads files to a ticket one by one and returns the attachment tags.
 * @param {Function} mutateAsync usePostTicketAttachment().mutateAsync
 * @param {String} ticket_tag Ticket tag
 * @param {File[]} files Files to upload
 * @returns {Promise<String[]>} Attachment tags
 */
export async function uploadTicketFiles(mutateAsync, ticket_tag, files) {
    const tags = []
    for (const file of files) tags.push((await mutateAsync({ ticket_tag, file })).tag)
    return tags
}

/**
 * @description Uploads files to a conversation one by one and returns the attachment tags.
 * @param {Function} mutateAsync usePostConversationAttachment().mutateAsync
 * @param {String} conversation_tag Conversation tag
 * @param {File[]} files Files to upload
 * @returns {Promise<String[]>} Attachment tags
 */
export async function uploadConversationFiles(mutateAsync, conversation_tag, files) {
    const tags = []
    for (const file of files) tags.push((await mutateAsync({ conversation_tag, file })).tag)
    return tags
}

/**
 * @description Image picker with client-side validation and previews of the picked files.
 * Nothing is uploaded until the caller does so (e.g. on Send).
 * @param {Object} [options]
 * @param {Boolean} [options.disabled] Disable the button
 * @param {String} [options.text] Button text (icon only if omitted)
 * @returns {{files: File[], button: JSX.Element, previews: JSX.Element|null, clear: Function}}
 */
export function useAttachmentPicker({ disabled = false, text } = {}) {
    const inputRef = useRef(null)
    const [files, setFiles] = useState([])
    const [errors, setErrors] = useState([])

    const onFiles = async (e) => {
        const selected = Array.from(e.target.files ?? [])
        e.target.value = ""
        const errs = []
        const ok = []
        for (const file of selected) {
            const { error } = await validateTicketAttachmentFile(file)
            if (error) errs.push(`${file.name}: ${error}`)
            else ok.push(file)
        }
        setErrors(errs)
        if (ok.length > 0) setFiles((prev) => [...prev, ...ok])
    }

    const clear = () => {
        setFiles([])
        setErrors([])
    }

    const button = <>
        <input
            ref={inputRef}
            type="file"
            accept={TICKET_ATTACHMENT_ACCEPT}
            multiple
            style={{ display: "none" }}
            onChange={onFiles}
        />
        <Button
            small
            icon="paperclip"
            text={text}
            disabled={disabled}
            title={`Attach images (${TICKET_ATTACHMENT_ALLOWED_EXTENSIONS.join(" ")}, max ${TICKET_ATTACHMENT_MAX_SIZE_MB} MB)`}
            onClick={() => inputRef.current?.click()}
        />
    </>

    const previews = files.length > 0 || errors.length > 0 ? (
        <div style={{ marginTop: 6 }}>
            {files.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {files.map((f) => (
                        <PendingThumb
                            key={`${f.name}-${f.size}-${f.lastModified}`}
                            file={f}
                            onRemove={() => setFiles((prev) => prev.filter((x) => x !== f))}
                        />
                    ))}
                </div>
            )}
            {errors.length > 0 && (
                <Callout intent="warning" style={{ marginTop: 6, padding: "6px 10px", fontSize: 12 }}>
                    {errors.map((err, i) => <div key={i}>{err}</div>)}
                </Callout>
            )}
        </div>
    ) : null

    return { files, button, previews, clear }
}

function PendingThumb({ file, onRemove }) {
    const { url } = useDataUrl(file)
    return (
        <div style={{ position: "relative", width: 72 }} title={file.name}>
            <div style={{
                width: 72, height: 54, borderRadius: 6, overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.15)", display: "flex", alignItems: "center",
                justifyContent: "center", background: "#f5f8fa",
            }}>
                {url
                    ? <img src={url} alt={file.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    : <Spinner size={14} />}
            </div>
            <div className={Classes.TEXT_MUTED} style={{
                fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
                {file.name}
            </div>
            <Button
                minimal small icon="cross" aria-label="Remove" onClick={onRemove}
                style={{
                    position: "absolute", top: -6, right: -6, minHeight: 18, minWidth: 18,
                    padding: 0, background: "white", borderRadius: "50%",
                }}
            />
        </div>
    )
}

TicketAttachmentUpload.propTypes = {
    ticket_tag: PropTypes.string.isRequired,
    onUploaded: PropTypes.func,
    disabled: PropTypes.bool,
}

/**
 * @description Upload button for ticket image attachments that uploads immediately
 * (not linked to a message). Validates each selected file before sending it.
 * @param {Object} props
 * @param {String} props.ticket_tag Ticket tag
 * @param {Function} [props.onUploaded] Called after each successful upload
 * @param {Boolean} [props.disabled] Disable the button (e.g. while another upload runs)
 */
export function TicketAttachmentUpload({ ticket_tag, onUploaded, disabled }) {
    const inputRef = useRef(null)
    const queryClient = useQueryClient()
    const [errors, setErrors] = useState([])
    const [pending, setPending] = useState([])

    const upload = api.tickets.usePostTicketAttachment({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getTicketAttachments", ticket_tag] })
            if (typeof onUploaded === "function") onUploaded()
        },
    })

    const onFiles = async (e) => {
        const files = Array.from(e.target.files ?? [])
        e.target.value = ""
        if (files.length === 0 || !ticket_tag) return
        const valid = []
        const errs = []
        for (const file of files) {
            const { error } = await validateTicketAttachmentFile(file)
            if (error) errs.push(`${file.name}: ${error}`)
            else valid.push(file)
        }
        setErrors(errs)
        for (const file of valid) {
            setPending((p) => [...p, file.name])
            try {
                await upload.mutateAsync({ ticket_tag, file })
            } catch (err) {
                setErrors((p) => [...p, `${file.name}: ${err?.response?.data?.detail ?? "Upload failed."}`])
            } finally {
                setPending((p) => p.filter((n) => n !== file.name))
            }
        }
    }

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept={TICKET_ATTACHMENT_ACCEPT}
                multiple
                style={{ display: "none" }}
                onChange={onFiles}
            />
            <Button
                small
                icon="paperclip"
                text="Attach image"
                title={`Attach a screenshot (${TICKET_ATTACHMENT_ALLOWED_EXTENSIONS.join(" ")}, max ${TICKET_ATTACHMENT_MAX_SIZE_MB} MB)`}
                disabled={disabled || !ticket_tag}
                loading={pending.length > 0}
                onClick={() => inputRef.current?.click()}
            />
            {pending.length > 0 && (
                <div className={Classes.TEXT_MUTED} style={{ fontSize: 11, marginTop: 4 }}>
                    Uploading {pending.join(", ")}…
                </div>
            )}
            {errors.length > 0 && (
                <Callout intent="danger" style={{ marginTop: 6, padding: "6px 10px", fontSize: 12 }}>
                    {errors.map((err, i) => <div key={i}>{err}</div>)}
                </Callout>
            )}
        </div>
    )
}

TicketAttachmentList.propTypes = {
    ticket_tag: PropTypes.string,
    unlinkedOnly: PropTypes.bool,
}

/**
 * @description Lists the image attachments of a ticket as thumbnails. With `unlinkedOnly`,
 * only attachments that are not shown inline in a conversation message.
 * @param {Object} props
 * @param {String} props.ticket_tag Ticket tag
 * @param {Boolean} [props.unlinkedOnly] Hide attachments that belong to a message
 */
export function TicketAttachmentList({ ticket_tag, unlinkedOnly = false }) {
    const { data = [], isLoading } = api.tickets.useGetTicketAttachments(
        { ticket_tag }, { enabled: !!ticket_tag }
    )
    if (!ticket_tag) return null
    if (isLoading) return <Spinner size={16} />
    const attachments = unlinkedOnly ? data.filter((a) => !a.message_tag) : data
    if (attachments.length === 0) return null
    return (
        <div style={{ marginTop: 8 }}>
            <div className={Classes.TEXT_MUTED} style={{ fontSize: 11, marginBottom: 4 }}>
                Attachments ({attachments.length})
            </div>
            <AttachmentGallery ticket_tag={ticket_tag} attachments={attachments} />
        </div>
    )
}

AttachmentGallery.propTypes = {
    ticket_tag: PropTypes.string,
    conversation_tag: PropTypes.string,
    attachments: PropTypes.array,
}

/**
 * @description Thumbnails of attachments; clicking one opens a full-size preview.
 * Images are fetched through the ticket endpoint when `ticket_tag` is given, otherwise
 * through the conversation endpoint (which also serves a support conversation's ticket
 * images). Images are fetched as authenticated blobs (the token never appears in a URL).
 * @param {Object} props
 * @param {String} [props.ticket_tag] Ticket tag the attachments belong to
 * @param {String} [props.conversation_tag] Conversation tag the attachments belong to
 * @param {Object[]} props.attachments Attachments (tag, filename, content_type, size, ...)
 */
export function AttachmentGallery({ ticket_tag, conversation_tag, attachments }) {
    const [preview, setPreview] = useState(null)
    if ((!ticket_tag && !conversation_tag) || !Array.isArray(attachments) || attachments.length === 0) return null
    const meta = preview
        ? [preview.filename, formatSize(preview.size), preview.uploaded_by_name || preview.uploaded_by, fmtTime(preview.created_at)]
            .filter(Boolean).join(" · ")
        : ""
    return <>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {attachments.map((a) => (
                <AttachmentThumb key={a.tag} ticket_tag={ticket_tag} conversation_tag={conversation_tag}
                    attachment={a} onPreview={setPreview} />
            ))}
        </div>
        <Dialog
            isOpen={!!preview}
            onClose={() => setPreview(null)}
            title={preview?.filename ?? "Attachment"}
            style={{ width: "min(90vw, 900px)" }}
        >
            <DialogBody>
                {preview && <>
                    <AttachmentImage
                        ticket_tag={ticket_tag}
                        conversation_tag={conversation_tag}
                        attachment={preview}
                        style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto" }}
                    />
                    <div className={Classes.TEXT_MUTED} style={{ fontSize: 12, marginTop: 8 }}>{meta}</div>
                </>}
            </DialogBody>
        </Dialog>
    </>
}

function AttachmentThumb({ ticket_tag, conversation_tag, attachment, onPreview }) {
    return (
        <div
            style={{ width: 96, cursor: "zoom-in" }}
            onClick={() => onPreview(attachment)}
            title={attachment.filename}
        >
            <div style={{
                width: 96, height: 72, borderRadius: 6, overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                background: "#f5f8fa",
            }}>
                <AttachmentImage ticket_tag={ticket_tag} conversation_tag={conversation_tag}
                    attachment={attachment} compact
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div style={{
                fontSize: 10, marginTop: 2, opacity: 0.75,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
                {attachment.filename} · {formatSize(attachment.size)}
            </div>
        </div>
    )
}

function AttachmentImage({ ticket_tag, conversation_tag, attachment, style, compact }) {
    // only one of the two queries is enabled
    const ticketFile = api.tickets.useGetTicketAttachmentFile(
        { ticket_tag: ticket_tag || null, attachment_tag: attachment.tag }
    )
    const conversationFile = api.tickets.useGetConversationAttachmentFile(
        { conversation_tag: ticket_tag ? null : (conversation_tag || null), attachment_tag: attachment.tag }
    )
    const { data: blob, isLoading, isError, refetch } = ticket_tag ? ticketFile : conversationFile
    const { url, failed: readFailed } = useDataUrl(blob, attachment.content_type)
    const [imgFailed, setImgFailed] = useState(false)
    useEffect(() => setImgFailed(false), [url])

    if (isLoading || (blob && !url && !readFailed)) return <Spinner size={14} />
    if (isError || readFailed || imgFailed || !url) {
        return (
            <div style={{
                ...style, width: "100%", height: "100%", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 4, color: "rgba(92,112,128,0.8)",
            }}>
                <Icon icon="media" />
                {!compact && <span style={{ fontSize: 12 }}>The image could not be loaded.</span>}
                <Button small minimal icon="refresh" title="Retry" aria-label="Retry"
                    onClick={(e) => { e.stopPropagation(); setImgFailed(false); refetch() }} />
            </div>
        )
    }
    return (
        <img src={url} alt={attachment.filename} style={style}
            onError={() => setImgFailed(true)} />
    )
}