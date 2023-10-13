import _ from "lodash"

export function allKeysInObject({ object, keyNames }) {
    return _.every(_.map(keyNames, keyName => _.has(object,keyName)))
}


export function objectHasKey({ object, keyName }) {
    return _.has(object,keyName)
}