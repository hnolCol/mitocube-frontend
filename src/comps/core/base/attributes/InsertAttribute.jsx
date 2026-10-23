import { useState } from "react";
import { MultipleAttributeSelection } from "./MultipleAttributeSelection";
import { addStringToArrayOrRemove } from "@/services/arrays/transforms";

import { AttributesInput } from "../../input/api/DatasetAttributeInput";
import _ from "lodash"
import { Trait } from "../traits/Trait";
import { AttributeGroupSelection } from "@/comps/admin/attributes/Groups";
import { api } from "@/api";
import { StaticStateIndicator } from "../states/SubmssionState";
import { StateSelectionMenu } from "../states/StateSelectionMenu";


import { APIAxiosError } from "../states/APIError";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";
import { Alert, Button, DialogBody } from "@blueprintjs/core";

const TRAIT_COLUMNS = [
    { key: "text", label: "Text" },
    { key: "description", label: "Description" },
    { key: "priority", label: "Priority" },
];
const INITIAL_ATTRIBUTE_STATE = {
    text : "",
    abbreviation: "",
    min_state : 0,
    priority : 500,
    allow_input : false,
    children: [],
    parents : [],
    required_trait_tags: [],
    group_tags: ["dataset", "filter", "sample"],
    traits : []
}


/**
 * @description Reads traits from a tab-separated .txt file with a header row.
 * The user maps the file columns to the trait fields.
 * @param {Object} props
 * @param {Function} props.onFileRead - called with [{ text, description, priority? }]
 * @param {Boolean} [props.includePriority=true] - set false for user requests; priority is then neither mapped nor returned
 */
