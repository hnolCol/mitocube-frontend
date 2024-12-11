import genotypes from "../types/genotypes"
import { getCurrentDate } from "./date/format"
import _ from "lodash"
export function constructSampleNames({ submission_tag, sampleNumber, sampleAttributes, sampleGenotypes, include_sample_attributes = [] }) {
    console.log(sampleNumber)
    const date = getCurrentDate()
    const zeroPadding = _.isNumber(sampleNumber) ? sampleNumber.toString().length : 0
    
    return _.range(sampleNumber).map(idx => {
        //create sample attributes
        let sampleNumber = (idx + 1).toString().padStart(zeroPadding > 1 ? zeroPadding : 2, '0')

        let sampleGenotypeString = _.isArray(sampleGenotypes) && _.isArray(sampleGenotypes[idx]) ? _.join(sampleGenotypes[idx]
            .filter(genotype => _.isObject(genotype) && _.has(genotype, "text"))
            .map(genotype => genotype.text), "_").replaceAll(".", "_").replaceAll("/", "") : ""
        
        let sampleAttributeString = _.join(
            _.keys(sampleAttributes[idx])
                .filter(attributeTag => include_sample_attributes.includes(attributeTag))
                    .map(attributeTag => {
                
                        return _.join(sampleAttributes[idx][attributeTag]
                                        .map(trait_tag => _.last(_.split(trait_tag,":"))), "-")})
                                            .filter(v => v !== ""), "_") 
                
        let sampleName = `${date}_${submission_tag}_${sampleNumber}_${sampleGenotypeString}_${sampleAttributeString}`.replaceAll(" ", "").replaceAll("__", "_")
  
        if (sampleName.endsWith("_"))
            sampleName = sampleName.slice(0,-1)
        return sampleName
    }
    )
}