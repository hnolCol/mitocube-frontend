

import _ from "lodash";
import { useState } from "react";
import { Dialog } from "@blueprintjs/core";
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";
import { AttributesInput } from "../../core/input/api/DatasetAttributeInput";
import { DatasetAttributeView } from "../../core/base/attributes/DatasetAttributeView";
import { findAndInsertTree, findChildrenByPath, deleteByPath, checkPathExists, addIDToPath, findNode } from "../../submission/new/sample_attributes/select/SamplesAttributeWrapper";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { MandatoryCheckDetail } from "@/comps/submission/MandatoryAttributes";
import { MandatoryCheckBadge } from "@/comps/submission/MandatoryAttributes";
import { StateHeader } from "@/comps/submission/view/StateHeader";


export function SubmissionConditionApplicationView({ submission_tag, group_by_min_state = true }) {
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected_traits, setSelectedTraits] = useState([])

    const { data: submission_ca_tags } = api.submissions.condition_applications.useGetSubmissionConditionApplication(
        { tag: submission_tag, group_by_min_state },
        { enabled: _.isString(submission_tag) }
    )
    const { data: submission_ca_data } = api.submissions.condition_applications.useGetSubmissionConditionApplicationData(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    )


    const { mutate: updateCA, isLoading } = api.submissions.condition_applications.useUpdateSubmissionCA({
        onSuccess: () => {
            queryClient.invalidateQueries(["getSubmissionConditionApplication", submission_tag])
            queryClient.invalidateQueries(["getSubmissionConditionApplicationData", submission_tag])
            setDialogOpen(false)
            setSelectedTraits([])
        }
    })

    const { data: submissionState } = api.submissions.states.useGetSubmissionState(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    )

    const { data: permissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    )
    
    const canEdit = permissions?.edit === true

    

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

    
    const checkAttributeRequiredTraits = (attribute_tag, trait_tags, referenceID) => {
                const foundNode = trait_tags.map(trait_tag => findNode(selected_traits, "trait", trait_tag, referenceID))
                return _.some(foundNode)
            }



    return (
        <div>
            <div className="flex flex-column" style={{overflow: "hidden", width : "100%"}}>
                <div className="flex center-items justify-space-between" >
                    <h3>Condition Applications</h3>
                    <MandatoryCheckBadge submission_tag={submission_tag} />
                    {canEdit && (
                    <button className="dialog-button" onClick={handleOpen}>+</button>
                    )}
                </div>
                <div style={{ height: "33vh", padding: "1rem", overflowY: "scroll" }}>
                    {group_by_min_state ?
                        <div>
                            {_.sortBy(submission_ca_tags, 'state_tag').map(state_ca_item => <div>
                                <StateHeader tag={state_ca_item.state_tag} />
                                {state_ca_item.condition_application_tags?.length > 0 ? state_ca_item.condition_application_tags.map(ca_tag => (
                                    <div key={ca_tag} className="padding--tiny margin--tiny">
                                        <ConditionApplicationsView tag={ca_tag} show_attribute={true} />
                                    </div>
                                )) : <div>No condition applications found for this submission.</div>}
                            </div>)}
                        </div>
                        : null}
                {_.isArray(submission_ca_tags) && submission_ca_tags.length > 0 ?
                    submission_ca_tags.map(ca_tag => (
                        <div key={ca_tag} className="padding--tiny margin--tiny">
                            <ConditionApplicationsView tag={ca_tag} show_attribute={true} />
                        </div>
                    )) : <div>No condition applications found for this submission.</div>}
                </div>
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
                    min_state={submissionState ?? 0}
                    selected_traits={selected_traits}
                    submission_tag={submission_tag}
                />
                <MandatoryCheckDetail submission_tag={submission_tag} />
                    <DatasetAttributeView
                        submission_tag={submission_tag}
                        attributeTraits={selected_traits}
                        getSelectionByPath={getSelectionByPath}
                        onChildrenSelection={handleTraitSelection}
                        handleTraitRemove={handleTraitSelection}
                        checkAttributeRequiredTraits={checkAttributeRequiredTraits}
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