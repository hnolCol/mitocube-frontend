import PropTypes from "prop-types"

import { Column, Table2, ColumnHeaderCell, SelectionModes, Cell,} from "@blueprintjs/table"
import { HotkeysProvider, Menu, MenuItem, Tag, Button, MenuDivider } from "@blueprintjs/core"
import { useCallback, useMemo, useState } from "react"
import _ from "lodash"

import { ReplicateMenu } from "./menu/ReplicateMenu"
import { AttributeContextMenuSearch } from "./menu/AttributeMenu"
import { GenotypeContextMenu } from "./menu/GenotypeMenu"
import { TraitWithValueInput } from "../../../../core/base/tags/TraitWithValueInput"

import { api } from "@/api"
import { AttributeInput } from "../../../../core/input/api/AttributeInput"
import { AddGenotypeDialog } from "../../../../admin/genotypes/AddGentoypeDialog"
import { GenotypeText } from "../../../../admin/genotypes/GentotypeText"
import { useHotkeys } from "@blueprintjs/core";



function AttributeSelectionHeader({
    selected_attribute_tag,
    sampleAttrIndex,
    onSampleAttributeSelect,
    disabled = false }) {
   
    const {data : attribute} = api.attributes.queryAttributes.useGetAttribute({tag : selected_attribute_tag},{enabled : _.isString(selected_attribute_tag)})
    const attributeSelected = _.isObject(attribute) && _.has(attribute,"text")
    return (
        <div style={{marginRight : "2rem"}}>
            {<AttributeInput {...{
                text: attributeSelected ? attribute.text : "",
                attribute_groups : ["sample"],
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
}

function SamplesAttributes({
    submission_tag,
    referenceIDs,
    sampleNames,
    attributeTable = [],
    getSelectionByPath,
    groupings = [],
    onSampleTraitSelection,
    addSampleAttr,
    onSampleAttributeSelect,
    onTagRemove ,
    removeSampleAttrByIndex,
    clearColumnByAttributeTag,
    clearGenotypeColumn,
    clearAttributeTableByRowIndex,
    rerenderTableDependency = 0,
    onReplicateChange,
    replicates = [],
    numberReplicates = 0,
    genotypes,
    handleGenotypeSelection,
    repeatSelection,
    onPasteRowsInAttribute,
    }) {

    const [selectedRows, setSelectedRows] = useState([])
    const [copiedRows, setCopiedRows] = useState([])
    const [isGenotypeDialogOpen, setIsGenotypeDialogOpen] = useState(false)
    const getCurrentSelection = () => { return selectedRows }
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
        const handleCopy = useCallback(() => {
            if (!handleSelection) return;

            // TODO: replace with your actual selection model
            const selection = getCurrentSelection(); 
            setCopiedRows(selection);
            

            console.log(selection, "copied rows")


            }, [handleSelection]);

        const handlePaste = useCallback(async () => {
            if (!handleSelection) return;

            try {
                setCopiedRows
            } catch (e) {
                console.error("Paste failed", e);
            }
        }, [handleSelection, copiedRows]);
    
        const hotkeys = useMemo(() => [
        {
            combo: "mod + c",
            label: "Copy table selection",
            preventDefault: true,
            onKeyDown: handleCopy,
        },
        {
            combo: "mod + v",
            label: "Paste table selection",
            preventDefault: true,
            onKeyDown: handlePaste,
        },
    ], [handleCopy, handlePaste]);

    const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);

    const getSelectedSampleTags = () => {
        return selectedRows.map(
            row => `${submission_tag}|${sampleNames[row]}`
        )
    }
    
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
    
    const { mutate } = api.samples.core.useInsertSampleGenotype()

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
                return <GenotypeContextMenu {...{ genotypes, selectedRows, handleGenotypeSelection, clearGenotypeColumn }} />;
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
                            repeatSelection,
                            copiedRows,
                            onPaste: onPasteRowsInAttribute
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
        if (!_.isArray(genotypes) || genotypes[rowIndex] === undefined) return <Cell key={cellKey}></Cell>
        const selected_genotype_tags = genotypes[rowIndex]
        if (!_.isArray(selected_genotype_tags)) return null
        return <Cell key={cellKey}><div className="flex flex--wrap center-items">
                {selected_genotype_tags.map(genotype_tag => {
            return <div>
                <Tag 
                    minimal={true} onRemove={() => handleGenotypeSelection([rowIndex], genotype_tag)}>
                 <GenotypeText tag={genotype_tag} />
            </Tag></div>
        })}</div>
        </Cell>
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
        const referenceID = referenceIDs[rowIndex]
        let cellData = getSelectionByPath([{ "type": "attribute", tag: attribute_tag, "id": referenceID }], rowIndex, false)
        if (!_.isArray(cellData)) return <Cell key={cellKey}></Cell>
        return <Cell key={cellKey}>
            <div className="flex flex--wrap center-items">
                {cellData.map(child => {
                    return <div
                        key={`${rowIndex}-${columnIndex}-${child.tag}-${referenceID}`}
                        className="padding--little">
                        <TraitWithValueInput 
                            rowIndex={rowIndex}
                            attribute_tag={attribute_tag}
                            getSelectionByPath = {getSelectionByPath}
                            trait_tag={child.tag}
                            submission_tag={submission_tag}
                            sel={selectedRows}
                            onChildrenSelection={onSampleTraitSelection}
                            referenceID={referenceID}
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
        const [attributeDefined, attribute_tag] = isGroupingAttributeDefined(columnIndex)
        const missingAttributeValues = attributeDefined?attributeTable.filter(rowData => _.isArray(rowData[attribute_tag])?rowData[attribute_tag].length === 0:true).length:attributeTable.length
        const allSamplesDefined = missingAttributeValues === 0
        const sampleAttrIndex = getSampleAttrIndex(columnIndex)
        return (
            <Menu small={true}>
                <MenuItem text="Sample Attribute" disabled={true} />
                <MenuDivider />
                <MenuItem text={allSamplesDefined ? "Attribute values defined." : `${missingAttributeValues} attribute values missing.`} intent={allSamplesDefined?"primary":"danger"}/>
                <MenuDivider />
                <MenuItem text="Clear" icon="clean" onClick={() => clearColumnByAttributeTag(attribute_tag)} disabled={!attributeDefined} />
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

   

    // const genotypeHeaderMenu = () => {
    //     return <Menu small={true}>
    //         <MenuItem text="Genotypes" disabled={true} />
    //         <MenuDivider />
    //         <MenuItem text="Clear" icon="clean" onClick={() =>  clearGenotypeColumn()} disabled={_.isObject(genotypeAttributes)} />
    //     </Menu>
    // }

    const renderGenotypeHeader = () => (
        <ColumnHeaderCell>
            <div style={{ minHeight: "50px", maxHeight: "50px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: "8px", paddingRight: "4px" }}>
                <h4 style={{ margin: 0 }}>Genotype</h4>
    
                <Button
                    icon="plus"
                    onClick={() => setIsGenotypeDialogOpen(true)}
                />
            </div>
        </ColumnHeaderCell>
    )

    const renderDefaultHeader = (headerName, menuRenderer) => {

        return <ColumnHeaderCell menuRenderer={menuRenderer}>
            <div className="margin--little" style={{minHeight: "50px", maxHeight: "50px", display: "flex", alignItems: "center"}}>
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
    
        <div style={{paddingTop:"1rem",paddingBottom:"1rem", height : "75vh", overflowY: "scroll"}}>
            <HotkeysProvider>
                <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex={0}>
                <Table2
                    //enableColumnInteractionBar = {false}
                    enableGhostCells={true}
                    numRows={sampleNames.length}
                    cellRendererDependencies={[rerenderTableDependency]}
                    bodyContextMenuRenderer={renderBodyContextMenu}
                    defaultRowHeight={60}
                    selectionModes={SelectionModes.CELLS}
                    minColumnWidth={300}
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
                        columnHeaderCellRenderer={renderGenotypeHeader}
                    />
                    {groupings.map((groupInfo,groupIdx) =>
                        <Column key={`${groupInfo.text}-${groupIdx}`} columnHeaderCellRenderer={renderAttributeHeader} cellRenderer={renderCell} />)}
                    
                    <Column columnHeaderCellRenderer={() =>
                            <ColumnHeaderCell><div className=" margin--little">
                                <Button icon="plus" onClick={addSampleAttr} /></div>
                        </ColumnHeaderCell>} />
            </Table2>
            <AddGenotypeDialog
                isOpen={isGenotypeDialogOpen}
                onClose={(genotype_tag) => {

                    const sample_tags = getSelectedSampleTags()
                
                    if (genotype_tag && sample_tags.length > 0) {
                
                        mutate(
                            { sample_tags, genotype_tag },
                            {
                                onSuccess: () => refetchGenotypes()
                            }
                        )
                    }
                
                    setIsGenotypeDialogOpen(false)
                }}
                
                selectedRows={selectedRows}
                submission_tag={submission_tag}
            />
            </div>
            </HotkeysProvider>
        </div>
    )
}


export default SamplesAttributes