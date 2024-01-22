/**
 * @typedef MinMaxResult 
 * @type {Object}
 * @property {Number} min  - The minimum in the data array 
 * @property {Number} max  - THe maximum in the data array
 */

/**
 * @typedef QuantileResult
 * @type {Object}
 * @property {Number[]} values - The calculated quantiles from the data
 * @property {Number} N - The number of values used for calculations 
 * @property {String[]} labels - Quantile labels (q25, median, q75 .. max )
 * @property {Number} n_removed - If outliers were removed before final quantile calculations, this gives the number of data points that were actually removed. 
 */

export default {}