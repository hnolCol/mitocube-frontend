import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, Spinner, TextArea } from "@blueprintjs/core"
import moment from "moment"
import { api } from "@/api"
import { UserFullName, UserInput } from "@/comps/core/input/api/UserInput"

ConversationDialog.propTypes = {
    conversation_tag: PropTypes.string.isRequired,
    user_tag: PropTypes.string,
    onClose: PropTypes.func
}

/**
 * @description Panel showing the messages of a conversation and an input to reply.
 * Loading the messages marks the conversation as read for the current user (backend behaviour).
 * @param {Object} props
 * @param {String} props.conversation_tag Conversation tag
 * @param {String} [props.user_tag] Tag of the current user
 * @param {Function} [props.onClose] Optional close callback (when rendered in a dialog)
 * @returns {JSX.Element} The conversation panel.
 */
export function ConversationDialog({ conversation_tag, user_tag, onClose }) {
    const [message, setMessage] = useState("")
    const { data: conversation } = api.messages.useGetConversation(
        { conversation_tag }, { enabled: _.isString(conversation_tag), staleTime: 30000, retry: false }
    )
    const { data: messages, isLoading } = api.messages.useGetConversationMessages(
        { conversation_tag }, { enabled: _.isString(conversation_tag), staleTime: 0, refetchInterval: 10000, retry: false }
    )
    const { mutate: postMessage, isPending } = api.messages.usePostConversationMessage({
        onSuccess: () => setMessage("")
    })
    const participants = _.isObject(conversation) && _.isArray(conversation.user_tags) ? conversation.user_tags : []
    const otherParticipants = participants.filter(tag => tag !== user_tag)
    const canSend = _.isString(message) && message.trim().length > 0
    const handleSend = () => {
        if (canSend) postMessage({ conversation_tag, content: message })
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
        <div className="font-size--smallest">
            {otherParticipants.map(tag => <span key={tag} className="margin-right--little"><UserFullName tag={tag} /></span>)}
            {_.isObject(conversation) && _.isString(conversation.submission_tag) ?
                <a href={`/submissions/${conversation.submission_tag}`}>{conversation.submission_tag}</a> : null}
        </div>
        <div style={{ maxHeight: "40vh", overflowY: "auto" }} className="margin-top--little">
            {isLoading ? <div className="flex center-items padding--medium"><Spinner size={20} /></div> :
                (_.isArray(messages) ? messages.map(msg => <div
                    key={msg.tag}
                    className={`margin--little padding--little div--round ${msg.sender_tag === user_tag ? "bg--lightgrey" : ""}`}
                    style={{ marginLeft: msg.sender_tag === user_tag ? "20%" : "0", marginRight: msg.sender_tag === user_tag ? "0" : "20%" }}>
                    <div className="font-size--smallest">
                        <UserFullName tag={msg.sender_tag} />
                        {" "}{_.isNumber(msg.created_at) ? moment.unix(msg.created_at / 1000).format("YYYY-MM-DD HH:mm") : null}
                    </div>
                    <div className="font-size--small">{msg.content}</div>
                </div>) : null)}
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
    onSelect: PropTypes.func
}

/**
 * @description One conversation row in the conversations list. Shows the other
 * participants, the optional submission link, the last message and the unread count.
 * @param {Object} props
 * @param {Object} props.conversation Conversation data
 * @param {String} [props.user_tag] Tag of the current user
 * @param {Function} [props.onSelect] Callback with the conversation tag
 * @returns {JSX.Element} The conversation row.
 */
function ConversationRow({ conversation, user_tag, onSelect }) {
    const otherParticipants = _.isArray(conversation.user_tags)
        ? conversation.user_tags.filter(tag => tag !== user_tag)
        : []
    const hasUnread = conversation.unread === true
    return <div
        className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round"
        onClick={() => _.isFunction(onSelect) && onSelect(conversation.tag)}>
        <div className="flex flex-column">
            {_.isString(conversation.title) && conversation.title.length > 0 ?
                <span className="font-size--small">{conversation.title}</span> : null}
            <div className="font-size--smallest">
                {otherParticipants.length > 0 ?
                    otherParticipants.map(tag => <span key={tag} className="margin-right--little"><UserFullName tag={tag} /></span>) :
                    <span>Only you</span>}
            </div>
            {_.isString(conversation.submission_tag) ?
                <a className="font-size--smallest" href={`/submissions/${conversation.submission_tag}`}>{conversation.submission_tag}</a> : null}
            {_.isString(conversation.last_message) ?
                <span className="font-size--smallest">{_.truncate(conversation.last_message, { length: 80 })}</span> : null}
        </div>
        <div className="flex align-center">
            {_.isNumber(conversation.last_message_at) ?
                <span className="font-size--smallest margin-right--little">
                    {moment.unix(conversation.last_message_at / 1000).format("YYYY-MM-DD")}
                </span> : null}
            {hasUnread ?
                <span className="bg--grey div--round padding--little font-size--smallest">new</span> : null}
        </div>
    </div>
}

ConversationsList.propTypes = {
    submission_tag: PropTypes.string,
    user_tag: PropTypes.string
}

/**
 * @description Lists the conversations of the current user, optionally filtered by a
 * submission. Clicking a conversation opens its messages.
 * @param {Object} props
 * @param {String} [props.submission_tag] Optional submission tag to filter the conversations by
 * @param {String} [props.user_tag] Tag of the current user (to hide it from the participants)
 * @returns {JSX.Element} The conversations list.
 */
export function ConversationsList({ submission_tag, user_tag }) {
    const [selectedTag, setSelectedTag] = useState()
    const { data: conversations, isLoading, isError } = api.messages.useGetMyConversations(
        { submission_tag }, { staleTime: 30000, retry: false }
    )
    if (isLoading) return <div className="flex center-items padding--medium"><Spinner size={20} /></div>
    if (isError || !_.isArray(conversations)) return <div className="padding--little font-size--small">Failed to load conversations.</div>
    if (conversations.length === 0) return <div className="padding--little font-size--small">No conversations yet.</div>
    return <div className="flex flex-column">
        {conversations.map(conversation => <ConversationRow
            key={conversation.tag}
            conversation={conversation}
            user_tag={user_tag}
            onSelect={setSelectedTag} />)}
        {_.isString(selectedTag) ?
            <Dialog
                isOpen={true}
                title="Conversation"
                onClose={() => setSelectedTag()}
                style={{ width: "50vw" }}>
                <DialogBody>
                    <ConversationDialog conversation_tag={selectedTag} user_tag={user_tag} />
                </DialogBody>
            </Dialog> : null}
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
 * user and an option to start a new conversation.
 * @param {Object} props
 * @param {String} [props.user_tag] Tag of the current user
 * @returns {JSX.Element} The messages button with dialog.
 */
export function MessagesButton({ user_tag }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isNewOpen, setIsNewOpen] = useState(false)
    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                icon="chat"
                text="Messages"
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Messages"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw" }}>
            <DialogBody>
                <div className="flex justify-end margin-bottom--little">
                    <Button small={true} intent="primary" icon="plus" text="New conversation" onClick={() => setIsNewOpen(true)} />
                </div>
                <ConversationsList user_tag={user_tag} />
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
        <NewConversationDialog
            isOpen={isNewOpen}
            onClose={() => setIsNewOpen(false)}
            user_tag={user_tag} />
    </>
}
