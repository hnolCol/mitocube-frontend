import { Button, Dialog, DialogBody, DialogFooter, Divider, Spinner, TextArea } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import PropTypes from "prop-types"
import APIError from "../../../core/error/APIerror";
import { mapAttributeTagsToAttributes } from "../../../../services/attributes";
import MetaText from "../../new/MetaText";
import { AxiosError } from "axios";
import { AddProteinTable } from "../../upload/ProteinTable";
import _ from "lodash"
import AttributeInput from "../../new/attribute/select/MultiSelectAttribute";
import DatasetAttributeHierarchy from "../../new/attribute/view/DatasetAttributesHierarchy";
import { AttributesInput } from "../../../core/input/api/DatasetAttributeInput";
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent, addStringToArrayOrRemove, isItemInArrayByTag, isItemInArrayDeepComp } from "../../../../services/arrays/transforms";
import { useGetDatasetAttributes, useGetMandatoryAttributes } from "../../../../hooks/queries/attribute.hooks";
import { Loading } from "../../../core/base/states/Loading";
import { TitleText } from "../../../core/metrics/ItemBasics";
import { usePatchSubmissionDatasetAttributes } from "../../../../hooks/queries/submission.hooks";
import { AttributeTraitSelection } from "../../../core/base/attributes/AttributeTraitSelection";
import { useGetMetadata } from "../../../../hooks/queries/datasets.hooks";

AttributeSelectionDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    submisison_tag: PropTypes.string.isRequired,
    newSubmissionState : PropTypes.number
}

/**
 * @description A controlled attribute selection dialog (@blueprintjs) that is used to enter dataset attributes upon a state change.
 * @param {Object} props 
 * @param {String} props.submission_tag 
 * @param {Number} props.newSubmissionState 
 * @param {Boolean} props.isOpen 
 * @returns {React.ReactElement} 
 */
