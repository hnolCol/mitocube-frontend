
/**
 * @typedef FeatureDataResponse
 * @type {Object}
 * @property {string} feature_id - The feature id (e.g. for proteomics likely the uniprot id) 
 * @property {string[]} dataset_labels - The labels of the datasets in which the feature id was found. 
 * @property {Object<string, Object[]>} data - The actual data, object with keys (dataset_labels) and values (data as arrays of objects). They also contain the annotated sample attributes
 * @property {Object<string, Object>} attribute_samples - Samples attributes object with keys as dataset_labels and values (samples attributes)

*/


/**
 * @typedef Feature 
 * @type {Object}
 * @property {String} key
 * @property {String} genes
 * @property {String} organism 
 * @property {String} proteins
 * @property {Number} aa_length 
 */


export default {}
