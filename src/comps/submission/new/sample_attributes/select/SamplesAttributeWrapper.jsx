
import _  from "lodash"
import { removeKeyInArrayOfObjects } from "../../../../../services/arrays/filter"
import { addStringToArrayOrRemove } from "../../../../../services/arrays/transforms"
import SamplesAttributes from "./SampleAttributes"
import { useState } from "react"
import { Alert } from "@blueprintjs/core"
import { constructSampleNames } from "../../../../../services/samples"
import { get_proteome_id } from "../../InitialSubmission"

export function deleteByPath(data, path, ignore_id = false) {
    if (path.length === 0) return false; // Nothing to delete
  
    const [current, ...restPath] = path;
  
    // Find the index of the node at this level
    const idx = data.findIndex(
      n => n.type === current.type && n.tag === current.tag && (ignore_id || n.id === current.id)
    );
    if (idx === -1) return false; // Node not found
    
    if (restPath.length === 0) {
      // This is the node to delete
      data.splice(idx, 1);
      return true;
    } else {
      // Recurse into children
      if (data[idx].children) {
        return deleteByPath(data[idx].children, restPath, ignore_id);
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

export const findAndInsertTree2 = (
        data,
        path,
        remove_parent_children,
        level = 0
) => {
            if (path.length === 0) return;
            const [current, ...restPath] = path;
            // Find node by type and id
            if (current.tag === undefined || current.id === undefined || current.type === undefined) return;
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
            // else if (forceInsert && restPath.length === 0) {
            //         data.push(current)
            // }

            if (_.has(current, "value") && current.value !== node.value) {
                node.value = current.value; // Update the value if it has changed
                }
            // // Update the value if needed
            // if (node.value === undefined && _.isObject(current) && _.has(current,"value") && current.value) {
            //     node.value = current.value; // Set the value if specified in the path  
            //     node.tag = current.tag // Ensure tag is set 
            //     node.type = current.type // Ensure type is set
            //     node.id = current.id // Ensure id is set
            // }
            // else if (_.has(current, "value") && node.value !== current.value) {
            //     node.value = current.value; // Update the value if it has changed
            //     node.tag = current.tag // Ensure tag is set 
            //     node.type = current.type // Ensure type is set
            //     node.id = current.id // Ensure id is set
            // }
            // Recurse into children, incrementing the level
            findAndInsertTree(node.children, restPath, single_child_level, single_child_type, join_values, forceInsert, level + 1);
};

export const findAndInsertTree = (
    data,
    path,
    options = {},
    level = 0
) => {
    const {
        enforceSingleVariantPerGroup = false,
        enforceAtLevel = 0,
    } = options;
    // Stop if nothing to process
    if (!path || path.length === 0) return;

    const [current, ...restPath] = path;

    // Validate required fields
    if (
        current.tag === undefined ||
        current.id === undefined ||
        current.type === undefined
    ) {
        return;
    }

    // Helper: get base tag (before ":")
    const getBaseTag = (tag) => tag?.split(":")[0];

    // Try to find existing node
    let node = data.find(
        (n) =>
            n.type === current.type &&
            n.id === current.id &&
            n.tag === current.tag
    );
    // Create node if it doesn't exist
    if (!node) {
        node = {
            ...current,
            children: [],
        };

        data.push(node);
    }
  
    if (enforceSingleVariantPerGroup && level > enforceAtLevel) {
        const baseTag = getBaseTag(current.tag);

        for (let i = data.length - 1; i >= 0; i--) {
            const existingBaseTag = getBaseTag(data[i].tag);

            if (
                existingBaseTag === baseTag &&
                data[i] !== node
            ) {
                data.splice(i, 1);
            }
        }
    }
    // Update value if changed
    if (
        Object.prototype.hasOwnProperty.call(current, "value") &&
        current.value !== node.value && current.id === node.id && current.type === node.type
    ) {
        node.value = current.value;
    }

    // Ensure children exists
    if (!node.children) {
        node.children = [];
    }

    // Recurse
    findAndInsertTree(
        node.children,
        restPath,
        options,
        level + 1
    );
};
export function replaceHierarchy(oldData, newNode) {
  if (!Array.isArray(oldData) || oldData.length === 0) {
    return [newNode];
  }

  function replace(nodes) {
    return nodes.map((node) => {
      // Replace matching node completely
      if (
        node.tag === newNode.tag &&
        node.type === newNode.type
      ) {
        return newNode;
      }

      // Traverse children
      if (Array.isArray(node.children) && node.children.length > 0) {
        return {
          ...node,
          children: replace(node.children),
        };
      }

      return node;
    });
  }

  return replace(oldData);
}
/**
 * Replaces a subtree if the same path already exists.
 *
 * The newData always starts from level 0 and contains
 * the FULL hierarchy path you want to replace.
 *
 * Example:
 * oldData:
 * A
 *  └── B
 *
 * newData:
 * A
 *  └── B
 *       └── C
 *
 * Result:
 * A subtree gets completely replaced by newData.
 */

function replaceHierarchy2(oldData, newData) {
  function isMatch(a, b) {
    return (
      a.tag === b.tag &&
      a.type === b.type &&
        a.id === b.id &&
        a.value === b.value
    );
  }

  function replace(nodes, newNode) {
    return nodes.map((node) => {
      // Found matching root -> replace entire subtree
      if (isMatch(node, newNode)) {
        return newNode;
      }

      // Traverse children
      if (node.children?.length) {
        return {
          ...node,
          children: replace(node.children, newNode),
        };
      }

      return node;
    });
  }
    if (oldData === undefined) return newData; 
    if (!_.isArray(oldData) || oldData.length === 0) return newData;

  return replace(oldData, newData);
}



export const checkPathExists = (data, path, ignore_id = false) => {
    if (!_.isArray(data) || data.length === 0) return false; // No data to search
    if (path.length === 0) return false; // Nothing to find
    const [current, ...restPath] = path;

    let node = data.find(
        n => n.type === current.type && n.tag === current.tag && (ignore_id || n.id === current.id) && n.value == current.value //keep == here so that null and undefined return true 
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
    return checkPathExists(node.children, restPath, ignore_id);
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


export const findChildrenByPath = (data, path, ignore_id = false) => {
    const [current, ...restPath] = path;
    //if (!_.isObject(current)) return 
    // Find node by type and tag
    let node = data.find(
        n => n.type === current.type && n.tag === current.tag && (ignore_id || n.id === current.id)
    );

    // If not found, create and push it
    if (!node) return 

    if (restPath.length === 0) {
        return node.children
    } 

    return findChildrenByPath(node.children, restPath);
    }


export const findID = (data, path) => {
    const node = findPath(data, path);
    return node ? node.id : undefined;
}

export function addIDToPath(path, id) {
    return path.map(p => { return { ...p, id } })
}

export function addIDToHierarchy(data, id) {
    return data.map(item => {
        const newItem = { ...item, id };
        if (item.children && item.children.length > 0) {
            newItem.children = addIDToHierarchy(item.children, id);
        }
        return newItem;
    });
}

/**
 * Wrapper for the sample attribute table component.
 * @param {Object} props 
 * @param {Object} props.submission - The submission object (e.g. coming from a useState) 
 * @param {Function} props.updateSubmission - The submission update function (e.g. coming from a useState) 
 * @param {Number} props.numberReplicates - The number of replicates for the submission
 * @returns 
*/
export function SampleAttributeTableWrapper({ submission, updateSubmission, numberReplicates}) {
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
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length)
            .forEach((rowIndex) => deleteByPath(attributeTable[rowIndex],[{ type: "attribute", tag: attribute_tag, id : submission.referenceIDs[rowIndex] }], false))
        
        
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

        _.range(attributeTable.length).forEach(rowIndex => deleteByPath(attributeTable[rowIndex], path, true))        

        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable, rerenderTableDependency: [Math.random()]
            }
        })
    }

    /**
     * 
     * @param {Number[]} rowIdcs The selected table rowIndex
     * @param {String} genotype_tag - The selected genotype tag to be added or removed from the selected rows
     */
    const handleGenotypeSelection = (rowIdces, genotype_tag) => {
        let genotype_tags = submission.genotypes
        
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length)
            .forEach(rowIndex => {
                genotype_tags[rowIndex] = addStringToArrayOrRemove({array: genotype_tags[rowIndex], string : genotype_tag})
            })
        updateSubmission(prevValues => {
            return {
                ...prevValues, genotypes : genotype_tags, rerenderTableDependency: [Math.random()]
            }
        })
    }
    
    

    const clearGenotypeColumn = (rowIdcs) => {

        if (_.isArray(rowIdcs)) {

            let genotypes = submission.genotypes
            _.forEach(rowIdcs, rowIdx => {
                genotypes[rowIdx] = []
            })
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    genotypes: genotypes,
                    rerenderTableDependency: [Math.random()]
                }
            })
        }
        else {
            //if not an array remove all
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    genotypes : [],
                    rerenderTableDependency: [Math.random()],
                }
            })
        }
        
    }

    const repeatSelection = (rowIdcs, attribute_tag) => {


        let d = submission.attributeTable.slice()
        const n_samples = d.length
        const selection = rowIdcs.map(rowIdx => d[rowIdx].filter(p => p.type === "attribute" && p.tag === attribute_tag)).slice()
        const lastIdx = rowIdcs.at(-1)
        const diff = (n_samples + 1) - lastIdx
        const n_repeat = _.toInteger((diff) / rowIdcs.length + 0.5)
        const fillValues = Array(n_repeat).fill(selection).flat();
        _.forEach(_.range(diff), idx => {  
            const rowIndex = lastIdx + 1 + idx 
            // console.log(rowIndex)
            // console.log(fillValues.at(idx % rowIdcs.length))
            const id = submission.referenceIDs[rowIndex] 
            if (id !== undefined) { 
                const v = addIDToHierarchy(fillValues.at(idx % rowIdcs.length).slice(), id)

                d[rowIndex] = [...d[rowIndex].filter(p => p.type === "attribute" && p.tag !== attribute_tag), ...addIDToHierarchy(v, id)]
               
            }
        })
        updateSubmission(prevValues => {
            return {
                ...prevValues,
                attributeTable: d,
                rerenderTableDependency: [Math.random()]
            }
        })
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


    const onSampleAttrRemove = (path, rowIdces, referenceID) => {
        let d = submission.attributeTable.slice()
        //handles the removal of a samples attributes
        if (!_.isArray(rowIdces)) return
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length)
            .forEach(rowIndex => {
   
                deleteByPath(d[rowIndex], path, false)
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
    const getSelectionByPath = (path, rowIdx, ignore_id = false) => {
        let d = submission.attributeTable.slice()
        return findChildrenByPath(d[rowIdx], path, ignore_id)
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
    const onSampleTraitSelection = (path, rowIdces, enforceSingleVariantPerGroup = false, enforceAtLevel = 1) => {
        let d = submission.attributeTable.slice()
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length).filter(rowIndex => !checkPathExists (d[rowIndex], path, false))
            .forEach(rowIndex => {
                 findAndInsertTree(d[rowIndex], addIDToPath(path, submission.referenceIDs[rowIndex]), {
                     enforceSingleVariantPerGroup ,
                     enforceAtLevel
                        })
            })
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable: d, rerenderTableDependency: [Math.random()]
            }
        })
    }

    const onPasteRowsForAttribute = (attribute_tag, copiedRows, rowIdces) => {

        let d = submission.attributeTable.slice()
        const selection = copiedRows.map(rowIdx => d[rowIdx].filter(p => p.type === "attribute" && p.tag === attribute_tag)).slice()

        _.forEach(rowIdces, rowIndex => {  
            
            const id = submission.referenceIDs[rowIndex] 
            if (id !== undefined) { 
                const v = addIDToHierarchy(selection.at(rowIndex % copiedRows.length).slice(), id)
                d[rowIndex] = [...d[rowIndex].filter(p => p.type === "attribute" && p.tag !== attribute_tag), ...addIDToHierarchy(v, id)]
               
            }
        })

        updateSubmission(prevValues => {
            return {
                ...prevValues,
                attributeTable: d,
                rerenderTableDependency: [Math.random()]
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
        <div style={{minHeight:"600x", overflow: "scroll"}}>
            <Alert style={{ minWidth: "700px" }} canEscapeKeyCancel={true} canOutsideClickCancel={true}
                onConfirm={resetAlert} onClose={resetAlert} {...alertProps} />

            <SamplesAttributes
                submission_tag={submission.tag}
                referenceIDs={submission.referenceIDs}
                sampleNames={submission.sampleNames}
                attributeTable={submission.attributeTable}
                rerenderTableDependency={submission.rerenderTableDependency}
                onSampleTraitSelection={onSampleTraitSelection}
                onTagRemove={onSampleAttrRemove}
                onPasteRowsInAttribute = {onPasteRowsForAttribute}
                    {...{
                        // attributes: attributesAllowedForDataset,
                    genotypes : submission.genotypes,
                    getSelectionByPath,
                    addSampleAttr,
                    clearColumnByAttributeTag,
                    clearGenotypeColumn,
                    clearAttributeTableByRowIndex,
                    onSampleAttributeSelect,
                    removeSampleAttrByIndex,
                    groupings: submission.samplesAttributes,
                    genotypeAttributes : submission.genotypeAttributes,
                    // onFeatureSelection,
                    proteome_ids,
                    numberReplicates: numberReplicates !==undefined? _.toNumber(numberReplicates) :_.uniq(submission.replicates).length,
                    replicates: submission.replicates,
                    onReplicateChange,
                    handleGenotypeSelection,
                    repeatSelection
                        }} />
            </div>
    )
}



