import { Callout } from "@blueprintjs/core";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { ConditionApplicationInput } from "@/comps/core/input/api/ConditionApplicationInput";
import { AttributesInput } from "@/comps/core/input/api/DatasetAttributeInput";
import { DatasetAttributeView } from "@/comps/core/base/attributes/DatasetAttributeView";
import { findAndInsertTree, findChildrenByPath, findPath, deleteByPath, checkPathExists, addIDToPath, findNode } from "@/comps/submission/new/sample_attributes/select/SamplesAttributeWrapper";
import { getRandomID } from "@/services/random";
import { ProtocolMinimalItem } from "@/comps/admin/protocols/ProtocolMinimalItem";
import { AttributeInput } from "@/comps/core/input/api/AttributeInput";

const INIT_PROCEDURE = { title: "", description: "", condition_application_tags: [], condition_application_trees: [], protocol_tags: [],
    input_plate_format: "", input_plate_type: "", output_plate_format: "", output_plate_type: "",
    input_attribute_tags: [], output_attribute_tags: [], success_submission_state: "",
    pubmed_ids: "", min_output_wells_per_sample: "", max_output_wells_per_sample: "" }

const SUBMISSION_STATE_OPTIONS = ["PROCESSED", "MEASURING", "ANALYSIS", "DONE"]


/**
 * Form to create a new modular procedure or edit an existing draft.
 * Published modular procedures are immutable and cannot be edited.
 */
