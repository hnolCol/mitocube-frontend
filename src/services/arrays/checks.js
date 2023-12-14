import _ from "lodash"

export function areAllValuesArrays(object) {
    let arrayCheckForValues = _.mapValues(object, v => _.isArray(v))
    return _.every(arrayCheckForValues)
}



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