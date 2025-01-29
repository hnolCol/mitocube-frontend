import _ from "lodash"

/**
 * @description Check if all keys are present in an object. 
 * @param {Object} props 
 * @param {Object} props.object 
 * @param {String[]} props.keyNames - Array of keys that should be present. 
 * @returns {Boolean} 
 */
export function allKeysInObject({ object, keyNames }) {
    return _.every(_.map(keyNames, keyName => _.has(object,keyName)))
}


export function objectHasKey({ object, keyName }) {
    return _.has(object,keyName)
}


export function checkForKey({ object, keyName, defaultValue }) {
    if (_.has(object, keyName)) return object[keyName]
    return defaultValue
}