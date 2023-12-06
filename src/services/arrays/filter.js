import _ from "lodash";
import { array } from "prop-types";

export function filterArrayBySearchString({searchString = "", array = [], searchColumns = []}) {
    // Filter array of objects using a search string, specify the search columns to limit the search to
    // certain keys of the objects. 
    if (!_.isArray(searchColumns)) return []
    if (!_.isArray(array)) return []
    if (!_.isObject(array[0])) return []
    const columnsToSearch = searchColumns.length === 0 ? Object.keys(array[0]) : searchColumns
    const re = new RegExp(_.escapeRegExp(searchString), 'i')
    const isMatch = arrayItem => _.filter(columnsToSearch.map(v => re.test(arrayItem[v]))).length > 0
    return _.filter(array, isMatch)
}


export function filterArrayBySearchStringBySingleKey({array = [], keyName = "", searchString = ""}){
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

export function filterArrayOfObjects({ array = [], keyName = "", keyValue = "" }) {
    return _.filter(array, v => v[keyName] === keyValue)
}

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