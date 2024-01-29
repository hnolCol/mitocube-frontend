/**
 * @typedef DatasetPCAResponse
 * @type {Object}
 * @property {Object[]} projection - The PCA projection (dimensional reduction). Contains an ```'index'``` key for each sample name.
 * @property {Object[]} drivers - The PCA drivers (e.g. features). Contains an ```'index'``` key with the feature id.
 * @property {Number[]} variance_explained - The explained variance sorted by component. 
 * @property {Object<string, string[]>} samples_attributes - Sample attributes for legend. Does not contain the sample index information. 
 */


/**
     * @typedef DatasetContextOutlet
     * @property {import("./submissions").Submission} metadata
     * @property {import("./attributes").AttributesByTagAPIResponse} attributesByTag
    */

export default {}