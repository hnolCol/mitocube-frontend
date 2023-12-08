import _ from "lodash";
import { array } from "prop-types";




/**
 * @description Iterates over an array of objects and finds the indices that match and returns as well data filtered data. 
 * Allows for multiple keyNames
 * @param   {Object}    searchParams - The search parameters.
 * @param   {Object[]}      searchParams.array - The data to filter.
 * @param   {string[]}      searchParams.keyNames The keyName to look for the search string.
 * @param   {string}        searchParams.searchString - The search string. 
 * @return  {Object[]} Returns an array containing matching items(objects)
 */
export function filterArrayBySearchString({array, keyNames, searchString}) {
    // Filter array of objects using a search string, specify the search columns to limit the search to
    // certain keys of the objects. 
    if (!_.isArray(keyNames)) return []
    if (!_.isArray(array)) return []
    if (!_.isObject(array[0])) return []
    const keyNamesToSearch = keyNames.length === 0 ? Object.keys(array[0]) : keyNames
    const re = new RegExp(_.escapeRegExp(searchString), 'i')
    const isMatch = arrayItem => _.some(_.map(keyNamesToSearch.map(v => re.test(arrayItem[v]))))
    return _.filter(array, isMatch)
}


/**
 * @description Iterates over an array of objects and finds the indices that match and returns as well data filtered data. 
 * Allows only for a single keyName. Use the function filterArrayBySearchString for multiple keyNames.
 * @param   {Object}    searchParams - The search parameters.
 * @param   {Object[]}  searchParams.array - The data to filter.
 * @param   {string}    searchParams.keyName The keyName to look for the search string.
 * @param   {string}    searchParams.searchString - The search string. 
 * @return  {Object} - Returns an object with keys idcs (indicies) and data (the filtered data.)
 */
export function filterArrayBySearchStringBySingleKey({array, keyName, searchString}){
    //Returns the data and index which match
    const re = new RegExp(_.escapeRegExp(searchString), 'i')
    const isMatch = i => re.test(i)
    return array.reduce((acc,i,idx) => {
        if (isMatch(i[keyName])) {
            acc.idcs.add(idx)
            acc.data.push(i)
        }
        return acc 
    }, {idcs : new Set(), data : []})
}


/**
 * @description Filters an array ob objects using a specific keyName (key) and keyValue.
 * @param   {Object}    searchParams - The search parameters.
 * @param   {Object[]}  searchParams.array - The data to filter.
 * @param   {string}    searchParams.keyName The keyName to look for the search string.
 * @param   {string|number}    searchParams.keyValue - The value to look for.
 * @return  {Object[]} - Returns the filtered object.
 */
export function filterArrayOfObjects({ array, keyName, keyValue}) {
    return _.filter(array, v => v[keyName] === keyValue)
}





/**
 * @description Remove a specific key of each object in an array.
 * @param   {Object}    searchParams - The search parameters.
 * @param   {Object[]}  searchParams.array - The data to filter.
 * @param   {string}    searchParams.keyName The keyName to look for the search string.
 * @return  {Object[]} - Returns the filtered object.
 */
export function removeKeyInArrayOfObjects({ array = [], keyName = ""}){
    return array.map(o => _.omit(o,keyName))
}


export function clearArrayOfObjectsByKeyName({ array = [], keyName = "", newValue = "" }) {
    return array.map(o => {return{ ...o, [keyName] : newValue}})
}



export function handleSearchTagFiltering({items = [], searchTags = [], headers = []}) {
    //Search tag based array filtering 
    if (!_.isArray(searchTags)) return []
    if (!_.isArray(headers)) return []
    // find items that match search tags
    let itemsMatchingSearchTags = searchTags.map(searchTag => {
        return filterArrayBySearchString(searchTag,items,headers)
    })
    //then find the intersection between all individual searchTag searches
    return  _.uniq(_.intersection(...itemsMatchingSearchTags))
}