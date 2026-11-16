import { Callout } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import _ from "lodash";
import { api } from "@/api";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { ConditionApplicationInput } from "@/comps/core/input/api/ConditionApplicationInput";
import { AttributeInput } from "@/comps/core/input/api/AttributeInput";
import { TraitInput } from "@/comps/core/input/api/TraitInput";
import { ProtocolMinimalItem } from "@/comps/admin/protocols/ProtocolMinimalItem";

const INIT_PROCEDURE = { title: "", description: "", condition_application_tags: [], condition_application_trees: [], protocol_tags: [] }
const makeAttributeNode = (tag) => ({ tag, type: "attribute", value: null, children: [] })
const makeTraitNode = (tag) => ({ tag, type: "trait", value: null, children: [] })

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

    const handleAddTreeAttribute = (attribute_tag) => {
        if (!_.isString(attribute_tag)) return
        setProcedure((prev) => {
            if (prev.condition_application_trees.some((tree) => tree.tag === attribute_tag)) return prev
            return { ...prev, condition_application_trees: [...prev.condition_application_trees, makeAttributeNode(attribute_tag)] }
        })
    }

    const mutateTree = (rootIndex, mutator) => {
        setProcedure((prev) => {
            const trees = _.cloneDeep(prev.condition_application_trees)
            mutator(trees[rootIndex])
            return { ...prev, condition_application_trees: trees }
        })
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
            Alternatively define condition applications newly as attribute/trait trees (like when inserting a
            submission) — e.g. attribute <em>Liquid Handler</em> → trait <em>Hamilton</em>, even if that
            combination was never used before.
        </Callout>
        <AttributeInput text="Add attribute (e.g. Liquid Handler)" onItemSelect={handleAddTreeAttribute} />
        {procedure.condition_application_trees.length > 0 ?
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "0.5rem" }}>
                {procedure.condition_application_trees.map((tree, rootIndex) =>
                    <TreeNodeEditor key={`${tree.tag}-${rootIndex}`} node={tree}
                        onChange={(mutator) => mutateTree(rootIndex, mutator)}
                        onRemove={() => setProcedure((prev) => ({
                            ...prev,
                            condition_application_trees: prev.condition_application_trees.filter((_, i) => i !== rootIndex)
                        }))} />)}
            </div> : null}
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

/**
 * Recursive editor for one node of a condition application attribute/trait tree.
 * Attribute nodes offer trait selection (via TraitInput), trait nodes offer an optional
 * value and nested child attributes (via AttributeInput) — mirroring the hierarchical
 * condition application definition of the submission insert.
 */
function TreeNodeEditor({ node, onChange, onRemove, depth = 0 }) {

    const addChildTrait = (attribute_tag, trait_tag) => {
        if (!_.isString(trait_tag)) return
        onChange((treeNode) => {
            if (treeNode.children.some((child) => child.type === "trait" && child.tag === trait_tag)) return
            treeNode.children.push(makeTraitNode(trait_tag))
        })
    }

    const addChildAttribute = (attribute_tag) => {
        if (!_.isString(attribute_tag)) return
        onChange((treeNode) => {
            if (treeNode.children.some((child) => child.type === "attribute" && child.tag === attribute_tag)) return
            treeNode.children.push(makeAttributeNode(attribute_tag))
        })
    }

    const setValue = (value) => {
        onChange((treeNode) => { treeNode.value = value.length === 0 ? null : (_.isNaN(_.toNumber(value)) ? value : _.toNumber(value)) })
    }

    return <div style={{ marginLeft: `${depth * 1.25}rem`, marginTop: "0.25rem", borderLeft: depth > 0 ? "1px solid #eee" : "none", paddingLeft: depth > 0 ? "0.5rem" : 0 }}>
        <div className="flex center-items" style={{ gap: "0.5rem", flexWrap: "wrap" }}>
            <strong>{node.tag}</strong>
            <span className="font-size--small" style={{ color: "#888" }}>{node.type}</span>
            {node.type === "trait" ?
                <input className="text-input" type="text" placeholder="Value (optional)"
                    style={{ width: "10rem" }}
                    value={_.isNull(node.value) || _.isUndefined(node.value) ? "" : String(node.value)}
                    onChange={(e) => setValue(e.target.value)} /> : null}
            <button className="basic-button basic-button--small" onClick={onRemove}>✕</button>
        </div>
        {node.type === "attribute" ?
            <TraitInput attribute_tag={node.tag} text="Add trait"
                onItemSelect={addChildTrait} /> : null}
        {node.type === "trait" ?
            <AttributeInput text="Add child attribute (optional)" onItemSelect={addChildAttribute} /> : null}
        {node.children.map((child, index) =>
            <TreeNodeEditor key={`${child.tag}-${index}`} node={child} depth={depth + 1}
                onChange={(mutator) => onChange((treeNode) => mutator(treeNode.children[index]))}
                onRemove={() => onChange((treeNode) => treeNode.children.splice(index, 1))} />)}
    </div>
}
