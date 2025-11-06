
import _ from "lodash"
import Loading from "../../../../core/base/loading"
import { clearArrayOfObjectsByKeyName, removeKeyInArrayOfObjects } from "../../../../../services/arrays/filter"
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent, addItemsToArrayIfNotPresent } from "../../../../../services/arrays/transforms"
import SamplesAttributes from "./SampleAttributes"
import { useState } from "react"
import { Alert } from "@blueprintjs/core"
import { constructSampleNames } from "../../../../../services/samples"
import { get_proteome_id } from "../../InitialSubmission"

export function deleteByPath(data, path) {
    if (path.length === 0) return false; // Nothing to delete
  
    const [current, ...restPath] = path;
  
    // Find the index of the node at this level
    const idx = data.findIndex(
      n => n.type === current.type && n.tag === current.tag && n.id === current.id
    );
  
    if (idx === -1) return false; // Node not found
  
    if (restPath.length === 0) {
      // This is the node to delete
      data.splice(idx, 1);
      return true;
    } else {
      // Recurse into children
      if (data[idx].children) {
        return deleteByPath(data[idx].children, restPath);
      } else {
        return false; // Path does not exist
      }
    }
}
  
export const findNode = (data, type, tag, id) => {
    if (!_.isArray(data) || data.length === 0) return undefined;

    for (const node of data) {
        if (!node) continue;
        if (node.type === type && node.tag === tag && node.id === id) {
            return node; // found, stop searching
        }
        if (_.isArray(node.children) && node.children.length > 0) {
            const found = findNode(node.children, type, tag, id);
            if (found) return found;
        }
    }

    return undefined;
}

export const findAndInsertTree = (
        data,
        path,
        single_child_level = 2,
        single_child_type = false,
        join_values = false,
        forceInsert = false,
        level = 0
) => {
    // console.log(data,single_child_type,forceInsert)
            if (path.length === 0) return;
            const [current, ...restPath] = path;
            // Find node by type and id
            let node = data.find(
            n =>  n.type === current.type && n.id === current.id && n.tag === current.tag
            );
            
            // If not found, create and push it
            if (!node) {
                node = { ...current, children: [] };
            // Only apply single_child_type restriction at level >= single_child_level
                if (single_child_type && level >= single_child_level) {
                // Remove all nodes of the same type at this level
                for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].type === current.type && data[i].id === current.id) {
                    data.splice(i, 1);
                }
                }
                }
            data.push(node);
            }
            else if (forceInsert && restPath.length === 0) {
                    data.push(current)
            }
        
            

            // Update the value if needed

            if (node.value === undefined && _.isObject(current) && _.has(current,"value") && current.value) {
                node.value = current.value; // Set the value if specified in the path  
                node.tag = current.tag // Ensure tag is set 
                node.type = current.type // Ensure type is set
                node.id = current.id // Ensure id is set
            }
            else if (_.has(current, "value") && node.value !== current.value) {
                node.value = current.value; // Update the value if it has changed
               
                node.tag = current.tag // Ensure tag is set 
                node.type = current.type // Ensure type is set
                node.id = current.id // Ensure id is set
            }
            // Recurse into children, incrementing the level
            findAndInsertTree(node.children, restPath, single_child_level, single_child_type, join_values, forceInsert, level + 1);
};



export const checkPathExists = (data, path) => {
    if (!_.isArray(data) || data.length === 0) return false; // No data to search
    if (path.length === 0) return false; // Nothing to find
    const [current, ...restPath] = path;
    // Find node by type and tag
    let node = data.find(
        n => n.type === current.type && n.tag === current.tag && n.id === current.id
    );  
    // If not found, return false   
    if (!node) return false;
    if (restPath.length === 0) {    
        return true; // Found the node
    }

    // Recurse into children
    if (!node.children || node.children.length === 0) {
        return false;
    }
    return checkPathExists(node.children, restPath);
}


