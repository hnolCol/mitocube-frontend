
import _ from "lodash"
import Loading from "../../../../core/base/loading"
import { useGetSubmissionAttributesByTag } from "../../../../../hooks/queries/submission.hooks"
import { clearArrayOfObjectsByKeyName, removeKeyInArrayOfObjects } from "../../../../../services/arrays/filter"
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent, addItemsToArrayIfNotPresent, addItemsToArrayOrRemoveItIfPresent, addStringToArrayOrRemove } from "../../../../../services/arrays/transforms"
import SamplesAttributes from "./SampleAttributes"
import { useMemo, useState } from "react"
import { Alert } from "@blueprintjs/core"
import { constructSampleNames } from "../../../../../services/samples"
import { get_proteome_id } from "../../InitialSubmission"

function deleteByPath(data, path) {
    if (path.length === 0) return false; // Nothing to delete
  
    const [current, ...restPath] = path;
  
    // Find the index of the node at this level
    const idx = data.findIndex(
      n => n.type === current.type && n.tag === current.tag
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
  
const findAndInsertTree = (
        data,
        path,
        valueToInsert,
        single_child_type = true,
        level = 0
      ) => {
        if (path.length === 0) return;
        console.log(path)
        const [current, ...restPath] = path;
        console.log(current)
        // Find node by type and tag
        let node = data.find(
          n => n.type === current.type && n.tag === current.tag
        );
      
        // If not found, create and push it
        if (!node) {
          node = { ...current, children: [] };
          // Only apply single_child_type restriction at level >= 3
          if (single_child_type && level >= 2) {
            // Remove all nodes of the same type at this level
            for (let i = data.length - 1; i >= 0; i--) {
              if (data[i].type === current.type) {
                data.splice(i, 1);
              }
            }
          }
          data.push(node);
        }
      
        // If this is the last element in the path, set the value
        if (restPath.length === 0) {
          node.value = valueToInsert;
          return;
        }
      
        // Recurse into children, incrementing the level
        findAndInsertTree(node.children, restPath, valueToInsert, single_child_type, level + 1);
      };



const findChildrenByPath = (data, path) => {
    const [current, ...restPath] = path;
    //if (!_.isObject(current)) return 
    // Find node by type and tag
    let node = data.find(
        n => n.type === current.type && n.tag === current.tag
    );

    // If not found, create and push it
    if (!node) return 

    if (restPath.length === 0) {
        return node.children
    } 

    return findChildrenByPath(node.children, restPath);
    }


export function SampleAttributeTableWrapper({ submission, updateSubmission, numberReplicates, genotypes }) {
    // wrapper to the sample attributes table 
    const [alertProps, setAlertProps] = useState({isOpen : false, children : <div></div>})
    const { data: attributesByTag, isSuccess, isLoading, isFetching } = useGetSubmissionAttributesByTag()
    const proteome_ids = get_proteome_id(submission.datasetAttributeValues)

    if (isLoading || isFetching) return <Loading />

    const addSampleAttr = () => {
        //adds a new sample attribute
        updateSubmission(prevValues => { return { ...prevValues, samplesAttributes: _.concat(prevValues.samplesAttributes, [[]]) } })
    }
    const clearAttributeTableByRowIndex = (rowIdces, attributeTag) => {
        //clear rows in table for specific attribute by its tg
        let attributeTable = submission.attributeTable
        rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length).forEach((rowIndex) => attributeTable[rowIndex][attributeTag] = [])
        updateSubmission(prevValues => {
            return {
                ...prevValues,
                attributeTable,
                rerenderTableDependency: [Math.random()],
                sampleNames: constructSampleNames({
                    submission_tag: prevValues.tag,
                    sampleNumber: prevValues.sampleNames.length,
                    sampleAttributes: attributeTable,
                    sampleGenotypes: prevValues.genotypeAttributes,
                    include_sample_attributes : prevValues.samplesAttributes.map(a => a.tag) })
            }
        })
    }

    const clearSampleAttrByIndex = (attributeTag) => {
        // clears the complete column of the samples attributes
        let attributeTable  = clearArrayOfObjectsByKeyName({array : submission.attributeTable,keyName : attributeTag, newValue : []})
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable, rerenderTableDependency: [Math.random()], sampleNames:
                constructSampleNames({
                    submission_tag: prevValues.tag,
                    sampleNumber: prevValues.sampleNames.length,
                    sampleAttributes: attributeTable,
                    sampleGenotypes: prevValues.genotypeAttributes,
                    include_sample_attributes : prevValues.samplesAttributes.map(a => a.tag) })
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

    const repeatSelection = (rowIdcs, attributeTag) => {
        let attributeTable = submission.attributeTable
        const n_samples = attributeTable.length
        const selection = rowIdcs.map(rowIdx => attributeTable[rowIdx][attributeTag])
        const lastIdx = rowIdcs.at(-1)
        const diff = (n_samples+1) - lastIdx
        const n_repeat = _.toInteger((diff) / rowIdcs.length+0.5)
        const values = Array(n_repeat).fill(selection).flat();
        _.forEach(_.range(diff), idx => _.isObject(attributeTable[lastIdx + 1 + idx]) ? attributeTable[lastIdx + 1 + idx][attributeTag] = values.at(idx % rowIdcs.length): null)
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable, rerenderTableDependency: [Math.random()],
                sampleNames:
                constructSampleNames({
                    submission_tag: prevValues.tag,
                    sampleNumber: prevValues.sampleNames.length,
                    sampleAttributes: attributeTable,
                    sampleGenotypes: prevValues.genotypeAttributes,
                    include_sample_attributes : prevValues.samplesAttributes.map(a => a.tag) })
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


    const onSampleAttrRemove = (rowIndex, attribute, attributeValueTag) => {
        //handles the removal of a samples attributes
        let attributeTable = submission.attributeTable
        let rowData = attributeTable[rowIndex]
      
        if (_.has(rowData,attribute.tag)){
            rowData[attribute.tag] = rowData[attribute.tag].filter(attrValueTag => attrValueTag !== attributeValueTag)
            attributeTable[rowIndex] = rowData
            updateSubmission(prevValues => {
                return {
                    ...prevValues, attributeTable, rerenderTableDependency: [Math.random()],
                    sampleNames: constructSampleNames({
                        submission_tag: prevValues.tag,
                        sampleNumber: prevValues.sampleNames.length,
                        sampleAttributes: attributeTable,
                        sampleGenotypes: prevValues.genotypeAttributes,
                        include_sample_attributes : prevValues.samplesAttributes.map(a => a.tag) })
                }
            })
        }
    }


    const getSelectionByPath = (path, rowIdx) => {
        let d = submission.attributeTable.slice()
        // console.log(d[rowIdx], "in finding??", path, rowIdx, d, "d(index), path, rowIdx,")
        return findChildrenByPath(d[rowIdx], path)
    }

    const onSampleTraitSelection = (path, rowIdces, value) => {
        console.log(path, rowIdces)
        const attribute_tag = _.head(path).tag
        let d = submission.attributeTable.slice()
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length)
            .forEach(rowIndex => findAndInsertTree(d[rowIndex], path, value))
        console.log("done?")
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable: d, rerenderTableDependency: [Math.random()],
                // sampleNames: constructSampleNames({
                //     submission_tag: prevValues.tag,
                //     sampleNumber: prevValues.sampleNames.length,
                //     sampleAttributes: d,
                //     sampleGenotypes: prevValues.genotypeAttributes,
                //     include_sample_attributes: prevValues.samplesAttributes.map(a => a.tag)
                // })
            }
        })
    }

    // const onSampleTraitSelection = (attribute_tag, trait_tag, rowIdces) => {
    //     //on selection of a sample attribute value
    //     let d = submission.attributeTable
    //     if (!_.has(d[0], attribute_tag)) {
    //         d = d.map(rowData => { return { ...rowData, [attribute_tag]: [] } })
    //     }
    //     rowIdces
    //         .filter(rowIndex => rowIndex < submission.sampleNames.length)
    //         .forEach(rowIndex => d[rowIndex][attribute_tag] = addStringToArrayOrRemove({ array: d[rowIndex][attribute_tag], string: trait_tag }))
    //     console.log(attribute_tag, trait_tag)

    //     console.log(rowIdces, d)
        // updateSubmission(prevValues => {
        //     return {
        //         ...prevValues, attributeTable: d, rerenderTableDependency: [Math.random()],
        //             sampleNames: constructSampleNames({
        //             submission_tag: prevValues.tag,
        //             sampleNumber: prevValues.sampleNames.length,
        //             sampleAttributes: d,
        //             sampleGenotypes: prevValues.genotypeAttributes,
        //             include_sample_attributes : prevValues.samplesAttributes.map(a => a.tag) })
        //     }
        // })
    // }

    /**
     * 
     * @param {Number} sampleAttrIdx 
     * @param {String} attribute_tag
     */
    const onSampleAttributeSelect = (sampleAttrIdx, attribute_tag) => {
        console.log(sampleAttrIdx,attribute_tag)
        let sampleAttrs = submission.samplesAttributes.slice()
        let sampleAttr = sampleAttrs[sampleAttrIdx]
        //handle unit input by the user and prepare the required list...
        // const samplesAttributeUnit = _.has(submission,"samplesAttributeUnit") ? submission.samplesAttributeUnit : {[attribute.tag] : []}
        // if (attributeHasUnits) {
        //     samplesAttributeUnit[attribute.tag] = _.map(_.range(submission.sampleNames.length), sampleIdx => [])
        // }

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
        let sampleAttrs = submission.samplesAttributes
        const updatedSampleAttrs = submission.samplesAttributes.filter((groupInfo, idx) => idx !== sampleAttrIdx)
        //remove attribute from attribibuteTable
        let samplAttribute = sampleAttrs[sampleAttrIdx]
        if (_.has(samplAttribute, "tag")) {
            let attributeTag = samplAttribute.tag 
            const updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: attributeTag })
            
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    samplesAttributes: updatedSampleAttrs,
                    attributeTable: updatedAttributeTable,
                    rerenderTableDependency: [Math.random()],
                    sampleNames: constructSampleNames({
                        submission_tag: prevValues.tag,
                        sampleNumber: prevValues.sampleNames.length,
                        sampleAttributes: updatedAttributeTable,
                        sampleGenotypes: prevValues.genotypeAttributes,
                        include_sample_attributes : updatedSampleAttrs.map(a => a.tag) })
                }
            })
            return 
        }

        updateSubmission(prevValues => {
            return {
                ...prevValues,
                samplesAttributes: updatedSampleAttrs,
                rerenderTableDependency: [Math.random()],
                sampleNames: constructSampleNames({
                    submission_tag: prevValues.tag,
                    sampleNumber: prevValues.sampleNames.length,
                    sampleAttributes: updatedAttributeTable,
                    sampleGenotypes: prevValues.genotypeAttributes,
                    include_sample_attributes : updatedSampleAttrs.map(a => a.tag) })
            }
        })
    }
    
    /**
     * @description Resets the alert. 
     */
    const resetAlert = () => {
        // close the alert 
        setAlertProps(prevValues => { return { ...prevValues, isOpen: false } })
    }


    /**
     * 
     * @param {Object} userUnitInput - The units object as [attribute_tag][trait_tag][unittype_tag]["value"/"unit"]
     * @param {Number[]} sampleIndices - The sample indices to set the units for. 
     */
    const onUserUnitInput = (attribute_tag, trait_tag, userUnitInput, sampleIndex) => {

        const sampleIndexString = _.toString(sampleIndex)
        const sampleUserInput = submission.sampleUserUnitInput 
        sampleUserInput[sampleIndexString] ??= {}
        sampleUserInput[sampleIndexString][attribute_tag] ??= {}
        sampleUserInput[sampleIndexString][attribute_tag][trait_tag] ??= {}

        sampleUserInput[sampleIndexString][attribute_tag] = {...sampleUserInput[sampleIndexString][attribute_tag], ...userUnitInput[attribute_tag]}

        updateSubmission(prevValues => {return {...prevValues, "sampleUserUnitInput" : sampleUserInput, rerenderTableDependency: [Math.random()]}})

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
                // attributeValuesByID={attributeValuesByAtrributeID}
                onSampleTraitSelection={onSampleTraitSelection}
                onTagRemove={onSampleAttrRemove}
                userUnitInput={submission.sampleUserUnitInput}
                    {...{
                        // attributes: attributesAllowedForDataset,
                    genotypes,
                    getSelectionByPath,
                        addSampleAttr,
                        clearSampleAttrByIndex,
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
                        onUserUnitInput
                        }} />
            </div>
    )
}



