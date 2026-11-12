import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
    Button, Callout, Card, Classes, Menu, MenuItem, NonIdealState,
    SegmentedControl, Spinner, Tag, TextArea,
} from "@blueprintjs/core"
import { api } from "@/api"
import { TicketAttachmentList, TicketAttachmentUpload } from "./TicketAttachments"

const STATUSES = ["Open", "In Progress", "Resolved"]
const STATUS_INTENT = { "Open": "warning", "In Progress": "primary", "Resolved": "success" }
const fmt = (ms) => (ms ? new Date(ms).toLocaleString() : "")

export default function AdminTicketQueue({ userTag }) {
    const [filter, setFilter] = useState("all")
    const [selectedTag, setSelectedTag] = useState(null)

    const { data: tickets = [], isLoading } = api.tickets.useGetTicketQueue(
        { status: filter === "all" ? undefined : filter }
    )
    const selected = useMemo(() => tickets.find((t) => t.tag === selectedTag) ?? null, [tickets, selectedTag])

    return (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, height: "100%", minHeight: 0 }}>
            <Card style={{ padding: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ padding: 12 }}>
                    <SegmentedControl
                        small fill value={filter} onValueChange={setFilter}
                        options={[{ label: "All", value: "all" }, ...STATUSES.map((s) => ({ label: s, value: s }))]}
                    />
                </div>
                <div style={{ overflowY: "auto", flex: 1 }}>
                    {isLoading ? <Spinner size={24} style={{ margin: 24 }} /> :
                     tickets.length === 0 ? <NonIdealState icon="inbox" title="No tickets" /> : (
                        <Menu>
                            {tickets.map((t) => (
                                <MenuItem
                                    key={t.tag}
                                    active={t.tag === selectedTag}
                                    onClick={() => setSelectedTag(t.tag)}
                                    multiline
                                    text={
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{t.title}</div>
                                            <div className={Classes.TEXT_MUTED} style={{ fontSize: 12 }}>
                                                {t.reference} · {t.raised_by_name || t.raised_by}
                                            </div>
                                            {t.assigned_to && (
                                                <div className={Classes.TEXT_MUTED} style={{ fontSize: 12 }}>
                                                    Handled by {t.assigned_to === userTag ? "you" : (t.assigned_to_name || t.assigned_to)}
                                                </div>
                                            )}
                                        </div>
                                    }
                                    labelElement={
                                        <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                            {t.awaiting_reply && t.status !== "Resolved" && (
                                                <Tag round intent="danger" icon="comment">New</Tag>
                                            )}
                                            <Tag minimal intent={STATUS_INTENT[t.status]}>{t.status}</Tag>
                                        </span>
                                    }
                                />
                            ))}
                        </Menu>
                    )}
                </div>
            </Card>

            <Card style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                {selected
                    ? <TicketThread key={selected.tag} ticket={selected} userTag={userTag} />
                    : <NonIdealState icon="chat" title="Select a ticket" />}
            </Card>
        </div>
    )
}


function TicketThread({ ticket, userTag }) {
    const queryClient = useQueryClient()
    const [content, setContent] = useState("")

    const handledByOther = !!ticket.assigned_to && ticket.assigned_to !== userTag
    const isResolved = ticket.status === "Resolved"

    const { data: messages = [], isLoading } = api.messages.useGetConversationMessages(
        { conversation_tag: ticket.conversation_tag },
        { staleTime: 500, enabled: !!ticket.conversation_tag }
    )

    const reply = api.tickets.usePostTicketReply({
        onSuccess: (updated) => {
            setContent("")
            queryClient.invalidateQueries({ queryKey: ["getTicketQueue"] })
            queryClient.invalidateQueries({ queryKey: ["getConversationMessages", updated.conversation_tag] })
            queryClient.invalidateQueries({ queryKey: ["getMyConversations"] })
        }
    })

    const send = (resolve) => reply.mutate({ ticket_tag: ticket.tag, content: content.trim(), resolve })

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                    <h4 className={Classes.HEADING} style={{ margin: 0 }}>{ticket.title}</h4>
                    <div className={Classes.TEXT_MUTED} style={{ fontSize: 12 }}>
                        from {ticket.raised_by_name || ticket.raised_by}
                    </div>
                </div>
                <Tag minimal>{ticket.reference}</Tag>
                <Tag intent={STATUS_INTENT[ticket.status]}>{ticket.status}</Tag>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
                {/* before the first reply the request only lives on the ticket */}
                {!ticket.conversation_tag && (
                    <Bubble
                        mine={false}
                        authorTag={ticket.raised_by}
                        fallbackName={ticket.raised_by_name}
                        time={ticket.created_at}
                        body={ticket.description} />
                )}

                {isLoading && ticket.conversation_tag && <Spinner size={20} />}
                {messages.map((m) => (
                    <Bubble
                        key={m.tag}
                        mine={m.sender_tag !== ticket.raised_by}
                        authorTag={m.sender_tag}
                        fallbackName={m.sender_tag === ticket.raised_by ? ticket.raised_by_name : null}
                        time={m.created_at}
                        body={m.content}
                    />
                ))}
                <TicketAttachmentList ticket_tag={ticket.tag} />
            </div>

            <div style={{ marginTop: 12 }}>
                {handledByOther ? (
                    <Callout intent="primary" icon="lock">
                        This ticket is handled by <strong>{ticket.assigned_to_name || ticket.assigned_to}</strong>.
                    </Callout>
                ) : (
                    <>
                        {reply.isError && (
                            <Callout intent="danger" style={{ marginBottom: 8 }}>
                                {reply.error?.response?.data?.detail ?? "Could not send the reply."}
                            </Callout>
                        )}
                        <TextArea
                            fill rows={4}
                            style={{ minHeight: "20rem" }}
                            placeholder={ticket.conversation_tag ? "Write a reply…" : "First reply starts a conversation with the user…"}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", justifyContent: "flex-end" }}>
                            <TicketAttachmentUpload ticket_tag={ticket.tag} disabled={reply.isPending} />
                            {!isResolved && (
                                <Button icon="tick" intent="success" text={content.trim() ? "Send & resolve" : "Resolve"}
                                        loading={reply.isPending} onClick={() => send(true)} />
                            )}
                            <Button intent="primary" icon="send-message" text="Send"
                                    loading={reply.isPending} disabled={!content.trim()} onClick={() => send(false)} />
                        </div>
                    </>
                )}
            </div>
        </>
    )
}


function Bubble({ mine, authorTag, fallbackName, time, body }) {
    const { data: author } = api.users.core.useGetPublicUserByTag(
        { tag: authorTag }, { enabled: !!authorTag, staleTime: Infinity }
    )
    const authorName = author
        ? `${author.firstname} ${author.lastname}`
        : (fallbackName || authorTag)

    return (
        <div style={{
            alignSelf: mine ? "flex-end" : "flex-start",
            maxWidth: "75%",
            padding: "8px 12px",
            borderRadius: 8,
            background: mine ? "rgba(45,114,210,0.15)" : "rgba(143,153,168,0.15)",
        }}>
            <div style={{ whiteSpace: "pre-wrap" }}>{body}</div>
            <div className={Classes.TEXT_MUTED} style={{ fontSize: 11, marginTop: 4 }}>
                {authorName} · {fmt(time)}
            </div>
        </div>
    )
}