export const findPath = (data, path) => { 
    if (!_.isArray(data) || data.length === 0) return undefined; // No data to search
    if (path.length === 0) return undefined; // Nothing to find
    const [current, ...restPath] = path;

    // Find node by type and tag
    let node = data.find(
        n => n.type === current.type && n.tag === current.tag && n.id === current.id
    );
    // If not found, return undefined
    if (!node) return undefined;

    if (restPath.length === 0) {
        return node;
    }

    // Recurse into children
    if (!node.children || node.children.length === 0) {
        return undefined;
    }
    return findPath(node.children, restPath);
}


export const findChildrenByPath = (data, path) => {
    const [current, ...restPath] = path;
    //if (!_.isObject(current)) return 
    // Find node by type and tag
    let node = data.find(
        n => n.type === current.type && n.id === current.id && n.tag === current.tag
    );

    // If not found, create and push it
    if (!node) return 

    if (restPath.length === 0) {
        return node.children
    } 

    return findChildrenByPath(node.children, restPath);
    }


/**
 * Wrapper for the sample attribute table component.
 * @param {Object} props 
 * @param {Object} props.submission - The submission object (e.g. coming from a useState) 
 * @param {Function} props.updateSubmission - The submission update function (e.g. coming from a useState) 
 * @param {Number} props.numberReplicates - The number of replicates for the submission
 * @returns 
*/
export function SampleAttributeTableWrapper({ submission, updateSubmission, numberReplicates, genotypes }) {
    // wrapper to the sample attributes table
    const [alertProps, setAlertProps] = useState({ isOpen: false, children: <div></div> })
    const proteome_ids = get_proteome_id(submission.datasetAttributeValues)

    const addSampleAttr = () => {
        //adds a new sample attribute
        updateSubmission(prevValues => { return { ...prevValues, samplesAttributes: _.concat(prevValues.samplesAttributes, [[]]) } })
    }
    const clearAttributeTableByRowIndex = (rowIdces, attribute_tag) => {
        //clear rows in table for specific attribute by its tg
        let attributeTable = submission.attributeTable.slice()
        let path = [{ type: "attribute", tag: attribute_tag }]
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length)
            .forEach((rowIndex) => deleteByPath(attributeTable[rowIndex], path))
        
        
        updateSubmission(prevValues => {
            return {
                ...prevValues,
                attributeTable,
                rerenderTableDependency: [Math.random()]
            }
        })
    }

    const clearColumnByAttributeTag = (attribute_tag) => {
        // clears the complete column of the samples attributes
        let attributeTable = submission.attributeTable.slice()
        let path = [{ type: "attribute", tag: attribute_tag }]

        _.range(attributeTable.length).forEach(rowIndex => deleteByPath(attributeTable[rowIndex], path))        

        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable, rerenderTableDependency: [Math.random()]
            }
        })
    }

    /**
     * 
     * @param {Number[]} rowIdcs The selected table rowIndex
     * @param {Object} genotype - The selected genotype.
     */
    const handleGenotypeSelection = (rowIdcs, genotype) => {
        let genotypeAttributes = submission.genotypeAttributes
        _.forEach(rowIdcs, rowIdx => {
            genotypeAttributes[rowIdx] = addItemToArrayOrRemoveItIfPresent({ array: genotypeAttributes[rowIdx], item: genotype })
        })
        updateSubmission(prevValues => {
            return {
                ...prevValues, genotypeAttributes, rerenderTableDependency: [Math.random()],
                sampleNames:
                constructSampleNames({
                    submission_tag: prevValues.tag,
                    sampleNumber: prevValues.sampleNames.length,
                    sampleAttributes: prevValues.attributeTable,
                    sampleGenotypes: genotypeAttributes,
                    include_sample_attributes : prevValues.samplesAttributes.map(a => a.tag) })
            }
        })
    }

    const clearGenotypeColumn = (rowIdcs) => {
        if (_.isArray(rowIdcs)) {

            let genotypeAttributes = submission.genotypeAttributes
            _.forEach(rowIdcs, rowIdx => {
                genotypeAttributes[rowIdx] = []
            })
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    genotypeAttributes: genotypeAttributes,
                    rerenderTableDependency: [Math.random()],
                    sampleNames:
                    constructSampleNames({
                        submission_tag: prevValues.tag,
                        sampleNumber: prevValues.sampleNames.length,
                        sampleAttributes: prevValues.attributeTable,
                        sampleGenotypes: genotypeAttributes,
                        include_sample_attributes : prevValues.samplesAttributes.map(a => a.tag) })
                }
            })
        }
        else {
            //if not an array remove all
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    genotypeAttributes: [],
                    rerenderTableDependency: [Math.random()],
                    sampleNames:
                    constructSampleNames({
                        submission_tag: prevValues.tag,
                        sampleNumber: prevValues.sampleNames.length,
                        sampleAttributes: prevValues.attributeTable,
                        sampleGenotypes: [],
                        include_sample_attributes : prevValues.samplesAttributes.map(a => a.tag) })
                }
            })
        }
        
    }

    const repeatSelection = (rowIdcs, attribute_tag) => {
        let attributeTable = submission.attributeTable.slice()
        const n_samples = attributeTable.length
        const selection = rowIdcs.map(rowIdx => attributeTable[rowIdx].filter(p => p.type === "attribute" && p.tag === attribute_tag)).slice()
        console.log("REPEAT SELECTION", rowIdcs, selection, "SELECTION", attribute_tag, "TAG")
        const lastIdx = rowIdcs.at(-1)
        const diff = (n_samples+1) - lastIdx
        const n_repeat = _.toInteger((diff) / rowIdcs.length+0.5)
        const values = Array(n_repeat).fill(selection).flat();
        console.log("VALUES", values, "DIFF", diff, "N_REPEAT", n_repeat, "LAST IDX", lastIdx)
        _.forEach(_.range(diff), idx => attributeTable[lastIdx + 1 + idx] = [...attributeTable[lastIdx + 1 + idx],...values.at(idx % rowIdcs.length)])
        
        console.log(attributeTable)
        
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable, rerenderTableDependency: [Math.random()]
            }
        })
    }

    const onFeatureSelection = (attribute, selectedFeatures, isSampleAttribute, rowIdces, genotypeLabel, entryIdx) => {
        if (attribute.allow_for_genotype) {
            genotypeSelection(genotypeLabel,attribute.tag,selectedFeatures[0],entryIdx) //double check entry!! 
        }
        else if (isSampleAttribute) {
            let d = submission.attributeTable
            if (!_.has(d[0], attribute.tag)) {
                d = d.map(rowData => { return { ...rowData, [attribute.tag]: [] } })
            }
            //save feature selection
            
            rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length)
                .forEach(rowIndex =>
                    d[rowIndex][attribute.tag] = addItemsToArrayIfNotPresent({ array: d[rowIndex][attribute.tag], items: selectedFeatures }))
            //update table
            updateSubmission(prevValues => {
                return {
                    ...prevValues, attributeTable: d, rerenderTableDependency: [Math.random()],
                    sampleNames:
                        constructSampleNames({
                            submission_tag: prevValues.tag,
                            sampleNumber: prevValues.sampleNames.length,
                            sampleAttributes: d,
                            sampleGenotypes: prevValues.genotypeAttributes,
                            include_sample_attributes: prevValues.samplesAttributes.map(a => a.tag)
                        })
                }
            })
        }
        else {
            let filteredDatasetAttr = addItemToArrayIfNotPresent({ array: submission.datasetAttributes, item: attribute })
            let datasetAttrValues = submission.datasetAttributeValues
            datasetAttrValues[attribute.tag] = selectedFeatures
            updateSubmission(prevValues => {
                return {
                    ...prevValues, datasetAttributes: filteredDatasetAttr, datasetAttributeValues: datasetAttrValues, rerenderTableDependency: [Math.random()],
                    sampleNames:
                    constructSampleNames({
                        submission_tag: prevValues.tag,
                        sampleNumber: prevValues.sampleNames.length,
                        sampleAttributes: filteredDatasetAttr,
                        sampleGenotypes: prevValues.genotypeAttributes,
                        include_sample_attributes : prevValues.samplesAttributes.map(a => a.tag) })
                }
            })
        }
        setAlertProps({isOpen : false})
    }

    const onReplicateChange = (rowIdcs, replicate, patternIndex) => {
        let reps = submission.replicates
        let numberSamples = submission.sampleNames.length
        if (reps.length === 0) {
            reps = Array(numberSamples).fill(undefined)
        }
        if (reps.length < numberSamples) {
            reps = _.concat(reps,Array(numberSamples - reps.length).fill(undefined))
        }

        if (_.isNumber(replicate)) {
            
            rowIdcs.filter(rowIndex => rowIndex < numberSamples).forEach(rowIndex => reps[rowIndex] = replicate)
        }
        else {
            
            if (patternIndex === 0) {

                let repsByPattern = _.range(numberReplicates).map(rep => rep + 1)
                reps = reps.map((value, idx) => repsByPattern[idx % repsByPattern.length])   

            }

            else if (patternIndex === 1) {
                const repetitions = _.toInteger(numberSamples / numberReplicates+0.5)
                reps = _.flatten(_.range(numberReplicates).map(repIdx => Array(repetitions).fill(repIdx+1)))
            }
        }

        updateSubmission(prevValues => {return{...prevValues,replicates : reps, rerenderTableDependency : [Math.random()]}})
    }


    const onSampleAttrRemove = (path, rowIdces) => {
        let d = submission.attributeTable.slice()
        //handles the removal of a samples attributes
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length)
            .forEach(rowIndex => {
                deleteByPath(d[rowIndex], path)
            })
        
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable: d, rerenderTableDependency: [Math.random()],
                }
            })
        }

    /**
     * Get the selection children from the attribute table by the given path and row index.
     * @param {Object[]} path - The path to find the selection [{type, tag, id, children : [type, tag, id, children]},...]
     * @param {Number} rowIdx The row index in the attribute table to get the correct data. 
     * @returns 
     */
    const getSelectionByPath = (path, rowIdx) => {
        let d = submission.attributeTable.slice()
        // console.log(d[rowIdx], "in finding??", path, rowIdx, d, "d(index), path, rowIdx,")
        return findChildrenByPath(d[rowIdx], path)
    }


    /**
     * Inserts a selected trait into the table data at the given path for the selected row indices.
     * @param {Object[]} path - The path to find the selection [{type, tag, id, children : [type, tag, id, children]},...]
     * @param {Number[]} rowIdces - The row indices in the attribute table to insert the selection.
     * @param {Number} single_child_level - The level of the child to insert.
     * @param {Boolean} single_child_type - Whether to insert a single child type. (e.g. deleting the rest.)
     * @param {Boolean} join_values - Whether to join the values.
     * @param {Boolean} forceInsert - Whether to force the insert.
     */
    const onSampleTraitSelection = (path, rowIdces, single_child_level = 3 , single_child_type = false, join_values = false, forceInsert = false) => {
        let d = submission.attributeTable.slice()
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length)
            .forEach(rowIndex => {
                findAndInsertTree(d[rowIndex], path, single_child_level, single_child_type, join_values, forceInsert)
            })
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable: d, rerenderTableDependency: [Math.random()]
            }
        })
    }

    
    /**
     * 
     * @param {Number} sampleAttrIdx 
     * @param {String} attribute_tag
     */
    const onSampleAttributeSelect = (sampleAttrIdx, attribute_tag) => {
        let sampleAttrs = submission.samplesAttributes.slice()
        let sampleAttr = sampleAttrs[sampleAttrIdx]

        sampleAttrs[sampleAttrIdx] = attribute_tag
        // if the the attribute is selected but at the index there has been already
        // a selection. 
        if (sampleAttr !== attribute_tag) {
            //different tag selected 
            const prevGroupingAttributeTag = sampleAttr.tag
            //requires cleaning up the old tag
            let updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: prevGroupingAttributeTag })
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    samplesAttributes: sampleAttrs,
                    //attributeTable: updatedAttributeTable,
                    rerenderTableDependency: [Math.random()],
                    sampleNames: constructSampleNames({
                        submission_tag: prevValues.tag,
                        sampleNumber: prevValues.sampleNames.length,
                        sampleAttributes: updatedAttributeTable,
                        sampleGenotypes: prevValues.genotypeAttributes,
                        include_sample_attributes : sampleAttrs.map(a => a.tag) })
                }
            })
        }
        else {
            //save sample attribute
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    samplesAttributes: sampleAttrs,
                    rerenderTableDependency: [Math.random()],
                    sampleNames: constructSampleNames({
                        submission_tag: prevValues.tag,
                        sampleNumber: prevValues.sampleNames.length,
                        sampleAttributes: updatedAttributeTable,
                        sampleGenotypes: prevValues.genotypeAttributes,
                        include_sample_attributes : sampleAttrs.map(a => a.tag) })
                }
            })
        }
    }

    /**
     * 
     * @param {Number} sampleAttrIdx - The index of the sample attribute that should be deleted.
     * @returns 
     */
    const removeSampleAttrByIndex = (sampleAttrIdx) => {
        //remove grouping by groupingIdx
        let sampleAttrs = submission.samplesAttributes.slice()
        let attributeTable = submission.attributeTable.slice()
        const updatedSampleAttrs = submission.samplesAttributes.filter((attribute_tag, idx) => idx !== sampleAttrIdx)
        //remove attribute from attribibuteTable
        let attribute_tag = sampleAttrs[sampleAttrIdx]
        let path = [{ type: "attribute", tag: attribute_tag }]
        _.range(attributeTable.length).forEach(rowIndex => deleteByPath(attributeTable[rowIndex], path))
            
        updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    samplesAttributes: updatedSampleAttrs,
                    attributeTable,
                    rerenderTableDependency: [Math.random()],
                }
            })
            return 
        }

    /**
     * @description Resets the alert. 
     */
    const resetAlert = () => {
        // close the alert 
        setAlertProps(prevValues => { return { ...prevValues, isOpen: false } })
    }

    
    return (
        <div>
            <Alert style={{ minWidth: "700px" }} canEscapeKeyCancel={true} canOutsideClickCancel={true}
                onConfirm={resetAlert} onClose={resetAlert} {...alertProps} />

            <SamplesAttributes
                submission_tag={submission.tag}
                sampleNames={submission.sampleNames}
                attributeTable={submission.attributeTable}
                rerenderTableDependency={submission.rerenderTableDependency}
                onSampleTraitSelection={onSampleTraitSelection}
                onTagRemove={onSampleAttrRemove}
                    {...{
                        // attributes: attributesAllowedForDataset,
                    genotypes,
                    getSelectionByPath,
                        addSampleAttr,
                        clearColumnByAttributeTag,
                        clearGenotypeColumn,
                        clearAttributeTableByRowIndex,
                        onSampleAttributeSelect,
                        removeSampleAttrByIndex,
                        groupings: submission.samplesAttributes,
                        genotypeAttributes : submission.genotypeAttributes,
                        onFeatureSelection,
                        proteome_ids,
                        numberReplicates: numberReplicates !==undefined? _.toNumber(numberReplicates) :_.uniq(submission.replicates).length,
                        replicates: submission.replicates,
                        onReplicateChange,
                        handleGenotypeSelection,
                        repeatSelection,
                        }} />
            </div>
    )
}



