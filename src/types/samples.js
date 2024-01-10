
/**
 * @typedef AnalyticalRun 
 * @type {Object}
 * @property {String} name - The name of the analytical run (e.g. the file name without extension)
 * @property {String} label 
 * @property {Number} measured_at - The unix time stamp when the run was actually measured/analysed 
 * @property {Number} index - The original index upon submission. 
 * @property {Number} measurment_index - The index (e.g. order) at which the run was measured. Runs are usually scrambled when measured to avoid batch effects. 
 * @property {Number} plate_index - The plate index upon creation of the run list. Bigger project with sample numbers greater than plate wells will have numerous ones. 
 * @property {Number} column_index - The index of the well's columns 
 * @property {Number} row_index - The index of the well's row
 * @property {String} position_label - The label assumes that the rows are labelled by Characters in alphabetical order (A,B,C) while columns are labelled by numbers starting with 1. First top left well would therefore be: ```A1```
 */


/**
 * @typedef RunList
 * @type {Object}
 * @property {Number} created_at 
 * @property {AnalyticalRun[]} runs - The analytical runs (e.g. the actual runs that have been measure). Importantly, the number can be different from the sample number due to fractionation and/or pooling.
 * @property {Number} n_runs - The number of runs in the RunList 
 * @property {String} aggregated_on - The sample attribute name that was used to aggreate the run list. Happens when a quantification technique is used that allows to distinguish the samples in the analytical run such as SILAC, easiTAG or TMT.
 * @property {String} dataset_label - The label of the dataset for which the RunList has been created 
 * @property {Boolean} fractionated - If the samples were fractionated. 
 * @property {Number} n_fractions - The number of fractions. 
 */

export default {}
