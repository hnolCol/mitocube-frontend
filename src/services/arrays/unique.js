import _ from "lodash"
/**
 * @description Finds unique values in an array of objects by a given keyName. Works for a single keyName (string) or an array of keyNames. 
 * The unique values will be pooled. To get the unique values by its keyNames use the function ```getUniqueValuesinArayOfObjectsByKey```. 
 * @param {Object} props
 * @param {Object[]} props.data - The array of objects to iterate over.
 * @param {string | string[]} props.keyName - The keyName to check.
 * @returns {string[] | Number[]} Returns an array of unique values which might be string or number. Pools the unique values if multiple keyNames are given. Undefined is removed. 
 */
export function getUniqueValuesInArrayOfObjects({ data, keyName }) {
    //finds the unique values in an array of objects and extracts the values, returns an array

    if (_.isArray(keyName)) return _.uniq(_.flatten(_.map(data, d => keyName.map(key => d[key]))))

    return _.uniq(_.map(data, d => d[keyName])).filter(i => i !== undefined)
}