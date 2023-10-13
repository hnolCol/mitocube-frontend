import _ from "lodash"

export function getUniqueValuesInArrayOfObjects({ data, keyName }) {
    //finds the unique values in an array of objects and extracts the values, returns an array

    if (_.isArray(keyName)) return _.uniq(_.flatten(_.map(data, d => keyName.map(key => d[key]))))

    return _.uniq(_.map(data, d => d[keyName]))
}