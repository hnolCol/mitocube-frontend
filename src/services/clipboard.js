import _ from "lodash"

/**
 * @description A function that takes an array of items (objects) and copies them to clipboard to be exported into a software such as Excel.
 *  *Column Names* are inferred by iterating over all items in data and finding the unique set of keyNames from all items if the property ```keyNames``` array is of length ```0```. 
 * @param {Object} props
 * @param {Object[]} props.data - The data to be copied 
 * @param {String} props.lineSplit - A string that is used to be added to each end of the line. Defaults to ```\n```.
 * @param {String} props.cellSplit - A string that is added to each *cell* (e.g. keyName in each item). Defaults to ```\t```.
 * @param {String[]} props.keyNamesSubset - An array of keyNames that should be exported. If the length equals zero. The columnNames are found by iterating over all items in data and finding the set of unique keys.
 */
export function copyTextToClipboardFromArrayOfObjects({ data = [{}], lineSplit = "\n", cellSplit = "\t", keyNamesSubset = []}) {
    //fuction assumes that all keys are similiar acrros the data array 
    const keyNames = keyNamesSubset.length === 0 ?_.uniq(data.map(item => Object.keys(item))) : keyNamesSubset
    const combinedString = _.join(_.map(data, d => _.join(keyNames.map(k => d[k]), cellSplit)), lineSplit)
    
    const clipboardText = _.join(keyNames,cellSplit) + lineSplit + combinedString 
    navigator.clipboard.writeText(clipboardText)
}

/**
 * @description Simply copies a text to clipboard. 
 * @param {String} text 
 */
export function copyTextToClipboard(text) {
    //navigator.clipboard.write(new ClipboardItem([text]))
    setTimeout(async () => await navigator.clipboard.writeText(text))
}