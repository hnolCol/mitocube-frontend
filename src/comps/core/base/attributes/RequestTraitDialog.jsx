import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button, TextArea, Callout, Tag } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { AttributeSelection } from "./AttributeSelection"
import { Attribute } from "@/comps/core/base/attributes/Attribute"
import { collectTraits } from "./RequestAttributeDialog"

const INITIAL_TRAIT_STATE = {
    text: "",
    description: "",
    pasted_traits: "",
    comment: ""
}

RequestTraitDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userRole: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    attribute_tag: PropTypes.string
}

export function RequestTraitDialog({ isOpen, onClose, userRole, attribute_tag }) {
    const [traitState, setTrait] = useState(INITIAL_TRAIT_STATE)
    const trait = { ...INITIAL_TRAIT_STATE, ...traitState }
    const [isMultiple, setIsMultiple] = useState(false)
    const [selectedAttributeTag, setSelectedAttributeTag] = useState(attribute_tag || "")
    const [confirmation, setConfirmation] = useState(null)
    const [skipped, setSkipped] = useState([])
    const [error, setError] = useState(null)
    const queryClient = useQueryClient()
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= 2
    const hasFixedAttribute = _.isString(attribute_tag) && attribute_tag.length > 0
    const targetAttributeTag = hasFixedAttribute ? attribute_tag : selectedAttributeTag

    const { mutate: postRequest, isPending: isPendingSingle } = api.attributes.requests.useCreateTraitRequest()
    const { mutate: postBulkRequest, isPending: isPendingBulk } = api.attributes.requests.useCreateTraitRequestsBulk()
    const isPending = isPendingSingle || isPendingBulk

    const update = (patch) => setTrait(prev => ({ ...prev, ...patch }))
    const traits = collectTraits(trait.pasted_traits)
    const missingDescription = traits.filter(t => t.description.length === 0)

    const onError = (fallback) => (err) => {
        const msg = err?.response?.data?.detail || err?.message || fallback
        setError(`Failed to create request: ${_.isString(msg) ? msg : JSON.stringify(msg)}`)
    }

    const onCreated = () => {
        queryClient.invalidateQueries({ queryKey: ["getPendingTraitRequests"] })
        setTrait(INITIAL_TRAIT_STATE)
    }

    const handleSubmit = () => {
        if (!_.isString(targetAttributeTag) || targetAttributeTag.trim().length === 0) {
            setError("Please select an attribute for the traits.")
            return
        }

        if (isMultiple) {
            if (traits.length === 0) {
                setError("Please paste at least one trait.")
                return
            }
            if (missingDescription.length > 0) {
                setError(`Please provide a description for every trait. Missing for: ${missingDescription.map(t => t.text).join(", ")}`)
                return
            }
            setError(null)
            postBulkRequest({
                attribute_tag: targetAttributeTag,
                traits,
                comment: trait.comment.trim() || null
            }, {
                onSuccess: (res) => {
                    const created = res?.created || []
                    setSkipped(res?.skipped || [])
                    setConfirmation(`${created.length} trait request${created.length === 1 ? "" : "s"} created successfully! Curators and admins have been notified via email and will review your requests.`)
                    onCreated()
                },
                onError: onError("Failed to create trait requests")
            })
            return
        }

        if (trait.text.trim().length === 0) {
            setError("Please provide a text for the trait.")
            return
        }
        if (trait.description.trim().length === 0) {
            setError("Please describe what this trait represents and why it is needed.")
            return
        }
        setError(null)
        postRequest({
            attribute_tag: targetAttributeTag,
            text: trait.text.trim(),
            description: trait.description.trim(),
            comment: trait.comment.trim() || null
        }, {
            onSuccess: (res) => {
                setSkipped([])
                setConfirmation(`Trait request created successfully! Request tag: ${res?.tag}. Curators and admins have been notified via email and will review your request.`)
                onCreated()
            },
            onError: onError("Failed to create trait request")
        })
    }

    const handleClose = () => {
        setError(null)
        setConfirmation(null)
        setSkipped([])
        setIsMultiple(false)
        setTrait(INITIAL_TRAIT_STATE)
        setSelectedAttributeTag(attribute_tag || "")
        onClose()
    }

    if (isCurator) return null

    return (
        <Dialog
            isOpen={isOpen}
            title={isMultiple ? "Request New Traits" : "Request New Trait"}
            onClose={handleClose}
            canOutsideClickClose={false}
            style={{ width: "60vw", maxWidth: "800px" }}
        >
            <DialogBody>
                <p className="font-size--small">
                    Request new traits to be added to an attribute. Curators and admins will review
                    your request and add it if approved.
                </p>

                {_.isString(confirmation) ?
                    <>
                        <Callout intent="success" title="Request submitted">{confirmation}</Callout>
                        {skipped.length > 0 && (
                            <Callout intent="warning" title={`${skipped.length} trait${skipped.length === 1 ? " was" : "s were"} skipped`} className="margin-top--little">
                                {skipped.map(s => <div key={s.text}><b>{s.text}</b>: {s.reason}</div>)}
                            </Callout>
                        )}
                    </> :
                    <>
                        <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                            <h4>Attribute</h4>
                            {hasFixedAttribute ?
                                <Attribute attribute_tag={attribute_tag} /> :
                                <AttributeSelection
                                    selectedItem={selectedAttributeTag}
                                    onAttributeSelect={(tag) => setSelectedAttributeTag(tag)}
                                    allowClear={true}
                                />}

                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                                <input
                                    type="checkbox"
                                    id="request_multiple_traits"
                                    checked={isMultiple}
                                    onChange={(e) => { setIsMultiple(e.target.checked); setError(null) }}
                                />
                                <label htmlFor="request_multiple_traits" style={{ fontSize: 14, color: "#111827", fontWeight: 600, cursor: "pointer" }}>
                                    Request more than one trait
                                </label>
                            </div>

                            {isMultiple ? (
                                <div className="bg--lightgrey padding--little">
                                    <h4>Traits</h4>
                                    <span className="font-size--small">
                                        Paste one trait per line as <code>text | description</code>, or copy two columns (text, description)
                                        directly from a spreadsheet. Every trait needs a description. Each trait becomes its own request.
                                    </span>
                                    <TextArea
                                        fill={true}
                                        placeholder={"Liver | Liver tissue samples\nHeart | Heart tissue, including atria\nKidney | Kidney cortex"}
                                        value={trait.pasted_traits}
                                        onChange={(e) => update({ pasted_traits: e.target.value })}
                                        style={{ minHeight: "120px", fontFamily: "monospace", marginTop: 8 }}
                                    />

                                    {traits.length > 0 && (
                                        <div className="margin-top--little">
                                            <h5>{traits.length} trait{traits.length === 1 ? "" : "s"}</h5>
                                            <div className="flex" style={{ flexWrap: "wrap", gap: 4 }}>
                                                {traits.map(t => (
                                                    <Tag key={t.text} minimal={true} intent={t.description ? "none" : "danger"} title={t.description || "Description missing"}>
                                                        {t.text}{t.description
                                                            ? <span style={{ color: "#6B7280" }}> — {t.description}</span>
                                                            : <span> — no description</span>}
                                                    </Tag>
                                                ))}
                                            </div>
                                            {missingDescription.length > 0 && (
                                                <div className="font-size--smallest margin-top--little" style={{ color: "#862323" }}>
                                                    {missingDescription.length} trait{missingDescription.length === 1 ? "" : "s"} without description.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <h4>Trait Information</h4>
                                    <input
                                        className="text-input"
                                        type="text"
                                        placeholder="Trait text (required)"
                                        value={trait.text}
                                        onChange={(e) => update({ text: e.target.value })}
                                    />
                                    <TextArea
                                        fill={true}
                                        placeholder="Description (required): what this trait represents and why it is needed"
                                        value={trait.description}
                                        onChange={(e) => update({ description: e.target.value })}
                                        style={{ minHeight: "80px" }}
                                    />
                                </>
                            )}

                            <h4>Additional Information</h4>
                            <TextArea
                                fill={true}
                                placeholder={isMultiple ? "Any additional comments for the curators (optional, applies to all traits)" : "Any additional comments for the curators (optional)"}
                                value={trait.comment}
                                onChange={(e) => update({ comment: e.target.value })}
                            />
                        </div>

                        {_.isString(error) ?
                            <Callout intent="danger" title="Request failed" className="margin-top--little">
                                {error}
                            </Callout> : null}
                    </>
                }
            </DialogBody>
            <DialogFooter actions={
                <>
                    <Button text="Close" onClick={handleClose} />
                    {!_.isString(confirmation) ?
                        <Button
                            intent="primary"
                            text={isMultiple && traits.length > 1 ? `Submit ${traits.length} Requests` : "Submit Request"}
                            loading={isPending}
                            onClick={handleSubmit}
                        /> : null}
                </>
            } />
        </Dialog>
    )
}