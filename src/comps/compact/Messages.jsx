import _ from "lodash";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { api } from "@/api";
import { PlainUserInput } from "@/comps/core/input/api/PlainUserInput";

/**
 * @description Formatted timestamp for a message: HH:mm today, otherwise D MMM HH:mm.
 * @param {Number} ts Timestamp in ms
 * @returns {String} Formatted time.
 */
function formatTime(ts) {
    if (!_.isNumber(ts)) return "";
    const m = moment(ts);
    return m.isSame(moment(), "day") ? m.format("HH:mm") : m.format("D MMM HH:mm");
}

/**
 * @description Open conversation view: message bubbles plus a send box (hidden for read-only
 * support notifications).
 * @param {Object} props
 * @param {String} props.conversation_tag Conversation tag
 * @param {String} props.user_tag Tag of the current user
 * @param {Function} props.onBack Back callback to the conversation list
 * @returns {JSX.Element} The conversation panel.
 */
function CompactConversation({ conversation_tag, user_tag, onBack }) {
    const [message, setMessage] = useState("");
    const scrollRef = useRef(null);
    const { data: conversation } = api.messages.useGetConversation(
        { conversation_tag }, { enabled: _.isString(conversation_tag), staleTime: 30000, retry: false }
    );
    const { data: messages, isLoading, refetch } = api.messages.useGetConversationMessages(
        { conversation_tag }, { enabled: _.isString(conversation_tag), staleTime: 0, refetchInterval: 10000, retry: false }
    );
    const { mutate: postMessage, isPending } = api.messages.usePostConversationMessage({
        onSuccess: () => { setMessage(""); refetch(); },
    });

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [_.isArray(messages) ? messages.length : 0]);

    const isReadOnly = _.isObject(conversation) && conversation.read_only === true;
    const canSend = !isReadOnly && _.isString(message) && message.trim().length > 0 && !isPending;
    const title = _.isObject(conversation) && _.isString(conversation.title) && conversation.title.length > 0
        ? conversation.title : "Conversation";

    return (
        <div className="compact__card">
            <div className="compact__row" style={{ marginTop: 0, justifyContent: "space-between" }}>
                <strong style={{ fontSize: "0.95rem" }}>{title}</strong>
                <button className="compact__button compact__button--ghost" onClick={onBack}>← Back</button>
            </div>
            {_.isObject(conversation) && _.isString(conversation.submission_tag) ? (
                <div className="compact__hint">About submission {conversation.submission_tag}</div>
            ) : null}
            <div ref={scrollRef} style={{ maxHeight: "45vh", overflowY: "auto", marginTop: "0.5rem" }}>
                {isLoading ? <div className="compact__hint">Loading…</div> : null}
                {_.isArray(messages) ? messages.map(msg => {
                    const isMe = msg.sender_tag === user_tag;
                    return (
                        <div key={msg.tag} className={`compact__message ${isMe ? "compact__message--me" : "compact__message--other"}`}>
                            <div>{msg.content}</div>
                            <div className="compact__message__meta">{formatTime(msg.created_at)}</div>
                        </div>
                    );
                }) : null}
            </div>
            {isReadOnly ? (
                <div className="compact__hint">This is a notification from MitoCube Support. Replies are not possible.</div>
            ) : (
                <div className="compact__row" style={{ marginTop: "0.5rem" }}>
                    <input
                        className="compact__input"
                        style={{ flex: 1, width: "auto" }}
                        placeholder="Write a message…"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && canSend) postMessage({ conversation_tag, content: message }); }}
                    />
                    <button
                        className="compact__button"
                        disabled={!canSend}
                        onClick={() => postMessage({ conversation_tag, content: message })}
                    >
                        Send
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * @description Form to start a new conversation. Participants are entered as a comma
 * separated list of user tags.
 * @param {Object} props
 * @param {String} props.user_tag Tag of the current user (added automatically)
 * @param {Function} props.onCreated Callback with the new conversation tag
 * @returns {JSX.Element} The new conversation form.
 */
