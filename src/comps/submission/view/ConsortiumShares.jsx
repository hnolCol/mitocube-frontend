import PropTypes from "prop-types";
import _ from "lodash";
import { Button, Tag } from "@blueprintjs/core";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { ConsortiumText } from "./ConsortiumText";

ConsortiumShare.propTypes = {
    consortium_tag: PropTypes.string.isRequired,
    submission_tag: PropTypes.string.isRequired,
    pendingConsortiumTags: PropTypes.arrayOf(PropTypes.string),
    onInvalidate: PropTypes.func
}

/**
 * @description One consortium row in the consortium sharing panel. Resolves the shared and
 * pending state for this consortium and allows to share/unshare the submission with it.
 * A share by a non-PI user is created pending and can be revoked until a PI approved it.
 * @param {Object} props
 * @param {String} props.consortium_tag Consortium tag
 * @param {String} props.submission_tag Submission tag
 * @param {String[]} props.pendingConsortiumTags Consortium tags with a pending share request for this submission
 * @param {Function} props.onInvalidate Callback to invalidate the share queries
 * @returns {JSX.Element} The consortium share row.
 */
function ConsortiumShare({ consortium_tag, submission_tag, pendingConsortiumTags = [], onInvalidate }) {
    const { data: submission_tags } = api.consortiums.useGetConsortiumSubmissions(
        { tag: consortium_tag }, { enabled: _.isString(consortium_tag), staleTime: 300000 }
    )
    const { mutate: shareSubmission, isPending: shareIsPending, isError: shareFailed, error: shareError } = api.consortiums.useShareSubmissionWithConsortium({
        onSuccess: onInvalidate
    })
    const { mutate: unshareSubmission, isPending: unshareIsPending, isError: unshareFailed, error: unshareError } = api.consortiums.useUnshareSubmissionFromConsortium({
        onSuccess: onInvalidate
    })
    const isShared = _.isArray(submission_tags) && submission_tags.includes(submission_tag)
    const isPending = pendingConsortiumTags.includes(consortium_tag)
    const isWorking = shareIsPending || unshareIsPending
    const handleToggleShare = () => {
        if (isShared) {
            unshareSubmission({ consortium_tag, submission_tag })
        } else {
            shareSubmission({ consortium_tag, submission_tag })
        }
    }
    const handleRevokeRequest = () => unshareSubmission({ consortium_tag, submission_tag })
    return <div className="flex justify-between align-center margin--little">
        <ConsortiumText tag={consortium_tag} />
        <div className="flex align-center flex-column">
            {shareFailed ? <APIAxiosError error={shareError} /> : null}
            {unshareFailed ? <APIAxiosError error={unshareError} /> : null}
            {isPending
                ? <div className="flex align-center">
                    <Tag minimal={true} round={true} intent="warning" icon="time">Pending</Tag>
                    <Button
                        small={true}
                        className="margin-left--little"
                        intent="danger"
                        text="Revoke request"
                        loading={isWorking}
                        onClick={handleRevokeRequest} />
                </div>
                : <Button
                    small={true}
                    loading={isWorking}
                    intent={isShared ? "danger" : "primary"}
                    text={isShared ? "Remove share" : "Share"}
                    onClick={handleToggleShare} />}
        </div>
    </div>
}

ConsortiumShares.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

/**
 * @description Shows all consortiums of the user the submission can be shared with and allows
 * the owner/curator to add or remove a share per consortium. If the user is not a research
 * group head (PI), the share is created with status pending and must be approved by a PI of
 * the owners research group first (backend behaviour). The requesting user can revoke a
 * pending request. Pending requests the user (as PI) can approve are handled in
 * PendingConsortiumShareRequests.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element|null} The consortium sharing panel.
 */
export function ConsortiumShares({ submission_tag }) {
    const queryClient = useQueryClient()
    const { data: userConsortiums, isLoading: isConsortiumsLoading } = api.consortiums.useGetUserConsortiums({}, { staleTime: 300000 })
    const { data: pendingConsortiumTags, isLoading: isPendingLoading } = api.consortiums.useGetPendingConsortiumShares(
        { submission_tag }, { staleTime: 300000 }
    )
    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []
    if (!isConsortiumsLoading && consortiumTags.length === 0) return null

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getConsortiumSubmissions"] })
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumShares"] })
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumShareRequests"] })
    }
    return <div className="container--shadow padding--little margin-top--little" style={{ maxWidth: "min(50vw,800px)", minWidth: "max(20vw,600px)" }}>
        <h3>Consortium Sharing</h3>
        <p className="font-size--small">
            Share this submission with a consortium. All members of the consortiums research groups will be able to access it.
            If you are not a research group head (PI), the share request must be approved by a PI of your research group first.
        </p>
        {isConsortiumsLoading || isPendingLoading ? <p>Loading..</p> :
            consortiumTags.map(consortium_tag => <ConsortiumShare
                key={consortium_tag}
                consortium_tag={consortium_tag}
                submission_tag={submission_tag}
                pendingConsortiumTags={_.isArray(pendingConsortiumTags) ? pendingConsortiumTags : []}
                onInvalidate={invalidate} />)}
    </div>
}