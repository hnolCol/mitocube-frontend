import PropTypes from "prop-types"
import _ from "lodash"
import moment from "moment"
import { Spinner, Tag, Tooltip } from "@blueprintjs/core"
import { api } from "@/api"
import { UserFullName } from "@/comps/core/input/api/UserInput"

DepositionStatus.propTypes = {
    submission_tag: PropTypes.string.isRequired
}

/**
 * @description Shows the deposition status of a submission in the submission overview.
 * If the submission's data was deposited to an external database (e.g. PRIDE), the
 * accession identifier (with a link to the dataset, if available) is displayed together
 * with the request date, the requesting user, the completion date and the curator who
 * completed the request. Pending deposition requests are indicated as well. Renders
 * nothing if there are no deposition requests for this submission.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element|null} The deposition status view container.
 */
export function DepositionStatus({ submission_tag }) {
    const { data: requests, isLoading } = api.requests.depositions.useGetSubmissionDepositionRequests(
        { submission_tag }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false }
    )
    if (isLoading) return null
    if (!_.isArray(requests) || requests.length === 0) return null
    const depositedRequest = requests.find(request => request.status === "deposited" && _.isString(request.identifier) && request.identifier.length > 0)
    const pendingRequests = requests.filter(request => request.status === "pending")
    return <div className="flex flex-column">
        <h3>Data Deposition</h3>
        {depositedRequest ?
            <DepositedRequestRow request={depositedRequest} /> :
            <div className="font-size--small">The data of this submission has not been deposited to an external database yet.</div>}
        {pendingRequests.length > 0 ?
            <div className="margin-top--little font-size--small">
                {pendingRequests.map((request, idx) => <div key={`${request.tag}-${idx}`} className="flex align-center">
                    <Tag minimal={true} round={true} intent="warning" icon="time">Deposition to {_.isString(request.database) ? request.database : "external database"} pending</Tag>
                    {_.isNumber(request.created_at) ?
                        <span className="padding-left--little">requested on {formatTimestamp(request.created_at)}</span> : null}
                    {_.isString(request.user_tag) ?
                        <span className="padding-left--little">by <UserFullName tag={request.user_tag} /></span> : null}
                </div>)}
            </div> : null}
    </div>
}

DepositedRequestRow.propTypes = {
    request: PropTypes.object.isRequired
}

/**
 * @description One deposited deposition request: the accession identifier (linked to the
 * deposited dataset if a url is available), the database it was deposited to, when the
 * deposition was requested and by whom, and when it was completed by which curator.
 * @param {Object} props
 * @param {Object} props.request Deposition request with status "deposited"
 * @returns {JSX.Element} The deposited request row.
 */
function DepositedRequestRow({ request }) {
    const identifier = _.isString(request.identifier) ? request.identifier : ""
    return <div className="flex flex-column">
        <div className="flex align-center">
            <Tag minimal={true} round={true} intent="success" icon="endorsed">
                Deposited to {_.isString(request.database) ? request.database : "external database"}
            </Tag>
            {_.isString(request.url) && request.url.length > 0 ?
                <a className="padding-left--little" href={request.url} target="_blank" rel="noopener noreferrer"><strong>{identifier}</strong></a> :
                <span className="padding-left--little"><strong>{identifier}</strong></span>}
        </div>
        {_.isNumber(request.created_at) ?
            <div className="font-size--smallest">
                Requested on {formatTimestamp(request.created_at)}
                {_.isString(request.user_tag) ? <> by <UserFullName tag={request.user_tag} /></> : null}
            </div> : null}
        {_.isNumber(request.reviewed_at) ?
            <div className="font-size--smallest">
                Deposited on {formatTimestamp(request.reviewed_at)}
                {_.isString(request.reviewer_tag) ? <> by <UserFullName tag={request.reviewer_tag} /></> : null}
            </div> : null}
        {_.isString(request.token) && request.token.length > 0 ?
            <div className="font-size--smallest">
                <Tooltip content="Login token for the deposited dataset" minimal={true}>
                    <span>Login token: {request.token}</span>
                </Tooltip>
            </div> : null}
        {_.isString(request.review_comment) && request.review_comment.length > 0 ?
            <div className="font-size--smallest">{_.truncate(request.review_comment, { length: 200 })}</div> : null}
    </div>
}

function formatTimestamp(timestamp) {
    if (Math.log10(timestamp) < 11) timestamp = timestamp * 1000
    return moment(timestamp).format("YYYY-MM-DD")
}
