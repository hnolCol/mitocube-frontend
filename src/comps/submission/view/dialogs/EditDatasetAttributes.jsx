import { Alert, Button, Callout, Dialog, DialogBody, DialogFooter, Spinner } from "@blueprintjs/core";
import { useEffect, useMemo, useState } from "react";
import { mapAttributeTagsToAttributes } from "../../../../services/attributes";
import { useGetSubmissionAttributesByTag, useGetSubmissionDatasetAttributesByTag } from "../../../../hooks/queries/submission.hooks";
import _ from "lodash"
import APIError from "../../../core/error/APIerror";
import Loading from "../../../core/base/loading";
import DatasetAttributeSelect from "../../new/attribute/select/DatasetAttributes";
import { groupListByProperty } from "../../../../services/arrays/groupby";
import { addItemsToArrayByTag, addItemToArrayIfNotPresent, addItemToArrayOrRemoveIfPresentByTag, addItemToArrayOrRemoveItIfPresent } from "../../../../services/arrays/transforms";
import DatasetAttributeHierarchy from "../../new/attribute/view/DatasetAttributesHierarchy";
import { TagWithTooltip } from "../../../core/base/tags/TagWithTooltip";
import { get_proteome_id } from "../../new/InitialSubmission";
import { AttributesInput } from "../../../core/input/api/DatasetAttributeInput";
import { useGetAttributes, useGetDatasetAttributes } from "../../../../hooks/queries/attribute.hooks";
import attributes from "../../../../types/attributes";


/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/submissions").Submission} props.submission
 * @returns 
 */
