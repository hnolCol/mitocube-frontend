
import PropTypes from "prop-types"
import { Combobox } from "../../../core/input/Combobox"
import TextInput from "../../../core/input/Text"

import { Column, Table2, ColumnHeaderCell, EditableName, SelectionModes, EditableCell2, Cell, RegionCardinality, RowHeaderCell } from "@blueprintjs/table"
import { EditableText, HotkeysProvider, InputGroup, Menu, MenuItem, Popover, Tag, TagInput, H4, Button, MenuDivider, NumericInput} from "@blueprintjs/core"
import AttributeInput from "./AttributeCombo"
import { useMemo, useState } from "react"
import { filterArrayBySearchString, filterArrayOfObjects } from "../../../../services/arrays/filter"
import _ from "lodash"
import NumericValueInput from "../../../core/input/Numeric"

AttributeGrouping.propTypes = {
    sampleNames: PropTypes.arrayOf(PropTypes.string),
    attributes: PropTypes.arrayOf(PropTypes.object),
    attributeValuesByID : PropTypes.object
}

function AttributeGroupingButton({
    columnIndex,
    attributes = [],
    groupingName = "",
    attributeName = "attribute type ...",
    attributesTagsInUse = [],
    onGroupingSelect = undefined,
    onGroupingRename = undefined,
    disabled = false }) {
    // const [groupingName, setGroupingName] = useState("")
    const groupingIndex = columnIndex-1
    return (
        <div>
            <H4><EditableText
                defaultValue=""
                value={groupingName}
                onChange={groupingNameEdit => onGroupingRename(groupingIndex,groupingNameEdit)}
                onConfirm={() => onGroupingSelect(groupingIndex, groupingName, undefined)}/></H4>
                
            <Combobox
                items={attributes.filter(a => !attributesTagsInUse.includes(a.tag)).map(a => a.name)}
                value={attributeName}
               // disabled={groupingName.length < 2}
                buttonProps={{ minimal: true, fill: false, disabled}}
                callbackKey={groupingName}
                onChange={(callbackKey, attributeName) => onGroupingSelect(groupingIndex, groupingName, filterArrayOfObjects({
                    array: attributes,
                    keyName: "name", 
                    keyValue: attributeName
                })[0])} />
        </div>
    )
}


function AttributeContextMenuSearch({attributeTag ,attributeValues, onAttributeSelect, rowIdces = [], clearAttributeTableByRowIndex = undefined}) {
    const [queryString, setQuery] = useState("")
    let attributeValueBySearchQuery = useMemo(() => queryString === ""? attributeValues:filterArrayBySearchString({searchString : queryString, array : attributeValues, searchColumns : ["name","details"]}),[queryString])
    return (
        <Menu>

                <TextInput
                    value={queryString}
                    callbackKey={"a"}
                    placeholder="Search attribute value..."
                    onChange={(key,value,type) => setQuery(value)}
                    
                />
                <Menu style={{ overflowY: "scroll", maxHeight: "280px" }}> 
                {attributeValueBySearchQuery.map(attributeValue =>
                    <MenuItem
                        onClick={(e) => onAttributeSelect(attributeTag,attributeValue.tag,rowIdces)}
                        key={attributeValue.name}
                        text={attributeValue.name}
                        label={attributeValue.details}
                        role="listoption" />)}
            </Menu>
            <MenuDivider />
            <MenuItem text={`Clear Selection (${rowIdces.length} rows)`} icon="clean" onClick={() => clearAttributeTableByRowIndex(rowIdces,attributeTag)}/>
            </Menu>
    )
}



