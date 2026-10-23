import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Callout, Dialog, DialogBody, DialogFooter, TextArea } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { UserFullName } from "@/comps/core/input/api/UserInput"
import { Attribute } from "@/comps/core/base/attributes/Attribute"
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette"
import moment from "moment"

const CURATOR_ROLE = 2

function formatTimestamp(timestamp) {
    if (Math.log10(timestamp) < 11) timestamp = timestamp * 1000
    return moment(timestamp).format("YYYY-MM-DD HH:mm")
}

PendingTraitRequestsButton.propTypes = {
    userRole: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export function PendingTraitRequestsButton({ userRole }) {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const { data: pendingRequests, isLoading } = api.attributes.requests.useGetPendingTraitRequests(
        {}, { enabled: isCurator, staleTime: 60000, retry: false }
    )

    const pendingCount = _.isArray(pendingRequests) ? pendingRequests.length : 0

    if (!isCurator || isLoading || pendingCount === 0) return null

    const invalidate = (attribute_tag) => {
        queryClient.invalidateQueries({ queryKey: ["getPendingTraitRequests"] })
        if (_.isString(attribute_tag)) {
            queryClient.invalidateQueries({ queryKey: ["traitsByTag", attribute_tag] })
        }
    }

    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                intent="warning"
                icon="changes"
                text={`Pending trait requests (${pendingCount})`}
                onClick={() => setIsOpen(true)}
            />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Pending Trait Requests"
            onClose={() => setIsOpen(false)}
            style={{ width: "60vw" }}
        >
            <DialogBody>
                <p className="font-size--small">
                    Users have requested the following new traits. Review, optionally edit, and approve or deny them.
                    <strong> Email notifications have been sent to curators and admins.</strong>
                </p>
                {pendingRequests.map((request) => (
                    <PendingTraitRequestRow
                        key={request.tag}
                        request={request}
                        onInvalidate={invalidate}
                    />
                ))}
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}

PendingTraitRequestRow.propTypes = {
    request: PropTypes.object.isRequired,
    onInvalidate: PropTypes.func.isRequired
}

function PendingTraitRequestRow({ request, onInvalidate }) {
    const trait = request.trait || {}
    const [comment, setComment] = useState("")
    const [error, setError] = useState(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const onError = (fallback) => (err) => {
        const msg = err?.response?.data?.detail || err?.message || fallback
        setError(_.isString(msg) ? msg : JSON.stringify(msg))
    }

    const { mutate: approve, isPending: isApproving } = api.attributes.requests.useApproveTraitRequest({
        onSuccess: () => { setComment(""); setIsEditOpen(false); onInvalidate(trait.attribute_tag) },
        onError: onError("Failed to approve")
    })
    const { mutate: deny, isPending: isDenying } = api.attributes.requests.useDenyTraitRequest({
        onSuccess: () => { setComment(""); onInvalidate() },
        onError: onError("Failed to deny")
    })
    const isWorking = isApproving || isDenying
    const reviewComment = comment.trim().length > 0 ? comment.trim() : undefined

    const handleApproveWithEdits = (edited) => {
        setError(null)
        approve({ tag: request.tag, comment: reviewComment, trait: edited })
    }

    return (
        <div className="flex flex-column margin--little padding--little bg--lightgrey div--round">
            <div className="flex justify-between" style={{ alignItems: "flex-start", gap: "1rem" }}>
                <div className="flex flex-column" style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex align-center" style={{ gap: "0.5rem" }}>
                        {trait.attribute_tag && <Attribute attribute_tag={trait.attribute_tag} />}
                        <div className="font-weight--bold">{trait.text || request.tag}</div>
                    </div>

                    {trait.description && (
                        <div className="margin-top--little">
                            <strong className="font-size--small">Description:</strong>
                            <div className="font-size--small" style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{trait.description}</div>
                        </div>
                    )}
                    {request.comment && (
                        <div className="margin-top--little">
                            <strong className="font-size--small">Additional information:</strong>
                            <div className="font-size--small" style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{request.comment}</div>
                        </div>
                    )}

                    <div className="font-size--smallest margin-top--little">
                        {_.isString(request.user_tag) ? <span>Requested by <UserFullName tag={request.user_tag} /></span> : null}
                        {_.isNumber(request.created_at) ? <span> on {formatTimestamp(request.created_at)}</span> : null}
                    </div>
                </div>
                <div className="flex" style={{ gap: "0.25rem", alignItems: "flex-start", flexShrink: 0 }}>
                    <Button
                        small={true}
                        icon="edit"
                        text="Edit"
                        disabled={isWorking}
                        onClick={() => { setError(null); setIsEditOpen(true) }}
                    />
                    <Button small={true} intent="primary" text="Approve" loading={isApproving && !isEditOpen} disabled={isWorking}
                        onClick={() => approve({ tag: request.tag, comment: reviewComment })} />
                    <Button small={true} intent="danger" text="Deny" loading={isDenying} disabled={isWorking}
                        onClick={() => deny({ tag: request.tag, comment: reviewComment })} />
                </div>
            </div>

            {error && !isEditOpen ? <div className="font-size--small margin-top--little" style={{ color: "#d32f2f" }}>{error}</div> : null}
            <div className="margin-top--little">
                <input
                    className="input"
                    style={{ width: "100%" }}
                    placeholder="Optional comment for response"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isWorking}
                />
            </div>

            <Dialog
                isOpen={isEditOpen}
                title={`Edit request: ${trait.text || request.tag}`}
                onClose={() => setIsEditOpen(false)}
                canOutsideClickClose={false}
                style={{ width: "min(700px,60vw)" }}
            >
                <DialogBody>
                    {request.comment && (
                        <Callout intent="primary" title="User's comment" className="margin-bottom--little">
                            <div style={{ whiteSpace: "pre-wrap" }}>{request.comment}</div>
                        </Callout>
                    )}
                    {error ? (
                        <Callout intent="danger" title="Approval failed" className="margin-bottom--little">{error}</Callout>
                    ) : null}
                    {isEditOpen && (
                        <EditTraitRequestForm
                            trait={trait}
                            onSubmit={handleApproveWithEdits}
                            isSubmitting={isApproving}
                        />
                    )}
                </DialogBody>
                <DialogFooter actions={<Button text="Cancel" onClick={() => setIsEditOpen(false)} />} />
            </Dialog>
        </div>
    )
}

EditTraitRequestForm.propTypes = {
    trait: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool
}

/**
 * @description Form to review a trait request, styled like InsertAttribute.
 * The attribute cannot be changed.
 */
function EditTraitRequestForm({ trait, onSubmit, isSubmitting = false }) {
    const [edit, setEdit] = useState({
        text: trait.text || "",
        description: trait.description || "",
        priority: trait.priority ?? 500
    })
    const valid = edit.text.trim().length > 0

    return (
        <div className="flex flex-column div--expand" style={{ gap: "0.5rem" }}>
            <h3>Review Trait</h3>
            <div className="flex align-center" style={{ gap: "0.5rem" }}>
                <span>Attribute:</span>
                {trait.attribute_tag && <Attribute attribute_tag={trait.attribute_tag} />}
            </div>
            <input
                className="text-input"
                type="text"
                placeholder="Trait text"
                value={edit.text}
                onChange={(e) => setEdit(prev => ({ ...prev, text: e.target.value }))}
            />
            <TextArea
                fill={true}
                placeholder="Description"
                value={edit.description}
                onChange={(e) => setEdit(prev => ({ ...prev, description: e.target.value }))}
                style={{ minHeight: "80px" }}
            />
            <div>
                <h4>Priority</h4>
                <input
                    className="text-input"
                    type="number"
                    value={_.toString(edit.priority)}
                    onChange={(e) => setEdit(prev => ({ ...prev, priority: e.target.value }))}
                />
            </div>
            <button
                className="dialog-button"
                style={{
                    backgroundColor: valid && !isSubmitting ? HIGHLIGHT_COLOR : "lightgrey",
                    color: valid && !isSubmitting ? "white" : "darkgrey"
                }}
                disabled={!valid || isSubmitting}
                onClick={() => onSubmit({
                    text: edit.text.trim(),
                    description: edit.description.trim(),
                    priority: _.toNumber(edit.priority) || 500
                })}
            >
                {isSubmitting ? "Submitting..." : "Approve with changes"}
            </button>
            {!valid && <div className="font-size--smallest" style={{ color: "#862323" }}>Provide text for the trait.</div>}
        </div>
    )
}