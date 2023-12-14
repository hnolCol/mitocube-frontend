
import _ from "lodash"


/**
 * @description Saves an item in local storage.
 * @param {Object} props
 * @param {string} props.itemName - The item name in the local storage
 * @param {*} props.itemValue - The item value.
 */
export const saveInLocalStorage = ({itemName,itemValue}) => {
    localStorage.setItem(itemName,itemValue)
}


/**
 * @description Checks for an item in the local storage.
 * @param {Object} props
 * @param {String} itemName - The itemName to look for in the local storage. Returns null if not present.
 * @param {Booealn} parseJson - If True, ```JSON.parse()```will be called prior returning the item from the local storage.
 * @returns 
 */
export function getItemFromLocalStorage ({ itemName, parseJson = false }){
    const itemValue = localStorage.getItem(itemName)
    const itemFound = _.isString(itemValue)
    return { itemFound, itemValue: parseJson && itemFound?JSON.parse(itemValue):itemValue }
}
/**
 * @description Removes an item by its name from the loca storage
 * @param {String} itemName - The item name in the local storage that should be deleted. 
 */
export const removeItemFromLocalStorage = (itemName) => {
    // token removed from local storage.
    if (localStorage.getItem(itemName) !== null){
        localStorage.removeItem(itemName)
    }
}