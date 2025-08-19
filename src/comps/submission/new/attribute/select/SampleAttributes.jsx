
import PropTypes from "prop-types"

import { Column, Table2, ColumnHeaderCell, SelectionModes, Cell,} from "@blueprintjs/table"
import { HotkeysProvider, Menu, MenuItem, Tag, Button, MenuDivider } from "@blueprintjs/core"
import { useState } from "react"
import _ from "lodash"

import { ReplicateMenu } from "./menu/ReplicateMenu"
import { AttributeContextMenuSearch } from "./menu/AttributeMenu"
import { GenotypeContextMenu } from "./menu/GenotypeMenu"
import { TraitWithValueInput } from "../../../../core/base/tags/TagWithTooltip"


import hooks from "@mitocube/api-hooks"
import { AttributeInput } from "../../../../core/input/api/AttributeInput"



SamplesAttributes.propTypes = {
    sampleNames: PropTypes.arrayOf(PropTypes.string),
    attributes: PropTypes.arrayOf(PropTypes.object),
    attributeValuesByID : PropTypes.object
}


function AttributeSelectionHeader({
    selected_attribute_tag,
    sampleAttrIndex,
    attributesTagsInUse = [],
    onSampleAttributeSelect,
    disabled = false }) {
   
    const {data : attribute} = hooks.attributes.useGetAttribute({tag : selected_attribute_tag},{enabled : _.isString(selected_attribute_tag)})
    const attributeSelected = _.isObject(attribute) && _.has(attribute,"text")
    return (
        <div style={{marginRight : "2rem"}}>
            {<AttributeInput {...{
                text: attributeSelected ? attribute.text : "",
                attribute_group : "sample",
                min_state: 0, disabled,
                onItemSelect: (attribute_tag) => onSampleAttributeSelect(sampleAttrIndex, attribute_tag)
            }} />}
        </div>
    )
}


SamplesAttributes.propTypes = {

    sampleNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    replicates: PropTypes.arrayOf(PropTypes.number),
    rerenderTableDependency: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
    numberReplicates: PropTypes.number.isRequired,
    proteome_ids : PropTypes.arrayOf(PropTypes.string),
    onUserUnitInput: PropTypes.func.isRequired
}

