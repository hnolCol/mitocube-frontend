import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button, TextArea, Callout, Tag } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { MultipleAttributeSelection } from "./MultipleAttributeSelection"
import { AttributesInput } from "../../input/api/DatasetAttributeInput"
import { Trait } from "../traits/Trait"
import { AttributeGroupSelection } from "@/comps/admin/attributes/Groups"
import { addStringToArrayOrRemove } from "@/services/arrays/transforms"
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette"

const INITIAL_ATTRIBUTE_STATE = {
    text: "",
    abbr: "",
    description: "",
    allow_input: false,
    children: [],
    parents: [],
    required_trait_tags: [],
    group_tags: [],
    suggested_traits: "",
    comment: ""
}

/**
 * @description Builds the request comment. The description is always the first block,
 * so the curator view can read it as everything before the first blank line.
 */
function buildComment({ description, comment }) {
    return [
        description.trim(),
        comment.trim().length > 0 ? comment.trim() : null
    ].filter(Boolean).join("\n\n")
}

/**
 * @description Parses pasted traits, one per line. A line can contain
 * "text<TAB>description" (copied from a spreadsheet) or "text | description".
 * Lines without a separator may contain several comma-separated texts.
 */
export function parsePastedTraits(pasted) {
    return pasted.split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .flatMap(line => {
            const parts = line.includes("\t") ? line.split("\t") : line.includes("|") ? line.split("|") : null
            if (parts) {
                const [text, ...rest] = parts.map(p => p.trim())
                return text.length > 0 ? [{ text, description: rest.join(" ").trim() }] : []
            }
            return line.split(",").map(t => t.trim()).filter(t => t.length > 0).map(text => ({ text, description: "" }))
        })
}

/**
 * @description Parses pasted traits into the trait objects the backend expects.
 * Priority is not requestable (curators set it on approval); duplicates (by text,
 * case-insensitive) are removed.
 */
export function collectTraits(pasted) {
    return _.uniqBy(parsePastedTraits(pasted || ""), t => t.text.toLowerCase())
}

function checkValid(attribute) {
    const missingFields = []
    if (attribute.text.trim().length === 0) missingFields.push("Provide text for the attribute.")
    if (attribute.description.trim().length === 0) missingFields.push("Describe what the attribute represents and why it is needed.")
    if (attribute.group_tags.length === 0) missingFields.push("Select at least one attribute group.")
    if (attribute.allow_input && attribute.abbr.trim().length === 0) missingFields.push("Provide an abbreviation for the attribute if allow input is selected.")
    if (attribute.allow_input && attribute.children.length > 0) missingFields.push("Cannot allow input if the attribute has children.")
    return { valid: missingFields.length === 0, missingFields }
}

RequestAttributeDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userRole: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export function RequestAttributeDialog({ isOpen, onClose, userRole }) {
    const [attributeState, setAttribute] = useState(INITIAL_ATTRIBUTE_STATE)
    const attribute = { ...INITIAL_ATTRIBUTE_STATE, ...attributeState }
    const [confirmation, setConfirmation] = useState(null)
    const [error, setError] = useState(null)
    const queryClient = useQueryClient()
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= 2

    const { mutate: postRequest, isPending } = api.attributes.requests.useCreateAttributeRequest()

    const update = (patch) => setAttribute(prev => ({ ...prev, ...patch }))

    const handleTraitSelection = (path) => {
        const trait_tag = _.last(path).tag
        setAttribute(prev => ({
            ...prev,
            required_trait_tags: addStringToArrayOrRemove({ array: prev.required_trait_tags || [], string: trait_tag })
        }))
    }

    const handleParentSelect = (attribute_tag) => {
        setAttribute(prev => {
            const parents = addStringToArrayOrRemove({ array: prev.parents || [], string: attribute_tag })
            // required traits only make sense while a parent is selected
            return { ...prev, parents, required_trait_tags: parents.length === 0 ? [] : (prev.required_trait_tags || []) }
        })
    }

    const traits = collectTraits(attribute.suggested_traits)
    const { valid, missingFields } = checkValid(attribute)

    const handleSubmit = () => {
        if (!valid) return
        setError(null)
        postRequest({
            text: attribute.text.trim(),
            abbr: attribute.abbr.trim() || null,
            group_tags: attribute.group_tags,
            traits,
            allow_input: attribute.allow_input,
            parents: attribute.parents,
            children: attribute.children,
            required_trait_tags: attribute.required_trait_tags,
            comment: buildComment(attribute)
        }, {
            onSuccess: (res) => {
                setConfirmation(`Attribute request created successfully! Request tag: ${res?.tag}. Curators and admins have been notified via email and will review your request.`)
                queryClient.invalidateQueries({ queryKey: ["getPendingAttributeRequests"] })
                setAttribute(INITIAL_ATTRIBUTE_STATE)
            },
            onError: (err) => {
                const msg = err?.response?.data?.detail || err?.message || "Failed to create attribute request"
                setError(`Failed to create request: ${_.isString(msg) ? msg : JSON.stringify(msg)}`)
            }
        })
    }

    const handleClose = () => {
        setError(null)
        setConfirmation(null)
        setAttribute(INITIAL_ATTRIBUTE_STATE)
        onClose()
    }

    if (isCurator) return null

    return (
        <Dialog
            isOpen={isOpen}
            title="Request New Attribute"
            onClose={handleClose}
            canOutsideClickClose={false}
            style={{ width: "min(950px,70vw)" }}
        >
            <DialogBody>
                {_.isString(confirmation) ?
                    <Callout intent="success" title="Request submitted">{confirmation}</Callout> :
                    <div className="flex flex-column div--expand" style={{ gap: "0.5rem" }}>
                        <span className="font-size--small">
                            Request a new attribute to be added to MitoCube. Curators and admins will review your request,
                            may adjust it (e.g. priority or groups), and add it if approved.
                        </span>

                        <h3>Request Attribute</h3>
                        <input
                            className="text-input"
                            type="text"
                            placeholder="Attribute text"
                            value={attribute.text}
                            onChange={(e) => update({ text: e.target.value })}
                        />
                        <TextArea
                            fill={true}
                            placeholder="Description: what this attribute represents and why it is needed"
                            value={attribute.description}
                            onChange={(e) => update({ description: e.target.value })}
                            style={{ minHeight: "80px" }}
                        />

                        <h3>Settings</h3>
                        <div style={{ marginLeft: "2rem" }}>
                            <h4>Attribute Groups</h4>
                            <span>Select attribute groups. Select sample if the attribute should be available for sample condition definition.</span>
                            <div className="margin--little">
                                <AttributeGroupSelection
                                    allowAdd={false}
                                    onSelection={group_tag => setAttribute(prev => ({
                                        ...prev,
                                        group_tags: addStringToArrayOrRemove({ array: prev.group_tags || [], string: group_tag })
                                    }))}
                                    selected_tags={attribute.group_tags}
                                />
                            </div>

                            <h4>Value Input</h4>
                            <div>
                                <span>Allowing users to enter a value. For example for a concentration, id, duration etc. If set to true a value must always be entered. In addition, a trait must also be defined (examples: °C, min, h, mM, etc).</span>
                            </div>
                            <div className="flex flex-column">
                                <div style={{ width: "100%", marginBottom: 16, marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        id="request_allow_input"
                                        checked={attribute.allow_input}
                                        onChange={(e) => update({ allow_input: e.target.checked })}
                                    />
                                    <label htmlFor="request_allow_input" style={{ fontSize: 14, color: "#111827", fontWeight: 600, cursor: "pointer" }}>
                                        Allow input
                                    </label>
                                </div>
                                {attribute.allow_input && <div>
                                    <h4>Abbreviation</h4>
                                    <input
                                        className="text-input"
                                        type="text"
                                        placeholder="Abbreviation"
                                        value={attribute.abbr}
                                        onChange={(e) => update({ abbr: e.target.value })}
                                    />
                                    <div className="font-size--smallest">Abbreviation is used in condition application view to display a value. Only relevant if allow input is <code>true</code></div>
                                </div>}
                            </div>

                            <h4>Hierarchy</h4>
                            <div className="flex flex-column" style={{ borderLeft: "0.5px solid black", paddingLeft: "1rem", marginLeft: "1rem", gap: "0.5rem" }}>
                                <div>
                                    <h4>Attribute parents</h4>
                                    <span>Defines parents of the specific attribute. For example, defining a specific heart region then, att_organ:heart should be the parent. This leads to a hierarchical entry of the attributes.
                                        Note that required traits must be of the same attribute as its parent.</span>
                                    <MultipleAttributeSelection
                                        selectedItems={attribute.parents}
                                        onAttributeSelect={handleParentSelect}
                                    />
                                </div>
                                <div>
                                    <h4>Required traits</h4>
                                    <div>
                                        Required traits define the conditions under which this attribute is applicable. Select a parent attribute first.
                                    </div>
                                    <AttributesInput
                                        placeHolderText="Select required traits for the attribute"
                                        handleTraitSelection={handleTraitSelection}
                                        selected_traits={attribute.required_trait_tags}
                                        matchTargetWidth={true}
                                        attribute_tags={attribute.parents}
                                        disabled={attribute.parents.length === 0}
                                    />
                                    <div className="flex">{attribute.required_trait_tags.map(trait_tag => <Trait key={trait_tag} trait_tag={trait_tag} />)}</div>
                                </div>
                                <div>
                                    <h4>Attribute children</h4>
                                    <div>Defines children of the specific attribute. For example, if you want to be able to define a duration or a concentration to the attribute, select them here.</div>
                                    <MultipleAttributeSelection
                                        selectedItems={attribute.children}
                                        onAttributeSelect={(attribute_tag) => setAttribute(prev => ({
                                            ...prev,
                                            children: addStringToArrayOrRemove({ array: prev.children || [], string: attribute_tag })
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <h3>Suggested Traits <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}>Optional</span></h3>
                        <div className="bg--lightgrey padding--little" style={{ marginLeft: "2rem" }}>
                            <span>
                                Paste one trait per line as <code>text | description</code>, or copy two columns (text, description) directly from a spreadsheet.
                                Curators will set the priority on approval.
                            </span>
                            <TextArea
                                fill={true}
                                placeholder={"Liver | Liver tissue samples\nHeart | Heart tissue"}
                                value={attribute.suggested_traits}
                                onChange={(e) => update({ suggested_traits: e.target.value })}
                                style={{ minHeight: "80px", fontFamily: "monospace", marginTop: 8 }}
                            />
                            {traits.length > 0 && (
                                <div className="margin-top--little">
                                    <h4>{traits.length} trait{traits.length === 1 ? "" : "s"} suggested</h4>
                                    <div className="flex" style={{ flexWrap: "wrap", gap: 4 }}>
                                        {traits.map(t => (
                                            <Tag key={t.text} minimal={true} title={t.description || undefined}>
                                                {t.text}{t.description ? <span style={{ color: "#6B7280" }}> — {t.description}</span> : null}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <h3>Additional Information <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}>Optional</span></h3>
                        <TextArea
                            fill={true}
                            placeholder="Any additional comments for the curators"
                            value={attribute.comment}
                            onChange={(e) => update({ comment: e.target.value })}
                        />

                        {_.isString(error) ?
                            <Callout intent="danger" title="Request failed" className="margin-top--little">
                                {error}
                            </Callout> : null}

                        <button
                            className="dialog-button"
                            style={{
                                backgroundColor: valid && !isPending ? HIGHLIGHT_COLOR : "lightgrey",
                                color: valid && !isPending ? "white" : "darkgrey"
                            }}
                            onClick={handleSubmit}
                            disabled={!valid || isPending}
                        >
                            {isPending ? "Submitting..." : "Submit Request"}
                        </button>
                        <div className="font-size--smallest flex flex-column" style={{ color: "#862323" }}>
                            {missingFields.map(field => <div key={field}>{field}</div>)}
                        </div>
                    </div>
                }
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={handleClose} />} />
        </Dialog>
    )
}