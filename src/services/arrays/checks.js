import _ from "lodash"

export function areAllValuesArrays(object) {
    let arrayCheckForValues = _.mapValues(object, v => _.isArray(v))
    return _.every(arrayCheckForValues)
}



export function areAllValuesNumbers(array) {
    return _.every(array,x=>_.isNumber(x) && !_.isNaN(x))
}