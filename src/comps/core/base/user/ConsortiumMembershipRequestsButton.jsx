import { useState } from "react"
import _ from "lodash"
import { Button, Dialog, DialogBody, DialogFooter, Spinner } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { ConsortiumText } from "@/comps/submission/view/ConsortiumText"
import { UserFullName } from "@/comps/core/input/api/UserInput"
import { ConsortiumTermsWarning } from "@/comps/core/base/user/ConsortiumTermsButton"

/**
 * @description One user row of a consortium the current user is a member of. Group curators
 * and heads (PIs) have the direct right to add and remove consortium members and see
 * 'Add to consortium' / 'Remove from consortium' buttons; standard users only see a request
 * button for themselves, the request is decided by the group curator or head (PI).
 * @param {Object} props
 * @param {String} props.consortium_tag Consortium tag
 * @param {String} props.user_tag User tag of the (potential) member
 * @param {Boolean} props.isMember True if the user is already a direct member
 * @param {Boolean} props.isSelf True if the row concerns the current user themselves
 * @param {Boolean} props.canManageDirect True if the current user may add/remove members directly
 * @param {Function} props.onInvalidate Callback to invalidate the membership queries
 * @returns {JSX.Element} The requestable member row.
 */
function RequestableMemberRow({ consortium_tag, user_tag, isMember, isSelf, canManageDirect, onInvalidate }) {
    const { mutate: request, isPending: requestIsPending } = api.consortiumMembershipRequests.usePostConsortiumMembershipRequest({ onSuccess: onInvalidate })
    const { mutate: postUsers, isPending: postIsPending } = api.consortiums.usePostConsortiumUsers({ onSuccess: onInvalidate })
    const { mutate: deleteUsers, isPending: deleteIsPending } = api.consortiums.useDeleteConsortiumUsers({ onSuccess: onInvalidate })
    const isPending = requestIsPending || postIsPending || deleteIsPending
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <div className="flex align-center"><UserFullName tag={user_tag} />{isSelf ? <span className="font-size--smallest margin-left--little">(you)</span> : null}</div>
        {canManageDirect ?
            <Button
                small={true}
                minimal={true}
                intent={isMember ? "danger" : "primary"}
                text={isMember ? "Remove from consortium" : "Add to consortium"}
                disabled={isPending}
                onClick={() => isMember ? deleteUsers({ tag: consortium_tag, user_tags: [user_tag] }) : postUsers({ tag: consortium_tag, user_tags: [user_tag] })} /> :
            <Button
                small={true}
                minimal={true}
                intent={isMember ? "danger" : "primary"}
                text={isMember ? "Request removal" : "Request addition"}
                disabled={isPending}
                onClick={() => request({ consortium_tag, user_tag, kind: isMember ? "remove" : "add" })} />}
    </div>
}

/**
 * @description The members of one consortium the current user is a member of. Group curators
 * and heads (PIs) can add and remove the members of their research groups directly, standard
 * users only see their own row with a request button.
 * @param {Object} props
 * @param {String} props.tag Consortium tag
 * @param {String} props.userTag Tag of the current user
 * @param {Number} props.userRole Role of the current user. Only group curators (2) and
 * above can add and remove consortium members directly.
 * @param {String[]} props.pendingTermsTags Tags of the consortiums where none of the users
 * research groups agreed to the terms yet (standard users cannot request to join those)
 * @param {Function} props.onInvalidate Callback to invalidate the membership queries
 * @returns {JSX.Element} The consortium members section.
 */
