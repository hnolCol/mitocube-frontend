import { Cell, Column, ColumnHeaderCell, Table2, SelectionModes } from "@blueprintjs/table";
import { useState } from "react";
import _ from "lodash"






/**
 * @description Table to selected a large number of items in a table view. Is in controlled mode, meaning that you have to handle
 * the item selection using the ```onSelection``` and ```selectedItems``` props. 
 * @param {Object} props
 * @param {String[] | Number[]} props.items - All items avaialble for selection 
 * @param {Number[]} props.selectedItems - The selected items as the list index. 
 * @param {Function} props.onSelection - The function that handles the selection of items. Should modify the ```selectedItems``` props.
 *  */
export function ItemTable({items = [], selectedItems = [], onSelection}) {

    const handleSelection = (selectedRegion) => {
        //handle selection of rows
        let rows = [] 
        if (!_.isArray(selectedRegion)) return 
        if (selectedRegion.length === 0) return 
        if (!_.isObject(selectedRegion[0])) return 
        if (!_.has(selectedRegion[0], "rows")) return 
        if (!_.isArray(selectedRegion[0].rows)) return 
        if (selectedRegion.length > 1) {
            //cmd /ctrl based selection
            // the indiividual selections can have overlapping rows or equal rows
            // hence we need to check for overlapping rows
            // the mapping returns either an integer (row) or an array ( multiple rows)
            // therefore we need to flatten the array first
            rows = _.uniq(_.flatten(selectedRegion.filter(selection => _.has(selection, "rows")).map(selection => {
                if (selection.rows[0] === selection.rows[1]) return selection.rows[0]
                return _.range(selection.rows[0],selection.rows[1]+1)
            })))
        }
        else if (selectedRegion.length === 1 && _.has(selectedRegion[0],"rows")) {
            //drag seelection
            if (selectedRegion[0].rows[0] == selectedRegion[0].rows[1]) {
                rows = [selectedRegion[0].rows[1]]
            }
            else {
                rows = _.range(selectedRegion[0].rows[0],selectedRegion[0].rows[1]+1)
            }
        }
        onSelection(rows)
    }

    const renderCell = (rowIndex, columnIndex) => {
        const cellKey = `${rowIndex}-${columnIndex}`
        return <Cell key={cellKey}>
                {items[rowIndex]}
            </Cell>
    }
    const renderDefaultHeader = (headerName) => {

        return <ColumnHeaderCell>
            <div className="margin--little">
                <h4>{headerName}</h4>
            </div>
        </ColumnHeaderCell>
    }

    const selectedRegionTransform = (e) => {
        //cell selection to full row selection transformation
        if (!_.has(e, "rows")) return { rows: [], cols: [] }
        return {
            rows: e.rows
        }
    }

    return <Table2
        numRows={items.length}
        defaultRowHeight={20}
        defaultColumnWidth={250}
        selectionModes={SelectionModes.CELLS}
        selectedRegions={selectedItems.length > 0 ? selectedItems.map(rowIdx => {return {rows : [rowIdx,rowIdx]}}) : []}
        onSelection={handleSelection}
        selectedRegionTransform={selectedRegionTransform}>
        <Column
            cellRenderer={renderCell} 
            columnHeaderCellRenderer={() => renderDefaultHeader("Column Names")}/>
    </Table2>
}


// <div style={{paddingTop:"1rem",paddingBottom:"1rem",height:"500px",overflowY:"hidden"}}>
// <HotkeysProvider>
//     <Table2
//         enableGhostCells={true}
//         numFrozenColumns={1}
//         numRows={sampleNames.length}
//         cellRendererDependencies={[rerenderTableDependency]}
//         bodyContextMenuRenderer={renderBodyContextMenu}
//         defaultRowHeight={30}
//         selectionModes={SelectionModes.CELLS}
//         //columnWidths={_.concat([220],_.range(groupings.length).map(_ => undefined),[50])}
//         minColumnWidth={120}
//         onSelection={handleSelection}
//         selectedRegionTransform={selectedRegionTransform}>
//         <Column
//             cellRenderer={renderCell}
//             columnHeaderCellRenderer={() => renderDefaultHeader("Sample Run")} />
//         <Column
//             cellRenderer={renderCell}
//             columnHeaderCellRenderer={() => renderDefaultHeader("Replicates")} />
//         <Column
//             cellRenderer={renderCell}
//             columnHeaderCellRenderer={() => renderDefaultHeader("Genotype")} />
//         {groupings.map((groupInfo,groupIdx) =>
//             <Column key={`${groupInfo.text}-${groupIdx}`} columnHeaderCellRenderer={renderGroupingHeader} cellRenderer={renderCell} />)}
//         <Column columnHeaderCellRenderer={() => <ColumnHeaderCell><div className=" margin--little">
//             <Button icon="plus" onClick={addSampleAttr} /></div></ColumnHeaderCell>} />
// </Table2>
// </HotkeysProvider>
// </div>