export function EditDatasetAttributeDialog({ isOpen, isLoading, success, submitted, submission, onClose, onSubmit, error = undefined }) {
    const [datasetAttributes, setDatasetAttributes] = useState({selection : {}, highlight : [], attributes : []})
    const [alertProps, setAlertProps] = useState({isOpen : false, children : <div></div>})
    const {data : mandatoryDatasetAttributes } = useGetAttributes({param_name : "mandatory_for_active"})
    
    const { data: initialDatasetAttributes,
        isLoading: initDataAttrLoading,
        isSuccess : initDataAttrIsSuccess,
        isError : initDataAttrIsError } = useGetSubmissionDatasetAttributesByTag({ tag: submission.tag })
    
    const { data: attributesByTag, isSuccess: isSuccessAttr, isLoading: isLoadingAttrs, isFetching: isFetchingAttrs } = useGetSubmissionAttributesByTag()

    useEffect(() => {
        if (!_.isObject(initialDatasetAttributes)) return
        if (initDataAttrLoading) return
        if (submission.tag == initialDatasetAttributes.tag) {
            const selectedAttributeValues = _.keys(initialDatasetAttributes.tags)
                .map(attributeTag => [attributeTag, initialDatasetAttributes.tags[attributeTag]
                    .map(attributeValueTag => initialDatasetAttributes.attribute_values[attributeValueTag])])

            setDatasetAttributes(prevValues => {
                return {
                    ...prevValues,
                    selection: _.fromPairs(selectedAttributeValues),
                    highlight: [],
                    attributes: _.values(initialDatasetAttributes.attributes)
                }
            })
        }
        
    }, [submission.tag, _.isObject(initialDatasetAttributes), initDataAttrLoading, initDataAttrIsSuccess])
    

    if (isLoadingAttrs || isFetchingAttrs) return <Loading />

    //find attributes that are missing  but are required to be active to show to the user.
    const missingMandatoryAttributes = _.isObject(mandatoryDatasetAttributes) ? mandatoryDatasetAttributes.attributes.filter(attribute => !_.has(datasetAttributes.selection,attribute.tag)) : []

    const handleDatasetAttributeSelection = (attribute, attributeValue) => {
        datasetAttributes.selection[attribute.tag] ??= []
        const updatedAttrValues = addItemToArrayOrRemoveIfPresentByTag({ array: datasetAttributes.selection[attribute.tag], item: attributeValue })
        //the attribute value was already selected and will be deleted from the selection.
        if (updatedAttrValues.length === 0) {
            setDatasetAttributes(prevValues => {
                return {
                    ...prevValues,
                    selection: _.omit(prevValues.selection, attribute.tag),
                    attributes: prevValues.attributes.filter(attr => attr.tag != attribute.tag)
                }
            })
        }
        else {
            //add attribute if its not there yet to the state to display it in the hierarchy. 
            const updatedAttributes = addItemsToArrayByTag({ array: datasetAttributes.attributes, item: attribute })
            setDatasetAttributes(prevValues => {
                return {
                    ...prevValues,
                    selection: _.assign(prevValues.selection, { [attribute.tag]: updatedAttrValues }),
                    attributes : updatedAttributes, 
                    highlight : prevValues.highlight.includes(attributeValue.tag)? prevValues.highlight: _.concat(prevValues.highlight, attributeValue.tag)
                }
            })
        }
    }

    const resetAlert = () => {
        // close the alert 
        setAlertProps(prevValues => { return { ...prevValues, isOpen: false, isLoading : false, success : false, submitted : false } })
    }

    const handleSubmit = () => {
        //handle sample attribute submit 
        onSubmit(
            submission.tag,
            datasetAttributes.attributes,
            datasetAttributes.selection,
            submission.state,
            submission.state,
            "Updated dataset attributes."
        )
    }


    return (
        <Dialog style={{ minWidth: "min(80vw,900px)", height: "80vh"}} {...{ isOpen }} title="Edit Dataset Attributes" onClose={onClose}>
            <Alert style={{ minWidth: "700px" }} canEscapeKeyCancel={true} canOutsideClickCancel={true}
                onConfirm={resetAlert} onClose={resetAlert} {...alertProps} />
            {submitted ? null : isLoading ? <Loading /> :
                <div className="no-scroll padding--medium">
                <div className="flex flex-column padding--medium justify-flex-start no-scroll" style={{height : "80vh"}}>
                <div className="flex flex-column justify-space-between" style={{ height: "13vh"}}>
                    <p>Alter the dataset attributes and submit changes for project <strong>{submission.title}</strong> ({submission.tag})</p>
                    <div class="margin--little">
                        <Callout intent={missingMandatoryAttributes.length > 0 ? "warning" : "primary"}>
                            {missingMandatoryAttributes.length > 0 ? <div><TagWithTooltip
                                tagText={missingMandatoryAttributes.length}
                                tooltipText={_.join(missingMandatoryAttributes.map(attribute => attribute.text), "\n")} /> attributes not defined that are required for an active dataset. </div> :
                                <div>All attributes defined to publish the dataset.</div>}
                        </Callout>
                    </div>
                    <AttributesInput
                        selectedDatasetAttributes={datasetAttributes.selection}
                        handleAttributeSelection={handleDatasetAttributeSelection}
                        min_state={submission.state} />
                </div>
                <div>
                    <div style={{ overflowY: "scroll", height : "55vh"}}>
                        {_.isArray(datasetAttributes.attributes) && datasetAttributes.attributes.length > 0 ? <DatasetAttributeHierarchy
                            selectedAttributes={datasetAttributes.attributes}
                            selectedDatasetAttributeValues={datasetAttributes.selection}
                            onDatasetAttributeRemove={handleDatasetAttributeSelection}
                            highlightAttributeValuesByTag={datasetAttributes.highlight}
                            warnAtTwoAttrValues={false} /> : null
                        }
                    </div>
                </div>
            </div>
            </div>}
            <DialogBody>
                {submitted ? success ? <p>Success. Dataset attribute were updated successfully.</p>
                    : <APIError error={error} /> :
                        isLoading ? <p>Updating submission ...</p> : null}
            </DialogBody>
            <DialogFooter actions={<div>
                <Button text="Submit" onClick={handleSubmit} disabled={isLoading || success || submitted} />
                <Button text={submitted ? "Done" : "Cancel"} onClick={() => onClose()} intent={submitted ? "danger" : "primary"} disabled={isLoading} />
            </div>} />
        </Dialog>
    )
}