import { useState } from "react";
import { MultipleAttributeSelection } from "./MultipleAttributeSelection";
import { addStringToArrayOrRemove } from "@/services/arrays/transforms";
import { AttributeInput } from "../../input/api/AttributeInput";
import { TraitInput } from "../../input/api/TraitInput";
import { AttributesInput } from "../../input/api/DatasetAttributeInput";
import _ from "lodash"
import { Trait } from "../traits/Trait";
import { AttributeGroupSelection } from "@/comps/admin/attributes/Groups";
import { api } from "@/api";
import APIError from "../../error/APIerror";


import { APIAxiosError } from "../states/APIError";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";
import { Alert, DialogBody } from "@blueprintjs/core";

const REQUIRED_COLUMNS = [
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


export function LoadTraitsFromFile({onFileRead}) {
        const [columnIndex, setColumnIndex] = useState({
        text : undefined,
        description: undefined,
        priority: undefined,
        });
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [progress, setProgress] = useState(0);

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

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target.result;
            const lines = content.split(/\r?\n/);
            // Remove header
            lines.shift();

            // Load complete file and map to objects based on selected columns
            const file = lines
                .filter((line) => line.trim() !== "")
                .map((line) => {
                    const cols = line.split(/\t/);
                    return {
                        text: cols[columnIndex.text],
                        description: cols[columnIndex.description],
                        priority: cols[columnIndex.priority],
                    };
                });
            onFileRead(file);
            setFile(null);
            setHeaders([]);

        };

        reader.readAsText(file);
       
    };


    return (
        <div>
         <div style={{ width: "100%", marginBottom: 20, marginTop: 20 }}>
                <label
                    // htmlFor="modern-file-upload"
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
                                style={{ verticalAlign: "middle", marginRight: 8, color: HIGHLIGHT_COLOR}}
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
                        id="modern-file-upload"
                        type="file"
                        accept=".txt"
                        onChange={handleFileChange}
                        style={{
                            display: "none",
                        }}
                    />
                </label>
            </div>
        {headers.length > 0 && (
                <div style={{ width: "100%", marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 8 }}>Map Required Columns:</h4>
                    {REQUIRED_COLUMNS.map((col) => (
                        <div key={col.key} style={{ marginBottom: 10 }}>
                            <label style={{ marginRight: 8 }}>{col.label}:</label>
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
    )
            }
            <button className="basic-button" onClick={readFile}>Read traits from file</button>
    </div>
    )
}


export function InsertAttribute({ }) {

    const [attribute, setAttribute] = useState(INITIAL_ATTRIBUTE_STATE);
    const [isErrorSuccessAlert, setIsErrorSuccessAlert] = useState(false)
    const { mutate : postAttribute, isSuccess, isPending, isError, error } = api.attributes.modifyAttributes.usePostAttribute()

    const handleTraitSelection = (path) => {
        const trait_tag = _.last(path).tag
        setAttribute(prevValues => { return { ...prevValues, required_trait_tags: addStringToArrayOrRemove({ array: prevValues.required_trait_tags, string: trait_tag }) } })

    }

    const handleAttributeSubmit = () => {
        postAttribute(attribute, {
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
        
        return { valid, missingFields }
    }

    const handleFileRead = (file) => {
        setAttribute(prevValues => { return { ...prevValues, traits: file } })
        // You can process the file data here, e.g., send it to an API or update state
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
        <h3>Insert Attribute</h3>
        <input className="text-input" type="text" placeholder="Attribute text" value={attribute.text} onChange={(e) => setAttribute(prevValues => { return { ...prevValues, text: e.target.value } })} />
        <input className="text-input" type="number" placeholder="Priority" value={_.toString(attribute.priority)} onChange={(e) => setAttribute(prevValues => { return { ...prevValues, priority: parseInt(e.target.value) } })} />
        
        <h3>Settings</h3>
        <div style={{ marginLeft: "2rem" }}>
            <h4>Attribute Groups</h4>
            <span>Select attribute groups. Select sample attribute if the attribute should be available for sample condition definition. </span>
            <div className="margin--little"><AttributeGroupSelection
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
                <span>Defines parents of the specific attribute. For example, defining a specific heart region then, att_organ:heart should be the parent. This leads to a hierarchical entry of the attributes. Note that required traits must be of the same attribute as its parent.</span>
                
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
        <div className="bg--lightgrey" style={{ marginLeft: "2rem" }}>
            <span>You can either upload a txt file here or add the traits later via the admin/attributes tab. </span>
            <span>The uploaded traits will be available for selection immediately. The txt file must contain a text, description and priority. For example: text : heart, description : Heart tissue., priority : 600. The default priority is 500.</span>
            <LoadTraitsFromFile onFileRead={handleFileRead} />
            {_.isArray(attribute.traits) && attribute.traits.length > 0 && <h3>{attribute.traits.length} traits loaded</h3>}
        </div>
       
        <button className="dialog-button" style={{backgroundColor : valid && !isPending ? HIGHLIGHT_COLOR :"lightgrey", color : valid && !isPending ? "white" : "darkgrey"}} onClick={handleAttributeSubmit} disabled={!valid || isPending}>Submit</button>
        <div className="font-size--smallest flex flex-column" style={{color: "#862323"}}>{missingFields.map(field => <div key={field}>{field}</div>)}</div>

    </div>
}