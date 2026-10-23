import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Callout, Dialog, DialogBody, DialogFooter, Tag } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { UserFullName } from "@/comps/core/input/api/UserInput"
import { InsertAttribute } from "@/comps/core/base/attributes/InsertAttribute"
import moment from "moment"

const CURATOR_ROLE = 2

/**
 * @description Splits the request comment into the description (first block)
 * and the additional information (rest).
 */
function splitComment(comment) {
    if (!_.isString(comment) || comment.length === 0) return { description: "", rest: "" }
    const [description, ...rest] = comment.split("\n\n")
    return { description, rest: rest.join("\n\n") }
}

function formatTimestamp(timestamp) {
    if (Math.log10(timestamp) < 11) timestamp = timestamp * 1000
    return moment(timestamp).format("YYYY-MM-DD HH:mm")
}

/** @description Maps a stored proposal to the state shape used by InsertAttribute. */
function proposalToInsertState(attribute) {
    return {
        text: attribute.text || "",
        abbreviation: attribute.abbr || "",
        min_state: attribute.min_state ?? 0,
        priority: attribute.priority ?? 500,
        allow_input: !!attribute.allow_input,
        children: attribute.children || [],
        parents: attribute.parents || [],
        required_trait_tags: attribute.required_trait_tags || [],
        group_tags: attribute.group_tags || [],
        traits: (attribute.traits || []).map(t => ({
            text: t.text || "",
            description: t.description || "",
            priority: t.priority ?? 500
        }))
    }
}

/** @description Maps the InsertAttribute state back to the approve edits payload. */
function insertStateToEdits(state) {
    return {
        text: state.text.trim(),
        abbr: _.isString(state.abbreviation) && state.abbreviation.trim().length > 0 ? state.abbreviation.trim() : null,
        priority: _.toNumber(state.priority) || 500,
        min_state: _.isFinite(_.toNumber(state.min_state)) ? _.toNumber(state.min_state) : 0,
        group_tags: state.group_tags,
        allow_input: state.allow_input,
        parents: state.parents,
        children: state.children,
        required_trait_tags: state.required_trait_tags,
        traits: (state.traits || [])
            .filter(t => _.isString(t?.text) && t.text.trim().length > 0)
            .map(t => ({
                text: t.text.trim(),
                description: _.isString(t.description) ? t.description.trim() : "",
                priority: _.toNumber(t.priority) || 500
            }))
    }
}

PendingAttributeRequestsButton.propTypes = {
    userRole: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export function PendingAttributeRequestsButton({ userRole }) {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const { data: pendingRequests, isLoading } = api.attributes.requests.useGetPendingAttributeRequests(
        {}, { enabled: isCurator, staleTime: 60000, retry: false }
    )

    const pendingCount = _.isArray(pendingRequests) ? pendingRequests.length : 0

    if (!isCurator || isLoading || pendingCount === 0) return null

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getPendingAttributeRequests"] })
    }

    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                intent="warning"
                icon="changes"
                text={`Pending attribute requests (${pendingCount})`}
                onClick={() => setIsOpen(true)}
            />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Pending Attribute Requests"
            onClose={() => setIsOpen(false)}
            style={{ width: "60vw" }}
        >
            <DialogBody>
                <p className="font-size--small">
                    Users have requested the following new attributes. Review, optionally edit, and approve or deny them.
                    <strong> Email notifications have been sent to curators and admins.</strong>
                </p>
                {pendingRequests.map((request) => (
                    <PendingAttributeRequestRow
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

PendingAttributeRequestRow.propTypes = {
    request: PropTypes.object.isRequired,
    onInvalidate: PropTypes.func.isRequired
}

function PendingAttributeRequestRow({ request, onInvalidate }) {
    const attribute = request.attribute || {}
    const { description, rest } = splitComment(request.comment)
    const [comment, setComment] = useState("")
    const [error, setError] = useState(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const onError = (fallback) => (err) => {
        const msg = err?.response?.data?.detail || err?.message || fallback
        setError(_.isString(msg) ? msg : JSON.stringify(msg))
    }

    const { mutate: approve, isPending: isApproving } = api.attributes.requests.useApproveAttributeRequest({
        onSuccess: () => { setComment(""); setIsEditOpen(false); onInvalidate() },
        onError: onError("Failed to approve")
    })
    const { mutate: deny, isPending: isDenying } = api.attributes.requests.useDenyAttributeRequest({
        onSuccess: () => { setComment(""); onInvalidate() },
        onError: onError("Failed to deny")
    })
    const isWorking = isApproving || isDenying
    const reviewComment = comment.trim().length > 0 ? comment.trim() : undefined

    const handleApproveWithEdits = (editedState) => {
        setError(null)
        approve({ tag: request.tag, comment: reviewComment, attribute: insertStateToEdits(editedState) })
    }

    return (
        <div className="flex flex-column margin--little padding--little bg--lightgrey div--round">
            <div className="flex justify-between" style={{ alignItems: "flex-start", gap: "1rem" }}>
                <div className="flex flex-column" style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-weight--bold">
                        {attribute.text || request.tag}
                        {attribute.abbr ? <span style={{ color: "#888", fontWeight: 400 }}> ({attribute.abbr})</span> : null}
                    </div>
                    {_.isArray(attribute.group_tags) && attribute.group_tags.length > 0 && (
                        <div className="font-size--small">Groups: {attribute.group_tags.join(", ")}</div>
                    )}
                    {attribute.allow_input && <div className="font-size--small">Allows input</div>}

                    {description && (
                        <div className="margin-top--little">
                            <strong className="font-size--small">Description:</strong>
                            <div className="font-size--small" style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{description}</div>
                        </div>
                    )}
                    {rest && (
                        <div className="margin-top--little">
                            <strong className="font-size--small">Additional information:</strong>
                            <div className="font-size--small" style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{rest}</div>
                        </div>
                    )}

                    {_.isArray(attribute.traits) && attribute.traits.length > 0 && (
                        <div className="margin-top--little">
                            <strong className="font-size--small">Suggested traits ({attribute.traits.length}):</strong>
                            <div className="flex" style={{ flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                                {attribute.traits.map((t, i) => (
                                    <Tag key={`${t.text}-${i}`} minimal={true} title={t.description || undefined}>{t.text}</Tag>
                                ))}
                            </div>
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
                title={`Edit request: ${attribute.text || request.tag}`}
                onClose={() => setIsEditOpen(false)}
                canOutsideClickClose={false}
                style={{ width: "min(950px,70vw)" }}
            >
                <DialogBody>
                    {(description || rest) && (
                        <Callout intent="primary" title="User's description" className="margin-bottom--little">
                            <div style={{ whiteSpace: "pre-wrap" }}>{[description, rest].filter(Boolean).join("\n\n")}</div>
                        </Callout>
                    )}
                    {error ? (
                        <Callout intent="danger" title="Approval failed" className="margin-bottom--little">{error}</Callout>
                    ) : null}
                    {isEditOpen && (
                        <InsertAttribute
                            initialAttribute={proposalToInsertState(attribute)}
                            onSubmit={handleApproveWithEdits}
                            title="Review Attribute"
                            submitLabel="Approve with changes"
                            isSubmitting={isApproving}
                        />
                    )}
                </DialogBody>
                <DialogFooter actions={<Button text="Cancel" onClick={() => setIsEditOpen(false)} />} />
            </Dialog>
        </div>
    )
}