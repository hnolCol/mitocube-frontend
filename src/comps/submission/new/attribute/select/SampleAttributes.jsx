
import PropTypes from "prop-types"
import { Combobox } from "../../../../core/input/Combobox"
import TextInput from "../../../../core/input/Text"

import { Column, Table2, ColumnHeaderCell, SelectionModes, Cell,} from "@blueprintjs/table"
import { EditableText, HotkeysProvider, Menu, MenuItem, Tag, Button, MenuDivider} from "@blueprintjs/core"
import { useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../../../../services/arrays/filter"
import _ from "lodash"
import NumericValueInput from "../../../../core/input/Numeric"
import { createFakeAttributeValue } from "../../../../../services/attributes"

SamplesAttributes.propTypes = {
    sampleNames: PropTypes.arrayOf(PropTypes.string),
    attributes: PropTypes.arrayOf(PropTypes.object),
    attributeValuesByID : PropTypes.object
}




function AttributeSelectionHeader({
    columnIndex,
    sampleAttrIndex,
    attributes = [],
    groupingName = "",
    attributeName = "attribute type ...",
    attributesTagsInUse = [],
    onSampleAttributeSelect = undefined,
    onSampleAttributeRename = undefined,
    disabled = false }) {
    // table column header that allows to select an attribute -> which then enables the user to select features of that attribute.
    return (
        <div>
            <h4><EditableText
                defaultValue=""
                value={groupingName}
                onChange={groupingNameEdit => onSampleAttributeRename(sampleAttrIndex,groupingNameEdit)}
                onConfirm={() => onSampleAttributeSelect(sampleAttrIndex, groupingName, undefined)}/></h4>
            <Combobox
                items={_.sortBy(attributes.filter(a => !attributesTagsInUse.includes(a.tag)),"name")}
                value={attributeName}
               // disabled={groupingName.length < 2}
                buttonProps={{ minimal: true, fill: false, disabled}}
                callbackKey={groupingName}
                onChange={(callbackKey, attribute) => onSampleAttributeSelect(sampleAttrIndex, groupingName, attribute, true)} />
        </div>
    )
}

function GenotypeContextMenu({ }) {
    
    return (
        <Menu>
            <MenuItem text="Genotypes" disabled={true} />
            <MenuDivider/>
        </Menu>
    )
}

function ReplicateContextMenu({numberReplicates, onReplicateChange, selectedRows }) {
    
    return (
        <Menu>
            <MenuItem text="Replicates." disabled={true} />
            <MenuDivider /> 
            {numberReplicates === 0 ? <MenuItem text="Select the number of replicates above." /> :
                <Menu>
                    <MenuItem text="Fill pattern" disabled={true} />
                    <MenuItem text="1,2,3 ... 1,2,3" onClick={() => onReplicateChange(selectedRows,undefined,0)}/>
                    <MenuItem text={`1,1,1 ... ${_.join([numberReplicates, numberReplicates, numberReplicates], ",")}`}
                        onClick={() => onReplicateChange(selectedRows, undefined, 1)} />
                    <MenuDivider />
                    <NumericValueInput
                        placeholder={`Select replicate`}
                        callbackKey={"replicate"}
                        submitButton={true}
                        buttonProps={{
                            intent: "primary",
                            icon: "rocket"
                        }}
                        minValue = {1}
                        maxValue = {_.toNumber(numberReplicates)}
                        onButtonClick={(callbackKey, replicate) => onReplicateChange(selectedRows,_.toInteger(replicate),undefined)}
                        />
        </Menu>}
    </Menu>
    )
}



export function AttributeContextMenuSearch({attributeTag ,attributeValues, onAttributeSelect, rowIdces = [], clearAttributeTableByRowIndex = undefined}) {
    const [queryString, setQuery] = useState("")
    let attributeValueBySearchQuery = useMemo(() => queryString === "" ? attributeValues : filterArrayBySearchString({
        searchString: queryString,
        array: attributeValues,
        keyNames: ["name", "details"]
    }), [queryString])
    return (
        <Menu>

                <TextInput
                    value={queryString}
                    callbackKey={"a"}
                    placeholder="Search attribute value..."
                    onChange={(key,value,type) => setQuery(value)}
                    
                />
                <Menu style={{ overflowY: "scroll", maxHeight: "280px" }}> 
                {attributeValueBySearchQuery.map((attributeValue, index) =>
                    index === 25 ? <MenuItem key={attributeValue.name} text=" . . . not all items shown, please use the search function.." disabled={true} /> : index > 25 ? null :
                    <MenuItem
                        onClick={(e) => onAttributeSelect(attributeTag, attributeValue,rowIdces)}
                        key={attributeValue.name}
                        text={attributeValue.name}
                        labelElement={<div className="labelelement-wrap--fixed-width">{attributeValue.details}</div>}
                        role="listoption" />)}
            </Menu>
            <MenuDivider />
            <MenuItem text={`Clear Selection (${rowIdces.length} rows)`} icon="clean" onClick={() => clearAttributeTableByRowIndex(rowIdces,attributeTag)}/>
            </Menu>
    )
}



function SamplesAttributes({
    sampleNames = [],
    attributeTable = [],
    attributes = [],
    attributeValuesByID = {},
    groupings = [],
    onAttributeSelect,
    addSampleAttr = undefined,
    onSampleAttributeSelect = undefined,
    onSampleAttributeRename = undefined,
    onTagRemove = undefined,
    removeSampleAttrByIndex = undefined,
    clearSampleAttrByIndex = undefined,
    clearAttributeTableByRowIndex = undefined,
    handleFeatureSelection = undefined,
    rerenderTableDependency = 0,
    onReplicateChange = undefined,
    replicates = [],
    numberReplicates = 0
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
        return groupings[getSampleAttrIndex(columnIndex)] //first column blocked
    }

    const getSampleAttrIndex = (columnIndex) => {
        return columnIndex - 3
    }

    const getGroupingAttributeByColumnIndex = (columnIndex) => {
        const groupingInfo = getGroupingInfoByColumnIndex(columnIndex)
        if (!_.isObject(groupingInfo)) return undefined
        return groupingInfo.attribute
    }


    const handleNumericInput = (numericInput, attrValues, attribute, selectedRows) => {
        const attributeAlreadyPresent = attrValues.filter(attrValue => attrValue.name === _.toString(numericInput))
        console.log(attributeAlreadyPresent)
        if (attributeAlreadyPresent.length > 0) {
            const attrValueMatches = attributeAlreadyPresent[0]
            onAttributeSelect(attribute.tag, attrValueMatches, selectedRows)
        }
        else {
            onAttributeSelect(attribute.tag, createFakeAttributeValue({ ... { attribute, numericInput } }), selectedRows)
        }
    }

    const renderBodyContextMenu = (r) => {
        // render context menu for attributes
        let targetColumns = r.target.cols
        let columnIndex = targetColumns[0]
        if (columnIndex === 0) return <Menu><MenuItem text="Samples names" disabled={true} /></Menu>
        if (sampleNames.length === 0) return <Menu><MenuItem text="Set number of samples first." disabled={true} /></Menu>

        //replicates menu 
        if (columnIndex === 1) return <ReplicateContextMenu {...{ numberReplicates, onReplicateChange, selectedRows }} />
        if (columnIndex === 2) return <GenotypeContextMenu {...{}}/>
        let groupingInfo = groupings[getSampleAttrIndex(columnIndex)] //first column blocked
        const [attributeDefined, attribute] = isGroupingAttributeDefined(columnIndex)

        if (!attributeDefined) return <Menu><MenuItem text="Please select attribute type" disabled={true} /></Menu>
        //find row indices from the selected region
        //attribute.allow_features_as_values ? attributeValuesByID[-1] : 
        let attributeValues = groupingInfo === undefined || !_.has(attributeValuesByID, groupingInfo.attribute.id)? [] : attributeValuesByID[groupingInfo.attribute.id]
        const valuesAlreadyUsed = _.uniq(_.flatten(attributeTable.filter(d => _.has(d,attribute.tag)).map(d => d[attribute.tag].map(attrValue => attrValue.name))))
        // if there is no attribute values, then a numeric value can be inserted by the user
        if (attribute.allow_features_as_values) {
            return <Menu><MenuItem
                text="Select protein sequence..."
                onClick={() => handleFeatureSelection({ attribute, isSampleAttribute: true, rowIdces: selectedRows })} />
            </Menu>
        }
        else if (attribute.allow_numeric_input) return (<Menu>
            
            <MenuItem text="Enter numeric value." disabled={true} />
            <MenuDivider />
            {/* {valuesAlreadyUsed.map(attrValue => <MenuItem text={attrValue} onClick={() => onAttributeSelect(attribute.tag, createFakeAttributeValue({...{attribute, numericInput : attrValue}}), selectedRows)}/>)} */}
            {attributeValues.map(attrValue => <MenuItem
                key={`${attrValue.tag}-${attribute.tag}-numeric-input`}
                text={attrValue.name}
                labelElement={<div className="labelelement-wrap--fixed-width">{attrValue.details}</div>}
                onClick={() => onAttributeSelect(attribute.tag, attrValue, selectedRows)} />)
            }
            
            <NumericValueInput
                placeholder={`${groupingInfo.attribute.name}`}
                callbackKey={groupingInfo.attribute.tag}
                submitButton={true}
                buttonProps={{
                    intent: "primary",
                    icon: "rocket"
                }}
                onButtonClick={(attributeTag, attributeValue) => handleNumericInput(attributeValue,attributeValues,attribute,selectedRows)}  //onAttributeSelect(attributeTag, createFakeAttributeValue({ ... { attribute, numericInput: attributeValue } }), selectedRows)}
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

        if (columnIndex === 1) {
            return <Cell key={cellKey}>
                {replicates[rowIndex]}
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
                {_.isArray(cellData) && cellData.length === 0 ? "" : cellData.map(attributeValue => {
                    const cellDataIsAttr = _.isObject(attributeValue)
                    return <div key={`${rowIndex}-${columnIndex}-${cellDataIsAttr ? attributeValue.tag : attributeValue}`} className="padding--little">
                        <Tag minimal={true} onRemove={() => onTagRemove(rowIndex, attribute, attributeValue)}>
                            {cellDataIsAttr?attributeValue.name:attributeValue}
                        </Tag>
                    </div>})}
            </div>
        </Cell>
    }

    const renderGroupingHeaderMenu = (columnIndex) => {
        const groupingInfo = getGroupingInfoByColumnIndex(columnIndex)
        const [attributeDefined, attribute] = isGroupingAttributeDefined(columnIndex)
        const missingAttributeValues = attributeDefined?attributeTable.filter(rowData => _.isArray(rowData[attribute.tag])?rowData[attribute.tag].length === 0:true).length:attributeTable.length
        const allSamplesDefined = missingAttributeValues === 0
        const sampleAttrIndex = getSampleAttrIndex(columnIndex)
        const nameDefined = _.isString(groupingInfo.name) && groupingInfo.name.length > 0
        return (
            <Menu small={true}>
                <MenuItem text="Sample Attribute" disabled={true} />
                <MenuDivider />
                <MenuItem text={nameDefined ? `Name : ${groupingInfo.name}` : "Name missing."} intent={nameDefined?"none":"danger"} />
                <MenuItem text={allSamplesDefined ? "Attribute values defined." : `${missingAttributeValues} attribute values missing.`} intent={allSamplesDefined?"primary":"danger"}/>
                <MenuDivider />
                <MenuItem text="Clear" icon="clean" onClick={() => clearSampleAttrByIndex(attribute.tag)} disabled={!attributeDefined} />
                <MenuItem text="Delete" icon="cross" onClick={() => removeSampleAttrByIndex(sampleAttrIndex)} />
                
            </Menu>)
    }

    const renderGroupingHeader = (columnIndex) => {
        const sampleAttrIndex = getSampleAttrIndex(columnIndex)
        const groupingInfo = groupings[sampleAttrIndex] //first column blocked
        const groupingDefined = _.isObject(groupingInfo)
        const attributesTagsInUse  = groupings.filter(groupingInfo => _.isObject(groupingInfo) && _.has(groupingInfo.attribute,"tag")).map(groupingInfo => groupingInfo.attribute.tag)
        return (
            <ColumnHeaderCell style={{minHeight : "3rem"}} menuRenderer={renderGroupingHeaderMenu} selectCellsOnMenuClick={false} isColumnSelected={false}>
                <div className="margin--little" style={{minHeight : "80px"}}>
                    <AttributeSelectionHeader
                        {...{
                            sampleAttrIndex,
                            attributes,
                            onSampleAttributeSelect,
                            columnIndex,
                            attributesTagsInUse,
                            onSampleAttributeRename,
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

    const renderDefaultHeader = (headerName) => {

        return <ColumnHeaderCell>
            <div className="margin--little" style={{ minHeight: "80px" }}>
                <h4>{headerName}</h4></div>
        </ColumnHeaderCell>
    }

    const selectedRegionTransform = (e) => {
        //cell selection to full row selection transformation
        if (!_.has(e, "rows")) return { rows: [], cols: [] } //prevents selection of table if column header is selected.
        return {
            rows: e.rows
        }
    }

    return (
    
        <div style={{paddingTop:"1rem",paddingBottom:"1rem",height:"500px",overflowY:"hidden"}}>
            <HotkeysProvider>
                <Table2
                    enableGhostCells={true}
                    numFrozenColumns={1}
                    numRows={sampleNames.length}
                    cellRendererDependencies={[rerenderTableDependency]}
                    bodyContextMenuRenderer={renderBodyContextMenu}
                    defaultRowHeight={30}
                    selectionModes={SelectionModes.CELLS}
                    //columnWidths={_.concat([220],_.range(groupings.length).map(_ => undefined),[50])}
                    minColumnWidth={120}
                    onSelection={handleSelection}
                    selectedRegionTransform={selectedRegionTransform}>
                    <Column
                        cellRenderer={renderCell}
                        columnHeaderCellRenderer={() => renderDefaultHeader("Sample Run")} />
                    <Column
                        cellRenderer={renderCell}
                        columnHeaderCellRenderer={() => renderDefaultHeader("Replicates")} />
                    <Column
                        cellRenderer={renderCell}
                        columnHeaderCellRenderer={() => renderDefaultHeader("Genotype")} />
                    {groupings.map((groupInfo,groupIdx) =>
                        <Column key={`${groupInfo.name}-${groupIdx}`} columnHeaderCellRenderer={renderGroupingHeader} cellRenderer={renderCell} />)}
                    <Column columnHeaderCellRenderer={() => <ColumnHeaderCell><div className=" margin--little">
                        <Button icon="plus" onClick={addSampleAttr} /></div></ColumnHeaderCell>} />
            </Table2>
            </HotkeysProvider>
        </div>
    )
}


export default SamplesAttributes