function NewConversationForm({ user_tag, onCreated }) {
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [title, setTitle] = useState("");
    const [initialMessage, setInitialMessage] = useState("");
    const { mutate, isPending, isError, error } = api.messages.usePostConversation({
        onSuccess: (conversation_tag) => {
            setSelectedParticipants([]); setTitle(""); setInitialMessage("");
            if (_.isString(conversation_tag)) onCreated(conversation_tag);
        },
    });

    const userTags = _.uniq([...selectedParticipants, ...(_.isString(user_tag) ? [user_tag] : [])]);
    const canSubmit = userTags.length > 1 && !isPending;

    return (
        <div className="compact__card">
            <span className="compact__label">New conversation</span>
            <div style={{ marginTop: "0.4rem" }}>
                <PlainUserInput
                    selected_users={selectedParticipants}
                    onChange={setSelectedParticipants}
                    current_user_tag={user_tag}
                    label="Participants"
                    placeholder="Find user…"
                />
            </div>
            <input
                className="compact__input"
                style={{ marginTop: "0.4rem" }}
                placeholder="Title (optional)"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <textarea
                className="compact__textarea"
                style={{ marginTop: "0.4rem" }}
                placeholder="Initial message (optional)"
                value={initialMessage}
                onChange={e => setInitialMessage(e.target.value)}
            />
            {isError ? <div className="compact__hint" style={{ color: "#cd4246" }}>{error?.message || "Failed to create conversation."}</div> : null}
            <div className="compact__row">
                <button className="compact__button" disabled={!canSubmit} onClick={() => mutate({
                    user_tags: userTags,
                    title: title.trim().length > 0 ? title.trim() : undefined,
                    initial_message: initialMessage.trim().length > 0 ? initialMessage.trim() : undefined,
                })}>
                    Start conversation
                </button>
            </div>
        </div>
    );
}

/**
 * @description Compact messages tab: list of conversations, an opened conversation with send
 * box, and a form to start a new conversation.
 * @param {Object} props
 * @param {String} props.user_tag Tag of the current user
 * @returns {JSX.Element} The messages tab.
 */
export function CompactMessages({ user_tag }) {
    const [selectedTag, setSelectedTag] = useState();
    const [showNew, setShowNew] = useState(false);
    const { data: conversations, isLoading, isError, error, refetch } = api.messages.useGetMyConversations(
        {}, { staleTime: 30000, retry: false }
    );

    if (selectedTag) {
        return (
            <CompactConversation
                conversation_tag={selectedTag}
                user_tag={user_tag}
                onBack={() => { setSelectedTag(); refetch(); }}
            />
        );
    }

    return (
        <div>
            <div className="compact__row" style={{ marginTop: 0, marginBottom: "0.75rem", justifyContent: "space-between" }}>
                <span className="compact__label">Conversations</span>
                <button className="compact__button compact__button--ghost" onClick={() => setShowNew(v => !v)}>
                    {showNew ? "Close" : "+ New"}
                </button>
            </div>
            {showNew ? <NewConversationForm user_tag={user_tag} onCreated={(tag) => { setShowNew(false); setSelectedTag(tag); refetch(); }} /> : null}
            {isLoading ? <div className="compact__hint">Loading…</div> : null}
            {isError ? <div className="compact__hint" style={{ color: "#cd4246" }}>{error?.message || "Failed to load conversations."}</div> : null}
            {_.isArray(conversations) && conversations.length === 0 ? <div className="compact__hint">No conversations yet.</div> : null}
            {_.isArray(conversations) ? conversations.map(c => (
                <button
                    key={c.tag}
                    className="compact__conversation"
                    onClick={() => setSelectedTag(c.tag)}
                >
                    <div style={{ fontWeight: c.unread ? 700 : 600 }}>
                        {_.isString(c.title) && c.title.length > 0 ? c.title : "Conversation"}
                        {c.unread ? <span className="compact__unread-dot" /> : null}
                    </div>
                    <div className="compact__hint" style={{ marginTop: 2 }}>
                        {_.isString(c.last_message) ? c.last_message : "No messages yet"}
                        {_.isString(c.submission_tag) ? ` · ${c.submission_tag}` : ""}
                    </div>
                </button>
            )) : null}
        </div>
    );
}
