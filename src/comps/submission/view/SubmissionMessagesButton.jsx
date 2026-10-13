import { useState } from "react"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button, Spinner } from "@blueprintjs/core"
import TooltipButton from "@/comps/core/base/buttons/TooltipButton"
import { api } from "@/api"
import { ConversationsList, NewConversationDialog } from "@/comps/messages"

/**
 * @description Button for the submission overview quick access bar that opens a dialog
 * with the conversations linked to this submission (ABOUT_SUBMISSION) and an option to
 * start a new one, e.g. to chat with the owner or collaborators.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {String} [props.user_tag] Tag of the current user
 * @returns {JSX.Element} The submission messages button with dialog.
 */
export function SubmissionMessagesButton({ submission_tag, user_tag }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isNewOpen, setIsNewOpen] = useState(false)
    const { data: submission_title } = api.submissions.title.useGetSubmissionTitle(
        { tag: submission_tag }, { enabled: _.isString(submission_tag) && isOpen }
    )
    return <>
        <TooltipButton
            icon="chat"
            content="Messages about this submission"
            onClick={() => setIsOpen(true)} />
        <Dialog
            isOpen={isOpen}
            title="Messages about this submission"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw" }}>
            <DialogBody>
                <div className="flex justify-end margin-bottom--little">
                    <Button
                        small={true}
                        intent="primary"
                        icon="plus"
                        text="New conversation"
                        onClick={() => setIsNewOpen(true)} />
                </div>
                <ConversationsList submission_tag={submission_tag} user_tag={user_tag} />
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
