
import _ from "lodash"
import Loading from "../../../../core/base/loading"
import { useGetSubmissionAttributesByTag } from "../../../../../hooks/queries/submission.hooks"
import { groupListByProperty } from "../../../../../services/arrays/groupby"
import { clearArrayOfObjectsByKeyName, removeKeyInArrayOfObjects } from "../../../../../services/arrays/filter"
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent, addItemsToArrayIfNotPresent, addItemsToArrayOrRemoveItIfPresent } from "../../../../../services/arrays/transforms"
import SamplesAttributes from "./SampleAttributes"
import { useMemo, useState } from "react"
import { Alert } from "@blueprintjs/core"
import { constructSampleNames } from "../../../../../services/samples"
import { get_proteome_id } from "../../InitialSubmission"


export function SampleAttributeTableWrapper({ submission, updateSubmission, numberReplicates, genotypes }) {
    // wrapper to the sample attributes table 
    const [alertProps, setAlertProps] = useState({isOpen : false, children : <div></div>})
    const { data: attributesByTag, isSuccess, isLoading, isFetching } = useGetSubmissionAttributesByTag()
    const proteome_ids = get_proteome_id(submission.datasetAttributeValues)

    const { attributeValuesByAtrributeID, attributesAllowedForDataset } = useMemo((
                ) => {
                if (!isSuccess) return []
                let attributeValues = _.flatten(_.values(attributesByTag.attribute_values))
                let attributes = _.flatten(_.values(attributesByTag.attributes))
                return ({
                    attributeValuesByAtrributeID: groupListByProperty(attributeValues, "attribute_id"),
                    attributesAllowedForDataset : attributes.filter(attribute => attribute["allow_for_dataset"])
                })
            }, [isSuccess])
    if (isLoading || isFetching) return <Loading />
    
    const addSampleAttr = () => {
        //adds a new sample attribute
        updateSubmission(prevValues => { return { ...prevValues, samplesAttributes: _.concat(prevValues.samplesAttributes, {}) } })
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
                sampleNames: constructSampleNames(prevValues.tag, prevValues.sampleNames.length, attributeTable, prevValues.genotypeAttributes)
            }
        })
    }

    const clearSampleAttrByIndex = (attributeTag) => {
        // clears the complete column of the samples attributes
        let attributeTable  = clearArrayOfObjectsByKeyName({array : submission.attributeTable,keyName : attributeTag, newValue : []})
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable, rerenderTableDependency: [Math.random()], sampleNames:
                    constructSampleNames(prevValues.tag, prevValues.sampleNames.length, attributeTable, prevValues.genotypeAttributes)
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
                    constructSampleNames(prevValues.tag, prevValues.sampleNames.length, prevValues.attributeTable, genotypeAttributes)
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
                        constructSampleNames(prevValues.tag, prevValues.sampleNames.length, prevValues.attributeTable, genotypeAttributes)
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
                        constructSampleNames(prevValues.tag, prevValues.sampleNames.length, prevValues.attributeTable, [])
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
                    constructSampleNames(prevValues.tag, prevValues.sampleNames.length, attributeTable, prevValues.genotypeAttributes)
            }
        })
    }

    const onFeatureSelection = (attribute, selectedFeatures, isSampleAttribute, rowIdces, genotypeLabel, entryIdx) => {
        if (attribute.allow_for_genotype) {
            genotypeSelection(genotypeLabel,attribute.tag,selectedFeatures[0],entryIdx) //double check entry!! 
        }
        else if (isSampleAttribute) {
            let d = submission.attributeTable
            if (!_.has(d[0],attribute.tag)) {
                d = d.map(rowData => {return { ...rowData, [attribute.tag] : []}})
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
                    constructSampleNames(prevValues.tag, prevValues.sampleNames.length, d, prevValues.genotypeAttributes)}
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
                        constructSampleNames(prevValues.tag, prevValues.sampleNames.length, filteredDatasetAttr, prevValues.genotypeAttributes)
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
                    sampleNames: constructSampleNames(prevValues.tag, prevValues.sampleNames.length, attributeTable, prevValues.genotypeAttributes)
                }
            })
        }
    }

    const onSampleAttributeValueSelect = (attributeTag, attributeValueTag, rowIdces) => {
        //on selection of a sample attribute value
        let d = submission.attributeTable
        if (!_.has(d[0], attributeTag)) {
            d = d.map(rowData => { return { ...rowData, [attributeTag]: [] } })
        }
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length)
            .forEach(rowIndex => d[rowIndex][attributeTag] = addItemToArrayOrRemoveItIfPresent({ array: d[rowIndex][attributeTag], item: attributeValueTag }))
        
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable: d, rerenderTableDependency: [Math.random()],
                sampleNames: constructSampleNames(prevValues.tag, prevValues.sampleNames.length, d, prevValues.genotypeAttributes)
            }
        })
    }

    /**
     * @description Handles the input of the value and the unit. 
     * @param {import("../../../../../types/attributes").Attribute} attribute 
     * @param {*} units 
     * @param {Number[]} rowIdces 
     */
    const onSamplesAttributeUnitInput = (attribute, attributeValue ,units, rowIdces) => {
        let attributeUnitSelection = submission.samplesAttributeUnit[attribute.tag]
        console.log(rowIdces)
        rowIdces
            .filter(rowIndex => rowIndex < submission.sampleNames.length)
            .forEach(rowIndex => _.isObject(attributeValue) ?
                attributeUnitSelection[rowIndex] = { ...attributeUnitSelection[rowIndex], [attributeValue.tag]: units } : 
                attributeUnitSelection[rowIndex] = units
            )

        updateSubmission(prevValues => {
            return {
                ...prevValues, 
                samplesAttributesUnit: { ...prevValues.samplesAttributeUnit, [attribute.tag]: attributeUnitSelection },
                rerenderTableDependency: [Math.random()]
        }})
    }

    /**
     * 
     * @param {Number} sampleAttrIdx 
     * @param {import("../../../../../types/attributes").Attribute} attribute 
     */
    const onSampleAttributeSelect = (sampleAttrIdx, attribute) => {
        
        let sampleAttrs = submission.samplesAttributes.slice()
        let sampleAttr = sampleAttrs[sampleAttrIdx]
        //handle unit input by the user and prepare the required list... 
        const attributeHasUnits = attribute.has_unit 
        const samplesAttributeUnit = _.has(submission,"samplesAttributeUnit") ? submission.samplesAttributeUnit : {[attribute.tag] : []}
        if (attributeHasUnits) {
            samplesAttributeUnit[attribute.tag] = _.map(_.range(submission.sampleNames.length), sampleIdx => [])
        }
        sampleAttrs[sampleAttrIdx] = attribute
        // if the the attribute is selected but at the index there has been already
        // a selection. 
        if (_.isObject(sampleAttr) && sampleAttr.tag !== attribute.tag) {
            //different tag selected 
            const prevGroupingAttributeTag = sampleAttr.tag
            if (_.has(samplesAttributeUnit, prevGroupingAttributeTag)) delete samplesAttributeUnit[prevGroupingAttributeTag]
            //requires cleaning up the old tag
            let updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: prevGroupingAttributeTag })
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    samplesAttributes: sampleAttrs,
                    samplesAttributeUnit,
                    attributeTable: updatedAttributeTable,
                    rerenderTableDependency: [Math.random()],
                    sampleNames: constructSampleNames(prevValues.tag, prevValues.sampleNames.length, updatedAttributeTable, prevValues.genotypeAttributes)
                }
            })
        }
        else {
            //save sample attribute
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    samplesAttributes: sampleAttrs,
                    samplesAttributeUnit,
                    rerenderTableDependency: [Math.random()],
                    sampleNames: constructSampleNames(prevValues.tag, prevValues.sampleNames.length, prevValues.attributeTable, prevValues.genotypeAttributes)
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
        //remove attribute from attribibuteTable
        let samplAttribute = sampleAttrs[sampleAttrIdx]
        if (_.has(samplAttribute, "tag")) {
            let groupingAttributeTag = samplAttribute.tag 
            const updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: groupingAttributeTag })
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    samplesAttributes: prevValues.samplesAttributes.filter((groupInfo, idx) => idx !== sampleAttrIdx),
                    attributeTable: updatedAttributeTable,
                    rerenderTableDependency: [Math.random()],
                    sampleNames: constructSampleNames(prevValues.tag, prevValues.sampleNames.length, updatedAttributeTable, prevValues.genotypeAttributes)
                }
            })
            return 
        }

        updateSubmission(prevValues => {
            return {
                ...prevValues,
                samplesAttributes: prevValues.samplesAttributes.filter((groupInfo, idx) => idx !== sampleAttrIdx),
                rerenderTableDependency: [Math.random()],
                sampleNames: constructSampleNames(prevValues.tag, prevValues.sampleNames.length, prevValues.attributeTable, prevValues.genotypeAttributes)
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

    return (
        <div>
            <Alert style={{ minWidth: "700px" }} canEscapeKeyCancel={true} canOutsideClickCancel={true}
                onConfirm={resetAlert} onClose={resetAlert} {...alertProps} />

            <SamplesAttributes
            sampleNames={submission.sampleNames}
            attributeTable={submission.attributeTable}
            rerenderTableDependency={submission.rerenderTableDependency}
            attributeValuesByID={attributeValuesByAtrributeID}
            onAttributeSelect={onSampleAttributeValueSelect}
            onTagRemove={onSampleAttrRemove}
            {...{
                attributes: attributesAllowedForDataset,
                genotypes,
                addSampleAttr,
                clearSampleAttrByIndex,
                clearGenotypeColumn,
                clearAttributeTableByRowIndex,
                onSampleAttributeSelect,
                onSamplesAttributeUnitInput,
                removeSampleAttrByIndex,
                samplesAttributeUnit : submission.samplesAttributeUnit,
                groupings: submission.samplesAttributes,
                genotypeAttributes : submission.genotypeAttributes,
                onFeatureSelection,
                proteome_ids,
                numberReplicates: numberReplicates !==undefined?numberReplicates :_.uniq(submission.replicates).length,
                replicates: submission.replicates,
                    onReplicateChange,
                    handleGenotypeSelection,
                    repeatSelection
                }} />
            </div>
    )
}



