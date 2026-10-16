import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Spinner } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { SubmissionLink } from "@/comps/core/links/Submission"
import { UserFullName } from "@/comps/core/input/api/UserInput"
import { ResearchGroupTitle } from "@/comps/core/input/api/ResearchGroupInput"

PendingCollaborationRequestsList.propTypes = {
    isDialogTitle: PropTypes.bool
}

/**
 * @description Lists the pending collaboration requests the current user can approve
 * (submission owner, head (PI) of the owner's research group or curator). On approval
 * the requesting user (or all members of the requested research group) becomes a
 * collaborator of the submission. Returns nothing visible if there are no pending
 * requests (unless used inside a dialog).
 */
export function PendingCollaborationRequestsList({ isDialogTitle = false }) {
    const queryClient = useQueryClient()
    const { data: pendingRequests, isLoading, isError } = api.collaborations.useGetPendingCollaborationRequests(
        {}, { staleTime: 30000, refetchInterval: 60000, refetchOnWindowFocus: true, retry: false }
    )
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumShareRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getConsortiumSubmissions"] })
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumShares"] })
    }
    const { mutate: approve, isPending: isApproving } = api.collaborations.usePostApproveCollaborationRequest({ onSuccess: invalidate })
    const { mutate: deny, isPending: isDenying } = api.collaborations.usePostDenyCollaborationRequest({ onSuccess: invalidate })
    if (isLoading) return <div className="flex center-items padding--medium"><Spinner size={20} /></div>
    if (isError || !_.isArray(pendingRequests)) return null
    if (pendingRequests.length === 0) {
        return isDialogTitle ? <div className="padding--little font-size--small">No pending collaboration requests.</div> : null
    }
    return <div className="flex flex-column">
        {pendingRequests.map((request, idx) => {
            const key = `${request.tag}-${idx}`
            const isWorking = isApproving || isDenying
            return <div key={key} className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
                <div className="flex flex-column">
                    <SubmissionLink tag={request.submission_tag} />
                    {_.isString(request.requested_by) ? <div className="font-size--smallest">by <UserFullName tag={request.requested_by} /></div> : null}
                    {_.isString(request.requested_for_group_tag) ?
                        <div className="font-size--smallest">for <ResearchGroupTitle tag={request.requested_for_group_tag} /></div> : null}
                    {_.isString(request.message) && request.message.length > 0 ?
                        <div className="font-size--smallest">{_.truncate(request.message, { length: 120 })}</div> : null}
                </div>
                <div className="flex">
                    <Button small={true} intent="primary" text="Approve" loading={isWorking} onClick={() => approve({ request_tag: request.tag })} />
                    <Button small={true} intent="danger" text="Deny" className="margin-left--little" loading={isWorking} onClick={() => deny({ request_tag: request.tag })} />
                </div>
            </div>
        })}
    </div>
}
