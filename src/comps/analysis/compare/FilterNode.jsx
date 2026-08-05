import { useState, useEffect } from "react";
import { ConditionApplicationSelection } from "@/comps/core/base/attribute_selection/Pairwise";
import { RemoveButton } from "@/comps/core/base/buttons/RemoveButton";
import { Combobox } from "@/comps/core/input/Combobox";
import { getRandomID } from "@/services/random"
import { Code, Collapse } from "@blueprintjs/core";
import { SubmissionInput } from "@/comps/core/input/api/SubmissionInput";
import _ from "lodash";
import { AttributeSelection } from "@/comps/core/base/attributes/AttributeSelection";
import { api } from "@/api";
import { Checkbox } from "@/comps/core/base/states/Checkbox";
import Trendlist from "./Trendlist";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";
import { AnnotationSelectionMenu } from "@/comps/core/base/annotations/AnnotationSelectionMenu";


const TYPE_OPTIONS = [
    { tag: "and", text: "AND", description : "All children must be true for this node to be true" },
    { tag: "or", text: "OR", description : "At least one child must be true for this node to be true" },
    { tag: "not", text: "NOT", description : "The child must be false for this node to be true" },
];

const GROUP_COLORS = ["#4285f4", "#f28b82", "#fbbc04", "#34a853"];
const PAIRWISE_CRITERIA_OPTIONS = [{ tag: "significant", text: "Significant (FDR < 0.05)" },
                        { tag: "not_significant", text: "Not Significant" },
                        { tag: "significant_increase", text: "Significant & Increased" },
    { tag: "significant_decrease", text: "Significant & Decreased" }]
                        


const ANNOTATION_CRITERIA_OPTIONS = [{ tag: "has_annotation", text: "Has Annotation" }, { tag: "does_not_have_annotation", text: "Does Not Have Annotation" }];

const makeTrend = (submission_tag) => {
    return {
        id: getRandomID(),
        type: "trend",
        submission_tag: submission_tag,
        criteria: "increasing",
        props : {},
        children: [],
        isOpen: true,
        relaxed_trend: false
    }
}

const makePairwise = (submission_tag) => {
    return {
        id: getRandomID(),
        type: "pairwise",
        submission_tag: submission_tag,
        criteria : "significant",
        props: {},
        editing : true,
        children: [],
        isOpen : true
    }
}


const makeAnnotation = (submission_tag) => {
    return {
        id: getRandomID(),
        criteria : "has_annotation",
        type: "annotation",
        submission_tag: submission_tag,
        props: {},
        children: [],
        isOpen: true
    }
}

const makeGroup = (type, submission_tag) => ({
    id: getRandomID(),
    type,
    submission_tag: submission_tag,
    children: type === "not" ? [] : [],
});

const LEAF_LABEL = { pairwise: "Pairwise comparison", trend: "Trend across conditions", annotation: "Annotation Filter"  };


export function TrendNode({ node, onChange, onDelete, depth }) {

    const { data : ca_attribute_tags} = api.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({tag : node.submission_tag}, {staleTime : Infinity, enabled : _.isString(node.submission_tag) && node.submission_tag.length > 0})
    const { data : ca_tags, isSuccess} = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : node.submission_tag, attribute_tags : node.props.attribute_tag, return_unique : true}, {staleTime : Infinity, enabled : _.isString(node.submission_tag) && node.submission_tag.length > 0 && _.isString(node.props.attribute_tag) && node.props.attribute_tag.length > 0})
    
    useEffect(() => {
        if (_.isString(node.props.attribute_tag) && isSuccess){
            onChange({ ...node, props: { ...node.props, ca_tags: ca_tags[node.props.attribute_tag] || {} } });
        }
    }, [ca_tags, isSuccess, node.props.attribute_tag]);
    
    return (
        <div className="flex flex-column" style={{marginLeft : `${depth * 0.5}rem`, borderRadius : "0.25rem", marginBottom : "0.5rem"}}>
            <h3>Trend Node</h3>
            <div className="flex center-items" style={{gap : "0.5rem", marginBottom : "0.5rem"}}>
            
                <AttributeSelection attribute_tags={ca_attribute_tags || []} selected={_.isString(node.props.attribute_tag) ? [node.props.attribute_tag] : []} onSelect={(attribute_tag) => onChange({ ...node, props: { ...node.props, attribute_tag } })} minimal={true} />
     
            <div className="flex center-items" style={{ width : "15rem"}}>
                <div><span>Direction:</span></div>
                    <Combobox
                        minimal
                        fill={false}
                        items={[{ tag: "increasing", text: "Increasing", description: "The trend is increasing" }, { tag: "decreasing", text: "Decreasing", description: "The trend is decreasing" }]}
                        value={node.criteria}
                        textKey="text"
                        labelKey={"description"}
                        onChange={item => onChange({ ...node, criteria: item.tag })}
                        matchTargetWidth={false} />
                </div>
            <Checkbox label="Relaxed trend" checked={node.props.relaxed_trend || false} onChange={() => onChange({ ...node, props: { ...node.props, relaxed_trend: !node.props.relaxed_trend } })} />
            </div>
            <span className="font-size--smallest">Reorder condition applications by drag & drop. Relaxed trend allows for non-strictly increasing or decreasing trends.</span>
            <span className="font-size--smallest" style={{color : HIGHLIGHT_COLOR}}> Results will be displayed a log2 fold change versus the first condition application!</span>
            {ca_tags && node.props.attribute_tag && <Trendlist items={node.props.ca_tags} onChange={(ca_tags) => onChange({ ...node, props: {...node.props, ca_tags} })}/>}
        
        </div>
    )
}   

