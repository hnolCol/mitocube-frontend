
import PropTypes from "prop-types"
import { Combobox } from "../../../../core/input/Combobox"
import TextInput from "../../../../core/input/Text"

import { Column, Table2, ColumnHeaderCell, SelectionModes, Cell,} from "@blueprintjs/table"
import { HotkeysProvider, Menu, MenuItem, Tag, Button, MenuDivider, Divider, SegmentedControl} from "@blueprintjs/core"
import { useEffect, useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../../../../services/arrays/filter"
import _ from "lodash"
import NumericValueInput from "../../../../core/input/Numeric"
import { addItemToArrayOrRemoveIfPresentByTag, addItemToArrayOrRemoveItIfPresent } from "../../../../../services/arrays/transforms"
import { FeatureInput } from "../../../../core/input/api/FeatureInput"
import { useGetAttributes, useGetValueForAttributeByTag } from "../../../../../hooks/queries/attribute.hooks"
import { AttributeValueMenuItem } from "../../../../core/input/items/AttributeValueMenu"
import Loading from "../../../../core/base/loading"
import { AttributeFeatureTag } from "../view/DatasetAttributesHierarchy"
import { ReplicateMenu } from "./menu/ReplicateMenu"
import { AttributeContextMenuSearch } from "./menu/AttributeMenu"
import { GenotypeContextMenu } from "./menu/GenotypeMenu"
import { TraitWithValueInput } from "../../../../core/base/tags/TagWithTooltip"





SamplesAttributes.propTypes = {
    sampleNames: PropTypes.arrayOf(PropTypes.string),
    attributes: PropTypes.arrayOf(PropTypes.object),
    attributeValuesByID : PropTypes.object
}


function AttributeSelectionHeader({
    sampleAttrIndex,
    attributeName = "attribute type ...",
    attributesTagsInUse = [],
    onSampleAttributeSelect = undefined,
    disabled = false }) {
    
    const {data : attributes_, isLoading, isFetching, isSuccess, isError, error } = useGetAttributes({param_name: "allow_for_measurement", min_state: 0})
    const attributes = _.isArray(attributes_) ? attributes_.map(a => { return { ...a.attribute, "prevview" : `${a.traits.length} traits. (${_.join(a.traits.slice(1,5).map(t => t.text))})` } }):[]
    // table column header that allows to select an attribute -> which then enables the user to select features of that attribute.
    return (
        <div style={{marginRight : "2rem"}}>
            {isSuccess && _.isArray(attributes) ? <Combobox
                items={_.sortBy(attributes.filter(a => !attributesTagsInUse.includes(a.tag)), "text")}
                value={attributeName}
                textKey="text"
                labelKey="prevview"
                // disabled={groupingName.length < 2}
                buttonProps={{ minimal: true, fill: false, disabled }}
                callbackKey={"sample_attr"}
                onChange={(callbackKey, attribute) => onSampleAttributeSelect(sampleAttrIndex, attribute)} /> : null}
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
    attributes = [],
    groupings = [],
    onAttributeSelect,
    addSampleAttr,
    onSampleAttributeSelect,
    onTagRemove ,
    removeSampleAttrByIndex,
    clearSampleAttrByIndex,
    clearGenotypeColumn,
    clearAttributeTableByRowIndex,
    //onFeatureSelection,
    rerenderTableDependency = 0,
    onReplicateChange,
    replicates = [],
    numberReplicates = 0,
    genotypes,
    genotypeAttributes,
    handleGenotypeSelection,
    repeatSelection,
    userUnitInput,
    onUserUnitInput
    }) {
    const [selectedRows, setSelectedRows] = useState([])
    /**
     * 
     * @param {Number} columnIndex 
     * @returns 
     */
    const isGroupingAttributeDefined = (columnIndex) => {
        const groupingAttribute = getGroupingAttributeByColumnIndex(columnIndex)
        if (!_.isObject(groupingAttribute)) return [false, undefined]
        if (!_.has(groupingAttribute, "tag")) return [false, undefined]
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
                const [attributeDefined, attribute] = isGroupingAttributeDefined(columnIndex)

                if (!attributeDefined) return <Menu><MenuItem text="Please select attribute type" disabled={true} /></Menu>
                //find row indices from the selected region
                // if there is no attribute values, then a numeric value can be inserted by the user
                const prevSelection = _.uniqBy(_.flatten(selectedRows.map(idx => attributeTable[idx][attribute.tag])).filter(v => _.isObject(v)), "tag")
                return (
                    <AttributeContextMenuSearch
                        {...{
                            selectedAttributeValues: prevSelection,
                            onAttributeSelect,
                            rowIdces: selectedRows,
                            clearAttributeTableByRowIndex,
                            repeatSelection,
                            attribute,
                            handleUnitInput,
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
        const [attributeDefined, attribute] = isGroupingAttributeDefined(columnIndex)

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
        const attributeTag = attribute.tag
        let cellData = attributeTable[rowIndex][attributeTag]
        
        const attributeHasFeatures = attribute.has_features_value    
        if (!_.isArray(cellData)) return <Cell key={cellKey}></Cell>
        return <Cell key={cellKey}>
            <div className="flex flex--wrap center-items">
                {_.isArray(cellData) && cellData.length === 0 ? "" : cellData.map(trait_tag => {
                    return <div
                        key={`${rowIndex}-${columnIndex}-${trait_tag}`}
                        className="padding--little">
                        <TraitWithValueInput //consider changing to sampleTraitWithvalue? 
                            attribute_tag={attribute.tag}
                            trait_tag={trait_tag}
                            submission_tag={submission_tag}
                            sel={selectedRows}
                            attribute={attribute}
                            valueIsFeature={attributeHasFeatures}
                            unitInput={_.has(userUnitInput,rowIndex) && _.isObject(userUnitInput) ? userUnitInput[rowIndex]: undefined}
                            onUserUnitInput={(userUnitInput)=> handleUnitInput(attribute.tag,trait_tag, userUnitInput,rowIndex)}
                            onRemove={() => onTagRemove(rowIndex, attribute, trait_tag)} />
                    </div>})}
            </div>
        </Cell>
    }




    /**
     * @description Renders the grouping header menu allowing the user to select the attribute.
     * @param {Number} columnIndex 
     * @returns 
     */
    const renderGroupingHeaderMenu = (columnIndex) => {
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

    const renderGroupingHeader = (columnIndex) => {
        const sampleAttrIndex = getSampleAttrIndex(columnIndex)
        const groupingInfo = groupings[sampleAttrIndex] //first column blocked
        
        const sampleAttributeSelected = _.isObject(groupingInfo)
        const attributesTagsInUse  = groupings.filter(groupingInfo => _.isObject(groupingInfo) && _.has(groupingInfo,"tag")).map(groupingInfo => groupingInfo.tag)
        return (
            <ColumnHeaderCell style={{minHeight : "3rem"}} menuRenderer={renderGroupingHeaderMenu} selectCellsOnMenuClick={false} isColumnSelected={false}>
                <div className="margin--little" style={{ minHeight: "50px", maxHeight : "50px" }}>
                    <AttributeSelectionHeader
                        {...{
                            sampleAttrIndex,
                            attributes,
                            onSampleAttributeSelect,
                            columnIndex,
                            attributesTagsInUse,
                            disabled : sampleNames.length === 0,
                            sampleAttributeName : sampleAttributeSelected && _.isString(groupingInfo.text)? groupingInfo.text : undefined,
                            attributeName: sampleAttributeSelected && _.isObject(groupingInfo) ? groupingInfo.text : undefined
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
                    enableGhostCells={true}
                    numRows={sampleNames.length}
                    cellRendererDependencies={[rerenderTableDependency]}
                    bodyContextMenuRenderer={renderBodyContextMenu}
                    defaultRowHeight={30}
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
                        <Column key={`${groupInfo.text}-${groupIdx}`} columnHeaderCellRenderer={renderGroupingHeader} cellRenderer={renderCell} />)}
                    <Column columnHeaderCellRenderer={() => <ColumnHeaderCell><div className=" margin--little">
                        <Button icon="plus" onClick={addSampleAttr} /></div>
                    </ColumnHeaderCell>} />
            </Table2>
            </HotkeysProvider>
        </div>
    )
}


export default SamplesAttributes