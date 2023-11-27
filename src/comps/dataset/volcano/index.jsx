import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import GroupingSelection from "./GroupSelection";
import _ from "lodash"
import { useGetSubmissionAttributesByTag } from "../../../hooks/queries/submission.hooks";
import { getAttributeForUserNumericInput } from "../../../services/attributes";

function DatasetVolcanoPlot({ authenticationStatus }) {
    
    const { dataset_label, metadata } = useOutletContext()   
    const {data : attributesByTag} = useGetSubmissionAttributesByTag({tokenString : authenticationStatus.token},{staleTime : Infinity})

    // if (isError) return <APIError error={error} />
    // if (isLoading) return <div>Dataset Info Loading...</div>
    // groupItems = { "Treatment": ["A", "B","WT"], "Time": ["A1", "B1"] },
    // groupingNames = ["Treatment", "Time"],
    if (!_.isObject(metadata) || !_.isObject(attributesByTag)) return null 
    let sampleAttributesKey = Object.keys(metadata.samples_attributes)
    let sampleAttributeValues = Object.fromEntries(sampleAttributesKey.map(attributeTag =>
        [attributeTag, Object.keys(metadata.samples_attributes[attributeTag].values).map(attributeValueTag => _.has(attributesByTag.attribute_values, attributeValueTag) ?
            attributesByTag.attribute_values[attributeValueTag] : getAttributeForUserNumericInput({attributesByTag,attributeTag,attributeValueTag}))]))
    console.log(metadata.samples_attributes,sampleAttributeValues,attributesByTag)
    return (
        <div>
            <div className="flex center-items justify-center div--expand">
            <GroupingSelection attributes={sampleAttributesKey.map(attrTag => attributesByTag.attributes[attrTag])} groupAttributeValues={sampleAttributeValues}/>
            </div>
        </div>
    )
}

export default DatasetVolcanoPlot