function AttributeGrouping({
    sampleNames = [],
    attributeTable = [],
    attributes = [],
    attributeValuesByID = {},
    groupings = [],
    onAttributeSelect,
    addGrouping = undefined,
    onGroupingSelect = undefined,
    onGroupingRename = undefined,
    onTagRemove = undefined,
    removeGroupingByIndex = undefined,
    clearGroupingByIndex = undefined,
    clearAttributeTableByRowIndex=undefined,
    rerenderTableDependency = 0,
    }) {

    const [selectedRows, setSelectedRows] = useState([])

    const isGroupingAttributeDefined = (columnIndex) => {
        const groupingAttribute = getGroupingAttributeByColumnIndex(columnIndex)
        if (!_.isObject(groupingAttribute)) return [false, undefined]
        if (!_.has(groupingAttribute, "tag")) return [false, undefined]
        return [true, groupingAttribute]
    }

    const getGroupingInfoByColumnIndex = (columnIndex) => {
        //returns the grouping info by column index
        return groupings[columnIndex - 1] //first column blocked
    }

    const getGroupingAttributeByColumnIndex = (columnIndex) => {
        const groupingInfo = getGroupingInfoByColumnIndex(columnIndex)
        if (!_.isObject(groupingInfo)) return undefined
        return groupingInfo.attribute
    }

    const renderBodyContextMenu = (r) => {
        // render context menu for attributes
        let targetColumns = r.target.cols
        let columnIndex = targetColumns[0]
        if (columnIndex === 0) return <Menu><MenuItem text="Samples names" disabled={true} /></Menu>
        if (sampleNames.length === 0) return <Menu><MenuItem text="Set number of samples first." disabled={true} /></Menu>
        let groupingInfo = groupings[columnIndex - 1] //first column blocked
        const [attributeDefined, attribute] = isGroupingAttributeDefined(columnIndex)

        if (!attributeDefined) return <Menu><MenuItem text="Please select attribute type" disabled={true} /></Menu>
        //find row indices from the selected region
        
        let attributeValues = groupingInfo === undefined ? [] : attributeValuesByID[groupingInfo.attribute.id]
        // if there is no attribute values, then a numeric value can be inserted by the user
        if (!_.isArray(attributeValues)) return (<Menu>
            
            <MenuItem text="Enter numeric value." disabled={true} />
            <NumericValueInput
                placeholder={`${groupingInfo.attribute.name}`}
                callbackKey={groupingInfo.attribute.tag}
                submitButton={true}
                buttonProps={{
                    intent: "primary",
                    icon: "rocket"
                }}
                onButtonClick={(attributeTag, attributeValue) => onAttributeSelect(attributeTag, parseInt(attributeValue), selectedRows)}
                />
            {selectedRows.length > 0 ?
                <Menu>
                <MenuDivider />
                    <MenuItem text={`Clear Selection (${selectedRows.length} rows)`} icon="clean" onClick={() => clearAttributeTableByRowIndex(selectedRows, groupingInfo.attribute.tag)}/> 
                </Menu>: null}
            </Menu>)
        
        return (
            <AttributeContextMenuSearch
                {...{ onAttributeSelect, rowIdces : selectedRows, clearAttributeTableByRowIndex }}
                attributeValues={attributeValues}
                attributeTag={groupingInfo.attribute.tag}
               />
        )
    }

    const renderCell = (rowIndex, columnIndex) => {
        const cellKey = `${rowIndex}-${columnIndex}`
        //checks
        if (columnIndex === 0) {
            return <Cell key={cellKey}>
                {sampleNames.length === 0? "Adjust sample number" : sampleNames[rowIndex]}
            </Cell>
        }

        if (rowIndex >= sampleNames.length) return <Cell key={cellKey}></Cell>

        const [attributeDefined, attribute] = isGroupingAttributeDefined(columnIndex)
       // const attribute = getGroupingAttributeByColumnIndex(columnIndex)
        if (!attributeDefined || attributeTable.length <= rowIndex) return <Cell key={cellKey}></Cell>
        const attributeTag = attribute.tag
        let cellData = attributeTable[rowIndex][attributeTag]
        if (!_.isArray(cellData)) return <Cell key={cellKey}></Cell>
        return <Cell key={cellKey}>
            <div className="flex flex--wrap center-items">
                {_.isArray(cellData) && cellData.length === 0 ? "" : cellData.map(attributeValueTag =>
                    <div key={`${rowIndex}-${columnIndex}-${attributeValueTag}`} className="padding--little">
                        <Tag minimal={true} onRemove={() => onTagRemove(rowIndex, attribute, attributeValueTag)}>
                            {attributeValueTag}
                        </Tag>
                    </div>)}
            </div>
        </Cell>
    }

    const renderGroupingHeaderMenu = (columnIndex) => {
        const groupingInfo = getGroupingInfoByColumnIndex(columnIndex)
        const [attributeDefined, attribute] = isGroupingAttributeDefined(columnIndex)
        const missingAttributeValues = attributeDefined?attributeTable.filter(rowData => _.isArray(rowData[attribute.tag])?rowData[attribute.tag].length === 0:true).length:attributeTable.length
        const allSamplesDefined = missingAttributeValues === 0
        const groupingIdx = columnIndex - 1
        const nameDefined = _.isString(groupingInfo.name) && groupingInfo.name.length > 0
        return (
            <Menu small={true}>
                <MenuItem text="Grouping" disabled={true} />
                <MenuDivider />
                <MenuItem text={nameDefined ? `Name : ${groupingInfo.name}` : "Name missing."} intent={nameDefined?"none":"danger"} />
                <MenuItem text={allSamplesDefined ? "Attribute values defined." : `${missingAttributeValues} attribute values missing.`} intent={allSamplesDefined?"primary":"danger"}/>
                <MenuDivider />
                <MenuItem text="Clear" icon="clean" onClick={() => clearGroupingByIndex(groupingIdx, attribute.tag)} disabled={!attributeDefined} />
                <MenuItem text="Delete" icon="cross" onClick={() => removeGroupingByIndex(groupingIdx)} />
                
            </Menu>)
    }

    const renderGroupingHeader = (columnIndex) => {

        const groupingInfo = groupings[columnIndex - 1] //first column blocked
        const groupingDefined = _.isObject(groupingInfo)
        const attributesTagsInUse  = groupings.filter(groupingInfo => _.isObject(groupingInfo) && _.has(groupingInfo.attribute,"tag")).map(groupingInfo => groupingInfo.attribute.tag)
        return (
            <ColumnHeaderCell menuRenderer={renderGroupingHeaderMenu}>
                <div className="margin--little">
                    <AttributeGroupingButton
                        {...{
                            attributes,
                            onGroupingSelect,
                            columnIndex,
                            attributesTagsInUse,
                            onGroupingRename,
                            disabled : sampleNames.length === 0,
                            groupingName : groupingDefined && _.isString(groupingInfo.name)? groupingInfo.name : undefined,
                            attributeName: groupingDefined && _.isObject(groupingInfo.attribute) ? groupingInfo.attribute.name : undefined
                        }} />
                </div>
            </ColumnHeaderCell>)
    }

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

        setSelectedRows(rows)
    }

    const selectedRegionTransform = (e) => {
        //cell selection to full row selection transformation
        return {
            rows: e.rows
        }
    }
    return (
    
        <div style={{paddingTop:"1rem",paddingBottom:"1rem",height:"500px",overflowY:"hidden"}}>
            <HotkeysProvider>
                <Table2
                    numRows={sampleNames.length + 1}
                    cellRendererDependencies={[rerenderTableDependency]}
                    bodyContextMenuRenderer={renderBodyContextMenu}
                    defaultRowHeight={30}
                    selectionModes={SelectionModes.CELLS}
                    //columnWidths={_.concat([220],_.range(groupings.length).map(_ => undefined),[50])}
                    minColumnWidth={220}
                    onSelection={handleSelection}
                    selectedRegionTransform={selectedRegionTransform}>
                    <Column
                        cellRenderer={renderCell}
                        columnHeaderCellRenderer={() => <ColumnHeaderCell><div className="margin--little"><H4>Sample Run</H4></div></ColumnHeaderCell>} />
                    {groupings.map((groupInfo,groupIdx) =>
                        <Column key={`${groupInfo.name}-${groupIdx}`} columnHeaderCellRenderer={renderGroupingHeader} cellRenderer={renderCell} />)}
                    <Column columnHeaderCellRenderer={() => <ColumnHeaderCell><div className=" margin--little">
                        <Button icon="plus" onClick={addGrouping} /></div></ColumnHeaderCell>} />
            </Table2>
            </HotkeysProvider>
        </div>
    )
}


export default AttributeGrouping