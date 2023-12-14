import { getCurrentDate } from "./date/format"
import _ from "lodash"
export function constructSampleNames(submission_label, sampleNumber, sampleAttributes) {
    const date = getCurrentDate()
    const zeroPadding = sampleNumber.toString().length
    
    return _.range(sampleNumber).map(idx => {
        //create sample attributes
        let sampleNumber = (idx + 1).toString().padStart(zeroPadding > 1 ? zeroPadding : 2, '0')
        let sampleAttributeString = _.join(_.keys(sampleAttributes[idx]).map(attributeTag => _.join(sampleAttributes[idx][attributeTag].map(attrValue => attrValue.text),"-")).filter(v => v!==""),"_")
        return `${date}_${submission_label}_${sampleNumber}_${sampleAttributeString}`
    }
    )

}