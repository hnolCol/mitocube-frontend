
import PropTypes from "prop-types"
import { Combobox } from "../../../../core/input/Combobox"
import TextInput from "../../../../core/input/Text"

import { Column, Table2, ColumnHeaderCell, SelectionModes, Cell,} from "@blueprintjs/table"
import { HotkeysProvider, Menu, MenuItem, Tag, Button, MenuDivider, Divider} from "@blueprintjs/core"
import { useMemo, useState } from "react"
import { filterArrayBySearchString } from "../../../../../services/arrays/filter"
import _ from "lodash"
import NumericValueInput from "../../../../core/input/Numeric"
import { createFakeAttributeValue } from "../../../../../services/attributes"
import { addItemToArrayOrRemoveItIfPresent } from "../../../../../services/arrays/transforms"
import { FeatureInput } from "../../../../core/input/api/FeatureInput"

SamplesAttributes.propTypes = {
    sampleNames: PropTypes.arrayOf(PropTypes.string),
    attributes: PropTypes.arrayOf(PropTypes.object),
    attributeValuesByID : PropTypes.object
}


function FeatureSelectionInMenu({ onSave, proteome_ids, attribute, selectedRows }) {
    const [selectedItems, setSelectedItems] = useState([])
    const collectItems = (attribute, feature) => {
        const updatedFeatures = addItemToArrayOrRemoveItIfPresent({ array: selectedItems, item: feature })
        setSelectedItems(updatedFeatures)
    }

    return (
        <div>
        <FeatureInput {...{ attribute, proteome_ids, onItemSelect : collectItems, selectedItems }} />
        <MenuItem text="Save" onClick={() => onSave(attribute,selectedItems,true,selectedRows)} intent="primary" icon="selection"/>
        </div>
    )
}

// tion(attribute,[value],true,selectedRows,undefined,undefined)}/>) : null}


function AttributeSelectionHeader({
    columnIndex,
    sampleAttrIndex,
    attributes = [],
    sampleAttributeName = "",
    attributeName = "attribute type ...",
    attributesTagsInUse = [],
    onSampleAttributeSelect = undefined,
    disabled = false }) {
    // table column header that allows to select an attribute -> which then enables the user to select features of that attribute.
    return (
        <div style={{marginRight : "2rem"}}>
            <Combobox
                items={_.sortBy(attributes.filter(a => !attributesTagsInUse.includes(a.tag)),"text")}
                value={attributeName}
               // disabled={groupingName.length < 2}
                buttonProps={{ minimal: true, fill: false, disabled}}
                callbackKey={sampleAttributeName}
                onChange={(callbackKey, attribute) => onSampleAttributeSelect(sampleAttrIndex, sampleAttributeName, attribute, true)} />
        </div>
    )
}


function getPositionString(positionAttrValue) {

    if (_.isString(positionAttrValue.aa)) {
        return positionAttrValue.aa
    }
    else if (_.isArray(positionAttrValue.aa_position) && positionAttrValue.aa_position.length > 1)
        return _.join(positionAttrValue.aa_position, "-")
    else if (positionAttrValue.aa_position === null && positionAttrValue.aa === null) {
        return positionAttrValue.attribute_value.text
    }
}

function extractGenotypeRepresentation(genotype) {
    
    return <div>{genotype.attributes.map((attribute,attrIdx) => {
        const hasProteinMutation = _.has(attribute, "att_protein_position")
        const mutations = hasProteinMutation && _.has(attribute, "att_protein_mutation") ? attribute["att_protein_mutation"] : []
        const positions = attribute["att_protein_position"]
        return <div style={{fontSize : "0.7rem"}}><ul style={{listStyleType: "none",margin:"0px",padding:"0px"}}>
            <li>{genotype.proteome_id}</li>
            <li>{attribute["att_gene_editing_method"][0].text} <strong>{attribute["att_gene_engineering"][0].text}</strong></li>
            <li><strong>{attribute["att_gene_zygosity"][0].text}</strong></li>
            <li>{hasProteinMutation ? mutations.map(mutationAttrValue => {
                if (_.has(positions, mutationAttrValue.tag)) {
                    const positionAttrValue = positions[mutationAttrValue.tag]
                    return <li>{mutationAttrValue.text} : {getPositionString(positionAttrValue)}</li>
                }
            }) : null}</li></ul>
         {attrIdx > 0 ? <Divider /> : null}
        </div>
           
    })}
        
        </div>

}


