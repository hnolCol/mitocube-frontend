import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Callout, Classes, Dialog, DialogBody, Spinner } from "@blueprintjs/core"
import { api } from "@/api"

// Mirrors the backend rules (PR #158, services/ticket_attachments.py): only PNG, JPEG,
// GIF and WebP images, verified by magic bytes, max 10 MB per file. The filename/extension
// alone is never trusted.
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
 * @description Client-side validation of a ticket attachment, mirroring the backend:
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

TicketAttachmentUpload.propTypes = {
    ticket_tag: PropTypes.string.isRequired,
    onUploaded: PropTypes.func,
    disabled: PropTypes.bool,
}

/**
 * @description Upload button for ticket image attachments. Validates each selected file
 * (extension, MIME type, size, magic bytes) before sending it as multipart/form-data.
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
}

/**
 * @description Lists the image attachments of a ticket as thumbnails with filename, size,
 * uploader and time. Clicking a thumbnail opens a full-size preview dialog. Images are
 * fetched as authenticated blobs and rendered from object URLs (the token never appears
 * in a URL and no remote content is loaded).
 * @param {Object} props
 * @param {String} props.ticket_tag Ticket tag
 */
export function TicketAttachmentList({ ticket_tag }) {
    const [preview, setPreview] = useState(null)
    const { data: attachments = [], isLoading } = api.tickets.useGetTicketAttachments(
        { ticket_tag }, { enabled: !!ticket_tag }
    )
    if (!ticket_tag) return null
    return (
        <div style={{ marginTop: 8 }}>
            {isLoading ? <Spinner size={16} /> : attachments.length === 0 ? null : (
                <>
                    <div className={Classes.TEXT_MUTED} style={{ fontSize: 11, marginBottom: 4 }}>
                        Attachments ({attachments.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {attachments.map((a) => (
                            <AttachmentThumb key={a.tag} ticket_tag={ticket_tag} attachment={a} onPreview={setPreview} />
                        ))}
                    </div>
                </>
            )}
            <Dialog
                isOpen={!!preview}
                onClose={() => setPreview(null)}
                title={preview?.filename ?? "Attachment"}
                style={{ width: "min(90vw, 900px)" }}
            >
                <DialogBody>
                    {preview && (
                        <AttachmentImage
                            ticket_tag={ticket_tag}
                            attachment={preview}
                            style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto" }}
                        />
                    )}
                    {preview && (
                        <div className={Classes.TEXT_MUTED} style={{ fontSize: 12, marginTop: 8 }}>
                            {preview.filename} · {formatSize(preview.size)} · {preview.uploaded_by_name || preview.uploaded_by} · {fmtTime(preview.created_at)}
                        </div>
                    )}
                </DialogBody>
            </Dialog>
        </div>
    )
}

function AttachmentThumb({ ticket_tag, attachment, onPreview }) {
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
                <AttachmentImage ticket_tag={ticket_tag} attachment={attachment}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div className={Classes.TEXT_MUTED} style={{
                fontSize: 10, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
                {attachment.filename} · {formatSize(attachment.size)}
            </div>
        </div>
    )
}

function AttachmentImage({ ticket_tag, attachment, style }) {
    const { data: blob, isLoading } = api.tickets.useGetTicketAttachmentFile(
        { ticket_tag, attachment_tag: attachment.tag }
    )
    const [url, setUrl] = useState(null)
    useEffect(() => {
        if (!blob) return undefined
        const objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
    }, [blob])
    if (!url) return isLoading ? <Spinner size={14} /> : null
    return <img src={url} alt={attachment.filename} style={style} />
}