export function AnnotationNode({ node, onChange, onDelete, depth }) {

    const handleAnnotationSelection = (e, annotation_tag) => {
        onChange({ ...node, props: { ...node.props, annotation_tag } });
    }

    return (<div>
         <span>Select annotation for filtering</span>
        <AnnotationSelectionMenu onSelection={handleAnnotationSelection} selected_tags={node.props.annotation_tag ? [node.props.annotation_tag] : []}
            onRemove={() => handleAnnotationSelection(null, null)} submission_tags={[node.submission_tag]} minimal={true} />
       <span>Select criteria for filtering</span>
        <Combobox
                    fill={false}
                    minimal
                    selectedItems={[node.criteria]}
                    onChange={(item) => onChange({ ...node, criteria: item.tag })}
                    items={ANNOTATION_CRITERIA_OPTIONS}
                    placeholder={node.criteria ? ANNOTATION_CRITERIA_OPTIONS.find(option => option.tag === node.criteria)?.text : "Select criteria"} />
    </div>)
}


export function PairwiseNode({ node, onChange, onDelete, depth }) {

    const handleConfim = (pairwiseProps) => {
        onChange({ ...node, props: pairwiseProps, editing: false });
    }

    const handleReset = () => {
        onChange({ ...node, props: {}, editing: true });
    }

    return (
        <div>
            
            <div className="flex center-items" style={{ gap : "0.5rem"}}><h3>Comparison</h3>{!_.isEmpty(node.props) && <button className="basic-button--no-border" onClick={() => onChange({ ...node, editing: !node.editing })}>{node.editing ? "Cancel" : "Edit"}</button>}</div>
            <ConditionApplicationSelection
                submission_tag={node.submission_tag}
                onConfirm={handleConfim}
                showTable={false} minimal
                showAnnotationSubset={false}
                displayOnly={!node.editing}
                displayProps={node.props} />
            
            {!_.isEmpty(node.props) && <div><h3>Criteria</h3>
                <Combobox
                    fill={false}
                    minimal
                    selectedItems={[node.criteria]}
                    onChange={(item) => onChange({ ...node, criteria: item.tag })}
                    items={PAIRWISE_CRITERIA_OPTIONS}
                    placeholder={node.criteria ? PAIRWISE_CRITERIA_OPTIONS.find(option => option.tag === node.criteria)?.text : "Select criteria"} />
                </div>}
        </div>
    );
}

