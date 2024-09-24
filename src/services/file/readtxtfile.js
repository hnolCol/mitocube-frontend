
import _ from "lodash"
import { arraysInArrayHaveSameLength } from "../arrays/checks";


/**
 * 
 * @param {Object} props
 * @param {import("react").FormEventHandler} props.e 
 * @param {Function} prop.callback
 * @returns - Sets the read result in the callback as an object including columnNames, dataArray,  
 */
export function handleFileInput({ e, callback }) {
    
    callback(prevValues => {return {...prevValues, isLoading : true}})
    const newFiles = e.target.files;
    const fileName = newFiles[0].name;
    const extension = fileName.split(".").at(-1)
    const isSupported = ["txt", "tsv"].includes(extension);
    if (isSupported) {
        const reader = new FileReader()
        reader.onload = (readEvent) => {
            let { columnNames, dataArray } = readLinesAndColumnNamesFromTxtFile({ readEvent })
            const columnNamesWithValues = columnNames.map((columnName, idx) => {
                return { text: columnName, firstValues : _.truncate(_.join(_.range(3).map(rowIdx => dataArray[rowIdx][idx]), ", "), {length : 24, omission : " ..."}) }
            })
            callback(prevValues => {return {...prevValues,isLoading : false, columnNames, dataArray, columnNamesForSelection : columnNamesWithValues}})

        }
        reader.readAsText(e.target.files[0])
    }
}



export function readLinesAndColumnNamesFromTxtFile({ readEvent, lineSplit = "\n", cellSplit = "\t" }) {
    //read lines and columns from a read event. 
    //replace the mac / windows specific new line insertions.
    let lines = readEvent.target.result.replace(/\r\n/g,lineSplit).split(lineSplit)
    const columnNames = lines[0].split(cellSplit)
    const dataArray = _.range(1, lines.length).map(idx => lines[idx].split(cellSplit)) //skip column names
    return {columnNames, dataArray}
}