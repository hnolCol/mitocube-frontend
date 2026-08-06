import PropTypes from "prop-types"

import { Column, Table2, ColumnHeaderCell, SelectionModes, Cell,} from "@blueprintjs/table"
import { HotkeysProvider, Menu, MenuItem, Tag, Button, MenuDivider } from "@blueprintjs/core"
import { memo, useState, useCallback, useMemo } from "react";
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
import "./sa.css"

const getSampleAttrIndex = (columnIndex) => columnIndex - 3;
const getGroupingInfoByColumnIndex = (columnIndex, groupings) => groupings[getSampleAttrIndex(columnIndex)];
const getGroupingAttributeByColumnIndex = (columnIndex, groupings) => getGroupingInfoByColumnIndex(columnIndex, groupings);

function useSampleTableSelection({handleSelection}) {
    const [selectedRows, setSelectedRows] = useState([]);
    const [copiedRows, setCopiedRows] = useState([]);
    const getCurrentSelection = useCallback(() => selectedRows, [selectedRows])

    const handleCopy = useCallback(() => {
            if (!handleSelection) return;

            const selection = getCurrentSelection(); 
            setCopiedRows(selection);

            }, [handleSelection]);

    const handlePaste = useCallback(async () => {
            if (!handleSelection) return;

            try {
                setCopiedRows
            } catch (e) {
                console.error("Paste failed", e);
            }
        }, [handleSelection]);
    
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

    return {
        selectedRows,
        copiedRows,

        setSelectedRows,
        setCopiedRows,
        getCurrentSelection,
        handleKeyDown,
        handleKeyUp,
        handleCopy,
        handlePaste
    }
}

