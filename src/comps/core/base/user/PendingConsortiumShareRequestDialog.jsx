import { useEffect, useRef, useState } from "react"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button } from "@blueprintjs/core"
import { api } from "@/api"
import { PendingConsortiumShareRequestsList } from "@/comps/submission/view/PendingConsortiumShareRequests"

/**
 * @description Dialog that shows pending consortium share requests once after login
 * if the logged-in user is a research group head (PI) with pending requests.
 * The backend endpoint returns pending requests only for heads/curators.
 */
export function PendingConsortiumShareRequestDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const hasShown = useRef(false)
    const { data: pendingRequests, isLoading, isSuccess } = api.consortiumShareRequests.useGetPendingConsortiumShareRequests(
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
        title="Pending consortium share requests"
        isCloseButtonShown={false}
        canOutsideClickClose={false}
        style={{ width: "40vw" }}>
        <DialogBody>
            <p className="font-size--small">
                Members of your research group requested to share the following submissions with a consortium.
                Please approve or deny the requests.
            </p>
            <PendingConsortiumShareRequestsList isDialogTitle={true} />
        </DialogBody>
        <DialogFooter actions={<Button text="Later" onClick={() => setIsOpen(false)} />} />
    </Dialog>
}
