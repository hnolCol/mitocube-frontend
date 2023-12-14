
import _ from "lodash"

export function readLinesAndColumnNamesFromTxtFile({ readEvent, lineSplit = "\n", cellSplit = "\t" }) {
    //read lines and columns from a read event. 
    //replace the mac / windows specific new line insertions.
    console.log(readEvent)
    let lines = readEvent.target.result.replace(/\r\n/g,lineSplit).split(lineSplit)
    const columnNames = lines[0].split(cellSplit)
    const dataArray = _.range(1, lines.length).map(idx => lines[idx].split(cellSplit)) //skip column names
    return {columnNames, dataArray}
}