function ConsortiumMembers({ tag, userTag, userRole, pendingTermsTags, onInvalidate }) {
    const { data: member_tags, isLoading: membersIsLoading } = api.consortiums.useGetConsortiumUsers({ tag }, { enabled: _.isString(tag), staleTime: 30000 })
    const { data: eligible_user_tags, isLoading: eligibleIsLoading } = api.consortiums.useGetConsortiumEligibleUsers({ tag }, { enabled: _.isString(tag), staleTime: 30000 })

    if (membersIsLoading || eligibleIsLoading) return <Spinner size={20} />
    const memberTags = _.isArray(member_tags) ? member_tags : []
    const eligibleTags = _.isArray(eligible_user_tags) ? eligible_user_tags : []
    const isGroupCuratorOrAbove = userRole >= 2
    // group curators and heads (PIs) see the members of their research groups (they can add
    // and remove them directly), standard users only their own row to request membership
    if (!isGroupCuratorOrAbove && !_.isString(userTag)) return null
    const termsPending = _.isArray(pendingTermsTags) && pendingTermsTags.includes(tag)
    if (!isGroupCuratorOrAbove && termsPending) {
        return <div className="margin--little">
            <div className="font-weight--bold font-size--small margin-bottom--little"><ConsortiumText tag={tag} /></div>
            <div className="font-size--smallest">
                The head (PI) of your research group has not yet agreed to the terms of this
                consortium. Until then you cannot request to join it.
            </div>
        </div>
    }
    const visibleTags = isGroupCuratorOrAbove ? eligibleTags : [userTag]
    if (visibleTags.length === 0) return null

    return <div className="margin--little">
        <div className="font-weight--bold font-size--small margin-bottom--little"><ConsortiumText tag={tag} /></div>
        {visibleTags.map(user_tag => <RequestableMemberRow
            key={user_tag}
            consortium_tag={tag}
            user_tag={user_tag}
            isMember={memberTags.includes(user_tag)}
            isSelf={user_tag === userTag}
            canManageDirect={isGroupCuratorOrAbove}
            onInvalidate={onInvalidate} />)}
    </div>
}

/**
 * @description Button for the topbar that opens a dialog to request consortium membership
 * changes and to decide the pending requests of the users research groups. Group curators
 * and heads (PIs) can request changes for members of their research groups and approve or
 * deny the pending requests of their groups (including requests filed by standard users);
 * standard users can request changes for themselves. Renders nothing if the user is not
 * a member of any consortium.
 * @param {Object} props
 * @param {String} props.userTag Tag of the current user
 * @param {Number} props.userRole Role of the current user
 * @returns {JSX.Element|null} The consortium membership requests button with dialog.
 */
export function ConsortiumMembershipRequestsButton({ userTag, userRole = 0 }) {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const canDecideRequests = userRole >= 2
    const { data: userConsortiums, isLoading: consortiumsIsLoading, isSuccess } = api.consortiums.useGetUserConsortiums(
        {}, { staleTime: 300000, retry: false }
    )
    const { data: pendingRequests, isLoading: requestsIsLoading } = api.consortiumMembershipRequests.useGetMyPendingConsortiumMembershipRequests(
        {}, { staleTime: 60000, retry: false }
    )
    const { data: pendingTermsConsortiums } = api.consortiumTerms.useGetUserConsortiumsWithPendingTerms(
        {}, { staleTime: 60000, retry: false }
    )
    const { mutate: approve, isPending: approveIsPending } = api.consortiumMembershipRequests.useApproveConsortiumMembershipRequest({ onSuccess: invalidate })
    const { mutate: deny, isPending: denyIsPending } = api.consortiumMembershipRequests.useDenyConsortiumMembershipRequest({ onSuccess: invalidate })
    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []
    const pendingTermsTags = _.isArray(pendingTermsConsortiums) ? pendingTermsConsortiums : []

    function invalidate() {
        queryClient.invalidateQueries({ queryKey: ["getMyPendingConsortiumMembershipRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getConsortiumUsers"] })
    }

    if (consortiumsIsLoading || (!isSuccess && !requestsIsLoading)) return null
    if (consortiumTags.length === 0) return null

    const isDeciding = approveIsPending || denyIsPending

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
                            {canDecideRequests && request.user_tag !== userTag ?
                                <div className="flex" style={{ gap: "0.25rem" }}>
                                    <Button small={true} intent="primary" text="Accept" disabled={isDeciding}
                                        onClick={() => approve({ consortium_tag: request.consortium_tag, user_tag: request.user_tag })} />
                                    <Button small={true} intent="danger" text="Deny" disabled={isDeciding}
                                        onClick={() => deny({ consortium_tag: request.consortium_tag, user_tag: request.user_tag })} />
                                </div> : null}
                        </div>) :
                        <div className="font-size--small padding--little">No pending requests.</div>}
                <h4>{canDecideRequests ? "Manage members" : "Request membership changes"}</h4>
                <p className="font-size--smallest">
                    Group curators and heads (PIs) can add members of their research groups
                    directly to the consortium and remove them again. Standard users can
                    request to join or leave for themselves; the requests are decided by the
                    group curators and heads (PIs) of the research groups. Only members of a
                    consortium can access its shared submissions.
                </p>
                {consortiumTags.map(consortium_tag => <ConsortiumMembers
                    key={consortium_tag}
                    tag={consortium_tag}
                    userTag={userTag}
                    userRole={userRole}
                    pendingTermsTags={pendingTermsTags}
                    onInvalidate={invalidate} />)}
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}

