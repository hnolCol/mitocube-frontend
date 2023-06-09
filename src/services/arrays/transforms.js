import _ from "lodash"

export function addItemToArrayOrRemoveItIfPresent({ array, item}) {
    // checks if an item in an array, if there it will remove the item from the array
    // otherswise it will add it to the array.
    const itemInArray = array.includes(item)
    if (!itemInArray) return _.concat(array,[item])
    return array.filter(i => i !== item)
}




export function arrayOfObjectsToString(data = [{}],keyNames = [], cellSplit = "\t", lineSplit = "\n"){

    const csvDataFromArray = data.map(v => {
        return(
            _.map(keyNames,keyName => v[keyName]).join(cellSplit)
        )
    })
    return [keyNames.join(cellSplit),csvDataFromArray.join(lineSplit)].join(lineSplit)
}
