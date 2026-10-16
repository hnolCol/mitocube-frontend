import { useState } from "react"
import _ from "lodash"
import { Button, Dialog, DialogBody, DialogFooter, Spinner } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { ConsortiumText } from "@/comps/submission/view/ConsortiumText"
import { SubmissionLink } from "@/comps/core/links/Submission"
import { UserFullName } from "@/comps/core/input/api/UserInput"

/**
 * @description One approved consortium share row: the submission shared with the consortium
 * and an option to revoke the share (only the submission owner or a curator can revoke,
 * backend enforced).
 * @param {Object} props
 * @param {String} props.consortium_tag Consortium tag
 * @param {String} props.submission_tag Submission tag
 * @param {Function} props.onInvalidate Callback to invalidate the share queries
 * @returns {JSX.Element} The approved share row.
 */
function ApprovedShareRow({ consortium_tag, submission_tag, onInvalidate }) {
    const { mutate: unshareSubmission, isPending } = api.consortiums.useUnshareSubmissionFromConsortium({ onSuccess: onInvalidate })
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <SubmissionLink tag={submission_tag} />
        <Button
            small={true}
            minimal={true}
            intent="danger"
            text="Revoke"
            disabled={isPending}
            onClick={() => unshareSubmission({ consortium_tag, submission_tag })} />
    </div>
}

/**
 * @description One pending consortium share request row with approve/deny actions.
 * @param {Object} props
 * @param {Object} props.request The pending share request
 * @param {Function} props.onInvalidate Callback to invalidate the share queries
 * @returns {JSX.Element} The pending request row.
 */
function PendingShareRequestRow({ request, onInvalidate }) {
    const { mutate: approve, isPending: isApproving } = api.consortiumShareRequests.useApproveConsortiumShareRequest({ onSuccess: onInvalidate })
    const { mutate: deny, isPending: isDenying } = api.consortiumShareRequests.useDenyConsortiumShareRequest({ onSuccess: onInvalidate })
    const isWorking = isApproving || isDenying
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <div className="flex flex-column">
            <SubmissionLink tag={request.submission_tag} />
            <div className="font-size--small"><ConsortiumText tag={request.consortium_tag} /></div>
            {_.isString(request.requested_by) ? <div className="font-size--smallest">by <UserFullName tag={request.requested_by} /></div> : null}
        </div>
        <div className="flex">
            <Button small={true} intent="primary" text="Accept" disabled={isWorking} onClick={() => approve({ consortium_tag: request.consortium_tag, submission_tag: request.submission_tag })} />
            <Button small={true} intent="danger" text="Deny" disabled={isWorking} onClick={() => deny({ consortium_tag: request.consortium_tag, submission_tag: request.submission_tag })} />
        </div>
    </div>
}

/**
 * @description The approved shares of one consortium, shown in the consortium shares dialog.
 * @param {Object} props
 * @param {String} props.tag Consortium tag
 * @param {Function} props.onInvalidate Callback to invalidate the share queries
 * @returns {JSX.Element} The approved shares section for one consortium.
 */
function ApprovedShares({ tag, onInvalidate }) {
    const { data: submission_tags, isLoading, isSuccess } = api.consortiums.useGetConsortiumSubmissions(
        { tag }, { enabled: _.isString(tag), staleTime: 60000 }
    )
    return <div className="margin--little">
        <div className="font-weight--bold font-size--small margin-bottom--little"><ConsortiumText tag={tag} /></div>
        {isLoading ? <Spinner size={20} /> :
            isSuccess && _.isArray(submission_tags) && submission_tags.length > 0 ?
                submission_tags.map(submission_tag => <ApprovedShareRow
                    key={submission_tag}
                    consortium_tag={tag}
                    submission_tag={submission_tag}
                    onInvalidate={onInvalidate} />) :
                <div className="font-size--smallest margin-left--little">No submissions shared.</div>}
    </div>
}

/**
 * @description Button for the topbar that opens a dialog with the consortium share decisions of
 * the current user: pending share requests to approve or deny (as research group head/PI) and
 * the approved shares per consortium which can be revoked (owner, head/PI of the owners research
 * group or curator, backend enforced). Renders nothing if the user is not
 * a member of any consortium. Denied requests are not listed because the backend removes
 * them on denial.
 * @returns {JSX.Element|null} The consortium shares button with dialog.
 */
export function ConsortiumShareDecisionsButton() {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { data: userConsortiums, isLoading: consortiumsIsLoading, isSuccess } = api.consortiums.useGetUserConsortiums(
        {}, { staleTime: 300000, retry: false }
    )
    const { data: pendingRequests, isLoading: requestsIsLoading } = api.consortiumShareRequests.useGetPendingConsortiumShareRequests(
        {}, { staleTime: 60000, retry: false }
    )
    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getConsortiumSubmissions"] })
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumShareRequests"] })
    }

    if (consortiumsIsLoading || (!isSuccess && !requestsIsLoading)) return null
    if (!requestsIsLoading && !_.isArray(pendingRequests)) return null
    if (consortiumTags.length === 0 && !(_.isArray(pendingRequests) && pendingRequests.length > 0)) return null

    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                icon="people"
                text="Consortium shares"
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Consortium share decisions"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw" }}>
            <DialogBody>
                <h4>Pending share requests</h4>
                {requestsIsLoading ? <Spinner size={20} /> :
                    _.isArray(pendingRequests) && pendingRequests.length > 0 ?
                        pendingRequests.map((request, idx) => <PendingShareRequestRow
                            key={`${request.consortium_tag}-${request.submission_tag}-${idx}`}
                            request={request}
                            onInvalidate={invalidate} />) :
                        <div className="font-size--small padding--little">No pending share requests.</div>}
                <h4>Approved shares</h4>
                <p className="font-size--smallest">
                    Approved shares can be revoked by the submission owner, a head (PI) of the owners research group or a curator.
                    Denied requests are not listed since they are removed on denial - the owner can simply request a new share.
                </p>
                {consortiumTags.map(consortium_tag => <ApprovedShares key={consortium_tag} tag={consortium_tag} onInvalidate={invalidate} />)}
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}