const AttributeSelectionHeader = memo(function AttributeSelectionHeader({
    selected_attribute_tag,
    sampleAttrIndex,
    onSampleAttributeSelect,
    disabled = false }) {
   
    const {data : attribute} = api.attributes.queryAttributes.useGetAttribute({tag : selected_attribute_tag},{enabled : typeof selected_attribute_tag === "string", staleTime : Infinity})
    const attributeSelected = _.isObject(attribute) && attribute?.text
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
})


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
    checkAttributeRequiredTraits,
    selected_proteome_tags
    }) {

    
    
     /**
     * @description Handles the selection based on the selection region. 
     * @param {import("@blueprintjs/table").Region} selectedRegion 
     * @returns 
     */
    const handleSelection = useCallback((regions) => {
        if (!regions?.length) return;

        const rows = [
            ...new Set(
                regions.flatMap(region => {
                    if (!region.rows) return [];

                    const [start, end] = region.rows;

                    return Array.from(
                        { length: end - start + 1 },
                        (_, i) => start + i
                    );
                })
            ),
        ];

        setSelectedRows(currentRows =>
            _.isEqual(currentRows, rows) ? currentRows : rows
        );
    }, []);


    
    const { selectedRows, copiedRows, setSelectedRows, handleKeyDown, handleKeyUp } = useSampleTableSelection({handleSelection})

    const [isGenotypeDialogOpen, setIsGenotypeDialogOpen] = useState(false)

    
    const selectedSampleTags = useMemo(
        () => selectedRows.map(r => `${submission_tag}|${sampleNames[r]}`),
        [selectedRows, submission_tag, sampleNames]
    );
    
    /**
     * 
     * @param {Number} columnIndex 
     * @returns 
     */
    const isGroupingAttributeDefined = useCallback((columnIndex) => {
        const groupingAttribute = getGroupingAttributeByColumnIndex(columnIndex, groupings)
        if (typeof groupingAttribute !== "string") return [false, undefined]
        return [true, groupingAttribute]
    }, [groupings])
    
    const { mutate } = api.samples.core.useInsertSampleGenotype()

    const [rowHeights, setRowHeights] = useState([])

    const updateRowHeight = useCallback((rowIndex, element) => {
        if (!element) return

        const requiredHeight = Math.max(60, element.scrollHeight + 8)
        setRowHeights(currentHeights => {
            const currentHeight = currentHeights[rowIndex] ?? 60
            if (requiredHeight <= currentHeight) return currentHeights

            const nextHeights = [...currentHeights]
            nextHeights[rowIndex] = requiredHeight
            return nextHeights
        })
    }, [])

    // Blueprint requires rowHeights to contain exactly one entry per table row.
    const tableRowHeights = useMemo(
        () => Array.from(
            { length: sampleNames.length },
            (_, rowIndex) => rowHeights[rowIndex] ?? 60
        ),
        [rowHeights, sampleNames.length]
    )


    
    

    const renderBodyContextMenu = useCallback((r) => {
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
    }, [
        clearAttributeTableByRowIndex,
        clearGenotypeColumn,
        copiedRows,
        genotypes,
        handleGenotypeSelection,
        isGroupingAttributeDefined,
        numberReplicates,
        onPasteRowsInAttribute,
        onReplicateChange,
        onSampleTraitSelection,
        repeatSelection,
        sampleNames.length,
        selectedRows,
    ])

    /**
     * @description Handles the genotype representation.
     * @param {Number} rowIndex 
     * @param {Number} columnIndex 
     * @returns 
     */
    const renderGenotype = useCallback((rowIndex, columnIndex) => {
        const cellKey = `${rowIndex}-${columnIndex}-genotype`
        if (!_.isArray(genotypes) || genotypes[rowIndex] === undefined) return <Cell key={cellKey}></Cell>
        const selected_genotype_tags = genotypes[rowIndex]
        if (!_.isArray(selected_genotype_tags)) return null
        return <Cell key={cellKey}><div className="flex flex--wrap center-items">
                {selected_genotype_tags.map(genotype_tag => {
            return <div key={`${rowIndex}-${columnIndex}-${genotype_tag}`} className="margin--little">
                <Tag 
                    minimal={true} onRemove={() => handleGenotypeSelection([rowIndex], genotype_tag)}>
                 <GenotypeText tag={genotype_tag} />
            </Tag></div>
        })}</div>
        </Cell>
    }, [genotypes, handleGenotypeSelection])

    const renderCell = useCallback((rowIndex, columnIndex) => {

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
        return <Cell key={cellKey} style={{ width: "100%", padding: 0 }}>
            <div
                ref={(element) => updateRowHeight(rowIndex, element)}
                className="flex cellContentInner">
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
                            checkAttributeRequiredTraits={checkAttributeRequiredTraits}
                            referenceID={referenceID}
                            onRemove={onTagRemove}
                            selected_proteome_tags = {selected_proteome_tags}/>
                    </div>})}
            </div>
        </Cell>
    }, [
        attributeTable.length,
        checkAttributeRequiredTraits,
        getSelectionByPath,
        isGroupingAttributeDefined,
        onSampleTraitSelection,
        onTagRemove,
        referenceIDs,
        replicates,
        sampleNames,
        selectedRows,
        selected_proteome_tags,
        submission_tag,
        updateRowHeight,
    ])




    /**
     * @description Renders the attribute header menu allowing the user to select the attribute.
     * @param {Number} columnIndex 
     * @returns 
     */
    const renderAttributeHeaderMenu = useCallback((columnIndex) => {
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
    }, [attributeTable, clearColumnByAttributeTag, isGroupingAttributeDefined, removeSampleAttrByIndex])

    const renderAttributeHeader = useCallback((columnIndex) => {
        const sampleAttrIndex = getSampleAttrIndex(columnIndex)
        const attribute_tag = groupings[sampleAttrIndex] 
        return (
            <ColumnHeaderCell style={{ minHeight: "3rem" }}
                menuRenderer={renderAttributeHeaderMenu}
                selectCellsOnMenuClick={false}
                isColumnSelected={false}
            >
                    <div className="margin--little attributeSelectionHeaderInner"
                        >
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
    }, [groupings, onSampleAttributeSelect, renderAttributeHeaderMenu, sampleNames.length])

   

    const renderGenotypeHeader = useCallback(() => (
        <ColumnHeaderCell>
            <div className="genotypeHeaderContainer">
                <h4 style={{ margin: 0 }}>Genotype</h4>
    
                <Button
                    icon="plus"
                    onClick={() => setIsGenotypeDialogOpen(true)}
                />
            </div>
        </ColumnHeaderCell>
    ), [])

    const renderDefaultHeader = useCallback((headerName, menuRenderer) => {

        return <ColumnHeaderCell menuRenderer={menuRenderer}>
            <div className="defaultHeaderContainer">
                <h4 className="defaultHeaderTitle">{headerName}</h4></div>
        </ColumnHeaderCell>
    }, [])

    const selectedRegionTransform = useCallback((e) => {
        //cell selection to full row selection transformation
        if (!_.has(e, "rows")) return { rows: [], cols: [] } //prevents selection of table if column header is selected.
        return {
            rows: e.rows
        }
    }, [])


    const replicateHeader = useCallback(
    () => renderDefaultHeader("Replicates"),
    [renderDefaultHeader]
    );
    const sampleRunHeader = useCallback(
    () => renderDefaultHeader("Sample Run"),
    [renderDefaultHeader]
);
    

    return (
    
        <div className="tableContainer">
            <HotkeysProvider>
                <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex={0}>
                <Table2
                    //enableColumnInteractionBar = {false}
                    enableGhostCells={true}
                    numRows={sampleNames.length}
                    cellRendererDependencies={[rerenderTableDependency]}
                    bodyContextMenuRenderer={renderBodyContextMenu}
                    defaultRowHeight={60}
                    rowHeights={tableRowHeights}
                    selectionModes={SelectionModes.CELLS}
                    minColumnWidth={300}
                    onSelection={handleSelection}
                    selectedRegionTransform={selectedRegionTransform}>
                    <Column
                        cellRenderer={renderCell}
                        columnHeaderCellRenderer={sampleRunHeader} />
                    <Column
                        cellRenderer={renderCell}
                        columnHeaderCellRenderer={replicateHeader} />
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
                
                    if (genotype_tag && selectedSampleTags.length > 0) {
                
                        mutate(
                            { sample_tags : selectedSampleTags, genotype_tag },
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