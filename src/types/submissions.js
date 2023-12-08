
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
 * @property {Object.<string, string[]>} dataset_attributes - Object/Dict of attribute_tag - atributeValues_tags in an array 
 * @property {Object.<string, Object>} samples_attributes - Sample attriutes as 
 * @property {string[]} sample_names - The sample names of the submission. The sample attributes link to the index of the sample names in the value array.
 * @property {Number} n_samples - The number of samples in the submission.
 * @property {Number[]} replicates - The array of replicates matching the sample names.
 * @property {Object} links - The links conneced to the dataset
 * @property {Timeline} timelie - The submission time line.
*/


export default {}
// created_on : float
// modified_on : Optional[float] = None
// state : SubmissionStates
// label : str
// title : str
// user_label : str
// collaborators : List[str]
// replicates : List[int]
// sample_names : List[str]
// n_samples : int
// metatext : Dict[str,str] = {}
// dataset_attributes : Dict[str,List[str]]
// samples_attributes : Dict[str,SampleAttributeFromDB]
// links : List[SubmissionLink] = []
// timeline : Timeline = Field(...,default_factory=Timeline)
