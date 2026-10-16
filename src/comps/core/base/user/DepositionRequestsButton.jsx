import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import moment from "moment"
import { Button, Dialog, DialogBody, DialogFooter, Spinner, Tag, TextArea } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { SubmissionLink } from "@/comps/core/links/Submission"
import { UserFullName } from "@/comps/core/input/api/UserInput"

const CURATOR_ROLE = 2

DepositionRequestsButton.propTypes = {
    userRole: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

/**
 * @description Button for the topbar, visible for curators and admins (role >= 2), that
 * opens a dialog with the deposition requests. The button is always shown; a warning
 * badge indicates the number of pending requests.
 * @param {Object} props
 * @param {Number|String} [props.userRole] Role of the current user
 * @returns {JSX.Element|null} The deposition requests button with dialog.
 */
export function DepositionRequestsButton({ userRole }) {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const { data: pendingRequests, isLoading } = api.requests.depositions.useGetPendingDepositionRequests(
        { limit: 50 }, { enabled: isCurator, staleTime: 60000, retry: false }
    )
    if (!isCurator) return null
    const pendingCount = _.isArray(pendingRequests) ? pendingRequests.length : 0
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getPendingDepositionRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getDepositionRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getSubmissionDepositionRequests"] })
    }
    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                icon="upload"
                text="Deposition requests"
                onClick={() => setIsOpen(true)} />
        </div>
        {pendingCount > 0 ?
            <div className="flex flex-column justify-center">
                <Tag minimal={true} round={true} intent="warning" icon="time">{pendingCount}</Tag>
            </div> : null}
        <Dialog
            isOpen={isOpen}
            title="Deposition requests"
            onClose={() => setIsOpen(false)}
            style={{ width: "60vw" }}>
            <DialogBody>
                <p className="font-size--small">
                    Deposition requests of the submissions' data to external databases (e.g. PRIDE).
                    Pending requests are completed with the accession identifier once the data was deposited.
                </p>
                <h4>Pending requests</h4>
                {isLoading ? <Spinner size={20} /> :
                    pendingCount > 0 ?
                        pendingRequests.map((request, idx) => <PendingDepositionRequestRow
                            key={`${request.tag}-${idx}`}
                            request={request}
                            onInvalidate={invalidate} />) :
                        <div className="font-size--small padding--little">No pending deposition requests.</div>}
                <RecentDepositionRequests />
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}

PendingDepositionRequestRow.propTypes = {
    request: PropTypes.object.isRequired,
    onInvalidate: PropTypes.func.isRequired
}

/**
 * @description One pending deposition request row: the submission, database, requesting user
 * and request date, with actions to complete the request with the accession identifier or
 * to reject it.
 * @param {Object} props
 * @param {Object} props.request A pending deposition request
 * @param {Function} props.onInvalidate Callback to invalidate the deposition request queries
 * @returns {JSX.Element} The pending deposition request row.
 */
