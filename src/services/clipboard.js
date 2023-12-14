import _ from "lodash"


export function copyTextToClipboardFromArrayOfObjects({ data = [{}], lineSplit = "\n", cellSplit = "\t"}) {
    //fuction assumes that all keys are similiar acrros the data array 
    const keyNames = Object.keys(data[0])
    const combinedString = _.join(_.map(data, d => _.join(keyNames.map(k => d[k]), cellSplit)), lineSplit)
    
    const clipboardText = _.join(keyNames,cellSplit) + lineSplit + combinedString 
    navigator.clipboard.writeText(clipboardText)
}


export function copyTextToClipboard(text) {
    //navigator.clipboard.write(new ClipboardItem([text]))
    setTimeout(async () => await navigator.clipboard.writeText(text))
}