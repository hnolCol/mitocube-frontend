import _ from "lodash"
export function getUniqueValuesInArrayOfObjects({ data, keyName }) {
    //finds the unique values in an array of objects and extracts the values, returns an array
    return _.uniq(_.map(data, d => d[keyName]))
}