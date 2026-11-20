import { Button, Dialog, DialogBody, DialogFooter, Spinner } from "@blueprintjs/core";
import _ from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { ConsortiumText } from "@/comps/submission/view/ConsortiumText";
import { UserFullName } from "@/comps/core/input/api/UserInput";

/**
 * @description One pending consortium membership request row with approve/deny actions.
 * @param {Object} props
 * @param {Object} props.request The pending membership request
 * @param {Function} props.onInvalidate Callback to invalidate the membership request queries
 * @returns {JSX.Element} The pending membership request row.
 */
export function PendingMembershipRequestRow({ request, onInvalidate }) {
    const { mutate: approve, isPending: isApproving } = api.consortiumMembershipRequests.useApproveConsortiumMembershipRequest({ onSuccess: onInvalidate })
    const { mutate: deny, isPending: isDenying } = api.consortiumMembershipRequests.useDenyConsortiumMembershipRequest({ onSuccess: onInvalidate })
    const isWorking = isApproving || isDenying
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <div className="flex flex-column">
            <div className="flex align-center" style={{ gap: "0.5rem" }}>
                <UserFullName tag={request.user_tag} />
                <span className="font-size--small">
                    {request.kind === "add" ? "join" : "leave"}
                </span>
                <ConsortiumText tag={request.consortium_tag} />
            </div>
            {_.isString(request.requested_by) ?
                <div className="font-size--smallest">requested by <UserFullName tag={request.requested_by} /></div> : null}
        </div>
        <div className="flex">
            <Button small={true} intent="primary" text="Accept" disabled={isWorking}
                onClick={() => approve({ consortium_tag: request.consortium_tag, user_tag: request.user_tag })} />
            <Button small={true} intent="danger" text="Deny" disabled={isWorking}
                onClick={() => deny({ consortium_tag: request.consortium_tag, user_tag: request.user_tag })} />
        </div>
    </div>
}

/**
 * @description Dialog that lists all pending consortium membership requests. Research group
 * heads (PIs) request membership changes for members of their groups; curators/admins
 * approve or deny them here (backend enforced).
 * @param {Object} props
 * @param {Boolean} props.isOpen
 * @param {Function} props.onClose
 * @returns {JSX.Element} The pending membership requests dialog.
 */
export function ConsortiumMembershipRequestsDialog({ isOpen, onClose }) {
    const queryClient = useQueryClient()
    const { data: pendingRequests, isLoading } = api.consortiumMembershipRequests.useGetPendingConsortiumMembershipRequests(
        {}, { enabled: isOpen, staleTime: 0, retry: false }
    )

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumMembershipRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getMyPendingConsortiumMembershipRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getUserJoinableConsortiums"] })
        queryClient.invalidateQueries({ queryKey: ["getConsortiumUsers"] })
    }

    return <Dialog isOpen={isOpen} canEscapeKeyClose title="Pending consortium membership requests" onClose={onClose} style={{ width: "50vw" }}>
        <DialogBody>
            <p className="font-size--small">
                Research group heads (PIs) request to add or remove members of their groups.
                Accepting an 'add' request makes the user a direct member of the consortium and
                gives them access to its shared submissions.
            </p>
            {isLoading ? <Spinner size={20} /> :
                _.isArray(pendingRequests) && pendingRequests.length > 0 ?
                    pendingRequests.map((request, idx) => <PendingMembershipRequestRow
                        key={`${request.consortium_tag}-${request.user_tag}-${idx}`}
                        request={request}
                        onInvalidate={invalidate} />) :
                    <div className="font-size--small padding--little">No pending membership requests.</div>}
        </DialogBody>
        <DialogFooter actions={<Button text="Close" onClick={onClose} />} />
    </Dialog>
}