export function FilterNode({ node, onChange, onDelete, index = 0, depth = 0, init_submission_tag, defaultGroupType = "and" }) {
    const [submission_tag, setSubmissionTag] = useState(init_submission_tag);
    const isGroup = node.type === "and" || node.type === "or" || node.type === "not";

    useEffect(() => { 
        onChange({ ...node, submission_tag: submission_tag, props: {} });
    }, [submission_tag])

    const updateChild = (idx, next) => {
            const children = [...node.children];
            children[idx] = next;
            onChange({ ...node, children });
        };
    const deleteChild = (idx) => {
        const children = node.children.filter((_, i) => i !== idx);
        onChange({ ...node, children });
    };
    
    const addChild = (make) => onChange({ ...node, children: [...node.children, make()] });
    if (!isGroup) {
        return (
            <div className="padding--little bg--lightgrey"
                style={{
                    marginLeft: `${depth * 0.5}rem`,
                    borderRadius: "0.25rem",
                    marginBottom: "0.5rem",
                    border: "1px solid #e0e0e0"
                }}>
                
                <div className="flex flex-column justify-flex-start">
                    {/* <Code>{node.type}</Code> */}
                    <div className="flex center-items justify-space-between" style={{ gap: "0.5rem", marginBottom : "0.5rem"}}>
                        <div><h3>{index + 1}. {LEAF_LABEL[node.type]}</h3></div>
                        <button className="basic-button--no-border"
                            onClick={() => onChange({ ...node, isOpen: !node.isOpen })}>
                            {node.isOpen ? "Collapse" : "Open"}
                        </button>
                        <RemoveButton
                            onRemove={() => onDelete(node.id)} />
                    </div>
                    <Collapse isOpen={node.isOpen}>
                        <div style={{ marginLeft: "1.5rem" }}>
                            <div>
                                <SubmissionInput selected_submission_tags={[submission_tag]} onSelect={(submission_tag) => {setSubmissionTag(submission_tag)}} minimal={true} />
                            </div>
                            {node.type === "pairwise" && <div>
                                <PairwiseNode node={node} onChange={onChange} onDelete={onDelete} depth={depth} /></div>}
                            {node.type === "trend" && <div>
                                <TrendNode node={node} onChange={onChange} onDelete={onDelete} depth={depth} /></div>}
                            {node.type === "annotation" && <div>
                                <AnnotationNode node={node} onChange={onChange} onDelete={onDelete} depth={depth} /></div>}
                        </div>
                    </Collapse>
                    </div>
            </div>
        );
    }


    return <div style={{marginLeft : `${depth * 0.2}rem`, marginBottom : "0.5rem", borderRadius : "0.25rem", padding : "0.5rem", backgroundColor: "#f9f9f9", border : `3px solid ${GROUP_COLORS[depth % GROUP_COLORS.length]}`}}>
        <div className="flex" style={{ gap: "0.5rem" }}>
            <h3>{index + 1}. Group Node</h3>
        </div>
        <div className="flex center-items justify-space-between" style={{ marginLeft: "0.3rem", marginBottom: "0.5rem" }}>
            
            <div className="flex center-items" style={{ gap: "0.5rem" }}>
                <span>Group Node Operator |</span>
                <div style={{width : "4rem"}}>
                    <Combobox
                        minimal={true}
                        items={TYPE_OPTIONS}
                        value={node.type}
                        textKey="tag"
                        labelKey={"description"}
                        onChange={item => onChange({ ...node, type: item.tag, children: node.children })}
                        matchTargetWidth={false} />
                </div>  
                    <span>Group Node ID: {node.id}</span>
            </div>
         
        {onDelete && <RemoveButton onRemove={() => onDelete(node.id)} />}
        </div>

        <div style={{marginLeft : `${depth * 1.5}rem`, marginTop : "0.5rem", borderRadius : "0.25rem", padding : "0.5rem"}}>
            {node.children.map((child, index) => {

                return <div key={child.id} style={{borderBottom : "2px solid #e0e0e0", marginBottom : "0.5rem", paddingBottom : "0.5rem"}}>
                    <FilterNode
                            key={child.id}
                            node={child}
                            index={index}
                            onChange={(next) => updateChild(index, next)}
                            onDelete={() => deleteChild(index)}
                            depth={depth + 1}
                            init_submission_tag={submission_tag} /> </div>
                
                            })} 
        </div>

        <div className="flex center-items">
            <button className="basic-button--small" onClick={() => addChild(makePairwise)}>+ Pairwise</button>
            <button className="basic-button--small" onClick={() => addChild(makeTrend)}>+ Trend</button>
            <button className="basic-button--small" onClick={() => addChild(makeAnnotation)}>+ Annotation</button>
             <button className="basic-button--small" onClick={() => addChild((e) => makeGroup(defaultGroupType, submission_tag))}>+ Group</button>
        </div>
    </div>
}