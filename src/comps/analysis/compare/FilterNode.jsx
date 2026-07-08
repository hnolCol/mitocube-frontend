import { useState, useEffect } from "react";
import { ConditionApplicationSelection } from "@/comps/core/base/attribute_selection/Pairwise";
import { RemoveButton } from "@/comps/core/base/buttons/RemoveButton";
import { Combobox } from "@/comps/core/input/Combobox";
import { getRandomID } from "@/services/random"
import { Code } from "@blueprintjs/core";
import { SubmissionInput } from "@/comps/core/input/api/SubmissionInput";
const TYPE_OPTIONS = [
    { tag: "and", text: "AND", description : "All children must be true for this node to be true" },
    { tag: "or", text: "OR", description : "At least one child must be true for this node to be true" },
    { tag: "not", text: "NOT", description : "The child must be false for this node to be true" },
];


const makeTrend = (submission_tag) => {
    return {
        id: getRandomID(),
        type: "trend",
        submission_tag: submission_tag,
        direction: "increasing",
        children : []
    }
}

const makePairwise = (submission_tag) => {
    return {
        id: getRandomID(),
        type: "pairwise",
        submission_tag: submission_tag,
        attribute_tag : undefined,
        ca_tag_left: undefined,
        ca_tag_right: undefined,
        children : []
    }
}
const makeGroup = (type, submission_tag) => ({
  id: getRandomID(),
  type,
  children: type === "not" ? [makePairwise(submission_tag)] : [makePairwise(submission_tag), makeTrend(submission_tag)],
});

const LEAF_LABEL = { pairwise: "Pairwise comparison", trend: "Trend across conditions" };


export function PairwiseNode({ node, onChange, onDelete, depth }) {
    console.log(node)
    return <ConditionApplicationSelection submission_tag={node.submission_tag} onConfirm={console.log} showTable={false} minimal />
}

export function FilterNode({ node, onChange, onDelete, depth, init_submission_tag, defaultGroupType = "and" }) {
    console.log(node, init_submission_tag)
    const [submission_tag, setSubmissionTag] = useState(init_submission_tag);
    const isGroup = node.type === "and" || node.type === "or" || node.type === "not";

    useEffect(() => { 
        onChange({ ...node, submission_tag: submission_tag });
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
            <div className="padding--little bg--lightgrey" style={{marginLeft : `${depth * 1.5}rem`, borderRadius : "0.25rem", marginBottom : "0.5rem"}}>
                <div className="flex center-items">
                    <Code>{node.type}</Code>
                    <div><h3>{LEAF_LABEL[node.type]}</h3></div>
                    <RemoveButton onRemove={() => onDelete(node.id)} />
                </div>
                <div>
                    <SubmissionInput selected_submission_tags={[submission_tag]} onSelect={(submission_tag) => {setSubmissionTag(submission_tag)}} minimal={true} />
                </div>
                {node.type === "pairwise" && <div><PairwiseNode node={node} onChange={onChange} onDelete={onDelete} depth={depth} /></div>}
                {node.type === "trend" && <div>Trend Node</div>}
            </div>
        );
    }


    return <div >
        <div className="flex center-items justify-space-between">
            <div className="flex">
                <span>{node.id}</span>
                <div style={{width : "4rem"}}>
                    <Combobox small items={TYPE_OPTIONS} value={node.type} textKey="tag" labelKey={"description"} onChange={item => onChange({ ...node, type: item.tag, children: node.children })} matchTargetWidth={false} />
                </div>  
            </div>
        {onDelete && <RemoveButton onRemove={() => onDelete(node.id)} />}
        </div>

        <div style={{marginLeft : `${depth * 1.5}rem`, marginTop : "0.5rem", border : "1px solid #ccc", borderRadius : "0.25rem", padding : "0.5rem"}}>
            {node.children.map((child, index) => {

                return <FilterNode
                            key={child.id}
                            node={child}
                            onChange={(next) => updateChild(index, next)}
                            onDelete={() => deleteChild(index)}
                            depth={depth + 1}
                            init_submission_tag={submission_tag} />
                
                            })} 
        </div>

        <div className="flex center-items">
            <button className="basic-button--small" onClick={() => addChild(makePairwise)}>+ Pairwise</button>
            <button className="basic-button--small" onClick={() => addChild(makeTrend)}>+ Trend</button>
             <button className="basic-button--small" onClick={() => addChild((type) => makeGroup(defaultGroupType, submission_tag))}>+ Group</button>
        </div>
    </div>
}