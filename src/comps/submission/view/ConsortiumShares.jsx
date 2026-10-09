import PropTypes from "prop-types"
import _ from "lodash"
import { Button } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { ConsortiumTagWithText } from "./ConsortiumText"

ConsortiumShares.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

/**
 * @description Shows the consortiums a submission is shared with and allows the owner/curator
 * to add or remove shares. If the user is not a research group head (PI), the share is
 * created with status pending and must be approved by a PI of the owners research group
 * (backend behaviour). Pending requests of a users own submissions are shown here,
 * pending requests the user (as PI) can approve are handled in PendingConsortiumShareRequests.
 */
export function ConsortiumShares({ submission_tag }) {
    const queryClient = useQueryClient()
    const { data: userConsortiums } = api.consortiums.useGetUserConsortiums({}, { staleTime: 300000 })
    const { data: pendingRequests, isLoading: isPendingLoading } = api.consortiumShareRequests.useGetPendingConsortiumShareRequests(
        {}, { staleTime: 300000, retry: false }
    )
    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []
    const { data: submissionsByConsortium, isLoading } = api.consortiums.useGetConsortiumSubmissions(
        { tag: consortiumTags.length > 0 ? consortiumTags[0] : undefined },
        { enabled: consortiumTags.length > 0 }
    )
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getConsortiumSubmissions"] })
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumShareRequests"] })
    }
    const { mutate: shareSubmission } = api.consortiums.useShareSubmissionWithConsortium({ onSuccess: invalidate })
    const { mutate: unshareSubmission } = api.consortiums.useUnshareSubmissionFromConsortium({ onSuccess: invalidate })
    if (consortiumTags.length === 0) return null
    const sharedConsortiums = _.isArray(submissionsByConsortium) && submissionsByConsortium.includes(submission_tag)
        ? [consortiumTags[0]]
        : []
    const pendingForSubmission = _.isArray(pendingRequests)
        ? pendingRequests.filter(r => r.submission_tag === submission_tag)
        : []
    const isPendingInConsortium = (consortium_tag) => pendingForSubmission.some(r => r.consortium_tag === consortium_tag)
    const handleToggleShare = (consortium_tag) => {
        if (sharedConsortiums.includes(consortium_tag)) {
            unshareSubmission({ consortium_tag, submission_tag })
        } else {
            shareSubmission({ consortium_tag, submission_tag })
        }
    }
    return <div className="container--shadow padding--little margin-top--little" style={{ maxWidth: "min(50vw,800px)", minWidth: "max(20vw,600px)" }}>
        <h3>Consortium Sharing</h3>
        <p className="font-size--small">
            Share this submission with a consortium. All members of the consortiums research groups will be able to access it.
            If you are not a research group head (PI), the share request must be approved by a PI of your research group first.
        </p>
        {isLoading || isPendingLoading ? <p>Loading..</p> :
            consortiumTags.map(consortium_tag => {
                const isShared = sharedConsortiums.includes(consortium_tag)
                const isPending = isPendingInConsortium(consortium_tag)
                return <div key={consortium_tag} className="flex justify-between align-center margin--little">
                    <ConsortiumTagWithText tag={consortium_tag} />
                    <Button
                        small={true}
                        intent={isShared ? "danger" : isPending ? "warning" : "primary"}
                        text={isShared ? "Remove share" : isPending ? "Pending approval" : "Share"}
                        disabled={isPending}
                        onClick={() => handleToggleShare(consortium_tag)} />
                </div>
            })}
    </div>
}
