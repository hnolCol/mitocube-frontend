import _ from "lodash"
import { getDomainWithBoundaries, getBoundariesFromArrayOfObjects, addMarginToBoundaries, getChartWidthAndHeightWithMargins } from "@mitocube/viz/src/utils/border"
import { getQuantilesInArrayByKeyNames } from "@mitocube/viz/src/utils/stats"

/**
 * @description Returns the absolute maximum number of an array of numbers. 
 * @param {Number[]} data - The array of numbers to get the maximal value from.  
 * @returns {Number} - The maximum absolute value. 
 */
export function getMaxAbsoluteValue(data) {
    return _.max(_.map(data, v => Math.abs(v)))
}

/**
 * 
 * @param {Object} props
 * @param {Object[]} props.data - The data array of objects. Each item[keyName] is validated to be a number.  
 * Hence a keyName might also be missing in an item of the array. It will simply ignore. If a keyName is missing in all items
 * then the function will return -Infinity / Infinity for min and max. 
 * @param {String[]} props.keyNames - Array of keyNames that are used to access the numeric data in the data array for each item. 
 * @returns {Object.<string, import("../../types/calculations").MinMaxResult>} 
 */
export function getMinMaxForMultipleKeyNames({data = [], keyNames = ["x","y"]}){
    const minMaxByKeyName = Object.fromEntries(keyNames.map(keyName => {return [keyName, {min : Infinity, max : -Infinity}]}))
    return data.reduce((p,c) => {        
        _.forEach(keyNames, keyName => {            
            const v = c[keyName]
            if (_.isNumber(v)) {
                if (v >  p[keyName].max ) {
                    p[keyName].max = v
                }
                if (v < p[keyName].min){
                    p[keyName].min = v
                }
            }
        })   
        return p 
    },minMaxByKeyName)
}

export { getDomainWithBoundaries, getBoundariesFromArrayOfObjects, addMarginToBoundaries, getChartWidthAndHeightWithMargins, getQuantilesInArrayByKeyNames }
