import { useState } from "react"
import _ from "lodash"
import { Button, Dialog, DialogBody, DialogFooter, Spinner } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { ConsortiumText } from "@/comps/submission/view/ConsortiumText"
import { UserFullName } from "@/comps/core/input/api/UserInput"
import { ConsortiumTermsWarning } from "@/comps/core/base/user/ConsortiumTermsButton"

/**
 * @description One user row of a consortium the current user is a member of, with a button to
 * request adding or removing the user from the consortium. The request must be approved by a
 * curator before it takes effect (backend enforced).
 * @param {Object} props
 * @param {String} props.consortium_tag Consortium tag
 * @param {String} props.user_tag User tag of the (potential) member
 * @param {Boolean} props.isMember True if the user is already a direct member
 * @param {Function} props.onInvalidate Callback to invalidate the membership queries
 * @returns {JSX.Element} The requestable member row.
 */
function RequestableMemberRow({ consortium_tag, user_tag, isMember, onInvalidate }) {
    const { mutate: request, isPending } = api.consortiumMembershipRequests.usePostConsortiumMembershipRequest({ onSuccess: onInvalidate })
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <UserFullName tag={user_tag} />
        <Button
            small={true}
            minimal={true}
            intent={isMember ? "danger" : "primary"}
            text={isMember ? "Request removal" : "Request addition"}
            disabled={isPending}
            onClick={() => request({ consortium_tag, user_tag, kind: isMember ? "remove" : "add" })} />
    </div>
}

/**
 * @description The members of one consortium the current user is a member of. Users of the
 * consortiums eligible research groups can be requested to be added or removed; the backend
 * allows requests only for members of research groups the current user leads (as head/PI).
 * @param {Object} props
 * @param {String} props.tag Consortium tag
 * @param {Function} props.onInvalidate Callback to invalidate the membership queries
 * @returns {JSX.Element} The consortium members section.
 */
function ConsortiumMembers({ tag, onInvalidate }) {
    const { data: member_tags, isLoading: membersIsLoading } = api.consortiums.useGetConsortiumUsers({ tag }, { enabled: _.isString(tag), staleTime: 30000 })
    const { data: eligible_user_tags, isLoading: eligibleIsLoading } = api.consortiums.useGetConsortiumEligibleUsers({ tag }, { enabled: _.isString(tag), staleTime: 30000 })

    if (membersIsLoading || eligibleIsLoading) return <Spinner size={20} />
    const memberTags = _.isArray(member_tags) ? member_tags : []
    const eligibleTags = _.isArray(eligible_user_tags) ? eligible_user_tags : []
    if (eligibleTags.length === 0) return null

    return <div className="margin--little">
        <div className="font-weight--bold font-size--small margin-bottom--little"><ConsortiumText tag={tag} /></div>
        {eligibleTags.map(user_tag => <RequestableMemberRow
            key={user_tag}
            consortium_tag={tag}
            user_tag={user_tag}
            isMember={memberTags.includes(user_tag)}
            onInvalidate={onInvalidate} />)}
    </div>
}

/**
 * @description Button for the topbar that opens a dialog to request consortium membership
 * changes for members of the research groups the current user leads (as head/PI). The
 * requests are approved or denied by curators/admins. Renders nothing if the user is not
 * a member of any consortium.
 * @returns {JSX.Element|null} The consortium membership requests button with dialog.
 */
export function ConsortiumMembershipRequestsButton() {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { data: userConsortiums, isLoading: consortiumsIsLoading, isSuccess } = api.consortiums.useGetUserConsortiums(
        {}, { staleTime: 300000, retry: false }
    )
    const { data: pendingRequests, isLoading: requestsIsLoading } = api.consortiumMembershipRequests.useGetMyPendingConsortiumMembershipRequests(
        {}, { staleTime: 60000, retry: false }
    )
    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getMyPendingConsortiumMembershipRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getConsortiumUsers"] })
    }

    if (consortiumsIsLoading || (!isSuccess && !requestsIsLoading)) return null
    if (consortiumTags.length === 0) return null

    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                icon="people"
                text="Consortium members"
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Consortium membership requests"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw" }}>
            <DialogBody>
                <ConsortiumTermsWarning />
                <h4>Your pending requests</h4>
                {requestsIsLoading ? <Spinner size={20} /> :
                    _.isArray(pendingRequests) && pendingRequests.length > 0 ?
                        pendingRequests.map((request, idx) => <div
                            key={`${request.consortium_tag}-${request.user_tag}-${idx}`}
                            className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
                            <div className="flex align-center" style={{ gap: "0.5rem" }}>
                                <UserFullName tag={request.user_tag} />
                                <span className="font-size--small">{request.kind === "add" ? "join" : "leave"}</span>
                                <ConsortiumText tag={request.consortium_tag} />
                            </div>
                        </div>) :
                        <div className="font-size--small padding--little">No pending requests.</div>}
                <h4>Request membership changes</h4>
                <p className="font-size--smallest">
                    You can request to add or remove members of your research groups. The requests
                    are approved or denied by curators. Only members of a consortium can access its
                    shared submissions.
                </p>
                {consortiumTags.map(consortium_tag => <ConsortiumMembers key={consortium_tag} tag={consortium_tag} onInvalidate={invalidate} />)}
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}