export function ConsortiumMembershipRequestsContent({ userTag, userRole = 0 }) {
    const queryClient = useQueryClient()
    const canDecideRequests = userRole >= 2
    const { data: userConsortiums, isLoading: consortiumsIsLoading, isSuccess } = api.consortiums.useGetUserConsortiums(
        {}, { staleTime: 300000, retry: false }
    )
    const { data: pendingRequests, isLoading: requestsIsLoading } = api.consortiumMembershipRequests.useGetMyPendingConsortiumMembershipRequests(
        {}, { staleTime: 60000, retry: false }
    )
    const { data: pendingTermsConsortiums } = api.consortiumTerms.useGetUserConsortiumsWithPendingTerms(
        {}, { staleTime: 60000, retry: false }
    )
    const { mutate: approve, isPending: approveIsPending } = api.consortiumMembershipRequests.useApproveConsortiumMembershipRequest({ onSuccess: invalidate })
    const { mutate: deny, isPending: denyIsPending } = api.consortiumMembershipRequests.useDenyConsortiumMembershipRequest({ onSuccess: invalidate })
    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []
    const pendingTermsTags = _.isArray(pendingTermsConsortiums) ? pendingTermsConsortiums : []

    function invalidate() {
        queryClient.invalidateQueries({ queryKey: ["getMyPendingConsortiumMembershipRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getConsortiumUsers"] })
    }

    if (consortiumsIsLoading || requestsIsLoading) return <div className="flex center-items padding--medium"><Spinner size={20} /></div>
    if (!isSuccess || !_.isArray(pendingRequests)) return null
    if (consortiumTags.length === 0) return null

    const isDeciding = approveIsPending || denyIsPending

    return <div>
        <h4>Your pending requests</h4>
        {pendingRequests.length > 0 ?
            pendingRequests.map((request, idx) => <div
                key={`${request.consortium_tag}-${request.user_tag}-${idx}`}
                className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
                <div className="flex align-center" style={{ gap: "0.5rem" }}>
                    <UserFullName tag={request.user_tag} />
                    <span className="font-size--small">{request.kind === "add" ? "join" : "leave"}</span>
                    <ConsortiumText tag={request.consortium_tag} />
                </div>
                {canDecideRequests && request.user_tag !== userTag ?
                    <div className="flex" style={{ gap: "0.25rem" }}>
                        <Button small={true} intent="primary" text="Accept" disabled={isDeciding}
                            onClick={() => approve({ consortium_tag: request.consortium_tag, user_tag: request.user_tag })} />
                        <Button small={true} intent="danger" text="Deny" disabled={isDeciding}
                            onClick={() => deny({ consortium_tag: request.consortium_tag, user_tag: request.user_tag })} />
                    </div> : null}
            </div>) :
            <div className="font-size--small padding--little">No pending requests.</div>}
        <h4>{canDecideRequests ? "Manage members" : "Request membership changes"}</h4>
        <p className="font-size--smallest">
            Group curators and heads (PIs) can add members of their research groups
            directly to the consortium and remove them again. Standard users can
            request to join or leave for themselves; the requests are decided by the
            group curators and heads (PIs) of the research groups. Only members of a
            consortium can access its shared submissions.
        </p>
        {consortiumTags.map(consortium_tag => <ConsortiumMembers
            key={consortium_tag}
            tag={consortium_tag}
            userTag={userTag}
            userRole={userRole}
            pendingTermsTags={pendingTermsTags}
            onInvalidate={invalidate} />)}
    </div>
}