export function AttributeSelectionDialog({
    submission_tag,
    newSubmissionState,
    setAttributeSelectionDialog,
    isOpen,
}) {
 

    const { data: submission, isSuccess : isSubmissionSuccess } = useGetMetadata({tag : submission_tag})
    const [selectedAttributes, setSelectedAttributes] = useState({ attributes: [], attributeValues: {}, userUnitInput: {}, traits : {} })
    const [submissionText, setSubmissionText] = useState({ comment: "", metatext: {} })
    // path function for the submission (e.g. updating the submission)
    const {mutate: patchSubmission, isLoading: patchSubmissionIsLoading, isSuccess, isError, error, reset} = usePatchSubmissionDatasetAttributes()

    //get mandatory attributes that have to be entered for the new submission state. 
    const { data: mandatoryAttributesForState,
        isLoading: manAttrIsLoading,
        isFetching: manAttrIsFetching,
        isSuccess : manAttrIsSuccess} = useGetMandatoryAttributes({ state: newSubmissionState },
                                                                    { enabled: _.isNumber(newSubmissionState) })

    const onUserUnitInput = (userUnitInput) => {
        
        setSelectedAttributes(prevValues => { return { ...prevValues, "userUnitInput": { ...prevValues["userUnitInput"], ...userUnitInput } } })
    }
    
    const handleSubmit = () => {
        const updatedDatasetAttributes = {
            dataset_attributes: selectedAttributes.traits,
            state_change: {
                state : newSubmissionState,
                prev_state: submission.state,
                comment : submissionText.comment
            }
        }
        patchSubmission({tag : submission_tag, updatedDatasetAttributes : updatedDatasetAttributes})
    }
    
    /**
     * @description Handles the selection and the removable of trait.
     * @param {import("../../../../types/attributes").Trait} trait 
     */
    const handleAttributeSelection = (trait) => {

        const attribute_tag = trait.attribute_tag 
        let selected_traits = selectedAttributes.traits

        if (!_.has(selected_traits, attribute_tag)) {
            selected_traits[attribute_tag] = [trait.tag]
        }
        else {
            selected_traits[attribute_tag] = addStringToArrayOrRemove({ array: selected_traits[attribute_tag], string: trait.tag })
        }
        
        setSelectedAttributes(prevValues => {return {...prevValues, traits : selected_traits}})

    }

    const handleDatasetAttributeSelection = (attribute, trait) => {

        handleAttributeSelection(trait)
    }


    
    const resetDialog = () => {
        reset()
        setSubmissionText({comment : "", metatext : {}})
    }

    const onClose = () => {
        resetDialog()
        setAttributeSelectionDialog(prevValues => {
            return {
                ...prevValues,
                isOpen: false,
            }
        })
    }

    return <Dialog isOpen={isOpen} title="State Change" style={{ width: "min(70vw, 900px)" }} onClose={onClose}>
        <DialogBody>
            <div className="flex flex-column padding--medium">
                
        <div style={{maxHeight : "40vh", overflowY:"scroll", marginBottom : "1rem"}}>
            <div>
                        {isSuccess ? null : patchSubmissionIsLoading  ? <Spinner /> : <div>
                        <h3>Attribute Selection</h3>
                            <p>Please select the required dataset attributes. There are {_.isArray(mandatoryAttributesForState)?mandatoryAttributesForState.length:null} mandatory required attributes.</p>
                        
                            {isSubmissionSuccess ? <AttributesInput
                                selectedAttributes={selectedAttributes.traits}
                                handleAttributeSelection={handleDatasetAttributeSelection}
                                min_state={submission.state} /> : null}
                    
                        <DatasetAttributeHierarchy
                                selectedAttributes={selectedAttributes.attributes}
                                selectedDatasetAttributeValues={selectedAttributes.attributeValues}
                                onDatasetAttributeRemove={handleDatasetAttributeSelection}
                                {...{onUserUnitInput, unitInput: selectedAttributes.userUnitInput }} />


                            <div style={{}}>
                                
                                <TitleText title={"Missing attributes"} />
                                {manAttrIsFetching || manAttrIsFetching ? <Loading /> : manAttrIsSuccess ? 
                                    mandatoryAttributesForState
                                        .filter(a => !isItemInArrayByTag({ array: selectedAttributes.attributes, item: a }))
                                        .map(a =>
                                            <AttributeTraitSelection
                                                attribute_tag={a.tag}
                                                onChange={handleAttributeSelection}
                                                selected_traits={_.has(selectedAttributes.traits, a.tag) ?
                                                    selectedAttributes.traits[a.tag] : []} />)
                                : null}
                                
                        </div>
            
                        </div>}
                <div>
                    {isSuccess ? <p>Success. Dataset attributes updated.</p> :  isError ? <APIError error={error} /> : null}
                </div>
            </div>
                </div>
                
                {newSubmissionState === 5 ? <div>
                    <h3>Upload protein data file</h3>
                    <p>Please select the protein file (wide format, proteins in rows, samples in columns)</p>
                    <AddProteinTable />
                    <Divider />
                </div> : null}

            {patchSubmissionIsLoading ? null : _.keys(submissionText.metatext).length > 0 ? <div>
                <h3>Meta text</h3>
                <div>
                    <MetaText
                        metatextValues={submissionText.metatext}
                        onMetaTextChange={(metatextTag, value) => setSubmissionText(prevValues => { return { ...prevValues, metatext: { ...prevValues.metatext, [metatextTag]: value } } })}
                        index=""
                        allowTextForState={newSubmissionState} />
                    </div>
            
                <h3>Timeline Comment</h3>
                <div>
                    <TextArea
                        fill={true}
                        value={submissionText.comment}
                        placeholder="Enter a comment here which will be visible in the timeline."
                        onChange={(e) => setSubmissionText(prevValues => { return { ...prevValues, comment: e.target.value } })} />
                </div>
        </div> : null}
            </div>
        </DialogBody>
        <DialogFooter actions={[<div className="flex">
            <Button text="Submit" disabled={isSuccess} onClick={() => handleSubmit()} />
            <Button text={isSuccess?"Done":"Cancel"} intent={isSuccess?"primary":"danger"} onClick={onClose} /></div>]} />
</Dialog>
}