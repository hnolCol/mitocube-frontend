import { useState } from "react"
import _ from "lodash"
import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core"
import { api } from "@/api"
import { PendingConsortiumShareRequestsList } from "@/comps/submission/view/PendingConsortiumShareRequests"

/**
 * @description Button for the topbar that indicates the number of pending consortium share
 * requests the current user (as research group head/PI) can approve or deny, and opens a dialog
 * with the requests on click. Renders nothing if there are no pending requests.
 * @returns {JSX.Element|null} The pending share requests button with dialog.
 */
export function PendingConsortiumShareRequestButton() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: pendingRequests, isLoading } = api.consortiumShareRequests.useGetPendingConsortiumShareRequests(
        {}, { staleTime: 60000, retry: false }
    )
    if (isLoading || !_.isArray(pendingRequests) || pendingRequests.length === 0) return null
    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                intent="warning"
                icon="changes"
                text={`Pending share requests (${pendingRequests.length})`}
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Pending consortium share requests"
            onClose={() => setIsOpen(false)}
            style={{ width: "40vw" }}>
            <DialogBody>
                <p className="font-size--small">
                    Members of your research group requested to share the following submissions with a consortium.
                    Please approve or deny the requests.
                </p>
                <PendingConsortiumShareRequestsList isDialogTitle={true} />
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}
