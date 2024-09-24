
/**
 * @typedef GenotypeResponse
 * @type {Object}
 * @property {string} label - Unique genotype label
 * @property {string} text - The representative name of the genotype 
 * @property {string} proteome_id - The Uniprot proteome id 
 * @property {import("./feature").Feature[]} features 
 * @property {Object<string, import("./attributes").AttributeValue[]|import("./feature").Feature[]|Object<string, MutationPosition>>} attributes 
 */


/**
 * @typedef MinimalGenotype
 * @type {Object}
 * @property {String} text 
 * @property {String} tag 
 * @property {String} proteome_id
 */


/**
 * @typedef MutationPosition
 * @property {import("./attributes").AttributeValue} attribute_value 
 * @property {Number[]} aa_position - The amino acid positions (start, end)
 * @property {String[]} substitution - The amino acids used for substitution. 
 * @property {String[]} aa - The amino acids of the original feature sequence
 */



export default {}
