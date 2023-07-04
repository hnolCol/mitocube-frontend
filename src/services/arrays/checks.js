import _ from "lodash"

export function areAllValuesArrays(object) {
    let arrayCheckForValues = Object.values(v => _.isArray(v))
    return _.every(arrayCheckForValues)
}



export function areAllValuesNumbers(array) {
    return _.every(array,x=>_.isNumber(x) && !_.isNaN(x))
}