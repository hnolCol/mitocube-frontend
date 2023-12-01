import { Button, Dialog, DialogFooter } from "@blueprintjs/core";
import SamplesAttributes from "../../new/attribute/select/SampleAttributes";
import { useEffect, useState } from "react";
import { mapAttributeTagsToAttributes, mapAttributeValueTagsToAttributeValues, mapAttributeValueTagsToAttributes } from "../../../../services/attributes";
import { useGetSubmissionAttributesByTag } from "../../../../hooks/queries/submission.hooks";
import _ from "lodash"
import { SampleAttributeTableWrapper } from "../../new/attribute/select/SamplesAttributeWrapper";
import NumericValueInput from "../../../core/input/Numeric";


// sampleNames: [],
// collaborators : [],
// attributeTable: [],
// samplesAttributes: [],
// metatext: {},
// genotypes: {},
// links : [{id : randomInitLinkID, link : "", comment : ""}],
// attributes: {sampleNumber : 0, replicates : 0},
// datasetAttributeValues: {},
// datasetAttributes: [],
// rerenderTableDependency: 0}

export function EditSamplesAttributeDialog({ isOpen, submission, onClose }) {
    const { data : attributesByTag, isLoading, isFetching} = useGetSubmissionAttributesByTag()
    const [samplesAttributesProps, setSamplesAttributesProps] = useState({ attributeTable: [], sampleNames : [], replicates : [], rerenderTableDependency : [Math.random()] , samplesAttributes : [], n_samples : 0})
    
    useEffect(() => {
        if (!_.isObject(attributesByTag)) return 
        if (_.isEmpty(submission)) return 
        const sampleAttributeTags = _.keys(submission.samples_attributes)
        let attributeTable = submission.sample_names.map(sampleName =>
            _.fromPairs(sampleAttributeTags.map(attrTag =>
                [attrTag, []])))
            
        let samplesAttributes = sampleAttributeTags.map(attrTag => {return { name : submission.samples_attributes[attrTag].name, attribute : attributesByTag.attributes[attrTag]}})
        _.forEach(sampleAttributeTags, attrTag => {
            let sampleAttributeValues = submission.samples_attributes[attrTag].values
            const mappedAttributeValuesByTag = _.fromPairs(mapAttributeValueTagsToAttributeValues({ attributeTags: _.keys(sampleAttributeValues), attributesByTag }).map(attributeValue => [attributeValue.tag, attributeValue]))
            _.forEach(_.keys(sampleAttributeValues), attrValueTag =>
                _.forEach(sampleAttributeValues[attrValueTag], sampleIdx => {
                    attributeTable[sampleIdx][attrTag].push(mappedAttributeValuesByTag[attrValueTag])
                }))
        })

        setSamplesAttributesProps({
            n_samples : submission.sample_names.length,
            sampleNames: submission.sample_names,
            attributeTable: attributeTable,
            replicates: submission.replicates,
            rerenderTableDependency: [Math.random()],
            samplesAttributes,
            datasetAttributeValues: _.fromPairs(_.keys(submission.dataset_attributes).map(attrTag =>
                [attrTag, mapAttributeValueTagsToAttributeValues({ attributeTags: submission.dataset_attributes[attrTag], attributesByTag })]))
        })
    },
        [submission.label, _.isObject(attributesByTag)])
    

    return (
        <Dialog style={{minWidth : "80vw", height : "80vh"}} {...{ isOpen }} title="Edit Samples Attributes" onClose={onClose}>
            <div className="padding--medium" style={{ height: "50vh", overflowY: "scroll" }}>
                <NumericValueInput placeholder="Number of samples.." hint="Sample number" value={_.toString(samplesAttributesProps.n_samples)} callbackKey="n_samples" onChange={(callbackKey,value) => setSamplesAttributesProps(prevValues => {return {...prevValues,"n_samples" : value}})}/>
                <NumericValueInput placeholder="Number of replicates" />
            <SampleAttributeTableWrapper
                submission={samplesAttributesProps}
                attributes={_.values(attributesByTag.attributes)}
                updateSubmission={setSamplesAttributesProps} />
            </div>
            
            <DialogFooter actions={<div>
                <Button text="Submit" />
                <Button text="Cancel" onClick={() => onClose()} intent="danger"/>
            </div>} />
        </Dialog>
    )
}