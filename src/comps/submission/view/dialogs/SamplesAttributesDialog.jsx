import { Button, Dialog, DialogFooter } from "@blueprintjs/core";
import SamplesAttributes from "../../new/attribute/select/SampleAttributes";
import { useEffect, useState } from "react";
import { mapAttributeValueTagsToAttributeValues, mapAttributeValueTagsToAttributes } from "../../../../services/attributes";
import { useGetSubmissionAttributesByTag, usePathSubmissionSampleAttributes } from "../../../../hooks/queries/submission.hooks";
import _ from "lodash"
import { SampleAttributeTableWrapper } from "../../new/attribute/select/SamplesAttributeWrapper";
import NumericValueInput from "../../../core/input/Numeric";
import { constructSampleNames } from "../../../../services/samples";
import APIError from "../../../core/error/APIerror";
import Loading from "../../../core/base/loading";


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

export function EditSamplesAttributeDialog({ isOpen, submission, onClose, onSubmit }) {

    const {mutate : updateSubmissionAttrSamples, isLoading : patchingIsLoading ,isSuccess, isError : patchingIsError, error : patchingSumissionError} = usePathSubmissionSampleAttributes()
    const { data : attributesByTag, isLoading, isFetching} = useGetSubmissionAttributesByTag()
    const [samplesAttributesProps, setSamplesAttributesProps] = useState({ attributeTable: [], sampleNames : [], replicates : [], rerenderTableDependency : [Math.random()] , samplesAttributes : [], n_samples : 0, n_replicates : 0, label : ""})
    
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
            const mappedAttributeValuesByTag = _.fromPairs(mapAttributeValueTagsToAttributeValues({ attributeTags: _.keys(sampleAttributeValues), attributesByTag }).filter(attributeValue => _.isObject(attributeValue) && !_.isEmpty(attributeValue)).map(attributeValue => [attributeValue.tag, attributeValue]))
            _.forEach(_.keys(sampleAttributeValues), attrValueTag =>
                _.forEach(sampleAttributeValues[attrValueTag], sampleIdx => {
                    if (_.has(mappedAttributeValuesByTag,attrValueTag)) attributeTable[sampleIdx][attrTag].push(mappedAttributeValuesByTag[attrValueTag])
                }))
        })

        setSamplesAttributesProps({
            label : submission.label,
            n_samples: submission.sample_names.length,
            n_replicates : _.uniq(submission.replicates).length,
            sampleNames: submission.sample_names,
            attributeTable: attributeTable,
            replicates: submission.replicates,
            rerenderTableDependency: [Math.random()],
            samplesAttributes,
            datasetAttributeValues: _.fromPairs(_.keys(submission.dataset_attributes).map(attrTag =>
                [attrTag, mapAttributeValueTagsToAttributeValues({ attributeTags: submission.dataset_attributes[attrTag], attributesByTag }).filter(v => _.isObject(v) && !_.isEmpty(v))]))
        })
    },
        [submission.label, _.isObject(attributesByTag)])
    
    
    useEffect(() => {

        if (samplesAttributesProps.n_samples === undefined) return 
        if (!_.isString(submission.label)) return 

        let attributeTable = samplesAttributesProps.attributeTable
        if (samplesAttributesProps.n_samples > attributeTable.length) {
            //add rows if missing
            const diff = samplesAttributesProps.n_samples - attributeTable.length
            //get the attribute tags that are defined either by checking the existing once from a defined attributeTable otherwise from the grouping info. 
            const existingAttributeTags = attributeTable.length > 0?Object.keys(attributeTable[0]):samplesAttributesProps.samplesAttributes.filter(sampleAttr => _.isObject(sampleAttr.attribute)).map(sampleAttr => sampleAttr.attribute.tag)
            _.forEach(_.range(diff), () => {
                attributeTable.push(Object.fromEntries(_.map(existingAttributeTags, samplesAttributesTag => [[samplesAttributesTag],[]])))
            })
        }

        setSamplesAttributesProps(prevValues => {
            return {
                ...prevValues,
                attributeTable,
                sampleNames: constructSampleNames(submission.label, samplesAttributesProps.n_samples, attributeTable),
                rerenderTableDependency: [Math.random()]
            }
        })
    }, [samplesAttributesProps.n_samples,submission.label])


    const handleSubmit = () => {
        //handle sample attribute submit 
       
    }


    return (
        <Dialog style={{ minWidth: "95vw", height: "80vh" }} {...{ isOpen }} title="Edit Samples Attributes" onClose={onClose}>
            
            {isSuccess ? <p>Success. Sample attributes updated.</p>: isLoading || isFetching || patchingIsLoading ? <Loading /> : patchingIsError ? <APIError error={patchingSumissionError} /> : <div className="padding--medium" style={{ height: "auto", overflowY: "visible" }}>
                <NumericValueInput
                    placeholder="Number of samples.."
                    hint="Sample number"
                    value={_.toString(samplesAttributesProps.n_samples)}
                    callbackKey="n_samples"
                    onChange={(callbackKey, value) => setSamplesAttributesProps(prevValues => { return { ...prevValues, [callbackKey]: value } })} />
                <NumericValueInput
                    placeholder="Number of replicates"
                    hint="Replicate number"
                    value={_.toString(samplesAttributesProps.n_replicates)}
                    callbackKey={"n_replicates"}
                    onChange={(callbackKey, value) => setSamplesAttributesProps(prevValues => { return { ...prevValues, [callbackKey]: value } })} />
            
                <SampleAttributeTableWrapper
                    
                    submission={samplesAttributesProps}
                    attributes={_.values(attributesByTag.attributes)}
                    updateSubmission={setSamplesAttributesProps}
                    numberReplicates={samplesAttributesProps.n_replicates}
                />
            </div>}
            
            <DialogFooter actions={<div>
                <Button text="Submit" onClick={handleSubmit} loading={patchingIsLoading} disabled={patchingIsLoading} />
                <Button text="Cancel" onClick={() => onClose()} intent="danger" disabled={patchingIsLoading}/>
            </div>} />
        </Dialog>
    )
}