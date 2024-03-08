import genotypes from "../types/genotypes"
import { getCurrentDate } from "./date/format"
import _ from "lodash"
export function constructSampleNames(submission_label, sampleNumber, sampleAttributes, sampleGenotypes) {
    const date = getCurrentDate()
    const zeroPadding = sampleNumber.toString().length
    
    return _.range(sampleNumber).map(idx => {
        //create sample attributes
        let sampleNumber = (idx + 1).toString().padStart(zeroPadding > 1 ? zeroPadding : 2, '0')
        let sampleGenotypeString = _.isArray(sampleGenotypes) && _.isArray(sampleGenotypes[idx]) ? _.join(sampleGenotypes[idx].filter(genotype => _.isObject(genotype) && _.has(genotype,"text")).map(genotype => genotype.text),"_").replaceAll(".","_").replaceAll("/","") : ""
        let sampleAttributeString = _.join(_.keys(sampleAttributes[idx]).map(attributeTag => {
            
            return _.join(sampleAttributes[idx][attributeTag].map(attrValue => _.isObject(attrValue) ? _.has(attrValue, "value") ?
                attrValue.value : attrValue.genes.split(" ").at(0) : ""
            ), "_")
        }).filter(v => v !== ""), "_")

        let sampleName = `${date}_${submission_label}_${sampleNumber}_${sampleGenotypeString}_${sampleAttributeString}`.replaceAll(" ", "").replaceAll("__", "_")
  
        if (sampleName.endsWith("_"))
            sampleName = sampleName.slice(0,-1)
        return sampleName
    }
    )
}