function GenotypeContextMenu({ genotypes, selectedRows, handleGenotypeSelection, proteome_ids }) {
    
    const [queryString, setQuery] = useState("")

    let genotpesBySearchQuery = useMemo(() => queryString === "" ? genotypes : filterArrayBySearchString({
        searchString: queryString,
        array: genotypes,
        keyNames: ["text"]
    }), [queryString])

    return (
        <Menu style={{minWidth : "500px"}} onWheelCapture={e => e.stopPropagation()}>
            <MenuItem text="Genotypes" disabled={true} />
            <TextInput
                    value={queryString}
                    callbackKey={"a"}
                    placeholder="Search genotype..."
                    onChange={(key,value,type) => setQuery(value)}
                    
                />
            <MenuDivider />
            <Menu style={{ overflowY: "scroll", maxHeight: "280px" }} onWheelCapture={e => e.stopPropagation()}> 
            {!_.isArray(proteome_ids) || proteome_ids.length === 0 ? <MenuItem text="Select an organism/proteome first." disabled={true} /> : 
                _.isArray(genotpesBySearchQuery) && genotpesBySearchQuery.length === 0 ? <MenuItem text="No results..."/>: 
            _.isArray(genotypes) && genotypes.length > 0 ?
                genotpesBySearchQuery .map(genotype =>
                    <MenuItem text={genotype.text} onClick={() => handleGenotypeSelection(selectedRows, genotype)}
                        labelElement={<div className="labelelement-wrap--fixed-width" style={{textAlign:"right"}}>{extractGenotypeRepresentation(genotype)}</div>} />)
                    : null}
            </Menu>
            <MenuDivider />
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



export function AttributeContextMenuSearch({attributeTag ,attributeValues, onAttributeSelect, rowIdces = [], clearAttributeTableByRowIndex = undefined, repeatSelection}) {
    const [queryString, setQuery] = useState("")
    let attributeValueBySearchQuery = useMemo(() => queryString === "" ? attributeValues : filterArrayBySearchString({
        searchString: queryString,
        array: attributeValues,
        keyNames: ["text", "details"]
    }), [queryString])
    return (
        <Menu style={{zIndex:10}} onWheelCapture={e => e.stopPropagation()}>
                <TextInput
                    value={queryString}
                    callbackKey={"a"}
                    placeholder="Search attribute value..."
                    onChange={(key,value,type) => setQuery(value)}
                    
                />
                <Menu style={{ overflowY: "scroll", maxHeight: "280px" }} onWheelCapture={e => e.stopPropagation()}> 
                {attributeValueBySearchQuery.map((attributeValue, index) =>
                    index === 25 ? <MenuItem key={attributeValue.text} text=" . . . not all items shown, please use the search function.." disabled={true} /> : index > 25 ? null :
                    <MenuItem
                        onClick={(e) => onAttributeSelect(attributeTag, attributeValue,rowIdces)}
                        key={attributeValue.text}
                        text={attributeValue.text}
                        labelElement={<div className="labelelement-wrap--fixed-width">{attributeValue.description}</div>}
                        role="listoption" />)}
            </Menu>
            <MenuDivider />
            <MenuItem text={`Repeat Selection (${rowIdces.length} rows)`} icon="clean" onClick={() => repeatSelection(rowIdces,attributeTag)}/>
            <MenuItem text={`Clear Selection (${rowIdces.length} row(s))`} icon="clean" onClick={() => clearAttributeTableByRowIndex(rowIdces,attributeTag)}/>
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
    onTagRemove = undefined,
    removeSampleAttrByIndex = undefined,
    clearSampleAttrByIndex = undefined,
    clearAttributeTableByRowIndex = undefined,
    onFeatureSelection,
    rerenderTableDependency = 0,
    onReplicateChange = undefined,
    replicates = [],
    numberReplicates = 0,
    genotypes,
    genotypeAttributes,
    handleGenotypeSelection,
    proteome_ids,
    repeatSelection
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
        return groupingInfo
    }


    const handleNumericInput = (numericInput, attrValues, attribute, selectedRows) => {
        const attributeAlreadyPresent = attrValues.filter(attrValue => attrValue.text === _.toString(numericInput))
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
        if (columnIndex === 2) return <GenotypeContextMenu {...{genotypes, selectedRows, handleGenotypeSelection, proteome_ids}}/>
        let sampleAttribute = groupings[getSampleAttrIndex(columnIndex)] //first column blocked
        const [attributeDefined, attribute] = isGroupingAttributeDefined(columnIndex)

        if (!attributeDefined) return <Menu><MenuItem text="Please select attribute type" disabled={true} /></Menu>
        //find row indices from the selected region
        //attribute.has_features_value ? attributeValuesByID[-1] : 
        let attributeValues = sampleAttribute === undefined || !_.has(attributeValuesByID, sampleAttribute.id) ? [] : attributeValuesByID[sampleAttribute.id]
        console.log(_.flatten(attributeTable.filter(d => _.has(d,attribute.tag)).map(d => d[attribute.tag])))
        const attributeValuesSelected = _.uniqBy(_.flatten(attributeTable.filter(d => _.has(d,attribute.tag)).map(d => d[attribute.tag])),"tag")
        // if there is no attribute values, then a numeric value can be inserted by the user
        const selectedAttributeValuesFound = attributeValuesSelected.length
        // onFeatureSelection = (attribute, selectedFeatures, isSampleAttribute, rowIdces, genotypeLabel, entryIdx) => {
        if (attribute.has_features_value) {            return <Menu style={{minWidth:"min(40vw,700px)"}}>
                <FeatureSelectionInMenu {...{attribute,onSave : onFeatureSelection, proteome_ids,selectedRows}}/>
            {selectedAttributeValuesFound? <MenuItem disabled text="Previous selections"/>:null}
            {selectedAttributeValuesFound ? <MenuDivider /> : null}
            
                {selectedAttributeValuesFound ? attributeValuesSelected.map(value => <MenuItem
                    key={value.key}
                    text={value.genes}
                    onClick={() => onFeatureSelection(attribute,[value],true,selectedRows,undefined,undefined)}/>) : null}
            </Menu>
        }
        else if (attribute.has_numeric_input) return (<Menu>
            
            <MenuItem text="Enter numeric value." disabled={true} />
            <MenuDivider />
            {/* {valuesAlreadyUsed.map(attrValue => <MenuItem text={attrValue} onClick={() => onAttributeSelect(attribute.tag, createFakeAttributeValue({...{attribute, numericInput : attrValue}}), selectedRows)}/>)} */}
            {attributeValues.map(attrValue => <MenuItem
                key={`${attrValue.tag}-${attribute.tag}-numeric-input`}
                text={attrValue.text}
                labelElement={<div className="labelelement-wrap--fixed-width">{attrValue.description}</div>}
                onClick={() => onAttributeSelect(attribute.tag, attrValue, selectedRows)} />)
            }
            
            <NumericValueInput
                placeholder={`${sampleAttribute.text}`}
                callbackKey={sampleAttribute.tag}
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
                    <MenuItem text={`Repeat Selection (${selectedRows.length} rows)`} icon="clean" onClick={() => repeatSelection(selectedRows,sampleAttribute.tag)}/>
                    <MenuItem text={`Clear Selection (${selectedRows.length} rows)`} icon="clean" onClick={() => clearAttributeTableByRowIndex(selectedRows, sampleAttribute.tag)}/> 
                </Menu>: null}
            </Menu>)
        
        return (
            <AttributeContextMenuSearch
                {...{ onAttributeSelect, rowIdces : selectedRows, clearAttributeTableByRowIndex, repeatSelection }}
                attributeValues={attributeValues}
                attributeTag={sampleAttribute.tag}
               />
        )
    }

    const renderGenotype = (rowIndex, columnIndex) => {
        const cellKey = `${rowIndex}-${columnIndex}-genotype`
        if (!_.isArray(genotypeAttributes) || genotypeAttributes[rowIndex] === undefined) return <Cell key={cellKey}></Cell>
        let selectedGenotypes = genotypeAttributes[rowIndex]
        if (!_.isArray(selectedGenotypes)) return null
        return <Cell key={cellKey}>{selectedGenotypes.map(genotype => {
            return <div><Tag minimal={true} onRemove={() => handleGenotypeSelection([rowIndex], genotype)}>
                {genotype.text}
            </Tag></div>
        })}
        </Cell>

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
        const attributeHasFeatures = attribute.has_features_value
        let cellData = attributeTable[rowIndex][attributeTag]
        if (!_.isArray(cellData)) return <Cell key={cellKey}></Cell>
        return <Cell key={cellKey}>
            <div className="flex flex--wrap center-items">
                {_.isArray(cellData) && cellData.length === 0 ? "" : cellData.map(attributeValue => {
                    const cellDataIsAttr = _.isObject(attributeValue)
                    return <div key={`${rowIndex}-${columnIndex}-${attributeHasFeatures ? attributeValue.key : cellDataIsAttr ? attributeValue.tag : attributeValue}`} className="padding--little">
                        <Tag minimal={true} onRemove={() => onTagRemove(rowIndex, attribute, attributeValue)}>
                            {cellDataIsAttr?attributeHasFeatures?attributeValue.genes: attributeValue.text:attributeValue}
                        </Tag>
                    </div>})}
            </div>
        </Cell>
    }

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
                   // numFrozenColumns={1}
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
                        cellRenderer={renderGenotype}
                        columnHeaderCellRenderer={() => renderDefaultHeader("Genotype")} />
                    {groupings.map((groupInfo,groupIdx) =>
                        <Column key={`${groupInfo.text}-${groupIdx}`} columnHeaderCellRenderer={renderGroupingHeader} cellRenderer={renderCell} />)}
                    <Column columnHeaderCellRenderer={() => <ColumnHeaderCell><div className=" margin--little">
                        <Button icon="plus" onClick={addSampleAttr} /></div></ColumnHeaderCell>} />
            </Table2>
            </HotkeysProvider>
        </div>
    )
}


export default SamplesAttributes