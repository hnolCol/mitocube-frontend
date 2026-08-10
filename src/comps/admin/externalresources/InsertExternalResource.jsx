import { api } from "@/api"
import _ from "lodash"
import { useState } from "react"
import APIError from "@/comps/core/error/APIerror"
import { AttributesInput } from "@/comps/core/input/api/DatasetAttributeInput"
import { DatasetAttributeView } from "@/comps/core/base/attributes/DatasetAttributeView"
import { findAndInsertTree, findChildrenByPath, deleteByPath, checkPathExists, addIDToPath } from "@/comps/submission/new/sample_attributes/select/SamplesAttributeWrapper"
import { CrosslinkUploadDialog } from "./CrosslinkUploadDialog"

const CONDITION_PATH_ID = "er_condition"

const INITIAL_RESOURCE = { title: "", link: "", doi: "", type: "crosslink_resource", author: "", year: "" }

const EXTERNAL_TYPE_VALUES = new Set(["crosslink_resource", "other"])

export function InsertExternalResource({ onClose }) {

    const [resource, setResource] = useState(INITIAL_RESOURCE)
    const [conditionTraits, setConditionTraits] = useState([])
    const [crosslinks, setCrosslinks] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    const { mutateAsync: postExternalResource } = api.crosslinks.externalresourcesModify.usePostExternalResource()
    const { mutateAsync: postCrosslinks } = api.crosslinks.externalresourcesModify.usePostExternalResourceCrosslinks()

    const handleConditionTraitSelection = (path, enforceSingleVariantPerGroup = true) => {
        path = addIDToPath(path, CONDITION_PATH_ID)
        let traits = conditionTraits.slice()
        const pathExists = checkPathExists(traits, path, true)
        const isValueInput = _.last(path).type === "trait" && _.has(_.last(path), "value") && _.isString(_.last(path).value)
        if (pathExists && !isValueInput) {
            deleteByPath(traits, path, true)
        } else {
            findAndInsertTree(traits, path, { enforceSingleVariantPerGroup })
        }
        setConditionTraits([...traits])
    }

    const getSelectionByPath = (path) => {
        path = addIDToPath(path, CONDITION_PATH_ID)
        return findChildrenByPath(conditionTraits, path)
    }

    const isLabExperiment = resource.type === "in_lab_experiment"

    const insertResource = async () => {
        setSubmitError(null)
        setIsSubmitting(true)
        try {
            const data = await postExternalResource({
                title: resource.title,
                link: resource.link.trim() === "" ? null : resource.link,
                doi: resource.doi,
                type: resource.type,
                author: resource.author,
                publication_date: resource.year,
                is_external: EXTERNAL_TYPE_VALUES.has(resource.type),
                condition_applications: conditionTraits
            })

            await postCrosslinks({ tag: data.tag, crosslinks })

            setResource(INITIAL_RESOURCE)
            setConditionTraits([])
            setCrosslinks([])
            onClose(true, data?.tag)
        } catch (error) {
            console.error("Failed to insert external resource", error)
            setSubmitError(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const isValid = () => {
        if (!_.isString(resource.title) || resource.title.trim().length === 0) return false
        if (!isLabExperiment && (!_.isString(resource.link) || resource.link.trim().length === 0)) return false
        if (crosslinks.length === 0) return false
        return true
    }

    return (
        <div className="flex flex-column div--expand margin--medium padding--medium" style={{ gap: "0.8rem" }}>
            <h3>External Resource Insertion</h3>

            <Section title="Details" required>
                <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                    <input className="text-input" type="text" value={resource.title} placeholder="Title"
                        onChange={(e) => setResource(prev => ({ ...prev, title: e.target.value }))} />
                    <input className="text-input" type="text" value={resource.link} placeholder={isLabExperiment ? "Link (optional)" : "Link (URL)"}
                        onChange={(e) => setResource(prev => ({ ...prev, link: e.target.value }))} />
                    <input className="text-input" type="text" value={resource.doi} placeholder="DOI (optional)"
                        onChange={(e) => setResource(prev => ({ ...prev, doi: e.target.value }))} />
                    <input className="text-input" type="text" value={resource.author} placeholder="Author / Creator"
                        onChange={(e) => setResource(prev => ({ ...prev, author: e.target.value }))} />
                    <input className="text-input" type="text" value={resource.year} placeholder="Year of Publication / Experiment"
                        onChange={(e) => setResource(prev => ({ ...prev, year: e.target.value }))} />
                    <select className="text-input" value={resource.type}
                        onChange={(e) => setResource(prev => ({ ...prev, type: e.target.value }))}>
                        <option value="crosslink_resource">External Crosslink Resource</option>
                        <option value="in_lab_experiment">Internal Experiment</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </Section>

            <Section title="Crosslinks" required>
                <div className="flex align-center" style={{ gap: "0.8rem" }}>
                    <CrosslinkUploadDialog onCrosslinksLoaded={setCrosslinks} />
                    {crosslinks.length > 0 && (
                        <span style={{ fontSize: "0.85rem", color: "#374151" }}>
                            {crosslinks.length} crosslinks loaded
                        </span>
                    )}
                </div>
            </Section>

            <Section title="Experimental Conditions" optional>
                <AttributesInput
                    handleTraitSelection={handleConditionTraitSelection}
                    min_state={0}
                    param_name="allow_for_sample"
                    selected_traits={conditionTraits}
                    showSelection={true}
                    placeHolderText="Search conditions (cell line, crosslinker, treatment, ...)"
                />
                {conditionTraits.length > 0 && (
                    <DatasetAttributeView
                        submission_tag={null}
                        attributeTraits={conditionTraits}
                        handleTraitRemove={handleConditionTraitSelection}
                        getSelectionByPath={getSelectionByPath}
                        onChildrenSelection={handleConditionTraitSelection}
                        checkAttributeRequiredTraits={() => true}
                    />
                )}
            </Section>

            {submitError && <APIError error={submitError} />}

            <div className="flex justify-end" style={{ gap: "0.4rem", marginTop: "auto" }}>
                <button className="dialog-button" style={{ backgroundColor: "#ec7160ff" }} onClick={() => onClose(false)}>
                    Close
                </button>
                <button
                    className={!isValid() || isSubmitting ? "dialog-button--disabled" : "dialog-button"}
                    disabled={!isValid() || isSubmitting}
                    onClick={insertResource}
                >
                    {isSubmitting ? "Inserting..." : "Insert"}
                </button>
            </div>
        </div>
    )
}

function Section({ title, children, required = false, optional = false }) {
    return (
        <div className="flex flex-column" style={{ gap: "0.4rem" }}>
            <div className="flex align-center" style={{ gap: "0.4rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{title}</span>
                {required && <span style={{ fontSize: "0.7rem", color: "#c0392b" }}>required</span>}
                {optional && <span style={{ fontSize: "0.7rem", color: "#aaa" }}>optional</span>}
            </div>
            {children}
        </div>
    )
}