import genotypes from "../types/genotypes"
import { getCurrentDate } from "./date/format"
import _ from "lodash"
export function constructSampleNames({ submission_tag, sampleNumber, referenceIDs }) {
    const date = getCurrentDate()
    const zeroPadding = _.isNumber(sampleNumber) ? sampleNumber.toString().length : 0
    
    return _.range(sampleNumber).map(idx => {
        //create sample attributes
        let sampleNumber = (idx + 1).toString().padStart(zeroPadding > 1 ? zeroPadding : 2, '0')

        let sampleReferenceID = _.isArray(referenceIDs) && _.isString(referenceIDs[idx]) ? referenceIDs[idx] : ""

                
        let sampleName = `${date}_${submission_tag}_${sampleReferenceID}_${sampleNumber}`.replaceAll(" ", "").replaceAll("__", "_")
  
        if (sampleName.endsWith("_"))
            sampleName = sampleName.slice(0,-1)
        return sampleName
    }
    )
}