function PendingDepositionRequestRow({ request, onInvalidate }) {
    const [isCompleteOpen, setIsCompleteOpen] = useState(false)
    const [identifier, setIdentifier] = useState("")
    const [url, setUrl] = useState("")
    const [token, setToken] = useState("")
    const [comment, setComment] = useState("")
    const [error, setError] = useState(null)
    const { mutate: complete, isPending: isCompleting } = api.requests.depositions.usePostCompleteDepositionRequest()
    const { mutate: reject, isPending: isRejecting } = api.requests.depositions.usePostRejectDepositionRequest()
    const isWorking = isCompleting || isRejecting
    const handleComplete = () => {
        if (!_.isString(identifier) || identifier.trim().length === 0) {
            setError("Please provide the accession identifier (e.g. PXD...).")
            return
        }
        setError(null)
        complete({
            request_tag: request.tag,
            identifier: identifier.trim(),
            url: url.trim().length > 0 ? url.trim() : undefined,
            token: token.trim().length > 0 ? token.trim() : undefined,
            comment: comment.trim().length > 0 ? comment.trim() : undefined
        }, {
            onSuccess: () => { setIsCompleteOpen(false); onInvalidate() },
            onError: (err) => setError(err?.response?.data?.detail || err?.message || "Completing the deposition request failed.")
        })
    }
    return <div className="flex flex-column margin--little padding--little bg--lightgrey div--round">
        <div className="flex justify-between align-center">
            <div className="flex flex-column">
                <SubmissionLink tag={request.submission_tag} />
                <div className="font-size--smallest">
                    <Tag minimal={true} round={true} intent="warning" icon="time">
                        {`Pending deposition to ${_.isString(request.database) ? request.database : "external database"}`}
                    </Tag>
                    {_.isNumber(request.created_at) ? <span className="padding-left--little">requested on {formatTimestamp(request.created_at)}</span> : null}
                    {_.isString(request.user_tag) ? <span className="padding-left--little">by <UserFullName tag={request.user_tag} /></span> : null}
                </div>
                {_.isString(request.comment) && request.comment.length > 0 ?
                    <div className="font-size--smallest">{`Comment: ${_.truncate(request.comment, { length: 200 })}`}</div> : null}
            </div>
            <div className="flex" style={{ gap: "0.25rem" }}>
                <Button small={true} intent="primary" text="Complete" disabled={isWorking} onClick={() => { setIsCompleteOpen(prev => !prev); setError(null) }} />
                <Button small={true} intent="danger" text="Reject" disabled={isWorking}
                    onClick={() => reject({ request_tag: request.tag, comment: comment.trim().length > 0 ? comment.trim() : undefined }, { onSuccess: onInvalidate })} />
            </div>
        </div>
        {isCompleteOpen ?
            <div className="flex flex-column margin-top--little padding--little bg--white div--round">
                <span className="font-size--small">Complete the deposition request</span>
                <input
                    className="input margin-top--little"
                    style={{ width: "100%" }}
                    placeholder="Accession identifier (e.g. PXD...)"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)} />
                <input
                    className="input margin-top--little"
                    style={{ width: "100%" }}
                    placeholder="Optional url of the deposited dataset"
                    value={url}
                    onChange={e => setUrl(e.target.value)} />
                <input
                    className="input margin-top--little"
                    style={{ width: "100%" }}
                    placeholder="Optional login token for the deposited dataset"
                    value={token}
                    onChange={e => setToken(e.target.value)} />
                <TextArea
                    className="margin-top--little"
                    fill={true}
                    placeholder="Optional comment for the requesting user"
                    value={comment}
                    onChange={e => setComment(e.target.value)} />
                {_.isString(error) ? <div className="font-size--small margin-top--little">{error}</div> : null}
                <div className="flex justify-end margin-top--little" style={{ gap: "0.25rem" }}>
                    <Button small={true} text="Cancel" disabled={isWorking} onClick={() => setIsCompleteOpen(false)} />
                    <Button small={true} intent="primary" text="Save" loading={isCompleting} onClick={handleComplete} />
                </div>
            </div>
            : null}
    </div>
}

RecentDepositionRequests.propTypes = {}

/**
 * @description The most recent processed deposition requests (deposited or rejected),
 * shown below the pending requests in the deposition requests dialog.
 * @returns {JSX.Element} The recent deposition requests section.
 */
function RecentDepositionRequests() {
    const { data: requests, isLoading } = api.requests.depositions.useGetDepositionRequests(
        { limit: 10 }, { staleTime: 60000, retry: false }
    )
    const processed = _.isArray(requests) ? requests.filter(r => r.status !== "pending") : []
    return <>
        <h4>Recent requests</h4>
        {isLoading ? <Spinner size={20} /> :
            processed.length > 0 ?
                processed.map((request, idx) => <ProcessedDepositionRequestRow key={`${request.tag}-${idx}`} request={request} />) :
                <div className="font-size--small padding--little">No processed deposition requests yet.</div>}
    </>
}

ProcessedDepositionRequestRow.propTypes = {
    request: PropTypes.object.isRequired
}

/**
 * @description One processed (deposited or rejected) deposition request row.
 * @param {Object} props
 * @param {Object} props.request A processed deposition request
 * @returns {JSX.Element} The processed deposition request row.
 */
function ProcessedDepositionRequestRow({ request }) {
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <div className="flex flex-column">
            <SubmissionLink tag={request.submission_tag} />
            <div className="font-size--smallest flex align-center" style={{ gap: "0.25rem" }}>
                {request.status === "deposited" ?
                    <Tag minimal={true} round={true} intent="success" icon="endorsed">
                        {`Deposited to ${_.isString(request.database) ? request.database : "external database"}`}
                    </Tag> :
                    <Tag minimal={true} round={true} intent="danger" icon="cross">
                        {`Rejected (${_.isString(request.database) ? request.database : "external database"})`}
                    </Tag>}
                {request.status === "deposited" && _.isString(request.identifier) && request.identifier.length > 0 ?
                    <span><strong>{request.identifier}</strong></span> : null}
                {_.isNumber(request.reviewed_at) ? <span>{`${request.status === "deposited" ? "deposited" : "reviewed"} on ${formatTimestamp(request.reviewed_at)}`}</span> : null}
            </div>
            {_.isString(request.review_comment) && request.review_comment.length > 0 ?
                <div className="font-size--smallest">{`Comment: ${_.truncate(request.review_comment, { length: 200 })}`}</div> : null}
        </div>
    </div>
}

function formatTimestamp(timestamp) {
    if (Math.log10(timestamp) < 11) timestamp = timestamp * 1000
    return moment(timestamp).format("YYYY-MM-DD")
}