export function ModularProcedureForm({ procedure_tag, isPending, isError, error, onSubmit, onCancel }) {

    const isEditMode = _.isString(procedure_tag)
    const [procedure, setProcedure] = useState(INIT_PROCEDURE)
    const [protocolSearchString, setProtocolSearchString] = useState("")

    const { data: existingProcedure, isSuccess } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: isEditMode })

    const { data: protocol_tags } = api.protocols.query.useGetProtocolsByQuery(
        { search_string: protocolSearchString, limit: 30 }, { enabled: true })
    const { data: plateOptions } = api.plates.plates.useGetPlateOptions({})

    useEffect(() => {
        if (isEditMode && isSuccess && _.isObject(existingProcedure)) {
            setProcedure({
                title: existingProcedure.title || "",
                description: existingProcedure.description || "",
                condition_application_tags: existingProcedure.condition_application_tags || [],
                condition_application_trees: [],
                protocol_tags: existingProcedure.protocol_tags || [],
                input_plate_format: existingProcedure.input_plate_format || "",
                input_plate_type: existingProcedure.input_plate_type || "",
                output_plate_format: existingProcedure.output_plate_format || "",
                output_plate_type: existingProcedure.output_plate_type || "",
                input_attribute_tags: existingProcedure.input_attribute_tags || [],
                output_attribute_tags: existingProcedure.output_attribute_tags || [],
                success_submission_state: existingProcedure.success_submission_state || "",
                pubmed_ids: (existingProcedure.pubmed_ids || []).join(", "),
                min_output_wells_per_sample: _.toString(existingProcedure.min_output_wells_per_sample || ""),
                max_output_wells_per_sample: _.toString(existingProcedure.max_output_wells_per_sample || "")
            })
        }
    }, [isEditMode, isSuccess, existingProcedure])

    const handleSelectConditionApplication = (ca_tag) => {
        setProcedure((prev) => {
            const tags = prev.condition_application_tags.includes(ca_tag) ?
                prev.condition_application_tags.filter((tag) => tag !== ca_tag) :
                [...prev.condition_application_tags, ca_tag]
            return { ...prev, condition_application_tags: tags }
        })
    }

    // hierarchical condition application definition, reusing the submission insert machinery
    // (AttributesInput + DatasetAttributeView/TraitWithValueInput with its attribute checks)
    const referenceID = useMemo(() => getRandomID(), [])

    const getSelectionByPath = (path) => findChildrenByPath(procedure.condition_application_trees, path)

    const handleTraitSelectionHierarchy = (path, rowIndex, enforceSingleVariantPerGroup = false,
                                            replaceChildrenAtLeaf = false, singleTrait = false, checkExists = false) => {
        path = addIDToPath(path, referenceID)
        const selected_traits = procedure.condition_application_trees.slice()
        const pathExists = checkPathExists(selected_traits, path, true)
        const isValueInput = _.last(path).type === "trait" && _.has(_.last(path), "value") && _.isString(_.last(path).value)
        if (checkExists && pathExists && !isValueInput) {
            deleteByPath(selected_traits, path, true)
        } else {
            findAndInsertTree(selected_traits, path, {
                enforceSingleVariantPerGroup,
                replaceChildrenAtLeaf,
                singleTrait
            })
        }
        setProcedure((prev) => ({ ...prev, condition_application_trees: selected_traits }))
    }

    const handleTraitRemove = (path) => {
        const selected_traits = procedure.condition_application_trees.slice()
        deleteByPath(selected_traits, path, false)
        setProcedure((prev) => ({ ...prev, condition_application_trees: selected_traits }))
    }

    const checkAttributeRequiredTraits = (attribute_tag, trait_tags, id) => {
        const selected_traits = procedure.condition_application_trees.slice()
        const foundNode = trait_tags.map((trait_tag) => findNode(selected_traits, "trait", trait_tag, id))
        return _.some(foundNode)
    }

    const makeAttributeTagHandler = (field) => (attribute_tag) => {
        setProcedure((prev) => prev[field].includes(attribute_tag) ?
            { ...prev, [field]: prev[field].filter((tag) => tag !== attribute_tag) } :
            { ...prev, [field]: [...prev[field], attribute_tag] })
    }
    const handleSelectInputAttribute = makeAttributeTagHandler("input_attribute_tags")
    const handleSelectOutputAttribute = makeAttributeTagHandler("output_attribute_tags")

    const handleSubmit = () => {
        // split the comma separated PubMed IDs into a list, normalize numbers ("" = not set)
        const payload = {
            ...procedure,
            pubmed_ids: _.compact(_.map(_.split(procedure.pubmed_ids, ","), (id) => _.trim(id))),
            min_output_wells_per_sample: procedure.min_output_wells_per_sample === "" ?
                1 : _.toInteger(procedure.min_output_wells_per_sample),
            max_output_wells_per_sample: procedure.max_output_wells_per_sample === "" ?
                null : _.toInteger(procedure.max_output_wells_per_sample),
        }
        if (payload.max_output_wells_per_sample === null) delete payload.max_output_wells_per_sample
        onSubmit(_.omitBy(payload, (value) => value === ""))
    }

    const handleSelectProtocol = (protocol_tag) => {
        setProcedure((prev) => {
            const tags = prev.protocol_tags.includes(protocol_tag) ?
                prev.protocol_tags.filter((tag) => tag !== protocol_tag) :
                [...prev.protocol_tags, protocol_tag]
            return { ...prev, protocol_tags: tags }
        })
    }

    return <div className="flex flex-column" style={{ gap: "0.5rem" }}>
        <h3>{isEditMode ? "Edit Modular Procedure" : "Insert Modular Procedure"}</h3>
        <input className="text-input" type="text" placeholder="Title"
            value={procedure.title}
            onChange={(e) => setProcedure({ ...procedure, title: e.target.value })} />
        <textarea className="text-input padding--medium" style={{ width: "100%", height: "150px" }}
            placeholder="Describe the modular procedure (e.g. how the facility performs it)."
            value={procedure.description}
            onChange={(e) => setProcedure({ ...procedure, description: e.target.value })} />
        <Callout intent="primary" title="Condition Applications">
            Assign the attributes/traits (e.g. instrument, protocol) that describe when this modular procedure applies.
        </Callout>
        <ConditionApplicationInput
            selected_ca_tags={procedure.condition_application_tags}
            onSelect={handleSelectConditionApplication}
            samples_only={false}
            placeholder="Select condition applications" />
        {procedure.condition_application_tags.length > 0 ?
            <div className="flex" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
                {procedure.condition_application_tags.map((ca_tag) =>
                    <span key={ca_tag} className="basic-button basic-button--small"
                        onClick={() => handleSelectConditionApplication(ca_tag)}>
                        {ca_tag} ✕
                    </span>)}
            </div> : null}
        <Callout intent="primary" title="Define new condition applications">
            Alternatively define condition applications newly as hierarchical attribute/trait trees (like when
            inserting a submission) — e.g. attribute <em>Liquid Handler</em> → trait <em>Hamilton</em>, even if
            that combination was never used before.
        </Callout>
        <AttributesInput
            handleTraitSelection={handleTraitSelectionHierarchy}
            min_state={2}
            selected_traits={procedure.condition_application_trees}
            placeHolderText="Search attribute (liquid handler, instrument, ...)" />
        <DatasetAttributeView
            getSelectionByPath={getSelectionByPath}
            submission_tag={referenceID}
            attributeTraits={procedure.condition_application_trees}
            onChildrenSelection={handleTraitSelectionHierarchy}
            handleTraitRemove={handleTraitRemove}
            checkAttributeRequiredTraits={checkAttributeRequiredTraits} />
        <Callout intent="primary" title="Linked Protocols">
            Select the protocols that form the basis of this modular procedure.
        </Callout>
        <input className="text-input padding--tiny margin--tiny" type="text" placeholder="Search protocols..."
            value={protocolSearchString}
            onChange={(e) => setProtocolSearchString(e.target.value)}
            style={{ width: "100%" }} />
        <div style={{ height: "25vh", overflowY: "scroll" }}>
            {protocol_tags?.map((protocol_tag) =>
                <div key={protocol_tag} style={{
                    border: procedure.protocol_tags.includes(protocol_tag) ? "2px solid #48aff0" : "none",
                    borderRadius: "4px", marginBottom: "0.25rem"
                }}>
                    <ProtocolMinimalItem protocol_tag={protocol_tag}
                        onClick={() => handleSelectProtocol(protocol_tag)} />
                </div>)}
        </div>
        <Callout intent="primary" title="Plate Setup">
            Define the plate layout of the input and output plates this procedure requires (e.g. 8x12 = 96 well
            plate, or a PCR strip). Executions are rejected if the selected plates do not match.
        </Callout>
        <div className="flex" style={{ gap: "1rem", flexWrap: "wrap" }}>
            <label>
                <div className="font-size--small">Input plate format</div>
                <select className="text-input" value={procedure.input_plate_format}
                    onChange={(e) => setProcedure({ ...procedure, input_plate_format: e.target.value })}>
                    <option value="">Any format</option>
                    {plateOptions?.formats?.map((format) =>
                        <option key={format.tag} value={format.text}>{format.text}</option>)}
                </select>
            </label>
            <label>
                <div className="font-size--small">Input plate type</div>
                <select className="text-input" value={procedure.input_plate_type}
                    onChange={(e) => setProcedure({ ...procedure, input_plate_type: e.target.value })}>
                    <option value="">Any type</option>
                    {plateOptions?.plate_type?.map((type) =>
                        <option key={type.tag} value={type.text}>{type.text}</option>)}
                </select>
            </label>
            <label>
                <div className="font-size--small">Output plate format</div>
                <select className="text-input" value={procedure.output_plate_format}
                    onChange={(e) => setProcedure({ ...procedure, output_plate_format: e.target.value })}>
                    <option value="">Any format</option>
                    {plateOptions?.formats?.map((format) =>
                        <option key={format.tag} value={format.text}>{format.text}</option>)}
                </select>
            </label>
            <label>
                <div className="font-size--small">Output plate type</div>
                <select className="text-input" value={procedure.output_plate_type}
                    onChange={(e) => setProcedure({ ...procedure, output_plate_type: e.target.value })}>
                    <option value="">Any type</option>
                    {plateOptions?.plate_type?.map((type) =>
                        <option key={type.tag} value={type.text}>{type.text}</option>)}
                </select>
            </label>
        </div>
        <Callout intent="primary" title="Well Attributes">
            Declare the per-well attributes of this procedure: input attributes may be filled in per input well
            before the execution (e.g. protein concentration before harmonization), output attributes are
            expected as data on the output wells of a successful execution.
        </Callout>
        <div className="flex" style={{ gap: "1rem", flexWrap: "wrap" }}>
            <div>
                <div className="font-size--small">Input attributes (allow input)</div>
                <AttributeInput text="Add input attribute" onItemSelect={handleSelectInputAttribute} />
                <div className="flex" style={{ gap: "0.25rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                    {procedure.input_attribute_tags.map((tag) =>
                        <button key={tag} className="basic-button basic-button--small"
                            onClick={() => handleSelectInputAttribute(tag)}>{tag} ✕</button>)}
                </div>
            </div>
            <div>
                <div className="font-size--small">Output attributes (expected data)</div>
                <AttributeInput text="Add output attribute" onItemSelect={handleSelectOutputAttribute} />
                <div className="flex" style={{ gap: "0.25rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                    {procedure.output_attribute_tags.map((tag) =>
                        <button key={tag} className="basic-button basic-button--small"
                            onClick={() => handleSelectOutputAttribute(tag)}>{tag} ✕</button>)}
                </div>
            </div>
        </div>
        <Callout intent="primary" title="Publication references (optional)">
            PubMed IDs of the publications this module is based on (comma separated, e.g. 12345678, 87654321).
            They are part of the content that becomes immutable with the content hash on publishing.
        </Callout>
        <input className="text-input" type="text" placeholder="PubMed IDs, comma separated"
            value={procedure.pubmed_ids}
            onChange={(e) => setProcedure({ ...procedure, pubmed_ids: e.target.value })} />
        <Callout intent="primary" title="Sample numbers: mirroring or duplication? (optional)">
            How an execution of this module may treat the sample numbers: leave empty for no constraint.
            Min = max = 1 means the module mirrors the samples (one output well per sample);
            min = max = N describes an N-fold duplication like an N-fraction fractionation;
            a range allows anything between min and max output wells per sample.
        </Callout>
        <div className="flex center-items" style={{ gap: "0.5rem" }}>
            <span className="font-size--small">Output wells per sample:</span>
            <input className="text-input" type="number" min={1} placeholder="min" style={{ width: "5rem" }}
                value={procedure.min_output_wells_per_sample}
                onChange={(e) => setProcedure({ ...procedure, min_output_wells_per_sample: e.target.value })} />
            <span className="font-size--small">to</span>
            <input className="text-input" type="number" min={1} placeholder="max (empty = unbounded)" style={{ width: "10rem" }}
                value={procedure.max_output_wells_per_sample}
                onChange={(e) => setProcedure({ ...procedure, max_output_wells_per_sample: e.target.value })} />
        </div>
        <Callout intent="primary" title="Success State (optional)">
            If set, confirming an execution of this procedure as successful automatically changes the state of
            the linked submissions (e.g. to Processed) and they adopt the condition applications of this module.
        </Callout>
        <select className="text-input" value={procedure.success_submission_state}
            onChange={(e) => setProcedure({ ...procedure, success_submission_state: e.target.value })}>
            <option value="">Do not change the submission state</option>
            {SUBMISSION_STATE_OPTIONS.map((state) => <option key={state} value={state}>{state}</option>)}
        </select>
        {isError ? <div><APIAxiosError error={error} /></div> : null}
        <div className="flex center-items justify-end" style={{ gap: "1rem", marginTop: "1rem" }}>
            <button disabled={isPending} className="basic-button basic-button--highlighted"
                onClick={handleSubmit}>{isPending ? "Saving..." : "Save"}</button>
            <button disabled={isPending} className="basic-button"
                onClick={() => setProcedure(INIT_PROCEDURE)}>Reset</button>
            <button disabled={isPending} className="basic-button" onClick={onCancel}>Cancel</button>
        </div>
    </div>
}
