
/**
 * @typedef FeatureDataResponse
 * @type {Object}
 * @property {string} feature_id - The feature id (e.g. for proteomics likely the uniprot id) 
 * @property {string[]} dataset_labels - The labels of the datasets in which the feature id was found. 
 * @property {Object<string, Object[]>} data - The actual data, object with keys (dataset_labels) and values (data as arrays of objects). They also contain the annotated sample attributes
 * @property {Object<string, Object>} attribute_samples - Samples attributes object with keys as dataset_labels and values (samples attributes)
 * @property {Object<string, string} title_by_label - The title of the dataset by its dataset_label
 */


/**
 * @typedef Feature 
 * @type {Object}
 * @property {String} key
 * @property {String} gene_name - The primary gene name from the Uniprot Database 
 * @property {String} gene_names - The gene names from Uniprot including synonyms 
 * @property {String[]} proteome_tags - The Uniprot proteome reference. 
 * @property {String} protein_name - Te protein name 
 * @property {String} tag - The uniprot identifier 
 * @property {Number} aa_length - The length of the protein in amino acids 
 */


export default {}
