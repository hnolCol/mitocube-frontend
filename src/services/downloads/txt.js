
import _ from "lodash"

export function downloadTxtFile(txtData, fileName) {
    //download txt file
    const element = document.createElement("a");
    const file = new Blob([txtData], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
}
  


/**
 * @description Creates a string from an object key - value to be exported to a text file.
 * @param {Object} props
 * @param {Object} props.obj - The object to create a string from
 * @param {String} props.cellSep - The cell separator string, defaults to tab "\t"
 * @param {String} props.lineSep - Line separator string, defaults to "\n"
 * @param {string[]} props.ignoreKeys - List of keys to be ignored. 
 * @returns {String} Join string, usually to be exported to a tab delimited file. 
 */
export function objectToKeyValueString({ obj, cellSep = "\t", lineSep = "\n", ignoreKeys = []}) {
    return _.toPairs(obj)
        .filter(keyValuePair => !ignoreKeys.includes(keyValuePair[0])) //file ignored key
        .map(keyValuePair => keyValuePair.join(cellSep)).join(lineSep) // join cells and lines 
}

/**
 * 
 * @param {Object} props
 * @param {Object[]} props.array - The array ob objects to be exported. Assumes that all keys are the same for each item in the array. 
 * @param {String} props.cellSep - The cell separator string, defaults to tab "\t"
 * @param {String} props.lineSep - Line separator string, defaults to "\n"
 */
export function arrayObjectsToString({ array = [], cellSep = "\t", lineSep = "\n" }) {
    //find headers 
    const keyNames = _.keys(array[0])
    const headerString = keyNames.join(cellSep)
    const dataString = _.map(array, item => _.map(keyNames, keyName => item[keyName]).join(cellSep)).join(lineSep)
    return `${headerString}\n${dataString}`
}   




export function arrayOfObjectsToTabDel(data = [], headers = [], groupingMapper = {}){
    // options to transform an array ob objects to a tab delimted file 
    // allow to export groupings as well using a groupingMapper
    if (data !== undefined && _.isArray(data) && headers.length === data[0].length) {
     
        const groupings = groupingMapper===undefined?undefined:Object.keys(groupingMapper).map(groupingName => {
            const headersMappedToGroupings = headers.map(headerName => groupingMapper[groupingName][headerName])
            return headersMappedToGroupings.join("\t")  
        })
        const csvDataFromArray = data.map(v => {
            return v.join("\t")    
            }) 
        
        return groupings!==undefined?[headers.join("\t"),groupings.join("\n"),csvDataFromArray.join("\n")].join("\n"):[headers.join("\t"),csvDataFromArray.join("\n")].join("\n")


    }
    else if (data !== undefined && data.length > 0 && _.isObject(data[0])) {
      
        const headers = Object.keys(data[0])

        const groupings = Object.keys(groupingMapper).length === 0 ? undefined : Object.keys(groupingMapper).map(groupingName => {
 
            const headersMappedToGroupings = headers.map(headerName => groupingMapper[groupingName][headerName])
    
            return headersMappedToGroupings.join("\t")  
        })


        const csvData = data.map(v => {
                const dd = headers.map(h => {return v[h]})
                return dd.join("\t")    
                }) 
        return groupings!==undefined?[headers.join("\t"),groupings.join("\n"),csvData.join("\n")].join("\n"):[headers.join("\t"),csvData.join("\n")].join("\n")
    }
    
}   
