import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Spinner, Tag } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import moment from "moment"
import { api } from "@/api"
import { UserFullName } from "@/comps/core/input/api/UserInput"
import { ResearchGroupTitle } from "@/comps/core/input/api/ResearchGroupInput"

CollaborationRequestRow.propTypes = {
    request: PropTypes.object.isRequired,
    onInvalidate: PropTypes.func
}

/**
 * @description One collaboration request row in the submission collaboration requests
 * panel, with approve/deny actions (only for users that can approve; backend enforced).
 * @param {Object} props
 * @param {Object} props.request Collaboration request data
 * @param {Function} props.onInvalidate Callback to invalidate the request queries
 * @returns {JSX.Element} The collaboration request row.
 */
function CollaborationRequestRow({ request, onInvalidate }) {
    const { mutate: approve, isPending: isApproving } = api.collaborations.usePostApproveCollaborationRequest({ onSuccess: onInvalidate, onError: onInvalidate })
    const { mutate: deny, isPending: isDenying } = api.collaborations.usePostDenyCollaborationRequest({ onSuccess: onInvalidate, onError: onInvalidate })
    const isWorking = isApproving || isDenying
    const status = _.isString(request.status) && request.status.length > 0 ? request.status : "pending"
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <div className="flex flex-column">
            {_.isString(request.requested_by) ? <div className="font-size--smallest"><UserFullName tag={request.requested_by} /></div> : null}
            {_.isString(request.requested_for_group_tag) ?
                <div className="font-size--smallest">for <ResearchGroupTitle tag={request.requested_for_group_tag} /></div> : null}
            {_.isString(request.message) && request.message.length > 0 ?
                <div className="font-size--smallest">{_.truncate(request.message, { length: 120 })}</div> : null}
            {_.isNumber(request.created_at) ?
                <div className="font-size--smallest">{moment.unix(request.created_at / 1000).format("YYYY-MM-DD")}</div> : null}
        </div>
        {status === "pending" ?
            <div className="flex">
                <Button small={true} intent="primary" text="Approve" loading={isWorking} onClick={() => approve({ request_tag: request.tag })} />
                <Button small={true} intent="danger" text="Deny" className="margin-left--little" loading={isWorking} onClick={() => deny({ request_tag: request.tag })} />
            </div>
            : <Tag minimal={true} round={true} intent={status === "approved" ? "success" : "danger"}>
                {status === "approved" ? "Approved" : "Denied"}
            </Tag>}
    </div>
}

CollaboratorRow.propTypes = {
    submission_tag: PropTypes.string.isRequired,
    user_tag: PropTypes.string.isRequired,
    onInvalidate: PropTypes.func
}

/**
 * @description One collaborator row in the submission collaborators section, with a remove
 * action to revoke the collaboration access (only for users allowed to remove; the backend
 * enforces creator, head (PI) of the creators research group or curator).
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {String} props.user_tag The collaborator user tag
 * @param {Function} props.onInvalidate Callback to invalidate the collaborator queries
 * @returns {JSX.Element} The collaborator row.
 */
function CollaboratorRow({ submission_tag, user_tag, onInvalidate }) {
    const { mutate: remove, isPending } = api.submissions.users.useDeleteSubmissionCollaborator({ onSuccess: onInvalidate })
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <UserFullName tag={user_tag} />
        <Button
            small={true}
            intent="danger"
            text="Remove access"
            loading={isPending}
            onClick={() => remove({ tag: submission_tag, user_tag })} />
    </div>
}

CollaborationRequests.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

/**
 * @description Shows the collaboration requests of a submission (pending and already
 * decided ones) and allows the submission owner, a head (PI) of the owner's research
 * group or a curator to approve or deny pending requests. On approval the requesting
 * user (or all members of the requested research group) is added as collaborator.
 * Below the requests, the current collaborators are listed and the collaboration access
 * of each can be removed by the creator, the head (PI) of the creators research group
 * or a curator (backend enforced).
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element} The submission collaboration requests panel.
 */
export function CollaborationRequests({ submission_tag }) {
    const queryClient = useQueryClient()
    const { data: requests, isLoading, isError } = api.collaborations.useGetSubmissionCollaborationRequests(
        { submission_tag }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false }
    )
    const { data: collaborator_tags, isLoading: isLoadingCollaborators } = api.submissions.users.useGetSubmissionCollaborators(
        { tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false }
    )
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getSubmissionCollaborationRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getPendingCollaborationRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getSubmissionCollaborators"] })
        queryClient.invalidateQueries({ queryKey: ["getSubmissionUsers"] })
        queryClient.invalidateQueries({ queryKey: ["getMySharedSubmissionsOverview"] })
    }
    return <div className="container--shadow padding--little margin-top--little" style={{ maxWidth: "min(50vw,800px)", minWidth: "max(20vw,600px)" }}>
        <h3>Collaboration Requests</h3>
        <p className="font-size--small">
            Users without access to this submission can request collaboration. On approval they are added as collaborators.
            Depending on the backend setting, the request must also be approved by the head (PI) of the requesting user's research group.
        </p>
        {isLoading ? <div className="flex center-items padding--medium"><Spinner size={20} /></div> :
            isError || !_.isArray(requests) || requests.length === 0 ?
                <div className="padding--little font-size--small">No collaboration requests for this submission.</div> :
                <div className="flex flex-column">
                    {requests.map((request, idx) => <CollaborationRequestRow
                        key={`${request.tag}-${idx}`}
                        request={request}
                        onInvalidate={invalidate} />)}
                </div>}
        <h3>Collaborators</h3>
        <p className="font-size--small">
            Users currently collaborating on this submission. The creator, the head (PI) of the
            creators research group and curators can remove the collaboration access of a user here.
        </p>
        {isLoadingCollaborators ? <div className="flex center-items padding--medium"><Spinner size={20} /></div> :
            !_.isArray(collaborator_tags) || collaborator_tags.length === 0 ?
                <div className="padding--little font-size--small">No collaborators for this submission.</div> :
                <div className="flex flex-column">
                    {collaborator_tags.map(tag => <CollaboratorRow
                        key={tag}
                        submission_tag={submission_tag}
                        user_tag={tag}
                        onInvalidate={invalidate} />)}
                </div>}
    </div>
}