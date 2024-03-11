import _ from "lodash"

/**
 * @description Checks if all values in an object are array. 
 * @param {Object.<string, []>} object 
 * @returns {Boolean}
 */
export function areAllValuesArrays(object) {
    let arrayCheckForValues = _.mapValues(object, v => _.isArray(v))
    return _.every(arrayCheckForValues)
}


/**
 * @description Checks if all values in the array are a number *AND* not NaN
 * @param {Array} array The array to check 
 * @returns {Boolean} Returns true if all values in an array are not nan and a number.
 */
export function areAllValuesNumbers(array) {
    return _.every(array,x=>_.isNumber(x) && !_.isNaN(x))
}


/**
 * 
 * @param {Array[]} array The input array. 
 * @returns {Boolean} Returns true if all arrays in an array (quantitative matrix) have the same length
 */
export function arraysInArrayHaveSameLength(array) {
    return _.every(array, d => d.length === d[0].length)
}