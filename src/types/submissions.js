
/**
 * @typedef TimelineEntry
 * @type {Object}
 * @property {Number} id - Identifier of the entry
 * @property {String} label - Unique string label of the timeline
 * @property {Number} created_on - The unix timestamp when timeline was created
 * @property {Number} state - Integer to indicate the state. 
 * @property {String} comment - Comment for the timeline entry.
 * @property {String} user_label - The user label of the user that created the timeline entry.
*/


/**
 * @typedef Timeline
 * @type {Object}
 * @property {Number} created_on - The unix timestamp when timeline was created
 * @property {Number} modified_on - The unix timetamp of last modification
 * @property {String} label - Unique string label of the timeline
 * @property {TimelineEntry[]} entries - The entries of the timelie.
*/


/**
 * @typedef Submission
 * @type {Object}
 * @property {Number} created_on - The unix time stamp when the submission was created 
 * @property {String} label - The label of the submission (unique string) 
 * @property {String} title - The title of the submission 
 * @property {Number} state - The state the submission is in. 
 * @property {String} user_label - The user_label which owns the submission. 
 * @property {string[]} collaborators - Array of user_labels that collaborate on this project with each other. Does not include the user_label
 * @property {Object.<string, import("./attributes").AttributeValue[] | import("./feature").Feature[]>} dataset_attributes - Object/Dict of attribute_tag - atributeValues_tags in an array 
 * @property {import("./attributes").SampleAttributes} samples_attributes - Sample attriutes which assing each sample to a group.
 * @property {string[]} sample_names - The sample names of the submission. The sample attributes link to the index of the sample names in the value array.
 * @property {Number} n_samples - The number of samples in the submission.
 * @property {Number[]} replicates - The array of replicates matching the sample names.
 * @property {Object} links - The links conneced to the dataset
 * @property {Timeline} timeline - The submission time line.
 * @property {Runlist} runlist - Runlist that has been created for the submission 
*/


/**
 * @typedef WellPosition
 * @type {Object}
 * @property {Number} row - The row index
 * @property {Number} column - The column index.
 */


/**
 * @typedef Runlist 
 * @type {Object}
 * @property {Run[]} runs - List of runs 
 * @property {String} submission_label - The label for which the runlist has been created.   
 * @property {Number} n_plates - The number of plates. 
 * @property {Number} n_fractions - The number of fractions. 
 * @property {Number} n_runs - The total number of runs.
 * @property {Boolean} fractionate - If fracationation has been enabled. 
 * @property {String} aggregate_on - If samples are pooled, the name of the samples attributes that was used to aggregate the samples. 
 * @property {Number} created_on - The unix time stamp. 
 * @property {String} user_label - The database user label 
 * @property {String} user_firstname - The users first name that created the runlist
 * @property {String} user_email - The email of the user that created the runlist 
 * @property {String} user_lastname - The user's last name 
 */

/**
* @typedef Run 
* @type {Object}
* @property {String} name - The name of the run (e.g. the raw files name.)
* @property {Number} column_index - The column index starting at index 0 
* @property {Number} row_index - The row index starting at index 0
* @property {String} position_label - The position label (e.g. A1, D12)
* @property {String} label - Pseudo random label of a run  
* @property {Number} index
* @property {Number} measurement_index
* @property {Number[]} aggregated_samples 
* @property {Number} measured_at
* @property {Number} plate_index
*/

export default {}

