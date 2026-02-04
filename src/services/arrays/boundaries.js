import _ from "lodash"
import { getQuantiles } from "../statistics/quantiles"

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

/**
 * @description Calculates the boundaries from a data array using keyNames. In additional it adds 
 * a margin to the boundaries using 8% of the euclidean distance between min and max. 
 * @param {Object} props
 * @param {Object[]} props.data - The data array of objects of type [{x : 2},{x : 1}, ...]
 * @param {String | String[]} props.keyName - The keyNames to access the data in the data array. 
 * @returns {import("../../types/calculations").MinMaxResult} - The boundaries e.g. axis limits. 
 */
export function getDomainWithBoundaries({ data, keyName, frac = 0.08}) {
    const domain = getBoundariesFromArrayOfObjects({ data , keyName })
    const domainWithMargin = addMarginToBoundaries({ domain: domain, frac })
    return domainWithMargin    
}


/**
 * @description Calculated the min and maximum in an array of objects. 
 * Data are filtered using ``_.isNumber()`` on individual items in the data for each keyName. If multiple keyNames are provided, then 
 * a global min and max are calculated. If you you want to get them by keyName use the function ``getMinMaxForMultipleKeyNames({data, keyNames})``. 
 * @param {Object} props
 * @param {Object[]} props.data - The data array each item must contain the keyName for which the boundaries (e.g. most likely axis limits)
 * should be calculated.
 * @param {String} props.keyName - The keyName(s) to get the data to calculate boundaries /e.g min and max.
 * @returns {Object} The minimum and maximum of the data accessed by the keyName(s). If multiple keyNames
 * are provided, the minimum in flattened data are provided. 
 * @returns {import("../../types/calculations").MinMaxResult} - The min max in the data array. 
 */
export function getBoundariesFromArrayOfObjects({ data = [{ x: 1 }, { x: 2 }], keyName = "x"}) {
    if (_.isArray(keyName)) {     
        return (
            {
                min: _.min(data.map(d => _.min(_.filter(keyName, key => _.isNumber(d[key])).map(key => d[key])))),
                max: _.max(data.map(d => _.max(_.filter(keyName, key => _.isNumber(d[key])).map(key => d[key]))))
            } 
    )   
    }


    const filteredData = data.filter(d => _.isNumber(d[keyName]))
    
    return ({
            min: _.minBy(filteredData, keyName)[keyName],
            max: _.maxBy(filteredData, keyName)[keyName]
        }
    )
}


export function addMarginToBoundaries({ domain = { min: 1, max: 2 }, frac = 0.1 }) {
    //adds some margin to a domain which can be used for plotting.
    var m = Math.sqrt(Math.pow(domain.max-domain.min, 2)) * frac
    if (m === 0) m += 1 // add 1 if boundary is zero. 
    return (
        {
            min: domain.min - m,
            max : domain.max + m 
        }
    )
}


/**
 * 
 * @param {Object} props 
 * @param {Object[]} props.data - Array of objects 
 * @param {String[]} props.keyNames - Array of keyNames to calculate the quantiles for. 
 * @returns {Object.<string, import("../../types/calculations").QuantileResult>} 
 */
export function getQuantilesInArrayByKeyNames({ data, keyNames }) {
    const quantiles =  _.map(keyNames, keyName => {
        return ([keyName, getQuantiles(_.map(data, d=>d[keyName]),[0.25,0.5,0.75], 1.8, false)])
    })
    return _.fromPairs(quantiles)
}