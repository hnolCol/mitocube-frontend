import { Alert, Button, Callout, Dialog, DialogBody, DialogFooter, Popover } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useGetSubmissionDatasetAttributesByTag, usePatchSubmissionDatasetAttributes } from "../../../../hooks/queries/submission.hooks";
import _ from "lodash"
import APIError from "../../../core/error/APIerror";
import Loading from "../../../core/base/loading";
import {addStringToArrayOrRemove } from "../../../../services/arrays/transforms";

import { AttributesInput } from "../../../core/input/api/DatasetAttributeInput";
import { useGetAttributes } from "../../../../hooks/queries/attribute.hooks";
import { AttributeTraitSelection } from "../../../core/base/attributes/AttributeTraitSelection";
import { DatasetAttributeView } from "../../../core/base/attributes/DatasetAttributeView";


const initDatasetAttributeState = { traits: {},  highlight : [], userUnitInput : {}}
/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/submissions").Submission} props.submission
 * @returns 
 */
export function EditDatasetAttributeDialog({ isOpen, submission, onClose }) {


    const [datasetAttributes, setDatasetAttributes] = useState(initDatasetAttributeState )
    const [alertProps, setAlertProps] = useState({isOpen : false, children : <div></div>})
    
    const {mutate: patchSubmission, isLoading: patchSubmissionIsLoading, isSuccess, isError, error, reset} = usePatchSubmissionDatasetAttributes()
    
    const { data: mandatoryDatasetAttributes } = useGetAttributes({ param_name: "mandatory_for_active" })
    const { data: initialDatasetAttributes,
        isLoading: initDataAttrLoading,
        isFetching: initDataAttrFetching,
        isSuccess: initDataAttrIsSuccess,
        isRefetching : initDataAttrRefetching,
        isError : initDataAttrIsError, refetch } = useGetSubmissionDatasetAttributesByTag({ tag: submission.tag })
    
    
    useEffect(() => {
        if (!_.isObject(initialDatasetAttributes)) return
        if (initDataAttrLoading) return

        if (submission.tag == initialDatasetAttributes.tag) {

            setDatasetAttributes(prevValues => {
                return {
                    ...prevValues,
                    traits: initialDatasetAttributes.tags,
                    highlight: [],
                    attributes: _.keys(initialDatasetAttributes.tags)
                }
            })

        }
    }, [submission.tag, _.isObject(initialDatasetAttributes), initDataAttrLoading, initDataAttrIsSuccess, initDataAttrRefetching])
    

    if (initDataAttrLoading || initDataAttrFetching) return <Loading />
    const missingMandatoryAttributes = []
    //find attributes that are missing  but are required to be active to show to the user.
    // const missingMandatoryAttributes = [] 
    //     _.isArray(mandatoryDatasetAttributes) ? mandatoryDatasetAttributes
    //         .map(item => item["attribute"])
    //         .filter(attribute => !_.has(datasetAttributes.traits, attribute.tag))
    //         : []


    const handleAttributeSelection = (trait) => {

        const attribute_tag = trait.attribute_tag 
        let selected_traits = datasetAttributes.traits
        
        if (!_.has(selected_traits, attribute_tag)) {
            selected_traits[attribute_tag] = [trait.tag]
        }
        else {
            selected_traits[attribute_tag] = addStringToArrayOrRemove({ array: selected_traits[attribute_tag], string: trait.tag })
            if (selected_traits[attribute_tag].length === 0) {
                delete selected_traits[attribute_tag]
            }
        }
        
        setDatasetAttributes(prevValues => {return {...prevValues, traits : selected_traits}})

    }

    const handleDatasetAttributeSelection = (attribute, attributeValue) => {

        handleAttributeSelection(attributeValue)
    }


    const onUserUnitInput = (userUnitInput) => {
        
        setDatasetAttributes(prevValues => { return { ...prevValues, "userUnitInput": {...prevValues["userUnitInput"], ...userUnitInput} }})

    }

    const resetAlert = () => {
        // close the alert 
        setAlertProps(prevValues => { return { ...prevValues, isOpen: false, isLoading : false, success : false, submitted : false } })
    }

    const handleSubmit = () => {
        //handle sample attribute submit 
        const updatedDatasetAttributes = {
            dataset_attributes: datasetAttributes.traits,
            state_change: {
                state : submission.state,
                prev_state: submission.state,
                comment : ""
            },
            dataset_attribute_input : datasetAttributes.userUnitInput
        }

        patchSubmission({tag : submission.tag, updatedDatasetAttributes, })
    }

    const handleClose = (e) => {
        reset()
        onClose()
    }

    const handleTraitRemove = (trait) => {
        handleAttributeSelection(trait)
    }

    const handleReset = (e) => {
        reset()
        setDatasetAttributes(initDatasetAttributeState)
        refetch()
        
    }

    const attributeHasDefinedTraits = (attribute_tag) => {

        return _.isObject(datasetAttributes.traits)
                && _.has(datasetAttributes.traits, attribute_tag)
                && _.isArray(datasetAttributes.traits[attribute_tag])
                && datasetAttributes.traits[attribute_tag].length > 0 
    }

    return (
        <Dialog style={{ minWidth: "min(80vw,900px)", height: "80vh" }} {...{ isOpen }} title="Edit Dataset Attributes" onClose={handleClose}>
            
            <Alert style={{ minWidth: "700px" }}
                canEscapeKeyCancel={true}
                canOutsideClickCancel={true}
                onConfirm={resetAlert}
                onClose={resetAlert} {...alertProps} />
            
            {initDataAttrLoading || initDataAttrFetching ? <Loading /> :
            <div className="no-scroll padding--medium">
                <div className="flex flex-column padding--medium justify-flex-start no-scroll" style={{height : "80vh"}}>
                <div className="flex flex-column justify-space-between" style={{ height: "13vh", marginBottom : "1rem"}}>
                    <p>Alter the dataset attributes and submit changes for project <strong>{submission.title}</strong> ({submission.tag})</p>
                    <div class="margin--little">
                        <Callout intent={missingMandatoryAttributes.length > 0 ? "warning" : "primary"}>
                                    <div >{missingMandatoryAttributes.length > 0 ?<div className="flex">
                                        <Popover interactionKind="click-target"  content={missingMandatoryAttributes.map(attribute =>
                                            <AttributeTraitSelection
                                                key = {attribute.tag}
                                                attribute_tag={attribute.tag}
                                                onChange={handleAttributeSelection}
                                                selected_traits={attributeHasDefinedTraits(attribute.tag) ? datasetAttributes.traits[attribute.tag] : []} />)}>
                                            <Button minimal small text={missingMandatoryAttributes.length} />
                                        </Popover>
                                        <div>attributes not defined that are required for an active dataset. </div> </div>:
                                <div>All attributes defined to publish the dataset.</div>} </div>
                        </Callout>
                    </div>
                <AttributesInput
                    selectedAttributes={datasetAttributes.traits}
                    handleAttributeSelection={handleDatasetAttributeSelection}
                    min_state={submission.state} />
                </div>
                <div>
                    <DatasetAttributeView
                            submission_tag={submission.tag}
                            attributeTraits={datasetAttributes.traits}
                            userUnitInput={datasetAttributes.userUnitInput}
                            onUserUnitInput={onUserUnitInput}
                            handleTraitRemove={handleTraitRemove } />
    
                </div>
                </div>
                </div>}
            
            <DialogBody>
                {isSuccess ? <p>Success. Dataset attribute were updated successfully.</p>
                    : isError ? <APIError error={error} /> : patchSubmissionIsLoading ? 
                    <p>Updating submission ...</p> : null }
            </DialogBody>
            <DialogFooter actions={<div>
                <Button text="" icon="reset" onClick={handleReset}/>
                <Button
                    text="Submit"
                    onClick={handleSubmit}
                    loading={patchSubmissionIsLoading}
                    />
                <Button text={isSuccess ? "Done" : "Cancel"} onClick={() => onClose()} intent={"primary"} disabled={patchSubmissionIsLoading} />
            </div>} />
        </Dialog>
    )
}