import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Dialog, DialogBody, DialogFooter, FormGroup, Icon, InputGroup, Spinner, Tag, TextArea } from "@blueprintjs/core"
import moment from "moment"
import { api } from "@/api"
import { UserFullName, UserInput } from "@/comps/core/input/api/UserInput"

const USER_COLORS = ["#2D72D2", "#238551", "#C87619", "#7961DB", "#CD4246", "#00A396", "#D1980B", "#D13913"]

/**
 * @description Stable color for a user tag (same user, same color).
 * @param {String} tag User tag
 * @returns {String} Hex color.
 */
function userColor(tag) {
    if (!_.isString(tag)) return "#5F6B7C"
    let hash = 0
    for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) | 0
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

/**
 * @description Short timestamp: HH:mm today, "D MMM" this year, otherwise YYYY-MM-DD.
 * @param {Number} ts Timestamp in ms
 * @returns {String} Formatted time.
 */
function formatConversationTime(ts) {
    if (!_.isNumber(ts)) return ""
    const m = moment(ts)
    if (m.isSame(moment(), "day")) return m.format("HH:mm")
    if (m.isSame(moment(), "year")) return m.format("D MMM")
    return m.format("YYYY-MM-DD")
}

/**
 * @description Number of conversations with unread messages for the current user,
 * optionally limited to one submission. Polls every 30s.
 * @param {String} [submission_tag] Optional submission tag
 * @returns {Number} Number of conversations with unread messages.
 */
export function useUnreadConversationsCount(submission_tag) {
    const { data } = api.messages.useGetMyConversations(
        { submission_tag }, { staleTime: 0, refetchInterval: 30000, retry: false }
    )
    return _.isArray(data) ? data.filter(c => c.unread === true).length : 0
}

UnreadBadge.propTypes = {
    count: PropTypes.number,
    dot: PropTypes.bool
}

/**
 * @description Unread indicator. Inline count pill by default; with `dot` a small red dot
 * on the top-right corner of a relatively positioned parent (for icon-only buttons).
 * @param {Object} props
 * @param {Number} [props.count] Unread count; nothing is rendered if 0
 * @param {Boolean} [props.dot] Render as a corner dot instead of an inline pill
 * @returns {JSX.Element|null} The badge.
 */
export function UnreadBadge({ count, dot = false }) {
    if (!_.isNumber(count) || count <= 0) return null
    if (dot) return <span style={{
        position: "absolute", top: 4, right: 4, width: 8, height: 8,
        borderRadius: "50%", background: "#CD4246", pointerEvents: "none"
    }} />
    return <span style={{
        display: "inline-block", marginLeft: 6, minWidth: 16, height: 16, padding: "0 5px",
        borderRadius: 8, background: "#CD4246", color: "white", fontSize: 10, fontWeight: 600,
        lineHeight: "16px", textAlign: "center", verticalAlign: "middle"
    }}>{count > 9 ? "9+" : count}</span>
}

SubmissionChip.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

/**
 * @description Clickable chip linking to a submission, showing its title (tag on hover).
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The submission chip.
 */
function SubmissionChip({ submission_tag }) {
    const { data: title } = api.submissions.title.useGetSubmissionTitle(
        { tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 300000 }
    )
    return <Tag minimal={true} round={true} intent="primary" icon="document"
        style={{ maxWidth: 280 }} onClick={e => e.stopPropagation()}>
        <a href={`/submissions/${submission_tag}`} title={submission_tag}>
            {_.isString(title) && title.trim().length > 0 ? title : submission_tag}
        </a>
    </Tag>
}

/**
 * @description Panel showing the messages of a conversation as chat bubbles and an input to reply.
 * Loading the messages marks the conversation as read for the current user (backend behaviour).
 * @param {Object} props
 * @param {String} props.conversation_tag Conversation tag
 * @param {String} [props.user_tag] Tag of the current user
 * @param {Function} [props.onClose] Optional close callback (when rendered in a dialog)
 * @returns {JSX.Element} The conversation panel.
 */
