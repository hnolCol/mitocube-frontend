import { useGetSubmissionsID, useGetSubmissionAttributes, useGetSubmissionMetatext, usePostSubmission } from "../../../hooks/queries/submission.hooks"
import PropTypes, { number } from "prop-types"
import { Header } from "../../core/base/Header"
import APIError from "../../core/error/APIerror"
import AttributeInput from "./attribute/AttributeCombo"
import { useMemo, useState, useEffect } from "react"
import { getUniqueValuesFromArrayOfObjectsByKey, groupListByProperty } from "../../../services/arrays/groupby"
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
import { Alert, Button } from "@blueprintjs/core"
import HelpOverlay from "../../core/overlay/Helpoverlay"
import MetaText from "./MetaText"

function constructSampleNames(id, sampleNumber) {
    const date = getCurrentDate()
    const zeroPadding = sampleNumber.toString().length
    return _.range(sampleNumber).map(idx => `${date}_${id}_${(idx+1).toString().padStart(zeroPadding > 1 ? zeroPadding : 2,'0')}`)
}


function InitialSubmission({
    authenticationStatus,
    logout
}
) {
    const [submission, setSubmission] = useState({
        sampleNames: [],
        collaborators : [],
        attributeTable: [],
        samplesAttributes: [],
        metatext : {},
        attributes: {},
        datasetAttributeValues: {},
        datasetAttributes: [],
        rerenderTableDependency: 0,
    })
    const [alertProps, setAlertProps] = useState({isOpen : false, children : <div></div>})
    
    const { mutate : postSubmission, isLoading : submissionLoading, isError : submissionFailed, error : submissionError } = usePostSubmission()
    const { data: metatext } = useGetSubmissionMetatext({ tokenString: authenticationStatus.token }, { staleTime: 1200000 })
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

        setSubmission(prevValues => {return {...prevValues, sampleNames, attributeTable, rerenderTableDependency : Math.random()}})

    }, [submission.attributes.sampleNumber,submissionID])



    const onSubmssionRequest = () => {
        let errMsgs = [] //collect error messages
        const numberSamples = submission.sampleNames.length
        const attributeTable = submission.attributeTable.slice(0,numberSamples)

        if (!_.isString(submission.attributes.title) || submission.attributes.title.length < 10) {
            errMsgs.push("Title not defined or to short (<10 characters).")
        }

        if (numberSamples === 0) {
            errMsgs.push("No samples number provided.")
            
        }

        if (attributeTable.length === 0 || Object.keys(attributeTable[0]).length === 0) {
            errMsgs.push("No samples attributes provided. Require at least one.")
        }

        //check for all mandatory attributes
        let requiredAttributeNotSubmitted = _.filter(attributesRequiredForSubmission, attrRequired => !(objectHasKey({
                        object: submission.datasetAttributeValues, keyName: attrRequired.tag})
            && submission.datasetAttributeValues[attrRequired.tag].length > 0))
        // TO DO check if present in samples attributes
        if (attributeTable.length > 0) {
            // check the attributes that are maybe in the sample attributes.
            requiredAttributeNotSubmitted = requiredAttributeNotSubmitted.filter(reqAttr => !_.has(attributeTable[0],reqAttr.tag))
        }
        

        if (requiredAttributeNotSubmitted.length > 0) {
            errMsgs.push("Mandatory Dataset Attributes Missing: "+_.join(requiredAttributeNotSubmitted.map(attr => attr.name), ", "))
        }

        // check if sample attributes table is complete 
        const emptySampleInfo = attributeTable.map(sampleAttributes => _.some(Object.values(sampleAttributes), array => array.length == 0))
        if (_.some(emptySampleInfo)) {
            const indices = _.range(emptySampleInfo.length).filter(idx => emptySampleInfo[idx])
            errMsgs.push("Missing sample attributes for samples in rows : " + _.join(indices.map(v => v+1),", "))
        }

        //check metatext details 
        const requiredMetaText = metatext["required"]
        const minLengthMetaText = metatext["min_text_length"]
        
        const metatextTag = metatext["tags"]
        const missingMetaText = Object.keys(requiredMetaText).filter(metatextTag => requiredMetaText[metatextTag] && !objectHasKey({ object: submission.metatext, keyName: metatextTag }))
        
        if (missingMetaText.length > 0) {
            errMsgs.push("Required metatext missing for: " + _.join(missingMetaText,", "))
        }
        else {
            const lengthReqMetaText = Object.keys(requiredMetaText).filter(metatextTag => _.isString(submission.metatext[metatextTag]) && submission.metatext[metatextTag].length < minLengthMetaText[metatextTag])
            if (lengthReqMetaText.length > 0) {
                errMsgs.push("Minimal length of metatext not met for: " + _.join(lengthReqMetaText, ", "))
            }
            
        }
        
        // check if sample attributes are non-unique
        const uniqueValuesPerSampleAttribute = getUniqueValuesFromArrayOfObjectsByKey(submission.attributeTable)
        const sampleAttributesWithSingleUniqueValue = _.filter(Object.keys(uniqueValuesPerSampleAttribute), sampleAttribute => uniqueValuesPerSampleAttribute[sampleAttribute].length < 2)
        if (sampleAttributesWithSingleUniqueValue.length > 0) {
            errMsgs.push("At least one samples attribute has less than two unique values. It should therefore be defined as a dataset attribute: "+_.join(sampleAttributesWithSingleUniqueValue,", "))
        }

    
        if (errMsgs.length > 0) {
            // if there are error messages, show it to the user.
            setAlertProps({ isOpen: true, children: <div><h3>Errors</h3><ul >{errMsgs.map(err => <li key={`${err}`}>{err}</li>)}</ul></div>, intent : "danger"})
        }

        else {

            let submissionDetails = { ...submission }
            // delete rendering float
            const flexAttributes = submissionDetails["attributes"]
            delete submissionDetails["rerenderTableDependency"]
            delete submissionDetails["attributes"]
            submissionDetails["attributeTable"] = attributeTable
            submissionDetails["label"] = submissionID.id
            submissionDetails["title"] = flexAttributes.title 

            postSubmission({ tokenString: authenticationStatus.token, submission: submissionDetails },
                {
                    onSuccess: (data) => setAlertProps({
                        isOpen: true,
                        children: <div><h3>Submission Successfull</h3>
                            <p>The submission was successfull. An email was sent to your email account and your collaborators. You will be redirected to the submission overview.</p>
                        </div>,
                        intent : "success"
                    }),
                    onError: (error) => setAlertProps({
                        isOpen: true,
                        children: <div><h3>Error</h3>
                            <p>There was an error in the submission.</p>
                            <p>If you token experied you will be re-direct to the login. 
                                Otherwise please contact the system administrator. 
                            </p>
                            <APIError error={error} />
                        </div>,
                        onConfirm: () => closeAlertAndLogout(error),
                        onClose : () => closeAlertAndLogout(error)
                    })
                })
            }
        

    }


    const closeAlertAndLogout = (error) => {
        setAlertProps({ isOpen: false })
        if (error.response.status === 401) {
            //logout if response is Unauthorized
            logout()
        }
       
    }
    
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
        //adds a new sample attribute
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

    const clearSampleAttrByIndex = (groupingIdx,attributeTag) => {
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

    const onSampleAttributeValueSelect = (attributeTag, attributeValueTag, rowIdces) => {
        //on selection of a sample attribute value
        let d = submission.attributeTable
        if (!objectHasKey({ object: d[0], keyName: attributeTag })) {
            d = d.map(rowData => {return { ...rowData, [attributeTag] : []}})
        }
        rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length).forEach(rowIndex =>  d[rowIndex][attributeTag] = addItemToArrayOrRemoveItIfPresent({array:d[rowIndex][attributeTag],item:attributeValueTag}))
        setSubmission(prevValues => {return{...prevValues,attributeTable : d, rerenderTableDependency : Math.random()}})
    }

    const onSampleAttributeRename = (sampleAttrIdx, sampleAttributeName) => {
        let sampleAttrs = submission.samplesAttributes
        sampleAttrs[sampleAttrIdx].name = sampleAttributeName

        setSubmission(prevValues => {return {...prevValues, samplesAttributes : sampleAttrs} })
    }

    const warnForMandatoryAttr = (addedAttribute) => {
        // warns if a mandatory attribute (dataset) was selected
        if (_.isObject(addedAttribute) && _.isObject(addedAttribute.attribute) && attributesRequiredForSubmission.includes(addedAttribute.attribute)) {
            setAlertProps({
                isOpen: true, children: <div><h3>Warning</h3><p>The selected attribute is defined as a mandatory dataset attribute.</p>
                    <p>Defining it as a sample attribute overwrites the dataset attribute selection and is <strong>only recommended if the attribute differs between samples.</strong></p></div>
            })
        }
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
                setSubmission(prevValues => {
                    return {
                        ...prevValues,
                        samplesAttributes: sampleAttrs,
                        attributeTable: updatedAttributeTable,
                        rerenderTableDependency: Math.random()
                    }
                })
                warnForMandatoryAttr(sampleAttrs[sampleAttrIdx])
                return 
            }
            sampleAttrs[sampleAttrIdx] = {
                name: sampleAttrName === "" ? attribute.name : sampleAttrName,
                attribute
            }
        }
        if (attributeChanged) {
            // only warn again if changed.
            warnForMandatoryAttr(sampleAttrs[sampleAttrIdx])
        }

        setSubmission(prevValues => {return {...prevValues, samplesAttributes : sampleAttrs} })
        
    }


    const onMetaTextChange = (tag, text) => {
        //handles changes in the metatext 
        let metatext = submission.metatext
        metatext[tag] = text
        setSubmission(prevValues => {return {...prevValues,metatext}})
        
    }

    const handleDatasetAttributeSelection = (attribute, attributeValue) => {
        // handles dataset attribute selection (adding and removing) Dataset values are stored in a list. 
        //check if attributes has nodeChilds

        let filteredDatasetAttr = addItemToArrayIfNotPresent({ array: submission.datasetAttributes, item: attribute })
        let datasetAttrValues = submission.datasetAttributeValues
        if (_.has(datasetAttrValues, attribute.tag)) {
            const attrValuesForAttr = datasetAttrValues[attribute.tag]
            const filteredAttrValuesForAttr = addItemToArrayOrRemoveItIfPresent({ array: attrValuesForAttr, item: attributeValue })
            if (filteredAttrValuesForAttr.length === 0) {
               
                delete datasetAttrValues[attribute.tag]
                filteredDatasetAttr = filteredDatasetAttr.filter(attr => attr.tag !== attribute.tag)
            }
            else {
                datasetAttrValues[attribute.tag] = filteredAttrValuesForAttr
            }
            
        }
        else {

            datasetAttrValues[attribute.tag] = [attributeValue]
        }
        setSubmission(prevValues => { return {...prevValues, datasetAttributes : filteredDatasetAttr, datasetAttributeValues : datasetAttrValues}})
    }
    const resetAlter = () => {

        setAlertProps(prevValues => { return { ...prevValues, isOpen: false } })
    }

    const handleCollaboratorSelection = (selectedUser) => {
        //save collaborations that are seleted
        setSubmission(prevValues => {return{...prevValues, collaborators : selectedUser}})
    }


    if (submissionIsError) return <APIError {...{error : submissionAPIError}} />
    if (submissionIDLoading || attributesLoading) return <div>Loading...</div>

    return (
        <div className="flex flex-column">
             
       
        <div className="flex flex-column container--scroll-y-hide-x padding--medium intent-margin-right intent-padding-right--little" style={{maxHeight : "82vh",position:"relative"}}>
                <Alert canEscapeKeyCancel={true} canOutsideClickCancel={true} onConfirm={resetAlter } onClose={resetAlter } {...alertProps}/>
            {/* <div style={{position:"-webkit-sticky",right:50,top:0}}>
                <Button text="Submit" />
            </div> */}
            <p>
                In this section, you can enter details about your new project. If you are looking for advise for your experimental design visit the <a href="/submission/help"><span className="a-span">help section</span></a>.</p>
            <p>The unique datset identifier {submissionID.id} was created for your dataset. Please include this identifier (id) in any request about the project.</p>
               <p> All files (such as raw file) will include the identifier. Please note that you and your collaborators will be notified via email when the state of your project changes.
            </p>

            <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <Header text="1. Contact and Collaborators" />
                <span>Project owner: </span><span className="h0-span">{authenticationStatus.firstname} {authenticationStatus.lastname}</span>
                <div><span>Unique identifier: </span> <span className="h3-span">{submissionID.id}</span></div>

                <UserSelection onUserSelection={handleCollaboratorSelection} selectedUsers={submission.collaborators}  {...{ authenticationStatus }} />
            </div>
            <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <Header text="2. Mandatory Attributes" />
                <p>Attributes that are required for the project submission. </p>
                <TextInput placeholder="Set title of your project" hint="Project Title" callbackKey="title" onChange={(callbackKey, title) => onAttributeChange(callbackKey, title)} />
                
                {attributesRequiredForSubmission.length > 0 ? attributesRequiredForSubmission.map((attribute) => {
                    const samplesAttributesPresent = submission.samplesAttributes.length > 0
                    if (objectHasKey({ object: attributeValuesByAtrributeID, keyName: attribute.id })) {
                        const attributeValues = attributeValuesByAtrributeID[attribute.id]
                        const isDefinedAsSamplesAttributes = samplesAttributesPresent ? submission.samplesAttributes.map(sampleAttr => sampleAttr.attribute).includes(attribute) : false
                        const attributeInputDisabled = samplesAttributesPresent && isDefinedAsSamplesAttributes
                        return <AttributeInput {...{ attributeValues, attribute }}
                            key={`${attribute.name}-${attribute.id}-mandatory`}
                            helperText={attributeInputDisabled?"Defined as an sample attribute below.":""}
                            disabled={attributeInputDisabled}
                            selectedItems={objectHasKey({ object: submission.datasetAttributeValues, keyName: attribute.tag }) ? submission.datasetAttributeValues[attribute.tag] : []}
                            onItemSelect={handleDatasetAttributeSelection}
                            onRemove={handleDatasetAttributeSelection}/>
                    }
                }) : null}
            </div>
            <MetaText metatextValues={submission.metatext} {...{onMetaTextChange,authenticationStatus}} />
            

            {attributesIsSuccess && _.isArray(submissionAttributes.attributes) ?
            <div>

                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                        <Header text="4. Dataset Attributes" />
                        <p className="p">Dataset attributes describe the dataset and are valid for all samples.
                            As an example, if you have a project that uses the same cell line throughout the study, the cell line should be added here.</p>
                        <p>Other examples are: Tissue, Lysis buffer and Cell culture media. If you compare two or more genotypes to each other, the genotype should be defined as a samples attributes.</p>
                        <DatasetAttributeSelect
                            attributes={submissionAttributes.attributes}
                            attributeValues={submissionAttributes.attribute_values}
                            {...{ handleDatasetAttributeSelection }} />
                        <DatasetAttributeHierarchy
                            submissionID={submissionID.id}
                            selectedAttributes={submission.datasetAttributes}
                            selectedDasetAttributeValues={submission.datasetAttributeValues}
                            onDatasetAttributeRemove={handleDatasetAttributeSelection} />
                </div>
                    
                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <Header text="5. Sample Attributes" />
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
                            clearSampleAttrByIndex,
                            clearAttributeTableByRowIndex,
                            onSampleAttributeSelect,
                            onSampleAttributeRename,
                            removeSampleAttrByIndex,
                            groupings: submission.samplesAttributes
                        }} />
                    </div>
                    


            </div> : null}
            
       
                     
            </div>
            <div className="flex padding--medium">
                <Button text="Submit" onClick={onSubmssionRequest} />
            </div>
            
            </div>
        )
    }

    InitialSubmission.propTypes  = {
    authenticationStatus: PropTypes.object.isRequired,
    
}


export default InitialSubmission