import { useGetSubmissionsID, useGetSubmissionAttributes, useGetSubmissionMetatext, usePostSubmission } from "../../../hooks/queries/submission.hooks"
import PropTypes from "prop-types"
import APIError from "../../core/error/APIerror"
import AttributeInput from "./attribute/select/MultiSelectAttribute"
import { useMemo, useState, useEffect } from "react"
import { getUniqueValuesFromArrayOfObjectsByKey, groupListByProperty } from "../../../services/arrays/groupby"
import { addItemToArrayIfNotPresent, addItemToArrayOrRemoveItIfPresent, addItemsToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { objectHasKey } from "../../../services/objects/checks"
import _ from "lodash"
import NumericValueInput from "../../core/input/Numeric"
import { getCurrentDate } from "../../../services/date/format"
import UserSelection from "../../core/input/Users"
import DatasetAttributeSelect from "./attribute/select/DatasetAttributes"
import DatasetAttributeHierarchy from "./attribute/view/DatasetAttributesHierarchy"
import TextInput from "../../core/input/Text"

import { Alert, Button } from "@blueprintjs/core"

import MetaText from "./MetaText"
import { getItemFromLocalStorage, removeItemFromLocalStorage, saveInLocalStorage} from "../../../services/localstorage"
import DatasetLinks from "./Links"
import { getRandomID } from "../../../services/random"
import GenotypeGenerator, { PositionSelection } from "./Genotype"
import { SampleAttributeTableWrapper } from "./attribute/select/SamplesAttributeWrapper"
import { constructSampleNames } from "../../../services/samples"

import { useGetGenotypes } from "../../../hooks/queries/genotype.hooks"
import { useNavigate } from "react-router"
import { FeatureInput } from "../../core/input/api/FeatureInput"
import { UserInput } from "../../core/input/api/UserInput"
//move to service
export function get_proteome_id(datasetAttributeValues) {
    return _.has(datasetAttributeValues,"att_organism") && datasetAttributeValues["att_organism"].length > 0? datasetAttributeValues["att_organism"].map(attributeValue => attributeValue.value) : []
    
}



const randomInitLinkID = getRandomID(5)
const initSubmissionState = {
            label : "",
            replicates : [],
            sampleNames: [],
            collaborators : [],
            attributeTable: [],
            samplesAttributes: [],
            metatext: {},
            genotypes: {},
            links : [{id : randomInitLinkID, link : "", comment : ""}],
            attributes: {sampleNumber : 0, replicates : 0},
            datasetAttributeValues: {},
            datasetAttributes: [],
            genotypeAttributes : [],
            rerenderTableDependency: 0
}
            
function InitialSubmission({
    authenticationStatus,
    logout,
    sampleNames = [],
    loadingFileProps,
    submission_label
    }   
) {

    console.log(submission_label)
    const preDefinedSampleNames = sampleNames.length > 0 
    //check if submission is from an existing file...
    const submitExistingData = _.isObject(loadingFileProps) && _.has(loadingFileProps,"dataArray") && _.isArray(loadingFileProps.dataArray) && loadingFileProps.dataArray.length > 0 
    const redirect = useNavigate()
    const [submission, setSubmission] = useState({ ...initSubmissionState, sampleNames, attributes : {sampleNumber : sampleNames.length}})
    const [alertProps, setAlertProps] = useState({isOpen : false, children : <div></div>})
    
    const { mutate : postSubmission, isLoading : submissionLoading, isError : submissionFailed, error : submissionError } = usePostSubmission()
    const { data: metatext } = useGetSubmissionMetatext({}, { staleTime: Infinity }) // put metatext for long time in cache (staleTime - define in hooks!) 
    const { data: submissionID, isLoading: submissionIDLoading, error: submissionAPIError, isError: submissionIsError, refetch : refetchSubmissionID } = useGetSubmissionsID({},{enabled : !_.isString(submission_label)})
    const proteome_ids = _.isObject(submission) ? get_proteome_id(submission.datasetAttributeValues) : [] 
    const {data : genotypes, isLoading : genotypeIsLoading, error : genotypeError, isError : genotypeIsError, refetch : refetchGenotypes } = useGetGenotypes({proteome_ids : proteome_ids},{enabled : proteome_ids.length > 0})

    const label = useMemo(() => _.isString(submission_label) ? submission_label : _.isObject(submissionID) ? submissionID.id : undefined,[_.isObject(submissionID),submission_label])
    const { data: submissionAttributes,
        isLoading: attributesLoading,
        error: attributesAPIError,
        isError: attributeIsError,
        isSuccess: attributesIsSuccess } = useGetSubmissionAttributes() //
    
    //filter attributes that are not for dataset
    const { attributeValuesByAtrributeID, attributeValuesWithParentInfo }  = useMemo(() => {
        if (!attributesIsSuccess) return {}
        let attrById = Object.fromEntries(submissionAttributes.attributes.map(attrs => [attrs.id,[attrs.tag,attrs.text]]))
        let attrsValues = submissionAttributes.attribute_values
        let attrs = attrsValues.map(attrValue => { return { ...attrValue, attribute_id_tag: attrById[attrValue.attribute_id][0], attribute_id_name: attrById[attrValue.attribute_id][1]} })

        return { attributeValuesByAtrributeID: groupListByProperty(attrs, "attribute_id"), attributeValuesWithParentInfo : attrs }
    }, [attributesIsSuccess])

    const attributesRequiredForSubmission = useMemo((
        ) => {
            if (!attributesIsSuccess) return []
            return submissionAttributes.attributes.filter(attribute => attribute["mandatory_for_submission"])

    }, [attributesIsSuccess])
    
    const attributesAllowedForDataset = useMemo((
        ) => {
        if (!attributesIsSuccess) return []
        
            return submissionAttributes.attributes.filter(attribute => attribute["allow_for_dataset"] && (submitExistingData || attribute.min_state === 0))

        },[attributesIsSuccess])

    const attributesForGenotype = useMemo((
        ) => {
            if (!attributesIsSuccess) return []
            return submissionAttributes.attributes.filter(attribute => attribute["allow_for_genotype"])

        },[attributesIsSuccess])
    
    
    
    useEffect(() => {
        loadSubmission()
    }, [])
    
    useEffect(() => {

        //handle changes that effect the samples names 
        const sampleNumber = parseInt(submission.attributes.sampleNumber)
        if (!_.isNumber(sampleNumber)) return 
        if (!_.isString(label)) return
        //adjust attribute table 
        let attributeTable = submission.attributeTable
        let genotypeAttributes = submission.genotypeAttributes
        if (sampleNumber > genotypeAttributes.length) {
            const diffLength = sampleNumber - attributeTable.length
            _.forEach(_.range(diffLength), () => genotypeAttributes.push([]))
        }
        if (sampleNumber > attributeTable.length) {
            //add rows 
            const diff = sampleNumber - attributeTable.length
            //get the attribute tags that are defined either by checking the existing once from a defined attributeTable otherwise from the grouping info. 
            const existingAttributeTags = attributeTable.length > 0?Object.keys(attributeTable[0]):submission.samplesAttributes.filter(groupInfo => _.isObject(groupInfo.attribute)).map(groupInfo => groupInfo.attribute.tag)
            _.forEach(_.range(diff), () => {
                attributeTable.push(Object.fromEntries(_.map(existingAttributeTags, groupingAttributeTag => [[groupingAttributeTag],[]])))
            })
        }
        const constructedSampleNames = !preDefinedSampleNames ? constructSampleNames(label, sampleNumber, attributeTable) : sampleNames

        setSubmission(prevValues => {return {...prevValues, genotypeAttributes, sampleNames : constructedSampleNames, attributeTable, label, rerenderTableDependency : [Math.random()]}})

    }, [submission.attributes.sampleNumber, label])
    

    const onSubmssionRequest = () => {
        // check the submisison before sending it to the API 
        // note that the API should also do its own checking. 

        let errMsgs = [] //collect error messages
        const numberSamples = submission.sampleNames.length
        const maxReplicateID = _.toInteger(submission.attributes.replicates)
        const validReplicates = submission.replicates.filter((rep, idx) => _.isNumber(rep) && idx < numberSamples && rep <= maxReplicateID)
        const numberReplicates = validReplicates.length
        const attributeTable = submission.attributeTable.slice(0, numberSamples)
        const genotypeAttributes = submission.genotypeAttributes.slice(0,numberSamples)
        const allEmptyGenoypes = _.every(genotypeAttributes.map(attrs => attrs.length === 0))
        const someEmptyGenotypes = _.some(genotypeAttributes.map(attrs => attrs.length === 0))
        if (!_.isString(submission.attributes.title) || submission.attributes.title.length < 10) {
            errMsgs.push("Title not defined or to short (<10 characters).")
        }

        if (numberSamples === 0) {
            errMsgs.push("No samples number provided.")
        }

        if (numberReplicates === 0) {
            errMsgs.push("No replicates defined")
        }

        if (numberReplicates < numberSamples) {
            errMsgs.push("Less replicates defined than samples. Check for missing cells in the sample attribute table. Maybe you also changed the number of replicates after you defined them in the table.")
        }


        if (allEmptyGenoypes && (attributeTable.length === 0 || Object.keys(attributeTable[0]).length === 0)) {
            errMsgs.push("No samples attributes provided. Require at least one.")
        }
        
        if (!allEmptyGenoypes && genotypeAttributes.length !== attributeTable.length) {
            errMsgs.push("Attribute table and genotype have different length indicating that you forgot to define the genotype for a sample.")
        }

        if (!allEmptyGenoypes && someEmptyGenotypes) {
            //only if not all genotypes are empty 
            errMsgs.push("Some sample genotypes are empty.")
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
            errMsgs.push("Mandatory Dataset Attributes Missing: "+_.join(requiredAttributeNotSubmitted.map(attr => attr.text), ", "))
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
        const missingMetaText = Object.keys(requiredMetaText).filter(metatextTag => requiredMetaText[metatextTag] && !objectHasKey({ object: submission.metatext, keyName: metatextTag }) && metatext.allowed_for_state === 0)
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
            if (allEmptyGenoypes) {
                delete submissionDetails["genotypes"]
            }
            submissionDetails["genotypes"] = genotypeAttributes
            console.log(loadingFileProps)
            submissionDetails["attributeTable"] = attributeTable
            submissionDetails["label"] = label
            submissionDetails["title"] = flexAttributes.title 
            submissionDetails["replicates"] = validReplicates
            submissionDetails["links"] = submission.links.filter(linkProps => linkProps.link !== "")
            submissionDetails["includes_data"] = submitExistingData
            submissionDetails["data_array"] = submitExistingData ? loadingFileProps.dataArray.map(row_data =>
                loadingFileProps.sampleColumnsIdx.map(rowIndex => row_data[rowIndex] === "NaN" || row_data[rowIndex] === "" ? NaN : _.toNumber(row_data[rowIndex]))) : undefined
            submissionDetails["data_sample_names"] = submitExistingData ? loadingFileProps.sampleColumnsIdx.map(rowIdx => loadingFileProps.columnNames[rowIdx]) : []
            submissionDetails["data_index"] = findFeatures(loadingFileProps)
            console.log(submissionDetails)
            postSubmission({ submission: submissionDetails },
                {
                    onSuccess: (data) => setAlertProps({
                        isOpen: true,
                        children: <div><h3>Submission Successful</h3>
                            <p>The submission was successful.
                                An email was sent to your email account and your collaborators.
                                You will be redirected to the submission overview.</p>
                        </div>,
                        intent: "success",
                        onClose: () => {
                            setAlertProps({ isOpen: false })
                            redirect("/submission/view")
                        }
                    }),
                    onError: (error) => setAlertProps({
                        isOpen: true,
                        children: <div><h3>Error</h3>
                            <p>There was an error in the submission.</p>
                            <p>If your token expired you will be re-direct to the login. 
                                Otherwise please contact the system administrator and/or the check the help. 
                            </p>
                            <APIError error={error} />
                        </div>,
                        onConfirm: () => closeAlertAndLogout(error),
                        onClose : () => closeAlertAndLogout(error)
                    })
                })
            }
        

    }

    const findFeatures = (loadingFileProps) => {
        if (!submitExistingData) return undefined 
        const feature_index = loadingFileProps.columnNames.indexOf(loadingFileProps.keyColumnName)
        return loadingFileProps.dataArray.map(rowData => rowData[feature_index]) 
    }

    const closeAlertAndLogout = (error) => {
        // function to handle altert closing 
        setAlertProps({ isOpen: false })
        if (error.response.status === 401) {
            //logout if response is Unauthorized
            logout()
        }
       
    }

    const saveSubmission = () => {
        //save the submission to local store and inform the user
        saveInLocalStorage({itemName : "submission", itemValue : JSON.stringify(submission)})
       // saveSubmissionInLocalStorage(submission)
        setAlertProps({
            isOpen: true, children: <div><h3>Saved Submission</h3>
                <p>Submission has been saved. Please note that closing the browser will also remove the saved submission.</p>
            </div>
        })

    }

    const resetSubmission = () => {
        // deletes the submission in the local storage.
        removeItemFromLocalStorage("submission")
        refetchSubmissionID()
        setSubmission(initSubmissionState)
    }

    const loadSubmission = () => {
        // load a submission from the submission.
        const {itemFound, itemValue : submission} = getItemFromLocalStorage({itemName : "submission", parseJson : true})
        if (_.isObject(submission)) {

            setSubmission(prevValues => {return {...prevValues, ...submission}})
        }
    }


    const onInputChange = (inputTag, inputValue) => {
        // handles the change of an attribute / attributeValue combination 
        let submissionAttributes = submission.attributes
        submissionAttributes[inputTag] = inputValue

        setSubmission(prevValues => {
            {
                return { ...prevValues, attributes: submissionAttributes }
            }
        })
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

    const onMetaTextChange = (tag, text) => {
        //handles changes in the metatext 
        let metatext = submission.metatext
        metatext[tag] = text
        setSubmission(prevValues => {return {...prevValues,metatext}})
        
    }

    /**
     * 
     * @param {*} attribute 
     * @param {import("../../../types/feature").Feature[]} selectedFeatures 
     * @param {*} isSampleAttribute 
     * @param {*} rowIdces 
     * @param {*} genotypeLabel 
     * @param {*} entryIdx 
     */
    const onFeatureSelection = (attribute, selectedFeatures, isSampleAttribute, rowIdces, genotypeLabel, entryIdx) => {
        //console.log(attribute)
        if (attribute.allow_for_genotype) {
            genotypeSelection(genotypeLabel,attribute.tag,selectedFeatures[0],entryIdx) //double check entry!! 
        }
        else if (isSampleAttribute) {
            let d = submission.attributeTable
            if (!_.has(d[0],attribute.tag)) {
                d = d.map(rowData => {return { ...rowData, [attribute.tag] : []}})
            }
            //save feature selection
            rowIdces.filter(rowIndex => rowIndex < submission.sampleNames.length).forEach(rowIndex =>  d[rowIndex][attribute.tag] =  _.concat(d[rowIndex][attribute.tag],selectedFeatures) )
            //update table
            setSubmission(prevValues => { return { ...prevValues, attributeTable: d, rerenderTableDependency: [Math.random()] } })
            }
        else {
            let filteredDatasetAttr = addItemToArrayIfNotPresent({ array: submission.datasetAttributes, item: attribute })
            let datasetAttrValues = submission.datasetAttributeValues
            datasetAttrValues[attribute.tag] = selectedFeatures
            setSubmission(prevValues => { return {...prevValues, datasetAttributes : filteredDatasetAttr, datasetAttributeValues : datasetAttrValues, rerenderTableDependency: [Math.random()]}})
        }
        setAlertProps({isOpen : false})
    }


    /**
     * 
     * @param {import("../../../types/feature").Feature} feature 
     */
    const handlePositionSelection = (feature, singlePosition = true, aaSubstitution = false, onSave, onSaveProps) => {
        setAlertProps({
            isOpen: true,
            confirmButtonText : "Cancel",
            children : <PositionSelection {...{feature, singlePosition, aaSubstitution, onSave, onSaveProps, onClose : () => setAlertProps({isOpen : false})}}/>
        })
        
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

    const handleCollaboratorSelection = (callback, selectedUser) => {
        //save collaborations that are seleted
        setSubmission(prevValues => {return{...prevValues, collaborators : addItemToArrayOrRemoveItIfPresent({array : prevValues.collaborators, item : selectedUser})}})
    }

    const addLink = () => {
        // add a new link
        const linkID = getRandomID(5)
        setSubmission(prevValues => {return {...prevValues,links : _.concat(submission.links, [{link : "", comment : "", id : linkID }])}})
    }

    const removeLinkByIndex = (linkIdx) => {
        //remove a link by index
        setSubmission(prevValues => {return {...prevValues,"links" : prevValues.links.filter((d,idx) => idx !== linkIdx)}})
    }

    const handleLinkChange = (linkIdx, updatedLinkProps) => {
        let links = submission.links 
        links[linkIdx] = updatedLinkProps
        setSubmission(prevValues => {return {...prevValues,links}})
    }

    const resetAlert = () => {
        // close the alert 
        setAlertProps(prevValues => { return { ...prevValues, isOpen: false } })
    }

    if (submissionIsError) return <APIError {...{error : submissionAPIError}} />
    if (submissionIDLoading || attributesLoading) return <div>Loading...</div>

    return (
        <div className="flex flex-column">
            <Alert style={{minWidth:"min(60vw,600px)"}} canEscapeKeyCancel={true} canOutsideClickCancel={true}
                onConfirm={resetAlert} onClose={resetAlert} {...alertProps} />
        <div className="flex flex-column container--scroll-y-hide-x padding--medium intent-margin-top--little intent-margin-right intent-padding-right--little" style={{maxHeight : "84vh",position:"relative"}}>
            {/* <div style={{position:"-webkit-sticky",right:50,top:0}}>
                <Button text="Submit" />
            </div> */}
                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <h3>Information</h3>
            <p>
                In this section, you can enter details about your new project. If you are looking for advice for your experimental design visit the <a href="/submission/help"><span className="a-span">help section</span></a>.</p>
            <p>The unique datset identifier <span className="h0-span">{label}</span> has been created for your submission. Please include this unique identifier in any request about your project.
                All files (such as raw file) will include the identifier. Please note that you and your collaborators will be notified via email when the state of your project changes.
                The meta data are based on pre-defined attributes/ontologies and hence it might happen that you are missing an attribute for your project. 
                    </p>
                    <span className="h0-span">Please take care to fill out the submission in a meticulously way. Data without carefully curated meta data are less informative.</span>
            </div>
            <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <h3>1. Contact and Collaborators</h3>
                <span>Project owner: </span><span className="h0-span">{authenticationStatus.firstname} {authenticationStatus.lastname}</span>
                    <div><span>Unique identifier: </span> <span className="h0-span">{label}</span></div>
                    
                    <UserInput selectedUsers={submission.collaborators} onUserSelect={handleCollaboratorSelection} isRequired={false} showLabel={true}  helperText="Collaborators will also be informed about the state of your project." />
                  
            </div>
            <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <h3>2. Mandatory Attributes</h3>
                <p>Attributes that are required for the project submission. </p>
                    <TextInput placeholder="Set the title of your submission.."
                        hint="Project Title"
                        value={_.isString(submission.attributes["title"]) ? submission.attributes["title"] : ""}
                        callbackKey="title"
                        onChange={(callbackKey, title) => onInputChange(callbackKey, title)} />
                
                {attributesRequiredForSubmission.length > 0 ? attributesRequiredForSubmission.map((attribute) => {
                    const samplesAttributesPresent = submission.samplesAttributes.length > 0
                    const hasFeatureValue = attribute.has_features_value
                    if (objectHasKey({ object: attributeValuesByAtrributeID, keyName: attribute.id }) || hasFeatureValue) {
                        const attributeValues = attribute.has_features_value ? [] : attributeValuesByAtrributeID[attribute.id]
                        // if features are allow as values, then just submit an empty list, it will be handled by the attrobute input
                        const isDefinedAsSamplesAttributes = samplesAttributesPresent ? submission.samplesAttributes.map(sampleAttr => sampleAttr.attribute).includes(attribute) : false
                        const attributeInputDisabled = samplesAttributesPresent && isDefinedAsSamplesAttributes
                        if (hasFeatureValue) {
                            
                            return <FeatureInput onItemSelect={handleDatasetAttributeSelection}
                                attribute={attribute}
                                proteome_ids={proteome_ids}
                                selectedItems={_.has(submission.datasetAttributeValues, attribute.tag) ? submission.datasetAttributeValues[attribute.tag] : []} />
                        }

                        return <AttributeInput {...{ attributeValues, attribute }}
                            key={`${attribute.text}-${attribute.id}-mandatory`}
                            helperText={attributeInputDisabled?"Defined as a sample attribute below.":""}
                            disabled={attributeInputDisabled}
                            selectedItems={objectHasKey({ object: submission.datasetAttributeValues, keyName: attribute.tag }) ? submission.datasetAttributeValues[attribute.tag] : []}
                            onItemSelect={handleDatasetAttributeSelection}
                            onRemove={handleDatasetAttributeSelection}
                        />
                    }
                }) : null}
                </div>
            <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                    <h3>4. Meta Text</h3>
            <MetaText metatextValues={submission.metatext} {...{onMetaTextChange,authenticationStatus}} />
            </div>
            <DatasetLinks index={4} links={submission.links} addLink={addLink} removeLink={removeLinkByIndex} onChange={handleLinkChange}/>

            {attributesIsSuccess && _.isArray(attributesAllowedForDataset) ?
            <div>

                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                        <h3>5. Dataset Attributes</h3>
                        <p>Dataset attributes describe the dataset and are valid for all samples.
                            As an example, if you have a project that uses the same cell line throughout the study, the cell line should be added here.</p>
                        <p>Other examples are: Tissue, Lysis buffer and Cell culture media. If you compare two or more genotypes to each other, the genotype should be defined as a samples attributes.</p>
                        <DatasetAttributeSelect
                            attributes={attributesAllowedForDataset}
                                attributeValues={attributeValuesWithParentInfo}
                                selectedDatasetAttribute={submission.datasetAttributes}
                                selectedDatasetAttributeValues={submission.datasetAttributeValues}
                                attributeValuesByID={attributeValuesByAtrributeID}
                                proteome_ids={proteome_ids}
                            {...{ handleDatasetAttributeSelection}} />
                        <DatasetAttributeHierarchy
                            selectedAttributes={submission.datasetAttributes}
                            selectedDasetAttributeValues={submission.datasetAttributeValues}
                            onDatasetAttributeRemove={handleDatasetAttributeSelection} />
                </div>
                    
                {/* <Button onClick={handleGenotypeCreation} /> */}
                        <GenotypeGenerator
                    proteome_ids={proteome_ids}
                    attributes={attributesForGenotype}
                    attributeValuesByID={attributeValuesByAtrributeID}
                    //onSelection={genotypeSelection}
                    genotypes={submission.genotypes} 
                    {...{handlePositionSelection, refetchGenotypes }}/>
                            
                        
                <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <h3>7. Sample Attributes</h3>
                    <p>A sample attribute defines unique attributes such as <span className="h1-span">Genotype</span>, <span className="h2-span">Treatment</span>, and <span className="h0-span">Timepoint</span> for each sample.
                        The samplesAttributes are used to calculated statistics on the dataset as well as for visualization. Therefore it is crucical that the groupings are defined in a meticulous way. If you cannot find a specific attribute please contact the administrator.
                    </p>
                    <p>First, create a sample attribute and name it in the table header. Then specify an attribute such as <span className="h1-span">Genotype</span> or <span className="h2-span">Treatment</span>.
                        After attribute selection you will be able to select from a defined set of attribute values from the drop-down menu (right click on the table cells).
                        If you want to assign an attribute value to multiple rows, select the rows and then choose the attribute value from the drop-down menu.</p>
                    <p>An attribute can only be assigned to a <span className="h0-span">single sample attribute</span> and the attribute values must have at least <span className="h0-span">two unique values</span>.
                                Otherwise they should be specified as dataset attributes above.</p>
                    <NumericValueInput
                            hint="Number of replicates"
                            placeholder="Number of replicates"
                            callbackKey={"replicates"}
                            value={submission.attributes.replicates===0?"":_.toString(submission.attributes.replicates)} onChange={(callbackKey, value) => onInputChange(callbackKey, value)} />
                    <NumericValueInput
                            disabled={preDefinedSampleNames}
                            hint={"Number of samples"}
                            placeholder="Number of samples"
                            callbackKey={"sampleNumber"}
                            value={submission.attributes.sampleNumber===0?"":_.toString(submission.attributes.sampleNumber)} onChange={(callbackKey, value) => onInputChange(callbackKey, value)} />
                    
                        <SampleAttributeTableWrapper {...{
                                submission,
                                genotypes,
                                updateSubmission: setSubmission,
                                attributes: attributesAllowedForDataset,
                                numberReplicates: submission.attributes.replicates,
                            }} />
                    </div>
                    


            </div> : null}
            
       
                     
            </div>
            <div className="flex padding--medium">
                <Button text="Submit" onClick={onSubmssionRequest} intent="primary" />
                <Button text="Save" onClick={saveSubmission} />
                <Button text="Reset Form" onClick={resetSubmission} />
            </div>
            
            </div>
        )
    }

    InitialSubmission.propTypes  = {
    authenticationStatus: PropTypes.object.isRequired,
    
}


export default InitialSubmission