export function ConversationDialog({ conversation_tag, user_tag, onClose }) {
    const [message, setMessage] = useState("")
    const scrollRef = useRef(null)
    const { data: conversation } = api.messages.useGetConversation(
        { conversation_tag }, { enabled: _.isString(conversation_tag), staleTime: 30000, retry: false }
    )
    const { data: messages, isLoading } = api.messages.useGetConversationMessages(
        { conversation_tag }, { enabled: _.isString(conversation_tag), staleTime: 0, refetchInterval: 10000, retry: false }
    )
    const { mutate: postMessage, isPending } = api.messages.usePostConversationMessage({
        onSuccess: () => setMessage("")
    })
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [_.isArray(messages) ? messages.length : 0])
    const participants = _.isObject(conversation) && _.isArray(conversation.user_tags) ? conversation.user_tags : []
    const otherParticipants = participants.filter(tag => tag !== user_tag)
    const canSend = _.isString(message) && message.trim().length > 0
    const handleSend = () => {
        if (canSend) postMessage({ conversation_tag, content: message })
    }
    const formatTime = ts => {
        if (!_.isNumber(ts)) return ""
        const m = moment(ts)
        return m.isSame(moment(), "day") ? m.format("HH:mm") : m.format("D MMM HH:mm")
    }
    return <div className="container--shadow padding--little margin-top--little" style={{ maxWidth: "min(50vw,800px)", minWidth: "max(20vw,600px)" }}>
        <div className="flex justify-between align-center">
            <h3>
                {_.isObject(conversation) && _.isString(conversation.title) && conversation.title.length > 0 ?
                    conversation.title : "Conversation"}
            </h3>
            {_.isFunction(onClose) ?
                <Button small={true} minimal={true} icon="cross" onClick={onClose} /> : null}
        </div>
        <div className="font-size--smallest" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            {otherParticipants.map(tag => <span key={tag} style={{ color: userColor(tag), fontWeight: 600 }}>
                <UserFullName tag={tag} />
            </span>)}
            {_.isObject(conversation) && _.isString(conversation.submission_tag) ?
                <SubmissionChip submission_tag={conversation.submission_tag} /> : null}
        </div>
        <div ref={scrollRef} style={{ maxHeight: "40vh", overflowY: "auto", padding: "4px 0" }} className="margin-top--little">
            {isLoading ? <div className="flex center-items padding--medium"><Spinner size={20} /></div> :
                (_.isArray(messages) ? messages.map(msg => {
                    const isMe = msg.sender_tag === user_tag
                    return <div key={msg.tag} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", margin: "6px 8px" }}>
                        <div style={{
                            maxWidth: "70%", padding: "6px 10px", borderRadius: 12,
                            borderBottomRightRadius: isMe ? 4 : 12, borderBottomLeftRadius: isMe ? 12 : 4,
                            background: isMe ? "#2D72D2" : "#E5E8EB", color: isMe ? "white" : "#1C2127"
                        }}>
                            {!isMe ?
                                <div className="font-size--smallest" style={{ fontWeight: 600, color: userColor(msg.sender_tag) }}>
                                    <UserFullName tag={msg.sender_tag} />
                                </div> : null}
                            <div className="font-size--small" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                            <div style={{ fontSize: 10, opacity: 0.7, textAlign: "right", marginTop: 2 }}>{formatTime(msg.created_at)}</div>
                        </div>
                    </div>
                }) : null)}
        </div>
        <div className="flex margin-top--little">
            <InputGroup
                fill={true}
                placeholder="Write a message.."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSend() }} />
            <Button small={true} intent="primary" text="Send" loading={isPending} disabled={!canSend} onClick={handleSend} />
        </div>
    </div>
}

ConversationRow.propTypes = {
    conversation: PropTypes.object.isRequired,
    user_tag: PropTypes.string,
    onSelect: PropTypes.func,
    hideSubmission: PropTypes.bool
}

/**
 * @description One conversation row in the conversations list (inbox style). Unread
 * conversations are highlighted with a tint, bold text and a dot. Conversations about a
 * submission get a document avatar and a chip with the submission title.
 * @param {Object} props
 * @param {Object} props.conversation Conversation data
 * @param {String} [props.user_tag] Tag of the current user
 * @param {Function} [props.onSelect] Callback with the conversation tag
 * @param {Boolean} [props.hideSubmission] Hide the submission chip (e.g. when already filtered by submission)
 * @returns {JSX.Element} The conversation row.
 */
