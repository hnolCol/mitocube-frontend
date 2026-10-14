import { useState } from "react"
import { Dialog, DialogBody, DialogFooter, Button } from "@blueprintjs/core"
import TooltipButton from "@/comps/core/base/buttons/TooltipButton"
import { CollaborationRequests } from "./CollaborationRequests"

/**
 * @description Button for the submission overview quick access bar that opens a dialog
 * with the collaboration requests of the submission, where the owner (or a head (PI) of
 * the owner's research group / curator) can approve or deny requests.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The collaboration requests button with dialog.
 */
export function CollaborationRequestsButton({ submission_tag }) {
    const [isOpen, setIsOpen] = useState(false)
    return <>
        <TooltipButton
            icon="people"
            content="Collaboration requests for this submission"
            onClick={() => setIsOpen(true)} />
        <Dialog
            isOpen={isOpen}
            title="Collaboration requests"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw" }}>
            <DialogBody>
                <CollaborationRequests submission_tag={submission_tag} />
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}
