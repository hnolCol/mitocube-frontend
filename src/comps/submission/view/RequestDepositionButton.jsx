import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button, TextArea, Callout, Tag } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import TooltipButton from "@/comps/core/base/buttons/TooltipButton"
import { api } from "@/api"

const CURATOR_ROLE = 2

RequestDepositionButton.propTypes = {
    submission_tag: PropTypes.string.isRequired,
    userRole: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

/**
 * @description Button for the submission overview quick access bar that opens a dialog to
 * request the deposition of the submission's data to the PRIDE database. The request is
 * handled by the curators, who complete it with the accession identifier once the data
 * is deposited. Only curators and admins (role >= 2) can request a deposition. If a
 * deposition request is already pending, all users with access to the submission see a
 * pending indicator and the request button is replaced by a revoke button (the revoke
 * itself is only offered to users who can see the pending request's tag: the requester,
 * curators/admins and research group heads; backend enforced).
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {Number|String} [props.userRole] Role of the current user
 * @returns {JSX.Element|null} The request deposition button with dialog.
 */
export function RequestDepositionButton({ submission_tag, userRole }) {
    const [isOpen, setIsOpen] = useState(false)
    const [comment, setComment] = useState("")
    const [confirmation, setConfirmation] = useState(null)
    const [error, setError] = useState(null)
    const queryClient = useQueryClient()
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const { data: exists } = api.requests.depositions.useGetSubmissionDepositionRequestExists(
        { submission_tag }, { enabled: _.isString(submission_tag), staleTime: 30000, retry: false }
    )
    const { data: requests } = api.requests.depositions.useGetSubmissionDepositionRequests(
        { submission_tag }, { enabled: exists?.pending === true, staleTime: 30000, retry: false }
    )
    const isPending = exists?.pending === true
    const pendingTag = isPending && _.isArray(requests) ?
        (requests.find(request => request.status === "pending")?.tag) : null
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getSubmissionDepositionRequestExists"] })
        queryClient.invalidateQueries({ queryKey: ["getSubmissionDepositionRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getPendingDepositionRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getDepositionRequests"] })
    }
    const close = () => { setIsOpen(false); setConfirmation(null); setError(null); setComment("") }
    return <>
        {isPending ?
            <>
                <Tag minimal={true} round={true} intent="warning" icon="time">Deposition pending</Tag>
                {_.isString(pendingTag) ?
                    <RevokeDepositionRequestButton request_tag={pendingTag} onRevoked={invalidate} />
                    : null}
            </> :
            isCurator ?
                <TooltipButton
                    icon="upload"
                    content="Request deposition of this submission's data to the PRIDE database"
                    onClick={() => setIsOpen(true)} />
                : null}
        <Dialog
            isOpen={isOpen}
            title="Request data deposition to PRIDE"
            onClose={close}
            style={{ width: "50vw" }}>
            <DialogBody>
                <p className="font-size--small">
                    Request the deposition of this submission's data to the PRIDE database.
                    The curators will upload the data to PRIDE and complete the request with the
                    accession identifier (e.g. PXD...). You will be notified once the deposition is done.
                </p>
                <p className="font-size--small">Submission: <strong>{submission_tag}</strong></p>
                {_.isString(confirmation) ?
                    <Callout intent="success" title="Deposition requested">{confirmation}</Callout> :
                    <>
                        <TextArea
                            fill={true}
                            placeholder="Optional comment for the curators (e.g. special requirements for the PRIDE submission)"
                            value={comment}
                            onChange={e => setComment(e.target.value)} />
                        {_.isString(error) ?
                            <Callout intent="danger" title="Request failed" className="margin-top--little">
                                {error}
                                <div className="font-size--small margin-top--little">
                                    The deposition request was not created. Check the details above and try again.
                                </div>
                            </Callout> : null}
                    </>}
            </DialogBody>
            <DialogFooter actions={<>
                <Button text="Close" onClick={close} />
                {!_.isString(confirmation) ?
                    <DepositionRequestButton
                        submission_tag={submission_tag}
                        comment={comment}
                        onError={setError}
                        onConfirmed={setConfirmation}
                        onRequested={invalidate} /> : null}
            </>} />
        </Dialog>
    </>
}

RevokeDepositionRequestButton.propTypes = {
    request_tag: PropTypes.string.isRequired,
    onRevoked: PropTypes.func
}

/**
 * @description Button that revokes (permanently deletes) a pending deposition request.
 * Only shown if a pending request is visible to the current user; the backend enforces
 * that only the requester, curators/admins or a research group head (PI) of the
 * requester's research group can revoke it.
 * @param {Object} props
 * @param {String} props.request_tag Tag of the pending deposition request
 * @param {Function} [props.onRevoked] Callback after the request was revoked
 * @returns {JSX.Element} The revoke button.
 */
function RevokeDepositionRequestButton({ request_tag, onRevoked }) {
    const [error, setError] = useState(null)
    const { mutate, isPending } = api.requests.depositions.useDeleteDepositionRequest({
        onSuccess: () => { setError(null); if (_.isFunction(onRevoked)) onRevoked() },
        onError: (err) => setError(err?.response?.data?.detail || err?.message || "Revoking the deposition request failed.")
    })
    return <TooltipButton
        intent="danger"
        icon="small-cross"
        loading={isPending}
        content={_.isString(error) ?
            `Revoking the deposition request failed: ${error}` :
            "A deposition request is pending. Click to revoke (permanently delete) the request."}
        onClick={() => mutate({ request_tag })} />
}

DepositionRequestButton.propTypes = {
    submission_tag: PropTypes.string.isRequired,
    comment: PropTypes.string,
    onConfirmed: PropTypes.func,
    onError: PropTypes.func,
    onRequested: PropTypes.func
}

/**
 * @description The submit button of the deposition request dialog. Triggers the
 * deposition request mutation and reports the created request tag.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {String} [props.comment] Optional comment for the curators
 * @param {Function} props.onConfirmed Callback with the confirmation message
 * @param {Function} props.onError Callback with the error message if the request failed
 * @param {Function} [props.onRequested] Callback after a successful request, e.g. to
 * invalidate the pending-status queries so the pending state shows immediately
 * @returns {JSX.Element} The submit button.
 */
function DepositionRequestButton({ submission_tag, comment, onConfirmed, onError, onRequested }) {
    const { mutate, isPending } = api.requests.depositionRequests.usePostDepositionRequest()
    const getRequestErrorMessage = (error) => {
        const status = error?.response?.status
        const detail = error?.response?.data?.detail
        if (_.isString(detail)) return status === 409 ? `Conflict: ${detail}` : detail
        if (_.isArray(detail)) {
            const messages = detail.map(d => [d?.loc?.filter(_.isString).join(" / "), d?.msg]
                .filter(s => _.isString(s) && s.length > 0).join(": "))
            return status === 409 ? `Conflict: ${messages.join("; ")}` : messages.join("; ")
        }
        if (_.isString(error?.response?.data?.message)) return error.response.data.message
        if (_.isString(error?.message)) return error.message
        return "An unknown error occurred while creating the deposition request. Please try again."
    }
    return <Button
        intent="primary"
        text="Request deposition"
        loading={isPending}
        onClick={() => {
            onError(null)
            mutate({ submission_tag, database: "PRIDE", comment }, {
                onSuccess: (request_tag) => {
                    if (_.isFunction(onRequested)) onRequested()
                    onConfirmed(`The deposition request was created and the curators were notified (request tag: ${request_tag}).`)
                },
                onError: (error) => onError(getRequestErrorMessage(error))
            })
        }} />
}
