import PropTypes from "prop-types"
import _ from "lodash"
import { Button } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { ConsortiumTagWithText } from "./ConsortiumText"

ConsortiumShare.propTypes = {
    consortium_tag: PropTypes.string.isRequired,
    submission_tag: PropTypes.string.isRequired,
    pendingRequests: PropTypes.array,
    onInvalidate: PropTypes.func
}

/**
 * @description One consortium row in the consortium sharing panel. Resolves the shared and
 * pending state for this consortium and allows to share/unshare the submission with it.
 * @param {Object} props
 * @param {String} props.consortium_tag Consortium tag
 * @param {String} props.submission_tag Submission tag
 * @param {Object[]} props.pendingRequests Pending share requests of the current user
 * @param {Function} props.onInvalidate Callback to invalidate the share queries
 * @returns {JSX.Element} The consortium share row.
 */
function ConsortiumShare({ consortium_tag, submission_tag, pendingRequests = [], onInvalidate }) {
    const { data: submission_tags, isLoading } = api.consortiums.useGetConsortiumSubmissions(
        { tag: consortium_tag }, { enabled: _.isString(consortium_tag), staleTime: 300000 }
    )
    const { mutate: shareSubmission, isPending: shareIsPending } = api.consortiums.useShareSubmissionWithConsortium({ onSuccess: onInvalidate })
    const { mutate: unshareSubmission, isPending: unshareIsPending } = api.consortiums.useUnshareSubmissionFromConsortium({ onSuccess: onInvalidate })

    const isShared = _.isArray(submission_tags) && submission_tags.includes(submission_tag)
    const isPending = pendingRequests.some(r => r.consortium_tag === consortium_tag && r.submission_tag === submission_tag)

    const handleToggleShare = () => {
        if (isShared) {
            unshareSubmission({ consortium_tag, submission_tag })
        } else {
            shareSubmission({ consortium_tag, submission_tag })
        }
    }

    return <div className="flex justify-between align-center margin--little">
        <ConsortiumTagWithText tag={consortium_tag} />
        <Button
            small={true}
            loading={isLoading || shareIsPending || unshareIsPending}
            intent={isShared ? "danger" : isPending ? "warning" : "primary"}
            text={isShared ? "Remove share" : isPending ? "Pending approval" : "Share"}
            disabled={isPending}
            onClick={handleToggleShare} />
    </div>
}

ConsortiumShares.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

/**
 * @description Shows all consortiums of the user the submission can be shared with and allows
 * the owner/curator to add or remove a share per consortium. If the user is not a research
 * group head (PI), the share is created with status pending and must be approved by a PI of
 * the owners research group (backend behaviour). Pending requests the user (as PI) can
 * approve are handled in PendingConsortiumShareRequests.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element|null} The consortium sharing panel.
 */
export function ConsortiumShares({ submission_tag }) {
    const queryClient = useQueryClient()
    const { data: userConsortiums, isLoading: isConsortiumsLoading } = api.consortiums.useGetUserConsortiums({}, { staleTime: 300000 })
    const { data: pendingRequests, isLoading: isPendingLoading } = api.consortiumShareRequests.useGetPendingConsortiumShareRequests(
        {}, { staleTime: 300000, retry: false }
    )
    console.log(userConsortiums, pendingRequests)

    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []
    if (!isConsortiumsLoading && consortiumTags.length === 0) return null
    
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getConsortiumSubmissions"] })
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
                pendingRequests={_.isArray(pendingRequests) ? pendingRequests : []}
                onInvalidate={invalidate} />)}
    </div>
}
