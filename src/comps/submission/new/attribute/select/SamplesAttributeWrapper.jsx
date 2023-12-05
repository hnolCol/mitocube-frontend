
import _ from "lodash"
import Loading from "../../../../core/base/loading"
import { useGetSubmissionAttributesByTag } from "../../../../../hooks/queries/submission.hooks"
import { groupListByProperty } from "../../../../../services/arrays/groupby"
import { clearArrayOfObjectsByKeyName, removeKeyInArrayOfObjects } from "../../../../../services/arrays/filter"
import { addItemToArrayOrRemoveItIfPresent } from "../../../../../services/arrays/transforms"
import SamplesAttributes from "./SampleAttributes"
import { useMemo, useState } from "react"
import FeatureSelection from "../../FeatureSelection"
import { Alert } from "@blueprintjs/core"
import { constructSampleNames } from "../../../../../services/samples"


export function SampleAttributeTableWrapper({ submission, attributes, updateSubmission, numberReplicates }) {
    // wrapper to the sample attributes table 
    const [alertProps, setAlertProps] = useState({isOpen : false, children : <div></div>})
    const { data: attributesByTag, isSuccess, isLoading, isFetching } = useGetSubmissionAttributesByTag()

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
        updateSubmission(prevValues => { return { ...prevValues, samplesAttributes: _.concat(prevValues.samplesAttributes, { name: "", attribute: undefined }) } })
    }

    const clearAttributeTableByRowIndex = (rowIdces, attributeTag) => {
        //clear rows in table for specific attribute by its tg
        let attributeTable = submission.attributeTable
        rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length).forEach((rowIndex) => attributeTable[rowIndex][attributeTag] = [])
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable,
                rerenderTableDependency: [Math.random()],
                sampleNames: constructSampleNames(submission.label, submission.sampleNames.length, submission.attributeTable)
            }
        })
    }

    const clearSampleAttrByIndex = (attributeTag) => {
        // clears the complete column of the samples attributes
        let attributeTable  = clearArrayOfObjectsByKeyName({array : submission.attributeTable,keyName : attributeTag, newValue : []})
        updateSubmission(prevValues => {
            return {
                ...prevValues, attributeTable, rerenderTableDependency: [Math.random()], sampleNames:
                    constructSampleNames(submission.label, submission.sampleNames.length, attributeTable)
            }
        })
    }


    const handleFeatureSelection = ({attribute, isSampleAttribute=false, rowIdces = [], genotypeLabel = undefined, entryIdx=0}) => {
        //handle feature selection of a samples attribute
        if (!_.has(submission.datasetAttributeValues, "att_organism")
            || submission.datasetAttributeValues["att_organism"].length === 0) {
            //if organism has not been selected prompt a warning.
            setAlertProps({ isOpen: true, children: <div><h3>Error</h3><p>Please select one or multiple organisms first.</p></div> })
            return 
        }
        let sampleAttributeTable = submission.attributeTable 
        let featuresSelectedInSampleAttributeTable = rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length && _.has(sampleAttributeTable[rowIndex],attribute.tag)).map(rowIndex => sampleAttributeTable[rowIndex][attribute.tag])
        let selectedItems = isSampleAttribute ?  _.uniq(_.flatten(featuresSelectedInSampleAttributeTable)) : _.has(submission.datasetAttributeValues,attribute.tag) ? submission.datasetAttributeValues[attribute.tag] : []

        setAlertProps({
            isOpen: true,
            confirmButtonText: "Cancel",
            children: <FeatureSelection {...{
                selectedItems,
                attribute,
                rowIdces,
                entryIdx,
                genotypeLabel,
                organisms: submission.datasetAttributeValues["att_organism"],
                isSampleAttribute,
                onSave : onFeatureSelection
            }} />
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
            rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length).forEach(rowIndex =>  d[rowIndex][attribute.tag] = selectedFeatures )
            //update table
            updateSubmission(prevValues => { return { ...prevValues, attributeTable: d, rerenderTableDependency: [Math.random()] } })
            }
        else {
            let filteredDatasetAttr = addItemToArrayIfNotPresent({ array: submission.datasetAttributes, item: attribute })
            let datasetAttrValues = submission.datasetAttributeValues
            datasetAttrValues[attribute.tag] = selectedFeatures
            updateSubmission(prevValues => { return {...prevValues, datasetAttributes : filteredDatasetAttr, datasetAttributeValues : datasetAttrValues, rerenderTableDependency: [Math.random()]}})
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
            updateSubmission(prevValues => {return {...prevValues,attributeTable, rerenderTableDependency : [Math.random()],sampleNames: constructSampleNames(submission.label, submission.sampleNames.length, attributeTable)}})
        }
    }

    const onSampleAttributeRename = (sampleAttrIdx, sampleAttributeName) => {
        //rename the samples attribute ("Grouping")
        let sampleAttrs = submission.samplesAttributes
        sampleAttrs[sampleAttrIdx].name = sampleAttributeName
        updateSubmission(prevValues => {return {...prevValues, samplesAttributes : sampleAttrs} })
    }
    const onSampleAttributeValueSelect = (attributeTag, attributeValueTag, rowIdces) => {
        //on selection of a sample attribute value
        let d = submission.attributeTable
        if (!_.has(d[0], attributeTag)) {
            d = d.map(rowData => { return { ...rowData, [attributeTag]: [] } })
        }
        rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length).forEach(rowIndex =>  d[rowIndex][attributeTag] = addItemToArrayOrRemoveItIfPresent({array:d[rowIndex][attributeTag],item:attributeValueTag}))
        updateSubmission(prevValues => {return{...prevValues,attributeTable : d, rerenderTableDependency : [Math.random()],sampleNames: constructSampleNames(submission.label, submission.sampleNames.length, d)}})
    }

    const onSampleAttributeSelect = (sampleAttrIdx, sampleAttrName, attribute, attributeChanged = false) => {
        // To DO: Rename to sample attribute
        let sampleAttrs = submission.samplesAttributes.slice()
        let sampleAttr = sampleAttrs[sampleAttrIdx]
        if (!_.isObject(attribute)) {
            sampleAttrs[sampleAttrIdx] = {
                name: sampleAttrName,
                attribute: _.isObject(sampleAttr) ? sampleAttr.attribute : undefined
            }
        }
        else {
            
            if (_.isObject(sampleAttr.attribute) && sampleAttr.attribute.tag !== attribute.tag) {
                //different tag selected 
                const prevGroupingAttributeTag = sampleAttr.attribute.tag
                //requires cleaning up the old ag
                let updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: prevGroupingAttributeTag })
                sampleAttrs[sampleAttrIdx] = {name : sampleAttrName === ""? attribute.name : sampleAttrName, attribute}
                updateSubmission(prevValues => {
                    return {
                        ...prevValues,
                        samplesAttributes: sampleAttrs,
                        attributeTable: updatedAttributeTable,
                        rerenderTableDependency: [Math.random()],
                        sampleNames: constructSampleNames(submission.label, submission.sampleNames.length, updatedAttributeTable)
                    }
                })
                // warnForMandatoryAttr(sampleAttrs[sampleAttrIdx])
                return 
            }
            sampleAttrs[sampleAttrIdx] = {
                name: sampleAttrName === "" ? attribute.name : sampleAttrName,
                attribute
            }
        }
        // if (attributeChanged) {
        //     // only warn again if changed.
        //     warnForMandatoryAttr(sampleAttrs[sampleAttrIdx])
        // }
        updateSubmission(prevValues => {return {...prevValues, samplesAttributes : sampleAttrs, rerenderTableDependency : [Math.random()],sampleNames: constructSampleNames(submission.label, submission.sampleNames.length, submission.attributeTable)} })
    }

    const removeSampleAttrByIndex = (sampleAttrIdx) => {
        //remove grouping by groupingIdx
        let sampleAttrs = submission.samplesAttributes
        //remove attribute from attribibuteTable
        let samplAttribute = sampleAttrs[sampleAttrIdx].attribute
        if (_.has(samplAttribute, "tag")) {
            let groupingAttributeTag = samplAttribute.tag 
            const updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: groupingAttributeTag })
            updateSubmission(prevValues => {
                return {
                    ...prevValues,
                    samplesAttributes: prevValues.samplesAttributes.filter((groupInfo, idx) => idx !== sampleAttrIdx),
                    attributeTable: updatedAttributeTable,
                    rerenderTableDependency: [Math.random()],
                    sampleNames: constructSampleNames(submission.label, submission.sampleNames.length, updatedAttributeTable)
                }
            })
            return 
        }

        updateSubmission(prevValues => {
            return {
                ...prevValues,
                samplesAttributes: prevValues.samplesAttributes.filter((groupInfo, idx) => idx !== sampleAttrIdx),
                rerenderTableDependency: [Math.random()],
                sampleNames: constructSampleNames(submission.label, submission.sampleNames.length, submission.attributeTable)
            }
        })
    }
    
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
                attributes : attributesAllowedForDataset,
                addSampleAttr,
                clearSampleAttrByIndex,
                clearAttributeTableByRowIndex,
                onSampleAttributeSelect,
                onSampleAttributeRename,
                removeSampleAttrByIndex,
                groupings: submission.samplesAttributes,
                handleFeatureSelection,
                numberReplicates: numberReplicates !==undefined?numberReplicates :_.uniq(submission.replicates).length,
                replicates: submission.replicates,
                onReplicateChange
                }} />
            </div>
    )
}



