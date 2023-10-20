import { useGetSubmissionsID, useGetSubmissionAttributes, useGetSubmissionMetatext } from "../../../hooks/queries/submission.hooks"
import PropTypes from "prop-types"
import { Header } from "../../core/base/Header"
import APIError from "../../core/error/APIerror"
import AttributeInput from "./attribute/AttributeCombo"
import { useMemo, useState, useEffect } from "react"
import { groupListByProperty } from "../../../services/arrays/groupby"
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { objectHasKey } from "../../../services/objects/checks"
import AttributeGrouping from "./attribute/SampleAttributes"
import _ from "lodash"
import { clearArrayOfObjectsByKeyName, removeKeyInArrayOfObjects } from "../../../services/arrays/filter"
import NumericValueInput from "../../core/input/Numeric"
import { getCurrentDate } from "../../../services/date/format"
import UserSelection from "../../core/input/Users"
import DatasetAttributeSelect from "./attribute/DatasetAttributes"
import DatasetAttributeHierarchy from "./attribute/DatasetAttributesHierarchy"
import TextInput from "../../core/input/Text"
import TextFieldInput from "../../core/input/TextArea"
import { Button } from "@blueprintjs/core"
import HelpOverlay from "../../core/overlay/Helpoverlay"

function constructSampleNames(id, sampleNumber) {
    const date = getCurrentDate()
    const zeroPadding = sampleNumber.toString().length


    return _.range(sampleNumber).map(idx => `${date}_${id}_${(idx+1).toString().padStart(zeroPadding > 1 ? zeroPadding : 2,'0')}`)
}


