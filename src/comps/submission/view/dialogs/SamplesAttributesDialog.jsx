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

/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/submissions").Submission} props.submission
 * @returns 
 */
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
            
        
        console.log(submission)
        
        let samplesAttributes = _.keys(submission.samples_attributes).map(attributeTag => {
            return {
                name: submission.samples_attributes[attributeTag].name,
                attribute : attributesByTag.attributes[attributeTag]
            }
        })

        _.forEach(_.keys(submission.samples_attributes), attributeTag => {
            const { name, attribute_values, values } = submission.samples_attributes[attributeTag]
            _.forEach(_.keys(values), attributeValueTag => {
                let sampleIdcs = values[attributeValueTag]
                let attributeValue = attribute_values[attributeValueTag]
                _.forEach(sampleIdcs, sampleIdx => {
                    attributeTable[sampleIdx][attributeTag].push(attributeValue)
                })
            })

            
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
            datasetAttributeValues: submission.dataset_attributes
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
                attributeTable.push(_.fromPairs(_.map(existingAttributeTags, samplesAttributesTag => [[samplesAttributesTag],[]])))
            })
        }

        setSamplesAttributesProps(prevValues => {
            return {
                ...prevValues,
               // attributeTable,
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
            
            {isSuccess ? <p>Success. Sample attributes updated.</p> : isLoading || isFetching || patchingIsLoading ? <Loading /> : patchingIsError ? <APIError error={patchingSumissionError} /> :
                <div className="padding--medium" style={{ height: "auto", overflowY: "visible" }}>
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