function ConversationRow({ conversation, user_tag, onSelect, hideSubmission = false }) {
    const [hover, setHover] = useState(false)
    const others = _.isArray(conversation.user_tags)
        ? conversation.user_tags.filter(tag => tag !== user_tag)
        : []
    const unread = conversation.unread === true
    const hasTitle = _.isString(conversation.title) && conversation.title.length > 0
    const isAboutSubmission = _.isString(conversation.submission_tag)
    const time = formatConversationTime(_.isNumber(conversation.last_message_at) ? conversation.last_message_at : conversation.created_at)
    const names = others.length > 0
        ? others.map((tag, i) => <span key={tag} style={{ color: userColor(tag) }}>{i > 0 ? ", " : ""}<UserFullName tag={tag} /></span>)
        : <span>Only you</span>
    return <div
        onClick={() => _.isFunction(onSelect) && onSelect(conversation.tag)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
            borderBottom: "1px solid #E5E8EB", cursor: "pointer",
            background: hover ? "#EDEFF2" : unread ? "#EEF4FB" : "white"
        }}>
        <div style={{
            width: 36, height: 36, borderRadius: isAboutSubmission ? 8 : "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: unread ? "#2D72D2" : "#D3D8DE"
        }}>
            <Icon icon={isAboutSubmission ? "document" : others.length > 1 ? "people" : "person"} size={16} color={unread ? "white" : "#5F6B7C"} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: unread ? 700 : 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {hasTitle ? conversation.title : names}
                </span>
                {isAboutSubmission && !hideSubmission ? <SubmissionChip submission_tag={conversation.submission_tag} /> : null}
            </div>
            {hasTitle ?
                <div className="font-size--smallest" style={{ fontWeight: 600 }}>{names}</div> : null}
            <div className="font-size--small" style={{
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                color: unread ? "#1C2127" : "#738091", fontWeight: unread ? 600 : 400
            }}>
                {_.isString(conversation.last_message) ? conversation.last_message : <i>No messages yet</i>}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
            <span className="font-size--smallest" style={{ color: unread ? "#2D72D2" : "#738091", fontWeight: unread ? 600 : 400 }}>
                {time}
            </span>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: unread ? "#2D72D2" : "transparent" }} />
        </div>
    </div>
}

ConversationsList.propTypes = {
    submission_tag: PropTypes.string,
    user_tag: PropTypes.string,
    onNewConversation: PropTypes.func
}

/**
 * @description Lists the conversations of the current user, optionally filtered by a
 * submission. Clicking a conversation replaces the list with its messages. The header
 * row holds the back button (left, when a conversation is open) and the
 * "New conversation" button (right).
 * @param {Object} props
 * @param {String} [props.submission_tag] Optional submission tag to filter the conversations by
 * @param {String} [props.user_tag] Tag of the current user (to hide it from the participants)
 * @param {Function} [props.onNewConversation] Callback for the "New conversation" button
 * @returns {JSX.Element} The conversations list or the opened conversation.
 */
export function ConversationsList({ submission_tag, user_tag, onNewConversation }) {
    const [selectedTag, setSelectedTag] = useState()
    const { data: conversations, isLoading, isError, refetch } = api.messages.useGetMyConversations(
        { submission_tag }, { staleTime: 30000, retry: false }
    )
    const handleBack = () => {
        setSelectedTag()
        refetch()
    }
    const unreadCount = _.isArray(conversations) ? conversations.filter(c => c.unread === true).length : 0
    const header = <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        {_.isString(selectedTag) ?
            <Button minimal={true} small={true} icon="arrow-left" text="Back to conversations" onClick={handleBack} /> :
            <span className="font-size--smallest" style={{ color: "#738091" }}>
                {_.isArray(conversations) ? `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}` : ""}
                {unreadCount > 0 ? <span style={{ color: "#2D72D2", fontWeight: 600 }}>{` · ${unreadCount} unread`}</span> : null}
            </span>}
        {_.isFunction(onNewConversation) ?
            <Button small={true} intent="primary" icon="plus" text="New conversation" onClick={onNewConversation} /> : null}
    </div>
    let body
    if (_.isString(selectedTag)) body = <ConversationDialog conversation_tag={selectedTag} user_tag={user_tag} />
    else if (isLoading) body = <div className="flex center-items padding--medium"><Spinner size={20} /></div>
    else if (isError || !_.isArray(conversations)) body = <div className="padding--little font-size--small">Failed to load conversations.</div>
    else if (conversations.length === 0) body = <div style={{ padding: "32px 0", textAlign: "center", color: "#738091" }}>
        <Icon icon="chat" size={24} color="#ABB3BF" />
        <div className="font-size--small margin-top--little">No conversations yet.</div>
    </div>
    else body = <div style={{ border: "1px solid #E5E8EB", borderRadius: 6, overflow: "hidden", maxHeight: "55vh", overflowY: "auto" }}>
        {conversations.map(conversation => <ConversationRow
            key={conversation.tag}
            conversation={conversation}
            user_tag={user_tag}
            hideSubmission={_.isString(submission_tag)}
            onSelect={setSelectedTag} />)}
    </div>
    return <div>
        {header}
        {body}
    </div>
}

NewConversationDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    submission_tag: PropTypes.string,
    submission_title: PropTypes.string,
    user_tag: PropTypes.string
}

