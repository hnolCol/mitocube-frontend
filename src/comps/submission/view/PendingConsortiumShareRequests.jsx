import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Spinner } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { ConsortiumText } from "./ConsortiumText"
import { UserFullName } from "@/comps/core/input/api/UserInput"

const REQUEST_TARGETS = [
    { label: "Submission", key: "submission_tag" },
    { label: "Consortium", key: "consortium_tag" },
    { label: "Requested by", key: "requested_by" }
]

PendingConsortiumShareRequestsList.propTypes = {
    isDialogTitle: PropTypes.bool
}

/**
 * @description Lists the pending consortium share requests the current user (as research
 * group head/PI) can approve, with approve/deny actions. Returns nothing visible
 * if there are no pending requests (unless used inside a dialog).
 */
export function PendingConsortiumShareRequestsList({ isDialogTitle = false }) {
    const queryClient = useQueryClient()
    const { data: pendingRequests, isLoading, isError } = api.consortiumShareRequests.useGetPendingConsortiumShareRequests(
        {}, { staleTime: 30000, refetchInterval: 60000, refetchOnWindowFocus: true, retry: false }
    )
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumShareRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getConsortiumSubmissions"] })
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumShares"] })
    }
    const { mutate: approve, isPending: isApproving } = api.consortiumShareRequests.useApproveConsortiumShareRequest({ onSuccess: invalidate })
    const { mutate: deny, isPending: isDenying } = api.consortiumShareRequests.useDenyConsortiumShareRequest({ onSuccess: invalidate })

    if (isLoading) return <div className="flex center-items padding--medium"><Spinner size={20} /></div>
    if (isError || !_.isArray(pendingRequests)) return null
    if (pendingRequests.length === 0) {
        return isDialogTitle ? <div className="padding--little font-size--small">No pending share requests.</div> : null
    }

    const isWorking = isApproving || isDenying
    return <div className="flex flex-column">
        {pendingRequests.map((request, idx) => {
            const key = `${request.submission_tag}-${request.consortium_tag}-${idx}`
            const params = { consortium_tag: request.consortium_tag, submission_tag: request.submission_tag }
            return <div key={key} className="flex justify-between align-center margin--little">
                <div className="flex align-center" style={{ gap: "0.75rem" }}>
                    <ConsortiumText tag={request.consortium_tag} />
                    <a className="font-size--small" href={`/submissions/${request.submission_tag}`}>{request.submission_tag}</a>
                    {_.isString(request.requested_by)
                        ? <span className="font-size--small">by <UserFullName tag={request.requested_by} /></span>
                        : null}
                </div>
                <div className="flex align-right">
                    <Button small={true} intent="primary" text="Approve" loading={isWorking} onClick={() => approve(params)} />
                    <Button small={true} className="margin-left--little" intent="danger" text="Deny" loading={isWorking} onClick={() => deny(params)} />
                </div>
            </div>
        })}
    </div>
}