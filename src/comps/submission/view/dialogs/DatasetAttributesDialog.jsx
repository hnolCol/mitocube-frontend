import { Alert, Button, Callout, Dialog, DialogFooter, Spinner } from "@blueprintjs/core";
import { useEffect, useMemo, useState } from "react";
import { mapAttributeTagsToAttributes } from "../../../../services/attributes";
import { useGetSubmissionAttributesByTag } from "../../../../hooks/queries/submission.hooks";
import _ from "lodash"
import APIError from "../../../core/error/APIerror";
import Loading from "../../../core/base/loading";
import DatasetAttributeSelect from "../../new/attribute/select/DatasetAttributes";
import { groupListByProperty } from "../../../../services/arrays/groupby";
import { addItemToArrayOrRemoveItIfPresent } from "../../../../services/arrays/transforms";
import DatasetAttributeHierarchy from "../../new/attribute/view/DatasetAttributesHierarchy";
import FeatureSelection from "../../new/FeatureSelection";
import { TagWithTooltip } from "../../../core/base/tags/TagWithTooltip";


export function EditDatasetAttributeDialog({ isOpen, isLoading, success, submitted, submission, onClose, onSubmit, error = undefined }) {

    const [datasetAttributes, setDatasetAttributes] = useState({selection : {}, highlight : []})
    const [alertProps, setAlertProps] = useState({isOpen : false, children : <div></div>})
    const { data: attributesByTag, isSuccess : isSuccessAttr, isLoading : isLoadingAttrs, isFetching : isFetchingAttrs } = useGetSubmissionAttributesByTag()

    const {
        attributeValuesByAtrributeID,
        attributesAllowedForDataset,
        attributeValuesWithParentInfo,
        attributesMandatoryForActiveByTag } = useMemo(() => {
                if (!isSuccessAttr) return {}
                const attributes = _.values(attributesByTag.attributes)
                const attrById = Object.fromEntries(attributes.map(attrs => [attrs.id,[attrs.tag,attrs.text]]))
                const attrsValues = _.values(attributesByTag.attribute_values)
                const attrs = attrsValues.map(attrValue => { return { ...attrValue, attribute_id_tag: attrById[attrValue.attribute_id][0], attribute_id_name: attrById[attrValue.attribute_id][1]} })
                const attrsForDataset = attributes.filter(attribute => attribute["allow_for_dataset"])
                return {
                    attributeValuesByAtrributeID: groupListByProperty(attrs, "attribute_id"),
                    attributeValuesWithParentInfo: attrs,
                    attributesAllowedForDataset: attrsForDataset,
                    attributesMandatoryForActiveByTag : groupListByProperty(attrsForDataset.filter(attr => attr.mandatory_for_active),"tag")
                }
    }, [isSuccessAttr])
    
    useEffect(() => {
        if (!_.isObject(submission.dataset_attributes) || !_.isObject(attributesByTag)) return 
        const matchedPrevSelectedAttributes = mapAttributeTagsToAttributes({ tagAttributes: submission.dataset_attributes, attributesByTag })
        
        setDatasetAttributes(prevValues => { return { ...prevValues, selection: matchedPrevSelectedAttributes, highlight : [] } })
    }, [submission.label, _.isObject(attributesByTag)])
    

    if (isLoadingAttrs || isFetchingAttrs) return <Loading />

    //find attributes that are missing  but are required to be active to show to the user.
    const missingMandatoryAttributes = _.isObject(attributesMandatoryForActiveByTag) ? _.keys(attributesMandatoryForActiveByTag).filter(attrTag => !_.has(datasetAttributes.selection,attrTag)) : []


    const handleDatasetAttributeSelection = (attribute, attributeValue) => {
        const attrValue = _.omit(attributeValue,["attribute_id_name","attribute_id_tag"]) //remove the attribute info that were added for seraching
        //handle dataset attribute selection
        datasetAttributes.selection[attribute.tag] ??= []
        const updatedAttrValues = addItemToArrayOrRemoveItIfPresent({ array: datasetAttributes.selection[attribute.tag], item: attrValue})
        if (updatedAttrValues.length === 0) {
            setDatasetAttributes(prevValues => {
                return { ...prevValues, selection: _.omit(prevValues.selection, attribute.tag) }
            })
        }
        else {
            setDatasetAttributes(prevValues => {
                return {
                    ...prevValues,
                    selection: _.assign(prevValues.selection, { [attribute.tag]: updatedAttrValues }),
                    highlight : prevValues.highlight.includes(attrValue.tag)? prevValues.highlight: _.concat(prevValues.highlight, attrValue.tag)
                }
            })
        }
    }

    const onFeatureSelection = (attribute, selectedFeatures, ...rest) => {

        if (selectedFeatures.length === 0 && _.has(datasetAttributes, attribute.tag)) {
            setDatasetAttributes(prevValues => { return { ...prevValues, selection: _.omit(prevValues.selection, attribute.tag) } })
        }
        else {
            // setDatasetAttributes(prevValues => { return { ...prevValues, [attribute.tag]: selectedFeatures } })
            setDatasetAttributes(prevValues => {
                return {
                    ...prevValues,
                    selection: _.assign(prevValues.selection, { [attribute.tag]: selectedFeatures }),
                    highlight : _.uniq(_.concat(prevValues.highlight, selectedFeatures.map(feature => feature.tag)))
                }
            })
        }

        resetAlert()
    }
    
    const handleFeatureSelection = ({attribute, isSampleAttribute = false}) => {
        //handle feature selection of a samples attribute
        if (!_.has(datasetAttributes.selection, "att_organism")
            || datasetAttributes.selection["att_organism"].length === 0) {
            //if organism has not been selected prompt a warning.
            setAlertProps({ isOpen: true, children: <div><h3>Error</h3><p>Please select one or multiple organisms first.</p></div> })
            return 
        }
        let selectedItems = _.has(datasetAttributes.selection,attribute.tag) ? datasetAttributes.selection[attribute.tag] : []
        
        setAlertProps({
            isOpen: true,
            confirmButtonText: "Cancel",
            children: <FeatureSelection {...{
                selectedItems,
                attribute,
                organisms: datasetAttributes.selection["att_organism"],
                isSampleAttribute,
                onSave : onFeatureSelection
            }} />
        })
    }

    const resetAlert = () => {
        // close the alert 
        setAlertProps(prevValues => { return { ...prevValues, isOpen: false, isLoading : false, success : false, submitted : false } })
    }

    const handleSubmit = () => {
        //handle sample attribute submit 
        onSubmit(
            submission.label,
            datasetAttributes.selection,
            submission.state,
            submission.state,
            "Updated dataset attributes."
        )
    }

    return (
        <Dialog style={{ minWidth: "min(80vw,900px)", height: "80vh" }} {...{ isOpen }} title="Edit Dataset Attributes" onClose={onClose}>
            <Alert style={{ minWidth: "700px" }} canEscapeKeyCancel={true} canOutsideClickCancel={true}
                onConfirm={resetAlert} onClose={resetAlert} {...alertProps} />
            {submitted ? null : isLoading ? <Spinner />: <div className="flex flex-column padding--medium justify-space-between">
                <div>
                    <p>Alter the dataset attributes and submit changes for project <strong>{submission.title}</strong> ({submission.label})</p>
                    <div class="margin--medium">
                        <Callout intent={missingMandatoryAttributes.length > 0 ? "warning" : "primary"}>
                            {missingMandatoryAttributes.length > 0 ? <div><TagWithTooltip tagText={missingMandatoryAttributes.length} tooltipText={_.join(missingMandatoryAttributes.map(attrTag => attributesByTag.attributes[attrTag].text), "\n")} /> attributes not defined that are required for an active dataset. </div> : <div>All attributes defined to publish the dataset.</div>}
                        </Callout>
                    </div>
                </div>
                <DatasetAttributeSelect
                    attributes={attributesAllowedForDataset}
                    attributeValues={attributeValuesWithParentInfo}
                    attributeValuesByID={attributeValuesByAtrributeID}
                    {...{ handleDatasetAttributeSelection, handleFeatureSelection }} />
                <div>
                    <div style={{ overflowY: "scroll", maxHeight: "50vh" }}>
                        <DatasetAttributeHierarchy
                            selectedAttributes={_.keys(datasetAttributes.selection).map(attrTag => attributesByTag.attributes[attrTag])}
                            selectedDasetAttributeValues={datasetAttributes.selection}
                            onDatasetAttributeRemove={handleDatasetAttributeSelection}
                            highlightAttributeValuesByTag={datasetAttributes.highlight}
                            warnAtTwoAttrValues={false} />
                    </div>
                </div>
            </div>}
            <div style={{ height: "70vh" }}>
                    {submitted ? success ? <p>Success</p> : <APIError error={error} /> : isLoading ? <p>Updating submission ...</p> : null}
                </div>
            <DialogFooter actions={<div>
                <Button text="Submit" onClick={handleSubmit} disabled={isLoading || success || submitted} />
                <Button text="Cancel" onClick={() => onClose()} intent="danger" disabled={isLoading} />
            </div>} />
        </Dialog>
    )
}