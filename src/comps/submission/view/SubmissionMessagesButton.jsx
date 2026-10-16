import { useState } from "react"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button } from "@blueprintjs/core"
import TooltipButton from "@/comps/core/base/buttons/TooltipButton"
import { api } from "@/api"
import { ConversationsList, NewConversationDialog, UnreadBadge, useUnreadConversationsCount } from "@/comps/messages"

/**
 * @description Button for the submission overview quick access bar that opens a dialog
 * with the conversations linked to this submission (ABOUT_SUBMISSION) and an option to
 * start a new one. Shows a red dot if a conversation about this submission has unread messages.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {String} [props.user_tag] Tag of the current user
 * @returns {JSX.Element} The submission messages button with dialog.
 */
export function SubmissionMessagesButton({ submission_tag, user_tag }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isNewOpen, setIsNewOpen] = useState(false)
    const unreadCount = useUnreadConversationsCount(submission_tag)
    const { data: submission_title } = api.submissions.title.useGetSubmissionTitle(
        { tag: submission_tag }, { enabled: _.isString(submission_tag) && isOpen }
    )
    return <>
        <span style={{ position: "relative", display: "inline-flex" }}>
            <TooltipButton
                icon="chat"
                content="Messages about this submission"
                onClick={() => setIsOpen(true)} />
            <UnreadBadge count={unreadCount} dot={true} />
        </span>
        <Dialog
            isOpen={isOpen}
            title="Messages about this submission"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw" }}>
            <DialogBody>
                <ConversationsList
                    submission_tag={submission_tag}
                    user_tag={user_tag}
                    onNewConversation={() => setIsNewOpen(true)} />
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
        <NewConversationDialog
            isOpen={isNewOpen}
            onClose={() => setIsNewOpen(false)}
            submission_tag={submission_tag}
            submission_title={submission_title}
            user_tag={user_tag} />
    </>
}