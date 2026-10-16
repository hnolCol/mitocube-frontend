import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button, TextArea, Callout } from "@blueprintjs/core"
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
 * is deposited. Only visible to curators and admins (role >= 2).
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {Number|String} [props.userRole] Role of the current user
 * @returns {JSX.Element|null} The request deposition button with dialog.
 */
export function RequestDepositionButton({ submission_tag, userRole }) {
    const [isOpen, setIsOpen] = useState(false)
    const [comment, setComment] = useState("")
    const [confirmation, setConfirmation] = useState(null)
    if (!_.isFinite(_.toNumber(userRole)) || _.toNumber(userRole) < CURATOR_ROLE) return null
    const close = () => { setIsOpen(false); setConfirmation(null); setComment("") }
    return <>
        <TooltipButton
            icon="upload"
            content="Request deposition of this submission's data to the PRIDE database"
            onClick={() => setIsOpen(true)} />
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
                    <TextArea
                        fill={true}
                        placeholder="Optional comment for the curators (e.g. special requirements for the PRIDE submission)"
                        value={comment}
                        onChange={e => setComment(e.target.value)} />}
            </DialogBody>
            <DialogFooter actions={<>
                <Button text="Close" onClick={close} />
                {!_.isString(confirmation) ?
                    <DepositionRequestButton submission_tag={submission_tag} comment={comment} onConfirmed={setConfirmation} /> : null}
            </>} />
        </Dialog>
    </>
}

DepositionRequestButton.propTypes = {
    submission_tag: PropTypes.string.isRequired,
    comment: PropTypes.string,
    onConfirmed: PropTypes.func
}

/**
 * @description The submit button of the deposition request dialog. Triggers the
 * deposition request mutation and reports the created request tag.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {String} [props.comment] Optional comment for the curators
 * @param {Function} props.onConfirmed Callback with the confirmation message
 * @returns {JSX.Element} The submit button.
 */
function DepositionRequestButton({ submission_tag, comment, onConfirmed }) {
    const { mutate, isPending } = api.requests.depositions.usePostDepositionRequest()
    return <Button
        intent="primary"
        text="Request deposition"
        loading={isPending}
        onClick={() => mutate({ submission_tag, database: "PRIDE", comment }, {
            onSuccess: (request_tag) => onConfirmed(`The deposition request was created and the curators were notified (request tag: ${request_tag}).`)
        })} />
}
