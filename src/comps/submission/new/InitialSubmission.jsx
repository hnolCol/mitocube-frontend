import { useGetSubmissionsID, useGetSubmissionAttributes } from "../../../hooks/queries/submission.hooks"
import PropTypes from "prop-types"
import { Header } from "../../core/base/Header"
import APIError from "../../core/error/APIerror"
import AttributeInput from "./attribute/AttributeCombo"
import { useMemo, useState, useEffect } from "react"
import { groupListByProperty } from "../../../services/arrays/groupby"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { objectHasKey } from "../../../services/objects/checks"
import AttributeGrouping from "./attribute/SampleAttributes"
import _ from "lodash"
import { clearArrayOfObjectsByKeyName, removeKeyInArrayOfObjects } from "../../../services/arrays/filter"
import FromLineEdit from "../../core/base/form/text"
import NumericValueInput from "../../core/input/Numeric"
import { getCurrentDate } from "../../../services/date/format"
import UserSelection from "../../core/input/Users"

function constructSampleNames(id, sampleNumber) {
    const date = getCurrentDate()
    const zeroPadding = sampleNumber.toString().length
    return _.range(sampleNumber).map(idx => `${date}_${id}_${(idx+1).toString().padStart(zeroPadding,'0')}`)
}


function InitialSubmission({
    authenticationStatus,
}
) {

    const [submission, setSubmission] = useState({sampleNames : [], attributeTable: [], groupings: [], rerenderTableDependency: 0, attributes : {}})
    const { data: submissionID, isLoading: submissionIDLoading, error: submissionAPIError, isError: submissionIsError } = useGetSubmissionsID()
    
    const { data: submissionAttributes,
        isLoading: attributesLoading,
        error: attributesAPIError,
        isError: attributeIsError,
        isSuccess: attributesIsSuccess } = useGetSubmissionAttributes({ tokenString: authenticationStatus.token }) //
    
    const attributeValuesByAtrributeID = useMemo(() => {
        if (!attributesIsSuccess) return {}
        return groupListByProperty(submissionAttributes.attribute_values, "attribute_id")
    }, [attributesIsSuccess])
    

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
            const existingAttributeTags = attributeTable.length > 0?Object.keys(attributeTable[0]):submission.groupings.filter(groupInfo => _.isObject(groupInfo.attribute)).map(groupInfo => groupInfo.attribute.tag)
            _.forEach(_.range(diff), () => {
                attributeTable.push(Object.fromEntries(_.map(existingAttributeTags, groupingAttributeTag => [[groupingAttributeTag],[]])))
            })
        }

        setSubmission(prevValues => {return {...prevValues, sampleNames, attributeTable}})

    }, [submission.attributes.sampleNumber,submissionID])

    if (submissionIsError) return <APIError {...{error : submissionAPIError}} />
    if (submissionIDLoading || attributesLoading) return <div>Loading...</div>

    
    const onAttributeChange = (attributeTag, attributeValue) => {
        console.log(attributeValue)
        let submissionAttributes = submission.attributes
        submissionAttributes[attributeTag] = attributeValue

        setSubmission(prevValues => {
            {
                return { ...prevValues, attributes: submissionAttributes }
            }
        })
    }

    const addGrouping = () => {
        //adds a new grouping
        setSubmission(prevValues => { return { ...prevValues, groupings: _.concat(prevValues.groupings, { name: "", attribute: undefined }) } })
    }

    const onGroupingTagRemove = (rowIndex ,attribute, attributeValueTag) => {
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

    const removeGroupingByIndex = (groupingIdx) => {
        //remove grouping by groupingIdx
        let groupingInfos = submission.groupings
        //remove attribute from attribibuteTable
        let groupingAttribute = groupingInfos[groupingIdx].attribute
        if (_.has(groupingAttribute, "tag")) {
            let groupingAttributeTag = groupingAttribute.tag 

            const updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: groupingAttributeTag })
            setSubmission(prevValues => {
                return {
                    ...prevValues,
                    groupings: prevValues.groupings.filter((groupInfo, idx) => idx !== groupingIdx),
                    attributeTable : updatedAttributeTable
                }
            })
            return 
        }

        setSubmission(prevValues => {
            return {
                ...prevValues,
                groupings: prevValues.groupings.filter((groupInfo, idx) => idx !== groupingIdx)
            }
        })
    }

    const onGroupingAttributeSelect = (attributeTag, attributeValueTag,rowIdces) => {
        let d = submission.attributeTable
        if (!objectHasKey({ object: d[0], keyName: attributeTag })) {
            d = d.map(rowData => {return { ...rowData, [attributeTag] : []}})
        }

        rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length).forEach(rowIndex =>  d[rowIndex][attributeTag] = addItemToArrayOrRemoveItIfPresent({array:d[rowIndex][attributeTag],item:attributeValueTag}))
        setSubmission(prevValues => {return{...prevValues,attributeTable : d, rerenderTableDependency : Math.random()}})
    }

    const onGroupingRename = (groupingIdx, groupingName) => {
        let groupingInfos = submission.groupings
        groupingInfos[groupingIdx].name = groupingName

        setSubmission(prevValues => {return {...prevValues, groupings : groupingInfos} })
    }

    const onGroupingSelect = (groupingIdx, groupingName, attribute) => {
        let groupingInfos = submission.groupings.slice()
        let groupInfo = groupingInfos[groupingIdx]
        if (!_.isObject(attribute)) {

            //if (groupInfo.name === groupingName) return 
            groupingInfos[groupingIdx] = {name : groupingName, attribute : _.isObject(groupInfo) ? groupInfo.attribute : undefined}
        }
        else {
            
            if (_.isObject(groupInfo.attribute) && groupInfo.attribute.tag !== attribute.tag) {
                //different tag selected 
                const prevGroupingAttributeTag = groupInfo.attribute.tag
                //requires cleaning up the old ag
                let updatedAttributeTable = removeKeyInArrayOfObjects({ array: submission.attributeTable, keyName: prevGroupingAttributeTag })
                groupingInfos[groupingIdx] = {name : groupingName, attribute}
                setSubmission(prevValues => { return { ...prevValues, groupings: groupingInfos, attributeTable: updatedAttributeTable, rerenderTableDependency: Math.random() } })
                return 
            }

            groupingInfos[groupingIdx] = {name : groupingName, attribute}
            
        }
        setSubmission(prevValues => {return {...prevValues, groupings : groupingInfos} })
        
    }

    const handleAttributeSelection = (attributeTag, attributeValue) => {
        //handle the selection/deseltion of attribute values
        let selectedAttributes = []
        if (objectHasKey({object : submission, keyName : attributeTag})) {
            selectedAttributes = addItemToArrayOrRemoveItIfPresent({ array: submission[attributeTag].slice(), item: attributeValue })
        }
        else {
            selectedAttributes.push(attributeValue)
        }
        setSubmission(prevValues => {return {...prevValues, [attributeTag] : selectedAttributes}})
    }

    return (
            
        <div className="flex flex-column container--scroll-y-hide-x margin--medium" style={{maxHeight:"90vh"}}>
            <p>
                In this section, you can enter details about your new project. If you are looking for advise for your experimental design visit the <a href="/submission/help"><span className="a-span">help section</span></a>.</p>
            
            <p>The unique identifier <span className="h3-span">{submissionID.id}</span> has been assigned to your new project. Please include this identifier (id) in any request about this project.
                All files (such as raw file) will include the identifier. Please note that you will be notified via email when the state of your project changes. Please not that refreshing the page will reset the id.
            </p>

            <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <Header text="Contact and Collaborators" />
                <FromLineEdit value={authenticationStatus.email} inputDisabled={true} helperText="Contact email address. Infered from user data." />
                <UserSelection  {...{authenticationStatus}} />
            </div>
            {attributesIsSuccess && _.isArray(submissionAttributes.attributes) ?
            <div>
                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <Header text="" />
                <NumericValueInput
                    placeholder="Sample number"
                    callbackKey={"sampleNumber"}
                    value={submission.attributes.sampleNumber} onChange={(callbackKey, value) => onAttributeChange(callbackKey, value)} />
                </div>

                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                        <Header text="Dataset Attributes" />
                        <p>Dataset attributes describe the dataset and are valid for all samples.
                            As an example, if you have a project that used the same cell line throughout the study, the cell line should be added here.</p>
                        <p>Other examples are: Tissue and Cell culture media</p>
                </div>
                    
                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <Header text="Sample Attributes" />
                    <p>A sample attribute defines unique attributes such as <span className="h1-span">Genotype</span>, <span className="h2-span">Treatment</span>, and <span className="h0-span">Timepoint</span> for each sample.
                        The groupings are used to calculated statistics on the dataset as well as for visualization. Therefore it is crucical that the groupings are defined in a meticulous way. If you cannot find a specific attribute please contact the administrator.
                    </p>
                    <p>First, create a grouping and name it in the table header. Then specify an attribute such as <span className="h1-span">Genotype</span> or <span className="h2-span">Treatment</span>.
                        After attribute selection you will be able to select from a defined set of attribute values from the drop-down menu (right click on the table cells).
                        If you want to assign an attribute value to multiple rows, select the rows and then choose the attribute value from the drop-down menu.</p>
                    <p>An attribute can only be assigned to a <span className="h0-span">single grouping</span> and the attribute values must have at least <span className="h0-span">two unique values</span>.
                        Otherwise they should be specified as attribute keywords below.</p>
                
                    <AttributeGrouping
                        sampleNames={submission.sampleNames}
                        attributeTable={submission.attributeTable}
                        attributes={submissionAttributes.attributes}
                        attributeValuesByID={attributeValuesByAtrributeID}
                        rerenderTableDependency={submission.rerenderTableDependency}
                        onAttributeSelect={onGroupingAttributeSelect}
                        onTagRemove={onGroupingTagRemove}
                        {...{
                            addGrouping,
                            clearGroupingByIndex,
                            clearAttributeTableByRowIndex,
                            onGroupingSelect,
                            onGroupingRename,
                            removeGroupingByIndex,
                            groupings: submission.groupings
                        }} />
                </div>
                

                {submissionAttributes.attributes.filter(attribute => _.has(attributeValuesByAtrributeID,attribute.id)).map(attribute => {
                    return <AttributeInput {...attribute}
                        key = {`${attribute.id}-${attribute.name}`}
                        attributeValues={attributeValuesByAtrributeID[attribute.id]}
                        selectedItems={submission[attribute.tag] === undefined ? [] : submission[attribute.tag]}
                        onItemSelect={handleAttributeSelection}
                        onRemove={handleAttributeSelection}/>
                })
                }



            </div> : null}
            
        </div>
        )
    }

    InitialSubmission.propTypes  = {
    authenticationStatus: PropTypes.object.isRequired,
    
}


export default InitialSubmission