function InitialSubmission({
    authenticationStatus,
}
) {

    const [submission, setSubmission] = useState({
        sampleNames: [],
        collaborators : [],
        attributeTable: [],
        samplesAttributes: [],
        rerenderTableDependency: 0,
        attributes: {},
        datasetAttributeValues: {},
        datasetAttributes: []
    })
    const { data: submissionID, isLoading: submissionIDLoading, error: submissionAPIError, isError: submissionIsError } = useGetSubmissionsID()
    const {data : metatext, isLoading : metatextIsLoading} = useGetSubmissionMetatext({ tokenString: authenticationStatus.token })


    const { data: submissionAttributes,
        isLoading: attributesLoading,
        error: attributesAPIError,
        isError: attributeIsError,
        isSuccess: attributesIsSuccess } = useGetSubmissionAttributes({ tokenString: authenticationStatus.token }) //
    
    const attributeValuesByAtrributeID = useMemo(() => {
        if (!attributesIsSuccess) return {}
        return groupListByProperty(submissionAttributes.attribute_values, "attribute_id")
    }, [attributesIsSuccess])

    const attributesRequiredForSubmission = useMemo((
        ) => {
            if (!attributesIsSuccess) return []
            return submissionAttributes.attributes.filter(attribute => attribute["mandatory_for_submission"])

        },[attributesIsSuccess])
    

    useEffect(() => {

        //handle changes that effect the samples names 
        const sampleNumber = parseInt(submission.attributes.sampleNumber)
        if (!_.isNumber(sampleNumber)) return 
        if (!_.isObject(submissionID) || !_.isString(submissionID.id)) return

        const sampleNames = constructSampleNames(submissionID.id, sampleNumber)
        

        //adjust attribute table 
        let attributeTable = submission.attributeTable
        if (sampleNames.length > attributeTable.length) {
            //add rows 
            const diff = sampleNames.length - attributeTable.length
            //get the attribute tags that are defined either by checking the existing once from a defined attributeTable otherwise from the grouping info. 
            const existingAttributeTags = attributeTable.length > 0?Object.keys(attributeTable[0]):submission.samplesAttributes.filter(groupInfo => _.isObject(groupInfo.attribute)).map(groupInfo => groupInfo.attribute.tag)
            _.forEach(_.range(diff), () => {
                attributeTable.push(Object.fromEntries(_.map(existingAttributeTags, groupingAttributeTag => [[groupingAttributeTag],[]])))
            })
        }

        setSubmission(prevValues => {return {...prevValues, sampleNames, attributeTable}})

    }, [submission.attributes.sampleNumber,submissionID])

    if (submissionIsError) return <APIError {...{error : submissionAPIError}} />
    if (submissionIDLoading || attributesLoading) return <div>Loading...</div>

    
    const onAttributeChange = (attributeTag, attributeValue) => {
        
        let submissionAttributes = submission.attributes
        submissionAttributes[attributeTag] = attributeValue

        setSubmission(prevValues => {
            {
                return { ...prevValues, attributes: submissionAttributes }
            }
        })
    }

    const addSampleAttr = () => {
        //adds a new grouping
        setSubmission(prevValues => { return { ...prevValues, samplesAttributes: _.concat(prevValues.samplesAttributes, { name: "", attribute: undefined }) } })
    }

    const onSampleAttrRemove = (rowIndex ,attribute, attributeValueTag) => {
        let attributeTable = submission.attributeTable
        let rowData = attributeTable[rowIndex]
      
        if (objectHasKey({ object: rowData, keyName: attribute.tag })){
            
            rowData[attribute.tag] = rowData[attribute.tag].filter(attrValueTag => attrValueTag !== attributeValueTag)
            attributeTable[rowIndex] = rowData
            setSubmission(prevValues => {return {...prevValues,attributeTable, rerenderTableDependency : Math.random()}})
        }
    }

    const clearAttributeTableByRowIndex = (rowIdces, attributeTag) => {
        //clear rows in table for specific attribute
        let attributeTable = submission.attributeTable
        rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length).forEach((rowIndex) => attributeTable[rowIndex][attributeTag] = [])
        setSubmission(prevValues => {return {...prevValues,attributeTable, rerenderTableDependency : Math.random()}})
    }

    const clearGroupingByIndex = (groupingIdx,attributeTag) => {
        let attributeTable  = clearArrayOfObjectsByKeyName({array : submission.attributeTable,keyName : attributeTag, newValue : []})
        setSubmission(prevValues => {return {...prevValues,attributeTable, rerenderTableDependency : Math.random()}})
    }

    const removeSampleAttrByIndex = (sampleAttrIdx) => {
        //remove grouping by groupingIdx
        let groupingInfos = submission.samplesAttributes
        //remove attribute from attribibuteTable
        let groupingAttribute = groupingInfos[sampleAttrIdx].attribute
        if (_.has(groupingAttribute, "tag")) {
            let groupingAttributeTag = groupingAttribute.tag 

            const updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: groupingAttributeTag })
            setSubmission(prevValues => {
                return {
                    ...prevValues,
                    samplesAttributes: prevValues.samplesAttributes.filter((groupInfo, idx) => idx !== sampleAttrIdx),
                    attributeTable : updatedAttributeTable
                }
            })
            return 
        }

        setSubmission(prevValues => {
            return {
                ...prevValues,
                samplesAttributes: prevValues.samplesAttributes.filter((groupInfo, idx) => idx !== sampleAttrIdx)
            }
        })
    }

    const onSampleAttributeValueSelect = (attributeTag, attributeValueTag,rowIdces) => {
        let d = submission.attributeTable
        if (!objectHasKey({ object: d[0], keyName: attributeTag })) {
            d = d.map(rowData => {return { ...rowData, [attributeTag] : []}})
        }

        rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length).forEach(rowIndex =>  d[rowIndex][attributeTag] = addItemToArrayOrRemoveItIfPresent({array:d[rowIndex][attributeTag],item:attributeValueTag}))
        setSubmission(prevValues => {return{...prevValues,attributeTable : d, rerenderTableDependency : Math.random()}})
    }

    const onGroupingRename = (sampleAttrIdx, groupingName) => {
        let groupingInfos = submission.samplesAttributes
        groupingInfos[sampleAttrIdx].name = groupingName

        setSubmission(prevValues => {return {...prevValues, samplesAttributes : groupingInfos} })
    }

    const onGroupingSelect = (sampleAttrIdx, groupingName, attribute) => {
        let sampleAttrs = submission.samplesAttributes.slice()
        let sampleAttr = sampleAttrs[sampleAttrIdx]
        if (!_.isObject(attribute)) {
            //if (groupInfo.name === groupingName) return 
            sampleAttrs[sampleAttrIdx] = {name : groupingName, attribute : _.isObject(sampleAttr) ? sampleAttr.attribute : undefined}
        }
        else {
            
            if (_.isObject(sampleAttr.attribute) && sampleAttr.attribute.tag !== attribute.tag) {
                //different tag selected 
                const prevGroupingAttributeTag = sampleAttr.attribute.tag
                //requires cleaning up the old ag
                let updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: prevGroupingAttributeTag })
                sampleAttrs[sampleAttrIdx] = {name : groupingName, attribute}
                setSubmission(prevValues => {
                    return {
                        ...prevValues,
                        samplesAttributes: sampleAttrs,
                        attributeTable: updatedAttributeTable,
                        rerenderTableDependency: Math.random()
                    }
                })
                return 
            }
            sampleAttrs[sampleAttrIdx] = {name : groupingName, attribute}
        }
        setSubmission(prevValues => {return {...prevValues, samplesAttributes : sampleAttrs} })
        
    }

    const handleDatasetAttributeSelection = (attribute, attributeValue) => {
        let filteredDatasetAttr = addItemToArrayIfNotPresent({ array: submission.datasetAttributes, item: attribute })
        let datasetAttrValues = submission.datasetAttributeValues
        if (_.has(datasetAttrValues, attribute.id)) {
            const attrValuesForAttr = datasetAttrValues[attribute.id]
            const filteredAttrValuesForAttr = addItemToArrayOrRemoveItIfPresent({ array: attrValuesForAttr, item: attributeValue })
            if (filteredAttrValuesForAttr.length === 0) {
               
                delete datasetAttrValues[attribute.id]
                filteredDatasetAttr = filteredDatasetAttr.filter(attr => attr.id !== attribute.id)
            }
            else {
                datasetAttrValues[attribute.id] = filteredAttrValuesForAttr
            }
            
        }
        else {
            datasetAttrValues[attribute.id] = [attributeValue]
        }
        setSubmission(prevValues => { return {...prevValues, datasetAttributes : filteredDatasetAttr, datasetAttributeValues : datasetAttrValues}})
    }

    const handleCollaboratorSelection = (selectedUser) => {
        //save collaborations that are seleted
        setSubmission(prevValues => {return{...prevValues, collaborators : selectedUser}})
    }

    // const handleAttributeSelection = (attributeTag, attributeValue) => {
    //     //handle the selection/deseltion of attribute values
    //     let selectedAttributes = []
    //     if (objectHasKey({object : submission, keyName : attributeTag})) {
    //         selectedAttributes = addItemToArrayOrRemoveItIfPresent({ array: submission[attributeTag].slice(), item: attributeValue })
    //     }
    //     else {
    //         selectedAttributes.push(attributeValue)
    //     }
    //     setSubmission(prevValues => {return {...prevValues, [attributeTag] : selectedAttributes}})
    // }

    return (
            
        <div className="flex flex-column container--scroll-y-hide-x margin--medium intent-margin-right intent-padding-right--little" style={{maxHeight:"90vh", position:"relative"}}>
            
            {/* <div style={{position:"-webkit-sticky",right:50,top:0}}>
                <Button text="Submit" />
            </div> */}
            <p>
                In this section, you can enter details about your new project. If you are looking for advise for your experimental design visit the <a href="/submission/help"><span className="a-span">help section</span></a>.</p>
            <p>The unique datset identifier {submissionID.id} was created for your dataset. Please include this identifier (id) in any request about the project.</p>
               <p> All files (such as raw file) will include the identifier. Please note that you and your collaborators will be notified via email when the state of your project changes.
            </p>

            <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <Header text="Contact and Collaborators" />
                <span>Project owner: </span><span className="h0-span">{authenticationStatus.firstname} {authenticationStatus.lastname}</span>
                <div><span>Unique identifier: </span> <span className="h3-span">{submissionID.id}</span></div>

                <UserSelection onUserSelection={handleCollaboratorSelection} selectedUsers={submission.collaborators}  {...{ authenticationStatus }} />
            </div>
            <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <Header text="Mandatory Attributes" />
                <TextInput placeholder="Set title of your project" hint="Project Title" onChange={(callbackKey, titleString) => console.log(titleString)} />
                {attributesRequiredForSubmission.length > 0 ? attributesRequiredForSubmission.map((attribute) => {
                    if (objectHasKey({ object: attributeValuesByAtrributeID, keyName: attribute.id })) {
                        const attributeValues = attributeValuesByAtrributeID[attribute.id]
                        return <AttributeInput {...{attributeValues, attribute }}
                            selectedItems={objectHasKey({ object: submission.datasetAttributeValues, keyName: attribute.id }) ? submission.datasetAttributeValues[attribute.id] : []}
                            onItemSelect={handleDatasetAttributeSelection}
                            onRemove={handleDatasetAttributeSelection}/>
                    }
                    
                }) : null}
                <Header text="Meta Text" />
                {_.isObject(metatext) ? metatext.titles.map(metatextTitle => 
                    <TextFieldInput
                        placeholder={metatext.placeholders[metatextTitle]}
                        minLength={metatext["min_text_length"][metatextTitle]}
                        isRequired={metatext["required"][metatextTitle]}
                        hint={metatextTitle}
                        callbackKey={metatext.tags[metatextTitle]}
                        onChange={(key, text) => console.log(key, text)} />
                    ) : null}
            </div>

            {attributesIsSuccess && _.isArray(submissionAttributes.attributes) ?
            <div>

                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                        <Header text="Dataset Attributes" />
                        <p>Dataset attributes describe the dataset and are valid for all samples.
                            As an example, if you have a project that uses the same cell line throughout the study, the cell line should be added here.</p>
                        <p>Other examples are: Tissue, Lysis buffer and Cell culture media</p>
                        <DatasetAttributeSelect
                            attributes={submissionAttributes.attributes}
                            attributeValues={submissionAttributes.attribute_values}
                            {...{ handleDatasetAttributeSelection }} />
                        <DatasetAttributeHierarchy
                            submissionID = {submissionID.id}
                            selectedAttributes={submission.datasetAttributes}
                            selectedDasetAttributeValues={submission.datasetAttributeValues} />
                </div>
                    
                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <Header text="Sample Attributes" />
                    <p>A sample attribute defines unique attributes such as <span className="h1-span">Genotype</span>, <span className="h2-span">Treatment</span>, and <span className="h0-span">Timepoint</span> for each sample.
                        The samplesAttributes are used to calculated statistics on the dataset as well as for visualization. Therefore it is crucical that the groupings are defined in a meticulous way. If you cannot find a specific attribute please contact the administrator.
                    </p>
                    <p>First, create a sample attribute and name it in the table header. Then specify an attribute such as <span className="h1-span">Genotype</span> or <span className="h2-span">Treatment</span>.
                        After attribute selection you will be able to select from a defined set of attribute values from the drop-down menu (right click on the table cells).
                        If you want to assign an attribute value to multiple rows, select the rows and then choose the attribute value from the drop-down menu.</p>
                    <p>An attribute can only be assigned to a <span className="h0-span">single samples attribute</span> and the attribute values must have at least <span className="h0-span">two unique values</span>.
                        Otherwise they should be specified as dataset attributes above.</p>
                    <NumericValueInput
                        placeholder="Sample number"
                        callbackKey={"sampleNumber"}
                        value={submission.attributes.sampleNumber} onChange={(callbackKey, value) => onAttributeChange(callbackKey, value)} />
                    
                    <AttributeGrouping
                        sampleNames={submission.sampleNames}
                        attributeTable={submission.attributeTable}
                        attributes={submissionAttributes.attributes}
                        attributeValuesByID={attributeValuesByAtrributeID}
                        rerenderTableDependency={submission.rerenderTableDependency}
                        onAttributeSelect={onSampleAttributeValueSelect}
                        onTagRemove={onSampleAttrRemove}
                        {...{
                            addSampleAttr,
                            clearGroupingByIndex,
                            clearAttributeTableByRowIndex,
                            onGroupingSelect,
                            onGroupingRename,
                            removeSampleAttrByIndex,
                            groupings: submission.samplesAttributes
                        }} />
                </div>
                
                    <div>
                        Submit
                    </div>

                {/* {submissionAttributes.attributes.filter(attribute => _.has(attributeValuesByAtrributeID,attribute.id)).map(attribute => {
                    return <AttributeInput {...attribute}
                        key = {`${attribute.id}-${attribute.name}`}
                        attributeValues={attributeValuesByAtrributeID[attribute.id]}
                        selectedItems={submission[attribute.tag] === undefined ? [] : submission[attribute.tag]}
                        onItemSelect={handleAttributeSelection}
                        onRemove={handleAttributeSelection}/>
                })
                } */}



            </div> : null}
            
        </div>
        )
    }

    InitialSubmission.propTypes  = {
    authenticationStatus: PropTypes.object.isRequired,
    
}


export default InitialSubmission