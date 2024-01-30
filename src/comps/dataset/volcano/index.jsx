import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { SamplesAttributesSelection } from "./SamplesAttributesSelection";
import _ from "lodash"
import { useGetSubmissionAttributesByTag } from "../../../hooks/queries/submission.hooks";
import { getAttributeForUserNumericInput } from "../../../services/attributes";
import Loading from "../../core/base/loading";
import { useGetDatasetVolcano } from "../../../hooks/queries/datasets.hooks";


function VolcanoPlot({dataset_label}) {
    const { data, isVolcanoLoading, isVolcanoFetching } = useGetDatasetVolcano({ dataset_label, testParams: {} })
    
}


function DatasetVolcanoPlot(logout) {
    
    const { metadata, dataset_label } = useOutletContext()   
    const {data : attributesByTag, isLoading, isFetching, isError, error} = useGetSubmissionAttributesByTag()

    
    // if (isError) return <APIError error={error} />
    // if (isLoading) return <div>Dataset Info Loading...</div>
    // groupItems = { "Treatment": ["A", "B","WT"], "Time": ["A1", "B1"] },
    // groupingNames = ["Treatment", "Time"],
    if (isLoading || isFetching) return <Loading />
    if (isError) return <APIError />
    
    if (!_.isObject(metadata) || !_.isObject(attributesByTag)) return null 
    let sampleAttributesKey = Object.keys(metadata.samples_attributes)
    let sampleAttributeValues =_.fromPairs(_.keys(metadata.samples_attributes).map(sampleAttributeTag => [sampleAttributeTag,  _.values(metadata.samples_attributes[sampleAttributeTag].attribute_values)]))

    console.log(sampleAttributeValues)
    console.log(metadata)
    
    return (
        <div>
            <div className="flex center-items justify-center div--expand">
                <SamplesAttributesSelection
                    attributes={sampleAttributesKey.map(attrTag => attributesByTag.attributes[attrTag])}
                    groupAttributeValues={sampleAttributeValues} {...{ metadata, callback : console.log }} />
            </div>
        </div>
    )
}

export default DatasetVolcanoPlot