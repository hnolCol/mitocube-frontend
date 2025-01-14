import _ from "lodash"
import moment from "moment"


export function getValueByKeyAndMergeToString({ array, keyName, joinString = ";" }) {
    if (!_.isArray(array)) return null 
    const extractedData = getValueFromArrayOfObjectsByKey({ data: array, keyName })
    if (extractedData.length > 0) {
        return _.join(extractedData,joinString)
    }
}


export function getValueFromArrayOfObjectsByKey({ data, keyName }) {

    return data.map(d => d[keyName])
}


export function isItemInArrayDeepComp({ array, item }) {
    const itemFound = _.some(array, (i) => _.isEqual(i,item))
    return itemFound
}


/**
 * @description Adds an item (object) to an array of objects using the
 * key 'tag' to determine uniqueness. 
 * @param {Object} param0 
 * @returns 
 */
export function addItemsToArrayByTag({ array = [], item = {} }) {
    
    return _.unionBy(array, [item], 'tag')
}

/**
 * 
 * @param {*} param0 
 * @returns 
 */
export function addItemToArrayOrRemoveIfPresentByTag({ array = [], item = {} }) {

    const itemIndex = _.findIndex(array, ['tag', item.tag])
    if (itemIndex === -1) {
        return _.concat(array, item)
    }
    else {
        _.pullAt(array,itemIndex)
        return array 
    }

}


/**
 * @description  Checks if a string is present in an array of strings.
 * If not it will add it to the array, otherwise remove it. 
 * @param {Object} props 
 * @param {String[]} props.array 
 * @param {String} props.string The  
 * @returns 
 */
export function addStringToArrayOrRemove({ array, string }) {
    if (!_.isArray(array)) return [string] //add string if array is no array.
    const index = _.indexOf(array, string)
    if (index === -1) return _.concat(array, [string])
    return _.filter(array, s => s !== string)
}



export function addStringToArray({ array, string }) {
    if (!_.isArray(array)) return [string] 
    return _.concat(array, [string])
}







export function addItemsToArrayIfNotPresent({ array = [], items = [] }) {
    // checks if an item in an array, if there it will remove the item from the array
    // otherswise it will add it to the array.
    if (array.length === 0) return items 
    const itemsNotInArray = items.filter(item => !isItemInArrayDeepComp({ array, item }))
    if (itemsNotInArray.length === 0) return array 
    return _.concat(array,itemsNotInArray)
}

export function addItemsToArrayOrRemoveItIfPresent({ array, items }) {
    // checks if an item in an array, if there it will remove the item from the array
    // otherswise it will add it to the array.
    const itemsInArray = items.map(item => isItemInArrayDeepComp({ array, item }))
    const arrayInItems = array.map(item => isItemInArrayDeepComp({ array : items, item }))
    
    let filteredItems = items.filter((i, idx) => !itemsInArray[idx])
    let filteredArray = array.filter((i,idx) => !arrayInItems[idx])

    return _.concat(filteredItems,filteredArray)
}

/**
 * 
 * @param {Object} props
 * @param {Array} props.array - The array to the item to or remove if it is already presented 
 * @param {Object} props.item - The item to be added. 
 * @returns {Object[]}  
 * @returns 
 */
export function addItemToArrayOrRemoveItIfPresent({ array, item }) {
    if (item === undefined) return array
    if (!_.isArray(array)) return [item]
    const itemInArray = isItemInArrayDeepComp({array,item})
    if (!itemInArray) return _.concat(array, [item])
    return array.filter(i => !_.isEqual(i,item))
}

export function addItemToArrayIfNotPresent({ array, item }) {
    // checks if an item in an array, if there it will remove the item from the array
    // otherswise it will add it to the array.
    const itemInArray = isItemInArrayDeepComp({array,item})
    if (itemInArray) return array
    return _.concat(array, [item])
}

export function isItemInArrayByTag({ array, item }) {
    
    return _.some(array.map(i => i.tag === item.tag))
}



export function arrayOfObjectsToString({ data = [{}], keyNames = [], cellSplit = "\t", lineSplit = "\n" }){

    const csvDataFromArray = data.map(v => {
        return(
            _.map(keyNames,keyName => v[keyName]).join(cellSplit)
        )
    })
    return [keyNames.join(cellSplit),csvDataFromArray.join(lineSplit)].join(lineSplit)
}


// Date formatting 
export function getAndTransformDatesFromArrayOfObjectsByKey({ data, keyName, dateFormat = "YYYYMMDD" }) {
    // returns any array containing the transformed string dates "asDate" and "asMoment" (used package)
    return data.map(d => {
        const stringAsMoment = moment.unix(d[keyName])
        const formattedDate =  stringAsMoment._d
        return { ...d, asDate: formattedDate, asMoment : stringAsMoment}
    })
}



