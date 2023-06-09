import _ from "lodash"

export function areAllValuesArrays(object) {
    let arrayCheckForValues = Object.values(v => _.isArray(v))
    return _.every(arrayCheckForValues)
}