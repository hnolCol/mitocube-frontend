import { useState } from "react"
import _ from "lodash"
import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core"
import { api } from "@/api"
import { PendingCollaborationRequestsList } from "@/comps/submission/view/PendingCollaborationRequests"

/**
 * @description Button for the topbar that indicates the number of pending collaboration
 * requests the current user can approve or deny (as submission owner, head (PI) of the
 * owner's research group or curator), and opens a dialog with the requests on click.
 * Renders nothing if there are no pending requests.
 * @returns {JSX.Element|null} The pending collaboration requests button with dialog.
 */
export function PendingCollaborationRequestButton() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: pendingRequests, isLoading } = api.collaborations.useGetPendingCollaborationRequests(
        {}, { staleTime: 60000, retry: false }
    )
    if (isLoading || !_.isArray(pendingRequests) || pendingRequests.length === 0) return null
    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                intent="warning"
                icon="people"
                text={`Pending collaboration requests (${pendingRequests.length})`}
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Pending collaboration requests"
            onClose={() => setIsOpen(false)}
            style={{ width: "40vw" }}>
            <DialogBody>
                <p className="font-size--small">
                    Users (or members of your research group) requested to collaborate on the following submissions.
                    On approval they are added as collaborators and can access the submission. Please approve or deny the requests.
                </p>
                <PendingCollaborationRequestsList isDialogTitle={true} />
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}
