
import _ from "lodash"

function getMutationAbbr(entryName, mutation,genotypeEntryAttributes) {
    const n_term = mutation.p === -Infinity
    const mutationAttrValue = mutation.mutation_attribute_value //tag or what ever 

    const aa_position = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa_position 
    const aa = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa
    const positions_defined = _.isArray(aa_position) &&  _.isArray(aa)

    if (mutationAttrValue.value === "deletion" || mutationAttrValue.value === "truncation") {
        
        const aa_position = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa_position 
        const aa = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa
        const position_length = aa_position.length

        if (!positions_defined) return entryName

        entryName += position_length === 1 ? `.${aa.at(0)}${aa_position.at(0)}del` : `.${aa.at(0)}${aa_position.at(0)}-${aa.at(-1)}${aa_position.at(-1)}del`
       
        return entryName
    }

    else if (mutationAttrValue.value === "substitution") {
        if (!positions_defined) return entryName

        const aa_position = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa_position 
        const aa = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa
        const sub_aa = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].substitution
        
        entryName += `.${aa.at(0)}${aa_position.at(0)}${sub_aa}`
        return entryName
    }

    else if (mutationAttrValue.value === "frameshift") {
        if (!positions_defined) return entryName
        const aa_position = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa_position 
        const aa = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa
        entryName += `.${aa.at(0)}${aa_position.at(0)}fs`
        return entryName
    }
    else if (mutationAttrValue.value === "insertion") {
        if (!positions_defined) return entryName
        const aa_position = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa_position 
        const aa = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa
        const ins_aa = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].substitution
        entryName += `.${aa.at(0)}${aa_position.at(0)}_${ins_aa}`
        return entryName
    }
    else {
        //other should be tag
        const mutationValue = mutationAttrValue.text.split(" ").at(0)
        if (mutation.p === Infinity || n_term) {
            if (n_term) {
                entryName = `${mutationValue}_N.` + entryName
            }
            else {
                entryName += `.C_${mutationValue}`
            }
        }
        else {
            if (!positions_defined) return entryName
            const aa_position = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa_position 
            const aa = genotypeEntryAttributes["att_protein_position"][mutationAttrValue.tag].aa
            entryName += `.${aa.at(0)}${aa_position.at(0)}_${mutationValue}`
        }
    }
    return entryName

}
/**
 * 
 * @param {Object.<string, import("../types/feature").Feature | import("../types/attributes").AttributeValue[]} genotypeAttributes 
 * @returns 
 */
export function constructGenotypeName(genotypeAttributes){
    let baseName = ""
    _.forEach(genotypeAttributes, (genotypeEntryAttributes, entryIdx) => {
        let entryName = ""
        if (_.isEmpty(genotypeEntryAttributes)) return ""
        entryName += genotypeEntryAttributes["att_protein_coding_sequence"][0].gene_name

        if (_.has(genotypeEntryAttributes, "att_gene_engineering")) {
            const geneEngineeringAttribute = genotypeEntryAttributes["att_gene_engineering"][0]

            if (geneEngineeringAttribute.text === "Knockout") {
                entryName += ".KO"
            }
            else if (geneEngineeringAttribute.text === "Knockin") {
                entryName += ".KI"
            }
        }

        if (_.has(genotypeEntryAttributes, "att_protein_mutation") && genotypeEntryAttributes["att_protein_mutation"].length > 0) {
            const mutations_with_priority = genotypeEntryAttributes["att_protein_mutation"].map(mutationAttribute => {
                const mutateAttributeTag = mutationAttribute.tag
                if (!_.has(genotypeEntryAttributes["att_protein_position"], mutateAttributeTag)) return { p: undefined, mutation_attribute_value: mutationAttribute, attribute_value: undefined }
                const position = genotypeEntryAttributes["att_protein_position"][mutateAttributeTag]
                if (position.attribute_value.text == "C-term") return { p: Infinity, mutation_attribute_value: mutationAttribute, attribute_value: position.attribute_value }
                if (position.attribute_value.text == "N-term") return { p: -Infinity, mutation_attribute_value: mutationAttribute, attribute_value: position.attribute_value }
                if (_.isArray(position.aa_position)) return { p: position.aa_position.at(0), mutation_attribute_value: mutationAttribute, attribute_value: position.attribute_value }
            })
            const sorted_mutations = _.sortBy(mutations_with_priority.filter(v => _.isObject(v) && v.p !== undefined), "p")

            sorted_mutations.forEach(mutation => {
                entryName = getMutationAbbr(entryName, mutation, genotypeEntryAttributes)
            })
        }


        //console.log(genotypeEntryAttributes["att_gene_zygosity"])
        if (_.has(genotypeEntryAttributes, "att_gene_zygosity") && genotypeEntryAttributes["att_gene_zygosity"][0].value !== "unknown") {
            entryName += "."+genotypeEntryAttributes["att_gene_zygosity"][0].value
        }
        if (entryIdx > 0) {
            baseName += " " + entryName
        }
        else {
            baseName += entryName
        }
        
    })
    
    return baseName
}

