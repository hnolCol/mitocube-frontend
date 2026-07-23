import { useState, useEffect } from "react";
import { MultipleAttributeSelection } from "./MultipleAttributeSelection";
import { addStringToArrayOrRemove } from "@/services/arrays/transforms";
import { AttributesInput } from "../../input/api/DatasetAttributeInput";
import _ from "lodash"
import { Trait } from "../traits/Trait";
import { AttributeGroupSelection } from "@/comps/admin/attributes/Groups";
import { api } from "@/api";


import { APIAxiosError } from "../states/APIError";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";
import { Alert, DialogBody } from "@blueprintjs/core";
import { StateSelection } from "@/comps/submission/filter/StateSelection";
import { StateMenuItem, StateSelectionMenu } from "../states/StateSelectionMenu";
import { StaticStateIndicator } from "../states/SubmssionState";

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


export function EditAttribute({attribute_tag}) {

    const [attribute, setAttribute] = useState(INITIAL_ATTRIBUTE_STATE);
    const [isErrorSuccessAlert, setIsErrorSuccessAlert] = useState(false)
    const {data : attributeProps, isSuccess : isAttributePropsSuccess} = api.attributes.queryAttributes.useGetAttribute({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && attribute_tag.length > 0, staleTime : Infinity})
    const { data: children_tags, isSuccess: isChildrenSuccess } = api.attributes.queryAttributes.useGetAttributeChildren({tag : attribute_tag},{ enabled : _.isString(attribute_tag) && attribute_tag.length > 0, staleTime : Infinity})
    const { data: parent_tags, isSuccess: isParentsSuccess } = api.attributes.queryAttributes.useGetAttributeParents({tag : attribute_tag},{ enabled : _.isString(attribute_tag) && attribute_tag.length > 0, staleTime : Infinity})
    const {data : group_tags, isSuccess : isGroupTagsSuccess} = api.attributes.queryAttributes.useGetAttributeGroupsByAttribute({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && attribute_tag.length > 0, staleTime : Infinity})
    const {data : min_state, isSuccess : isMinStateSuccess} = api.attributes.queryAttributes.useGetAttributeMinState({tag : attribute_tag}, {enabled : _.isString(attribute_tag) && attribute_tag.length > 0, staleTime : Infinity})

    
    useEffect(() => {
        //loading children and parents. 
        if (isChildrenSuccess && isParentsSuccess && isGroupTagsSuccess && isAttributePropsSuccess) {
            setAttribute(prevValues => { return { ...prevValues, children: children_tags, parents: parent_tags, group_tags, min_state, ...attributeProps } })
        }
    }, [isChildrenSuccess, isParentsSuccess, isGroupTagsSuccess, isAttributePropsSuccess, isMinStateSuccess, children_tags, parent_tags, group_tags, min_state, attributeProps])

    const { mutate : patchAttribute, isSuccess, isPending, isError, error } = api.attributes.modifyAttributes.usePostAttribute()

    const handleTraitSelection = (path) => {
        const trait_tag = _.last(path).tag
        setAttribute(prevValues => { return { ...prevValues, required_trait_tags: addStringToArrayOrRemove({ array: prevValues.required_trait_tags, string: trait_tag }) } })

    }

    console.log(attribute, parent_tags, children_tags, group_tags, attributeProps)

    const handleAttributeSubmit = () => {
        patchAttribute({tag : attribute_tag, ...attribute}, {
            onSuccess: () => {
                // setAttribute(INITIAL_ATTRIBUTE_STATE)
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


    const { valid, missingFields } = checkValid()
    return <div className="flex flex-column div--expand" style={{ gap: "0.5rem" }}>
        <Alert style={{overflowX : "scroll"}} isOpen={isErrorSuccessAlert} onClose={() => { setIsErrorSuccessAlert(false) }} confirmButtonText="Close" intent="danger">
            <DialogBody>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {isError ? <APIAxiosError error={error} /> : null}
                {isSuccess ? <div style={{color : HIGHLIGHT_COLOR}}><h3>Attribute update successful!</h3></div> : null}
                </div>
            </DialogBody>
        </Alert>
        <Alert isOpen={isPending} onClose={() => {}} confirmButtonText="Close" intent="primary">
            <div>Inserting attribute...</div>
        </Alert>
        <h3>Edit Attribute</h3>

        <input className="text-input" type="text" placeholder="Attribute text" value={attribute.text} onChange={(e) => setAttribute(prevValues => { return { ...prevValues, text: e.target.value } })} />
        <input className="text-input" type="number" placeholder="Priority" value={_.toString(attribute.priority)} onChange={(e) => setAttribute(prevValues => { return { ...prevValues, priority: parseInt(e.target.value) } })} />
        
        <h3>Settings</h3>
        <div style={{ marginLeft: "2rem" }}>

            <h4>Minimal State</h4>
            <span>Define the minimum state that is required for the attribute to be shown. For example, attributes that are only relevant for the processing of the sample (protease) or Measuring (instrument). Attributes describing the samples should be defined as submitted</span>
            <div className="flex center-items" style={{ gap: "0.2rem", marginTop: "0.5rem" }}>
                <StaticStateIndicator state_tag={attribute.min_state}/>
                <StateSelectionMenu onSelection={(state) => setAttribute(prevValues => { return { ...prevValues, min_state: state } })} current_state_tag={attribute.min_state} />
            </div>
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
        

       
        <button className="dialog-button" style={{backgroundColor : valid && !isPending ? HIGHLIGHT_COLOR :"lightgrey", color : valid && !isPending ? "white" : "darkgrey"}} onClick={handleAttributeSubmit} disabled={!valid || isPending}>Update</button>
        <div className="font-size--smallest flex flex-column" style={{color: "#862323"}}>{missingFields.map(field => <div key={field}>{field}</div>)}</div>

    </div>
}