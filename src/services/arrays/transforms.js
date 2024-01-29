import _ from "lodash"
import moment from "moment"


export function getValueFromArrayOfObjectsByKey({ data, keyName }) {
    return data.map(d => d[keyName])
}


export function isItemInArrayDeepComp({ array, item }) {
    const itemFound = _.some(array, (i) => _.isEqual(i,item))
    return itemFound
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

export function addItemToArrayOrRemoveItIfPresent({ array, item }) {
    // checks if an item in an array, if there it will remove the item from the array
    // otherswise it will add it to the array.
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