/**
 * @description Dialog to start a new conversation, optionally linked to a submission
 * (ABOUT_SUBMISSION). The creating user must be included as participant and is
 * added automatically here. If linked to a submission, only users with access to
 * the submission can be added as participants (backend enforced).
 * @param {Object} props
 * @param {Boolean} props.isOpen Whether the dialog is open
 * @param {Function} [props.onClose] Close callback
 * @param {String} [props.submission_tag] Submission tag to link the conversation to
 * @param {String} [props.submission_title] Submission title, used as default conversation title
 * @param {String} [props.user_tag] Tag of the current user (added as participant)
 * @returns {JSX.Element} The new conversation dialog.
 */
export function NewConversationDialog({ isOpen, onClose, submission_tag, submission_title, user_tag }) {
    const [userTags, setUserTags] = useState([])
    const [title, setTitle] = useState()
    const [initialMessage, setInitialMessage] = useState("")
    const [createdTag, setCreatedTag] = useState()
    const { mutate, isPending, isError, error } = api.messages.usePostConversation({
        onSuccess: (conversation_tag) => { setCreatedTag(conversation_tag) }
    })
    const handleUserSelection = (callbackKey, selected_user_tag) => {
        setUserTags(prevValues => {
            return prevValues.includes(selected_user_tag)
                ? prevValues.filter(tag => tag !== selected_user_tag)
                : [...prevValues, selected_user_tag]
        })
    }
    const participants = _.uniq([...userTags, ...(_.isString(user_tag) ? [user_tag] : [])])
    const handleSubmit = () => {
        mutate({
            user_tags: participants,
            submission_tag,
            title: _.isString(title) && title.length > 0 ? title : undefined,
            initial_message: initialMessage.length > 0 ? initialMessage : undefined
        })
    }
    const handleClose = () => {
        setUserTags([])
        setTitle()
        setInitialMessage("")
        setCreatedTag()
        if (_.isFunction(onClose)) onClose()
    }
    return <Dialog
        isOpen={isOpen}
        title={_.isString(submission_tag) ? "Message about submission" : "New conversation"}
        onClose={handleClose}
        style={{ width: "40vw" }}>
        <DialogBody>
            {_.isString(createdTag) ? <>
                <p className="font-size--small">Conversation created.</p>
                <ConversationDialog conversation_tag={createdTag} user_tag={user_tag} />
            </> : <>
                <p className="font-size--small">
                    {_.isString(submission_tag) ?
                        `Start a conversation about submission ${submission_tag}${_.isString(submission_title) ? ` ("${submission_title}")` : ""}.` :
                        "Start a conversation with other users."}
                </p>
                <UserInput
                    selected_users={userTags}
                    onUserSelect={handleUserSelection}
                    isRequired={false}
                    label="Participants"
                    helperText={_.isString(submission_tag) ?
                        "Only users with access to the submission can be added as participants." :
                        "Select the users you want to talk to."} />
                <FormGroup label="Title" labelInfo="(optional)">
                    <InputGroup
                        fill={true}
                        defaultValue={_.isString(submission_tag) ? `About submission ${submission_tag}` : ""}
                        onChange={e => setTitle(e.target.value)} />
                </FormGroup>
                <FormGroup label="Message" labelInfo="(optional)">
                    <TextArea
                        fill={true}
                        growVertically={true}
                        value={initialMessage}
                        onChange={e => setInitialMessage(e.target.value)} />
                </FormGroup>
                {isError ?
                    <div className="font-size--small">
                        {`An error occurred while creating the conversation: ${error?.response?.data?.detail || error?.message || "unknown error"}.`}
                    </div> : null}
            </>}
        </DialogBody>
        <DialogFooter actions={<>
            {_.isString(createdTag) ?
                <Button text="Close" onClick={handleClose} /> :
                <>
                    <Button text="Cancel" onClick={handleClose} />
                    <Button
                        intent="primary"
                        text="Start conversation"
                        loading={isPending}
                        disabled={participants.length < 2}
                        onClick={handleSubmit} />
                </>}
        </>} />
    </Dialog>
}

MessagesButton.propTypes = {
    user_tag: PropTypes.string
}

/**
 * @description Topbar button that opens a dialog with the conversations of the current
 * user and an option to start a new conversation. Shows a badge with the number of
 * conversations that have unread messages.
 * @param {Object} props
 * @param {String} [props.user_tag] Tag of the current user
 * @returns {JSX.Element} The messages button with dialog.
 */
export function MessagesButton({ user_tag }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isNewOpen, setIsNewOpen] = useState(false)
    const unreadCount = useUnreadConversationsCount()
    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                icon="chat"
                text={<>Messages<UnreadBadge count={unreadCount} /></>}
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Messages"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw" }}>
            <DialogBody>
                <ConversationsList user_tag={user_tag} onNewConversation={() => setIsNewOpen(true)} />
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
        <NewConversationDialog
            isOpen={isNewOpen}
            onClose={() => setIsNewOpen(false)}
            user_tag={user_tag} />
    </>
}