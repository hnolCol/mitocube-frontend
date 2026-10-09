import PropTypes from "prop-types"
import _ from "lodash"
import { Button } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"

ConsortiumShares.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

/**
 * @description Shows the consortiums a submission is shared with and allows the owner/curator
 * to add or remove shares. The backend enforces owner-or-curator on the mutating endpoints.
 */
export function ConsortiumShares({ submission_tag }) {
    const queryClient = useQueryClient()
    const { data: userConsortiums } = api.consortiums.useGetUserConsortiums({}, { staleTime: 300000 })
    const { data: submissionsByConsortium, isLoading } = api.consortiums.useGetConsortiumSubmissions(
        { tag: userConsortiums && userConsortiums.length > 0 ? userConsortiums[0] : undefined },
        { enabled: _.isArray(userConsortiums) && userConsortiums.length > 0 }
    )
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["getConsortiumSubmissions"] })
    const { mutate: shareSubmission } = api.consortiums.useShareSubmissionWithConsortium({ onSuccess: invalidate })
    const { mutate: unshareSubmission } = api.consortiums.useUnshareSubmissionFromConsortium({ onSuccess: invalidate })

    if (!_.isArray(userConsortiums) || userConsortiums.length === 0) return null

    const sharedConsortiums = _.isArray(submissionsByConsortium) && submissionsByConsortium.includes(submission_tag)
        ? [userConsortiums[0]]
        : []

    const handleToggleShare = (consortium_tag) => {
        if (sharedConsortiums.includes(consortium_tag)) {
            unshareSubmission({ consortium_tag, submission_tag })
        } else {
            shareSubmission({ consortium_tag, submission_tag })
        }
    }

    return <div className="container--shadow padding--little margin-top--little" style={{ maxWidth: "min(50vw,800px)", minWidth: "max(20vw,600px)" }}>
        <h3>Consortium Sharing</h3>
        <p className="font-size--small">Share this submission with a consortium. All members of the consortiums research groups will be able to access it.</p>
        {isLoading ? <p>Loading..</p> :
            userConsortiums.map(consortium_tag =>
                <div key={consortium_tag} className="flex justify-between align-center margin--little">
                    <span>{consortium_tag}</span>
                    <Button
                        small={true}
                        intent={sharedConsortiums.includes(consortium_tag) ? "danger" : "primary"}
                        text={sharedConsortiums.includes(consortium_tag) ? "Remove share" : "Share"}
                        onClick={() => handleToggleShare(consortium_tag)} />
                </div>)}
    </div>
}