export function LoadTraitsFromFile({ onFileRead, includePriority = true }) {
    const columns = includePriority ? TRAIT_COLUMNS : TRAIT_COLUMNS.filter(c => c.key !== "priority")
    const [columnIndex, setColumnIndex] = useState({
        text: undefined,
        description: undefined,
        priority: undefined,
    });
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Read first line for headers
            const reader = new FileReader();
            reader.onload = (event) => {
                const firstLine = event.target.result.split(/\r?\n/)[0];
                const cols = firstLine.split(/\t/); // supports tab only
                setHeaders(cols);
            };
            // Read only the first 1KB for header
            const blob = selectedFile.slice(0, 1024);
            reader.readAsText(blob);
        }
    };
    const handleHeaderSelect = (key, idx) => {
        setColumnIndex((prev) => ({
            ...prev,
            [key]: idx,
        }));
    };

    const readFile = async () => {
        if (!file || columnIndex.text === undefined) return

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target.result;
            const lines = content.split(/\r?\n/);
            // Remove header
            lines.shift();

            const traits = lines
                .filter((line) => line.trim() !== "")
                .map((line) => {
                    const cols = line.split(/\t/);
                    const trait = {
                        text: (cols[columnIndex.text] || "").trim(),
                        description: columnIndex.description !== undefined ? (cols[columnIndex.description] || "").trim() : "",
                    }
                    if (includePriority && columnIndex.priority !== undefined) {
                        const priority = parseInt(cols[columnIndex.priority])
                        trait.priority = Number.isFinite(priority) ? priority : 500
                    }
                    return trait
                })
                .filter((t) => t.text.length > 0);
            onFileRead(traits);
            setFile(null);
            setHeaders([]);
        };

        reader.readAsText(file);
    };


    return (
        <div>
            <div style={{ width: "100%", marginBottom: 20, marginTop: 20 }}>
                <label
                    style={{
                        display: "block",
                        width: "100%",
                        padding: "14px 0",
                        background: "#f3f4f6",
                        border: `2px solid ${HIGHLIGHT_COLOR}`,
                        borderRadius: 8,
                        textAlign: "center",
                        color: HIGHLIGHT_COLOR,
                        fontWeight: 500,
                        fontSize: 16,
                        cursor: "pointer",
                        transition: "background 0.2s, border-color 0.2s",
                        marginBottom: 0,
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = "#e0e7ef")}
                    onMouseOut={e => (e.currentTarget.style.background = "#f3f4f6")}
                >
                    {file ? (
                        <>
                            <span style={{ color: "#111827" }}>{file.name}</span>
                            <span style={{ marginLeft: 12, color: "#6b7280", fontSize: 14 }}>
                                (Change file)
                            </span>
                        </>
                    ) : (
                        <>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="28"
                                height="28"
                                fill="none"
                                viewBox="0 0 24 24"
                                style={{ verticalAlign: "middle", marginRight: 8, color: HIGHLIGHT_COLOR }}
                            >
                                <path
                                    fill="currentColor"
                                    d="M12 16a1 1 0 0 1-1-1V7.83l-2.29 2.3a1 1 0 1 1-1.42-1.42l4-4a1 1 0 0 1 1.42 0l4 4a1 1 0 1 1-1.42 1.42L13 7.83V15a1 1 0 0 1-1 1Zm-7 4a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2H5Z"
                                />
                            </svg>
                            Click or drag to select a .txt file for trait upload.
                        </>
                    )}
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </label>
            </div>
            {headers.length > 0 && (
                <div style={{ width: "100%", marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 8 }}>Map Columns:</h4>
                    {columns.map((col) => (
                        <div key={col.key} style={{ marginBottom: 10 }}>
                            <label style={{ marginRight: 8 }}>{col.label}{col.key === "text" ? " (required)" : ""}:</label>
                            <select
                                value={columnIndex[col.key] ?? ""}
                                onChange={(e) => handleHeaderSelect(col.key, Number(e.target.value))}
                                style={{
                                    padding: 8,
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db",
                                    fontSize: 15,
                                    background: "#f9fafb",
                                    minWidth: 120,
                                }}
                            >
                                <option value="" disabled>
                                    Select column
                                </option>
                                {headers.map((header, idx) => (
                                    <option key={idx} value={idx}>
                                        {header}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
            <button
                className="basic-button"
                onClick={readFile}
                disabled={!file || columnIndex.text === undefined}
            >
                Read traits from file
            </button>
        </div>
    )
}


/**
 * @description Editable list of traits (text, description and optionally priority).
 * @param {Object} props
 * @param {Object[]} props.traits
 * @param {Function} props.onChange - called with the new traits array
 * @param {Boolean} [props.showPriority=true]
 */
export function TraitListEditor({ traits, onChange, showPriority = true }) {
    const list = _.isArray(traits) ? traits : []

    const updateTrait = (idx, patch) => onChange(list.map((t, i) => i === idx ? { ...t, ...patch } : t))
    const removeTrait = (idx) => onChange(list.filter((_t, i) => i !== idx))
    const addTrait = () => onChange([...list, { text: "", description: "", ...(showPriority ? { priority: 500 } : {}) }])

    const duplicateTexts = new Set(
        _.chain(list).map(t => (t.text || "").trim().toLowerCase()).filter(Boolean).countBy().pickBy(n => n > 1).keys().value()
    )

    return (
        <div className="flex flex-column" style={{ gap: "0.3rem" }}>
            {list.length > 0 && (
                <div className="flex font-size--smallest" style={{ gap: "0.5rem", color: "#6B7280" }}>
                    <div style={{ flex: 2 }}>Text</div>
                    <div style={{ flex: 4 }}>Description</div>
                    {showPriority && <div style={{ width: 90 }}>Priority</div>}
                    <div style={{ width: 30 }} />
                </div>
            )}
            {list.map((t, idx) => {
                const isDuplicate = duplicateTexts.has((t.text || "").trim().toLowerCase())
                return (
                    <div key={idx} className="flex center-items" style={{ gap: "0.5rem" }}>
                        <input
                            className="text-input"
                            style={{ flex: 2, borderColor: isDuplicate || !(t.text || "").trim() ? "#d32f2f" : undefined }}
                            type="text"
                            placeholder="Trait text"
                            value={t.text || ""}
                            onChange={(e) => updateTrait(idx, { text: e.target.value })}
                        />
                        <input
                            className="text-input"
                            style={{ flex: 4 }}
                            type="text"
                            placeholder="Description"
                            value={t.description || ""}
                            onChange={(e) => updateTrait(idx, { description: e.target.value })}
                        />
                        {showPriority && (
                            <input
                                className="text-input"
                                style={{ width: 90 }}
                                type="number"
                                value={_.toString(t.priority ?? 500)}
                                onChange={(e) => updateTrait(idx, { priority: parseInt(e.target.value) || 500 })}
                            />
                        )}
                        <Button minimal={true} small={true} icon="trash" intent="danger" onClick={() => removeTrait(idx)} />
                    </div>
                )
            })}
            <div className="flex center-items" style={{ gap: "0.5rem" }}>
                <Button small={true} icon="plus" text="Add trait" onClick={addTrait} />
                {list.length > 0 && <Button small={true} minimal={true} icon="cross" text="Remove all" onClick={() => onChange([])} />}
            </div>
            {duplicateTexts.size > 0 && (
                <div className="font-size--smallest" style={{ color: "#862323" }}>Duplicate trait texts: {[...duplicateTexts].join(", ")}</div>
            )}
        </div>
    )
}


/**
 * @param {Object} props
 * @param {Object} [props.initialAttribute] - prefill values (e.g. from a user request)
 * @param {Function} [props.onSubmit] - if given, called with the attribute instead of inserting it directly
 * @param {String} [props.title]
 * @param {String} [props.submitLabel]
 * @param {Boolean} [props.isSubmitting] - pending state when onSubmit is used
 */
export function InsertAttribute({ initialAttribute, onSubmit, title = "Insert Attribute", submitLabel = "Submit", isSubmitting = false }) {

    const [attribute, setAttribute] = useState(
        _.isObject(initialAttribute) ? { ...INITIAL_ATTRIBUTE_STATE, ...initialAttribute } : INITIAL_ATTRIBUTE_STATE
    );
    const [isErrorSuccessAlert, setIsErrorSuccessAlert] = useState(false)
    const { mutate : postAttribute, isSuccess, isPending, isError, error } = api.attributes.modifyAttributes.usePostAttribute()
    const isBusy = _.isFunction(onSubmit) ? isSubmitting : isPending

    const handleTraitSelection = (path) => {
        const trait_tag = _.last(path).tag
        setAttribute(prevValues => { return { ...prevValues, required_trait_tags: addStringToArrayOrRemove({ array: prevValues.required_trait_tags, string: trait_tag }) } })
    }

    const cleanTraits = (traits) => (traits || [])
        .map(t => ({ ...t, text: (t.text || "").trim(), description: (t.description || "").trim() }))
        .filter(t => t.text.length > 0)

    const handleAttributeSubmit = () => {
        const payload = { ...attribute, traits: cleanTraits(attribute.traits) }
        if (_.isFunction(onSubmit)) {
            onSubmit(payload)
            return
        }
        postAttribute(payload, {
            onSuccess: () => {
                setAttribute(INITIAL_ATTRIBUTE_STATE)
                setIsErrorSuccessAlert(true)
            },
            onError: () => {
                setIsErrorSuccessAlert(true)
            }
        })
    }

    const checkValid = () => {
        let valid = true
        let missingFields = [] 
        if (!(_.isString(attribute.text) && attribute.text.length > 0)) {
            valid = false
            missingFields.push("Provide text for the attribute.")
        }
        if (attribute.group_tags.length === 0) {
            valid = false
            missingFields.push("Select at least one attribute group.")
        }
        if (attribute.allow_input && (!_.isString(attribute.abbreviation) || attribute.abbreviation.length === 0)) {
            valid = false
            missingFields.push("Provide an abbreviation for the attribute if allow input is selected")
        }
        if (attribute.children.length > 0 && attribute.allow_input) {
            valid = false
            missingFields.push("Cannot allow input if the attribute has children.")
        }
        const traitTexts = cleanTraits(attribute.traits).map(t => t.text.toLowerCase())
        if (traitTexts.length !== new Set(traitTexts).size) {
            valid = false
            missingFields.push("Trait texts must be unique.")
        }
        return { valid, missingFields }
    }

    const handleFileRead = (fileTraits) => {
        // append to the existing list so curators can combine file and manual edits
        setAttribute(prevValues => {
            const existing = prevValues.traits || []
            const known = new Set(existing.map(t => (t.text || "").trim().toLowerCase()))
            const added = fileTraits.filter(t => !known.has(t.text.toLowerCase()))
            return { ...prevValues, traits: [...existing, ...added] }
        })
    }

    const { valid, missingFields } = checkValid()
    return <div className="flex flex-column div--expand" style={{ gap: "0.5rem" }}>
        <Alert style={{overflowX : "scroll"}} isOpen={isErrorSuccessAlert} onClose={() => { setIsErrorSuccessAlert(false) }} confirmButtonText="Close" intent="danger">
            <DialogBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {isError ? <APIAxiosError error={error} /> : null}
                {isSuccess ? <div style={{color : HIGHLIGHT_COLOR}}><h3>Attribute inserted successfully!</h3></div> : null}
                </div>
            </DialogBody>
        </Alert>
        <Alert isOpen={isPending} onClose={() => {}} confirmButtonText="Close" intent="primary">
            <div>Inserting attribute...</div>
        </Alert>
        <h3>{title}</h3>
        <input className="text-input" type="text" placeholder="Attribute text" value={attribute.text} onChange={(e) => setAttribute(prevValues => { return { ...prevValues, text: e.target.value } })} />
        <input className="text-input" type="number" placeholder="Priority" value={_.toString(attribute.priority)} onChange={(e) => setAttribute(prevValues => { return { ...prevValues, priority: parseInt(e.target.value) } })} />
        
        <h3>Settings</h3>
        <div style={{ marginLeft: "2rem" }}>
            <h4>Minimal Sate</h4>
                        <span>Define the minimum state that is required for the attribute to be shown. For example, attributes that are only relevant for the processing of the sample (protease) or Measuring (instrument). Attributes describing the samples should be defined as submitted</span>
                        <div className="flex center-items" style={{ gap: "0.2rem", marginTop: "0.5rem" }}>
                            <StaticStateIndicator state_tag={attribute.min_state}/>
                            <StateSelectionMenu onSelection={(state) => setAttribute(prevValues => { return { ...prevValues, min_state: state } })} current_state_tag={attribute.min_state} />
            </div>
            <h4>Attribute Groups</h4>
            <span>Select attribute groups. Select sample attribute if the attribute should be available for sample condition definition. </span>
            <div className="margin--little"><AttributeGroupSelection
                allowAdd
                onSelection={group_tag => setAttribute(prevValues => { return { ...prevValues, group_tags: addStringToArrayOrRemove({ array: prevValues.group_tags, string: group_tag }) } })}
                selected_tags={attribute.group_tags} /></div>
        <h4>Value Input</h4>
            <div>    
            <span>Allowing users to enter a value. For example for a concentration, id, duration etc. If set to true a values must always be entered. In addition, a trait must also be defined (examples:  °C, min, h, mM, etc).</span>
        </div>
        <div className="flex flex-column">
        <div style={{ width: "100%", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" id="allow_input" checked={attribute.allow_input} onChange={(e) => setAttribute(prevValues => { return { ...prevValues, allow_input: e.target.checked } })} />
                    <label htmlFor="allow_input" style={{ fontSize: 14, color: "#111827", fontWeight: 600, cursor: "pointer" }}>
                        Allow input
                    </label>
        </div>
        
                {
                    attribute.allow_input && <div>
                    <h4>Abbreviation</h4>
                    <input className="text-input" type="text" placeholder="Abbreviation" value={attribute.abbreviation} disabled={!attribute.allow_input} onChange={(e) => setAttribute(prevValues => { return { ...prevValues, abbreviation: e.target.value } })} />
                    <div className="font-size--smallest">Abbreviation is used in condition application view to display a value. Only relevant if allow_input is <code>true</code></div>
                </div>}
        </div>
            <h4>Hierarchy</h4>
            <div className="flex flex-column" style={{borderLeft : "0.5px solid black", paddingLeft : "1rem", marginLeft : "1rem", gap : "0.5rem"}}>
                
                <div>
                <h4>Attribute parents</h4>
                    <span>Defines parents of the specific attribute. For example, defining a specific heart region then, att_organ:heart should be the parent. This leads to a hierarchical entry of the attributes.
                        Note that required traits must be of the same attribute as its parent.</span>
                
                 <MultipleAttributeSelection selectedItems={attribute.parents}
                    onAttributeSelect={(attribute_tag) => setAttribute(prevValues =>
                    { return { ...prevValues, parents: addStringToArrayOrRemove({ array: prevValues.parents, string: attribute_tag }) } })} />
                </div>
                <div>
                    <h4>Required traits</h4>
                <div>
                    Required traits are used to define the conditions under which this attribute is applicable. For example, if a trait is required, the attribute will only be applicable if the trait is present in the condition.
                </div>
                    <AttributesInput placeHolderText="Select required traits for the attribute" handleTraitSelection={handleTraitSelection} selected_traits={attribute.required_trait_tags} matchTargetWidth={true} attribute_tags={attribute.parents} disabled={attribute.parents.length === 0} />
                
                <div className="flex">{attribute.required_trait_tags.map(trait_tag => <Trait key={trait_tag} trait_tag={trait_tag} />)}</div>
                </div>

                <div>
                <h4>Attribute children</h4>
                <div>Defines children of the specific attribute. For example, if you want to be able to define a duration or a concentration to the attribute, select them here.</div>
            
                <MultipleAttributeSelection selectedItems={attribute.children}
                    onAttributeSelect={(attribute_tag) => setAttribute(prevValues =>
                    { return { ...prevValues, children: addStringToArrayOrRemove({ array: prevValues.children, string: attribute_tag }) } })} />
                </div>
                </div>
        </div>
        
            
        <h3>Traits <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 400 }}>Optional</span></h3>
        <div className="bg--lightgrey padding--little" style={{ marginLeft: "2rem" }}>
            <span>Add traits manually, upload a txt file, or add them later via the admin/attributes tab. </span>
            <span>The txt file must be tab-separated with a header row and contain a text, description and priority column. The default priority is 500. Uploaded traits are appended to the list below and can be edited before submitting.</span>
            <LoadTraitsFromFile onFileRead={handleFileRead} />
            <div className="margin-top--little">
                {_.isArray(attribute.traits) && attribute.traits.length > 0 && <h4>{attribute.traits.length} trait{attribute.traits.length === 1 ? "" : "s"}</h4>}
                <TraitListEditor
                    traits={attribute.traits}
                    onChange={(traits) => setAttribute(prevValues => ({ ...prevValues, traits }))}
                />
            </div>
        </div>
       
        <button className="dialog-button" style={{backgroundColor : valid && !isBusy ? HIGHLIGHT_COLOR :"lightgrey", color : valid && !isBusy ? "white" : "darkgrey"}} onClick={handleAttributeSubmit} disabled={!valid || isBusy}>{isBusy ? "Submitting..." : submitLabel}</button>
        <div className="font-size--smallest flex flex-column" style={{color: "#862323"}}>{missingFields.map(field => <div key={field}>{field}</div>)}</div>

    </div>
}