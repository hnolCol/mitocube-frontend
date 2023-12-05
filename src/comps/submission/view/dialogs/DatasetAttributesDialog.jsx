import { Button, Dialog, DialogFooter } from "@blueprintjs/core";
import { useEffect, useMemo, useState } from "react";
import { mapAttributeTagsToAttributes } from "../../../../services/attributes";
import { useGetSubmissionAttributesByTag } from "../../../../hooks/queries/submission.hooks";
import _ from "lodash"
import { SampleAttributeTableWrapper } from "../../new/attribute/select/SamplesAttributeWrapper";
import NumericValueInput from "../../../core/input/Numeric";
import { constructSampleNames } from "../../../../services/samples";
import APIError from "../../../core/error/APIerror";
import Loading from "../../../core/base/loading";
import DatasetAttributeSelect from "../../new/attribute/select/DatasetAttributes";
import { groupListByProperty } from "../../../../services/arrays/groupby";
import { addItemToArrayOrRemoveItIfPresent } from "../../../../services/arrays/transforms";
import DatasetAttributeHierarchy from "../../new/attribute/view/DatasetAttributesHierarchy";


export function EditDatasetAttributeDialog({ isOpen, submission, onClose, onSubmit }) {

    // const {mutate : updateSubmissionAttrSamples, isLoading : patchingIsLoading ,isSuccess, isError : patchingIsError, error : patchingSumissionError} = usePathSubmissionSampleAttributes()
    // const { data : attributesByTag, isLoading, isFetching} = useGetSubmissionAttributesByTag()
    // const [samplesAttributesProps, setSamplesAttributesProps] = useState({ attributeTable: [], sampleNames : [], replicates : [], rerenderTableDependency : [Math.random()] , samplesAttributes : [], n_samples : 0, n_replicates : 0, label : ""})
    const [datasetAttributes, setDatasetAttributes] = useState({})
    
    const { data: attributesByTag, isSuccess, isLoading, isFetching } = useGetSubmissionAttributesByTag()


    const { attributeValuesByAtrributeID, attributesAllowedForDataset, attributeValuesWithParentInfo }  = useMemo(() => {
        if (!isSuccess) return {}
        let attributes = _.values(attributesByTag.attributes)
        let attrById = Object.fromEntries(attributes.map(attrs => [attrs.id,[attrs.tag,attrs.name]]))
        let attrsValues = _.values(attributesByTag.attribute_values)
        let attrs = attrsValues.map(attrValue => { return { ...attrValue, attribute_id_tag: attrById[attrValue.attribute_id][0], attribute_id_name: attrById[attrValue.attribute_id][1]} })
        
        return { attributeValuesByAtrributeID: groupListByProperty(attrs, "attribute_id"), attributeValuesWithParentInfo : attrs, attributesAllowedForDataset : attributes.filter(attribute => attribute["allow_for_dataset"])}
    }, [isSuccess])


    
    if (isLoading || isFetching) return <Loading />


    useEffect(() => {
        if (!_.isObject(submission.dataset_attributes) || !_.isObject(attributesByTag)) return 
        const matchedPrevSelectedAttributes = mapAttributeTagsToAttributes({ tagAttributes: submission.dataset_attributes, attributesByTag })
        
        setDatasetAttributes(matchedPrevSelectedAttributes)
    }, [submission.label, _.isObject(attributesByTag)])


    // useEffect(() => {
    //     if (!_.isObject(attributesByTag)) return 
    //     if (_.isEmpty(submission)) return 
        
    //     //transform dataset attribute value tags to attributes
    //     setDatasetAttributes(prevValues => {
    //         return {
    //             ...prevValues,
    //             datasetAttributes :  _.keys(submission.dataset_attributes).map(attrTag => attributesByTag.attributes[attrTag]),
    //             datasetAttributeValues: _.fromPairs(_.keys(submission.dataset_attributes).map(attrTag =>
    //                 [attrTag, mapAttributeValueTagsToAttributeValues({ attributeTags: submission.dataset_attributes[attrTag], attributesByTag }).filter(v => _.isObject(v) && !_.isEmpty(v))]))
    //         }
    //     })
    // }, [submission.label, _.isObject(attributesByTag)])

    const handleDatasetAttributeSelection = (attribute, attributeValue) => {
        //handle dataset attribute selection
        datasetAttributes[attribute.tag] ??= []
        const updatedAttrValues = addItemToArrayOrRemoveItIfPresent({ array: datasetAttributes[attribute.tag], item: attributeValue })

        if (updatedAttrValues.length === 0) {
            setDatasetAttributes(prevValues => _.omit(prevValues, attribute.tag))
        }
        else {
            setDatasetAttributes(prevValues => { return { ...prevValues, [attribute.tag]: updatedAttrValues } })
        }
    }

    
const handleFeatureSelection = () => {
        console.log("FEAUTRE SELECTION")
    }

    const handleSubmit = () => {
        //handle sample attribute submit 

        onSubmit(
            submission.label,
            datasetAttributes,
            submission.state,
            submission.state,
            "Updated dataset attributes."

        )

        submission.label, selectedAttributes,newSubmissionState, submission.state, comment

    }

    return (
        <Dialog style={{ minWidth: "95vw", height: "80vh" }} {...{ isOpen }} title="Edit Dataset Attributes" onClose={onClose}>
            
            <div className="padding--medium">
                <p>Alter the dataset attributes and submit changes for project {submission.title} ({submission.label})</p>
            <DatasetAttributeSelect
                attributes={attributesAllowedForDataset}
                attributeValues={attributeValuesWithParentInfo}
                attributeValuesByID={attributeValuesByAtrributeID}
                    {...{ handleDatasetAttributeSelection, handleFeatureSelection }} />
            <div style={{overflowY : "scroll", height : "60vh"}}>
             <DatasetAttributeHierarchy
                    selectedAttributes={_.keys(datasetAttributes).map(attrTag => attributesByTag.attributes[attrTag])}
                    selectedDasetAttributeValues={datasetAttributes}
                        onDatasetAttributeRemove={handleDatasetAttributeSelection} />
            </div>
            </div>
            <DialogFooter actions={<div>
                <Button text="Submit" onClick={handleSubmit}/>
                <Button text="Cancel" onClick={() => onClose()} intent="danger" />
            </div>} />
        </Dialog>
    )
}