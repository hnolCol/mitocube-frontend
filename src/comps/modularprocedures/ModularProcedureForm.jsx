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

const INIT_PROCEDURE = { title: "", description: "", condition_application_tags: [], condition_application_trees: [], protocol_tags: [] }


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

    useEffect(() => {
        if (isEditMode && isSuccess && _.isObject(existingProcedure)) {
            setProcedure({
                title: existingProcedure.title || "",
                description: existingProcedure.description || "",
                condition_application_tags: existingProcedure.condition_application_tags || [],
                condition_application_trees: [],
                protocol_tags: existingProcedure.protocol_tags || []
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
        {isError ? <div><APIAxiosError error={error} /></div> : null}
        <div className="flex center-items justify-end" style={{ gap: "1rem", marginTop: "1rem" }}>
            <button disabled={isPending} className="basic-button basic-button--highlighted"
                onClick={() => onSubmit(procedure)}>{isPending ? "Saving..." : "Save"}</button>
            <button disabled={isPending} className="basic-button"
                onClick={() => setProcedure(INIT_PROCEDURE)}>Reset</button>
            <button disabled={isPending} className="basic-button" onClick={onCancel}>Cancel</button>
        </div>
    </div>
}
