// import hooks from "@mitocube/api-hooks";
// import _ from "lodash";
// import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";

// export function SubmissionConditionApplicationView({ submission_tag }) {

//    const {data : submission_ca_tags} = hooks.submissions.condition_applications.useGetSubmissionConditionApplication({tag : submission_tag}, {enabled : _.isString(submission_tag)})

//     const { data: submission_ca_data } = hooks.submissions.condition_applications.useGetSubmissionConditionApplicationData(
//         { tag: submission_tag },
//         { enabled: _.isString(submission_tag) }
//     )
    
//     console.log("EXISTING CA DATA:", JSON.stringify(submission_ca_data, null, 2))

//     return (
//         <div>
            
//             <div className="flex flex-column">
//                 <h3>Condition Applications</h3>
//             {_.isArray(submission_ca_tags) && submission_ca_tags.length > 0 ?
//                 submission_ca_tags.map(ca_tag => {
//                     return <div key ={ca_tag} className="padding--tiny margin--tiny">
//                         <div><ConditionApplicationsView key={ca_tag} tag={ca_tag} /></div></div>
//                 }) : <div>No condition applications found for this submission.</div>}
//              </div>
//         </div>
//     )
// }

import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { useState } from "react";
import { Dialog } from "@blueprintjs/core";
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";
import { AttributesInput } from "../../core/input/api/DatasetAttributeInput";
import { DatasetAttributeView } from "../../core/base/attributes/DatasetAttributeView";
import { findAndInsertTree, findChildrenByPath, deleteByPath, checkPathExists, addIDToPath } from "../../submission/new/sample_attributes/select/SamplesAttributeWrapper";
import { useQueryClient } from "react-query";

export function SubmissionConditionApplicationView({ submission_tag }) {
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected_traits, setSelectedTraits] = useState([])

    const { data: submission_ca_tags } = hooks.submissions.condition_applications.useGetSubmissionConditionApplication(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    )

    const { data: submission_ca_data } = hooks.submissions.condition_applications.useGetSubmissionConditionApplicationData(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    )

    console.log(submission_ca_data)

    const { mutate: updateCA, isLoading } = hooks.submissions.condition_applications.useUpdateSubmissionCA({
        onSuccess: () => {
            queryClient.invalidateQueries(["getSubmissionConditionApplication", submission_tag])
            queryClient.invalidateQueries(["getSubmissionConditionApplicationData", submission_tag])
            setDialogOpen(false)
            setSelectedTraits([])
        }
    })

    const handleOpen = () => {
        if (_.isArray(submission_ca_data)) {
            // replace backend random ids with submission_tag so deleteByPath can match them
            const normalized = submission_ca_data.map(item => ({
                ...item,
                id: submission_tag,
                children: item.children.map(child => ({
                    ...child,
                    id: submission_tag
                }))
            }))
            setSelectedTraits(normalized)
        } else {
            setSelectedTraits([])
        }
        setDialogOpen(true)
    }

    const handleClose = () => {
        setDialogOpen(false)
        setSelectedTraits([])
    }

    const getSelectionByPath = (path) => {
        return findChildrenByPath(selected_traits, path)
    }

    const handleTraitSelection = (path) => {
        // path = path.map(p => ({ value: null, ...p }))
        path = addIDToPath(path, submission_tag)
        let traits = selected_traits.slice()
        const pathExists = checkPathExists(traits, path, false)
        const isValueInput = _.last(path).type === "trait" && _.has(_.last(path), "value") && _.isString(_.last(path).value)
    
        if (pathExists && !isValueInput) {
            deleteByPath(traits, path, true)
        } else {
            findAndInsertTree(traits, path, 3, true)
        }
        setSelectedTraits([...traits])
    }
    const cleanForBackend = (traits) => {
        return traits.map(item => ({
            type: item.type,
            tag: item.tag,
            value: item.value ?? undefined,
            children: _.isArray(item.children) ? cleanForBackend(item.children) : []
        }))
    }
const handleSubmit = () => {
    const cleaned = cleanForBackend(selected_traits)
    updateCA({ tag: submission_tag, selected_traits: cleaned })
}

    return (
        <div>
            <div className="flex flex-column">
                <div className="flex center-items justify-space-between">
                    <h3>Condition Applications</h3>
                    <button className="dialog-button" onClick={handleOpen}>+</button>
                </div>

                {_.isArray(submission_ca_tags) && submission_ca_tags.length > 0 ?
                    submission_ca_tags.map(ca_tag => (
                        <div key={ca_tag} className="padding--tiny margin--tiny">
                            <ConditionApplicationsView tag={ca_tag} show_attribute={true} />
                        </div>
                    )) : <div>No condition applications found for this submission.</div>}
            </div>

            <Dialog
                isOpen={dialogOpen}
                onClose={handleClose}
                title="Edit Condition Applications"
                style={{ minWidth: "600px" }}
            >
                <div className="padding--medium flex flex-column" style={{ gap: "1rem" }}>
                    <AttributesInput
                        handleTraitSelection={handleTraitSelection}
                        min_state={0}
                        selected_traits={selected_traits}
                    />
                    <DatasetAttributeView
                        submission_tag={submission_tag}
                        attributeTraits={selected_traits}
                        getSelectionByPath={getSelectionByPath}
                        onChildrenSelection={handleTraitSelection}
                        handleTraitRemove={handleTraitSelection}
                    />
                    <div className="flex justify-end" style={{ gap: "0.5rem" }}>
                        <button 
                            className="dialog-button" 
                            style={{ backgroundColor: "#ec7160ff" }} 
                            onClick={handleClose}>
                            Close
                        </button>
                        <button 
                            className="dialog-button" 
                            disabled={isLoading} 
                            onClick={handleSubmit}>
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}