function SamplesAttributes({
    submission_tag,
    proteome_ids,
    sampleNames,
    attributeTable = [],
    getSelectionByPath,
    groupings = [],
    onSampleTraitSelection,
    addSampleAttr,
    onSampleAttributeSelect,
    onTagRemove ,
    removeSampleAttrByIndex,
    clearSampleAttrByIndex,
    clearGenotypeColumn,
    clearAttributeTableByRowIndex,
    rerenderTableDependency = 0,
    onReplicateChange,
    replicates = [],
    numberReplicates = 0,
    genotypes,
    genotypeAttributes,
    handleGenotypeSelection,
    repeatSelection,
    }) {
    const [selectedRows, setSelectedRows] = useState([])
    /**
     * 
     * @param {Number} columnIndex 
     * @returns 
     */
    const isGroupingAttributeDefined = (columnIndex) => {
        const groupingAttribute = getGroupingAttributeByColumnIndex(columnIndex)
        if (!_.isString(groupingAttribute)) return [false, undefined]
        return [true, groupingAttribute]
    }
    
    const getGroupingInfoByColumnIndex = (columnIndex) => groupings[getSampleAttrIndex(columnIndex)];

    const getGroupingAttributeByColumnIndex = (columnIndex) => getGroupingInfoByColumnIndex(columnIndex);
    
    const getSampleAttrIndex = (columnIndex) => columnIndex - 3;

    const renderBodyContextMenu = (r) => {
        // render context menu for attributes
        let targetColumns = r.target.cols
        let columnIndex = targetColumns[0]
        if (sampleNames.length === 0) return <Menu><MenuItem text="Set number of samples first." disabled={true} /></Menu>
        switch (columnIndex) {
            case 0:
                return <Menu><MenuItem text="Samples names" disabled={true} /></Menu>
            case 1:
                return <ReplicateMenu {...{ numberReplicates, onReplicateChange, selectedRows }} />;
            case 2:
                return <GenotypeContextMenu {...{ genotypes, selectedRows, handleGenotypeSelection, proteome_ids, clearGenotypeColumn }} />;
            default: {

                //let sampleAttribute = groupings[getSampleAttrIndex(columnIndex)] //first column blocked
                const [attributeDefined, attribute_tag] = isGroupingAttributeDefined(columnIndex)

                if (!attributeDefined) return <Menu><MenuItem text="Please select attribute type first.." disabled={true} /></Menu>
                //find row indices from the selected region
                // if there is no attribute values, then a numeric value can be inserted by the user
                const prevSelection = [] //_.uniqBy(_.flatten(selectedRows.map(idx => attributeTable[idx][attribute.tag])).filter(v => _.isObject(v)), "tag")
                return (
                    <AttributeContextMenuSearch
                        {...{
                            attribute_tag,
                            selectedAttributeValues: prevSelection,
                            onSampleTraitSelection,
                            rowIdces: selectedRows,
                            clearAttributeTableByRowIndex,
                            repeatSelection
                        }}
                    />
                )
            }
        }
    }

    /**
     * @description Handles the genotype representation.
     * @param {Number} rowIndex 
     * @param {Number} columnIndex 
     * @returns 
     */
    const renderGenotype = (rowIndex, columnIndex) => {
        const cellKey = `${rowIndex}-${columnIndex}-genotype`
        if (!_.isArray(genotypeAttributes) || genotypeAttributes[rowIndex] === undefined) return <Cell key={cellKey}></Cell>
        let selectedGenotypes = genotypeAttributes[rowIndex]
        if (!_.isArray(selectedGenotypes)) return null
        return <Cell key={cellKey}><div className="flex flex--wrap center-items">{selectedGenotypes.map(genotype => {
            return <div><Tag minimal={true} onRemove={() => handleGenotypeSelection([rowIndex], genotype)}>
                {genotype.text}
            </Tag></div>
        })}</div>
        </Cell>
    }

    /**
     * @description Handles the unit input of the user.
     * @param {String} attribute_tag 
     * @param {String} trait_tag 
     * @param {Object} userUnitInput The user input object with [attribute_tag][trait_tag][unittype]["value"/"unit"]
     * @param {Number} rowIndex The index of the row the user selected. 
     */
    const handleUnitInput = (attribute_tag, trait_tag, userUnitInput, rowIndex) => {
        
        onUserUnitInput(attribute_tag, trait_tag, userUnitInput, rowIndex)
    }

    const renderCell = (rowIndex, columnIndex) => {

        const cellKey = `${rowIndex}-${columnIndex}`
        const [attributeDefined, attribute_tag] = isGroupingAttributeDefined(columnIndex)

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

        

        if (!attributeDefined || attributeTable.length <= rowIndex) return <Cell key={cellKey}></Cell>
        let cellData = getSelectionByPath([{ "type": "attribute", tag: attribute_tag }], rowIndex)
        console.log(cellData, "cellData", rowIndex, columnIndex, attribute_tag)
        const attributeHasFeatures = false //attribute.has_features_value    
        if (!_.isArray(cellData)) return <Cell key={cellKey}></Cell>
        return <Cell key={cellKey}>
            <div className="flex flex--wrap center-items">
                {cellData.map(child => {
                    return <div
                        key={`${rowIndex}-${columnIndex}-${child.tag}`}
                        className="padding--little">
                        <TraitWithValueInput //consider changing to sampleTraitWithvalue? 
                            rowIndex={rowIndex}
                            attribute_tag={attribute_tag}
                            getSelectionByPath = {getSelectionByPath}
                            trait_tag={child.tag}
                            submission_tag={submission_tag}
                            sel={selectedRows}
                            onChildrenSelection={onSampleTraitSelection}
                            valueIsFeature={attributeHasFeatures}
                            onRemove={onTagRemove} />
                    </div>})}
            </div>
        </Cell>
    }




    /**
     * @description Renders the attribute header menu allowing the user to select the attribute.
     * @param {Number} columnIndex 
     * @returns 
     */
    const renderAttributeHeaderMenu = (columnIndex) => {
        const [attributeDefined, attribute] = isGroupingAttributeDefined(columnIndex)
        const missingAttributeValues = attributeDefined?attributeTable.filter(rowData => _.isArray(rowData[attribute.tag])?rowData[attribute.tag].length === 0:true).length:attributeTable.length
        const allSamplesDefined = missingAttributeValues === 0
        const sampleAttrIndex = getSampleAttrIndex(columnIndex)
        return (
            <Menu small={true}>
                <MenuItem text="Sample Attribute" disabled={true} />
                <MenuDivider />
                <MenuItem text={allSamplesDefined ? "Attribute values defined." : `${missingAttributeValues} attribute values missing.`} intent={allSamplesDefined?"primary":"danger"}/>
                <MenuDivider />
                <MenuItem text="Clear" icon="clean" onClick={() => clearSampleAttrByIndex(attribute.tag)} disabled={!attributeDefined} />
                <MenuItem text="Delete" icon="cross" onClick={() => removeSampleAttrByIndex(sampleAttrIndex)} />
                
            </Menu>)
    }

    const renderAttributeHeader = (columnIndex) => {
        const sampleAttrIndex = getSampleAttrIndex(columnIndex)
        const attribute_tag = groupings[sampleAttrIndex] 
        return (
            <ColumnHeaderCell style={{ minHeight: "3rem" }}
                menuRenderer={renderAttributeHeaderMenu}
                selectCellsOnMenuClick={false}
                isColumnSelected={false}
            >
                    <div className="margin--little"
                        style={{ minHeight: "50px", maxHeight: "50px" }}>
                        <AttributeSelectionHeader
                            {...{
                                selected_attribute_tag : attribute_tag,
                                sampleAttrIndex,
                                onSampleAttributeSelect,
                                columnIndex,
                                disabled : sampleNames.length === 0,
                            }} />
                    </div>
            </ColumnHeaderCell>)
    }

    /**
     * @description Handles the selection based on the selection region. 
     * @param {import("@blueprintjs/table").Region} selectedRegion 
     * @returns 
     */
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

    const genotypeHeaderMenu = () => {
        return <Menu small={true}>
            <MenuItem text="Genotypes" disabled={true} />
            <MenuDivider />
            <MenuItem text="Clear" icon="clean" onClick={() =>  clearGenotypeColumn()} disabled={_.isObject(genotypeAttributes) && genotypeAttributes.length === 0} />
        </Menu>
    }

    const renderDefaultHeader = (headerName, menuRenderer) => {

        return <ColumnHeaderCell menuRenderer={menuRenderer}>
            <div className="margin--little" style={{ minHeight: "50px", maxHeight : "50px" }}>
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
                    //enableColumnInteractionBar = {false}
                    enableGhostCells={true}
                    numRows={sampleNames.length}
                    cellRendererDependencies={[rerenderTableDependency]}
                    bodyContextMenuRenderer={renderBodyContextMenu}
                    defaultRowHeight={40}
                    selectionModes={SelectionModes.CELLS}
                    minColumnWidth={250}
                    onSelection={handleSelection}
                    selectedRegionTransform={selectedRegionTransform}>
                    <Column
                        cellRenderer={renderCell}
                        columnHeaderCellRenderer={() => renderDefaultHeader("Sample Run")} />
                    <Column
                        cellRenderer={renderCell}
                        columnHeaderCellRenderer={() => renderDefaultHeader("Replicates")} />
                    <Column
                        cellRenderer={renderGenotype}
                        columnHeaderCellRenderer={() => renderDefaultHeader("Genotype",genotypeHeaderMenu)} />
                    {groupings.map((groupInfo,groupIdx) =>
                        <Column key={`${groupInfo.text}-${groupIdx}`} columnHeaderCellRenderer={renderAttributeHeader} cellRenderer={renderCell} />)}
                    
                    <Column columnHeaderCellRenderer={() =>
                            <ColumnHeaderCell><div className=" margin--little">
                                <Button icon="plus" onClick={addSampleAttr} /></div>
                        </ColumnHeaderCell>} />
            </Table2>
            </HotkeysProvider>
        </div>
    )
}


export default SamplesAttributes