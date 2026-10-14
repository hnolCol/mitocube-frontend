import { useEffect, useRef, useState } from "react"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button } from "@blueprintjs/core"
import { api } from "@/api"
import { PendingCollaborationRequestsList } from "@/comps/submission/view/PendingCollaborationRequests"

/**
 * @description Dialog that shows pending collaboration requests once after login
 * if the logged-in user can approve them (submission owner, head (PI) of the
 * owner's research group or curator). The backend endpoint returns only the
 * requests the current user can approve.
 */
export function PendingCollaborationRequestDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const hasShown = useRef(false)
    const { data: pendingRequests, isLoading, isSuccess } = api.collaborations.useGetPendingCollaborationRequests(
        {}, { staleTime: 0, retry: false }
    )
    useEffect(() => {
        if (!hasShown.current && isSuccess && _.isArray(pendingRequests) && pendingRequests.length > 0) {
            hasShown.current = true
            setIsOpen(true)
        }
    }, [isSuccess, pendingRequests])
    if (isLoading || !_.isArray(pendingRequests) || pendingRequests.length === 0) return null
    return <Dialog
        isOpen={isOpen}
        title="Pending collaboration requests"
        isCloseButtonShown={false}
        canOutsideClickClose={false}
        style={{ width: "40vw" }}>
        <DialogBody>
            <p className="font-size--small">
                Users requested to collaborate on the following submissions you own or that belong to your research group.
                Please approve or deny the requests.
            </p>
            <PendingCollaborationRequestsList isDialogTitle={true} />
        </DialogBody>
        <DialogFooter actions={<Button text="Later" onClick={() => setIsOpen(false)} />} />
    </Dialog>
}
