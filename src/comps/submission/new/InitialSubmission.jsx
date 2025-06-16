import { useGetSubmissionsID, useGetSubmissionMetatext, usePostSubmission } from "../../../hooks/queries/submission.hooks"
import PropTypes from "prop-types"
import APIError from "../../core/error/APIerror"
import { useMemo, useState, useEffect } from "react"
import { getUniqueValuesFromArrayOfObjectsByKey } from "../../../services/arrays/groupby"
import { objectHasKey } from "../../../services/objects/checks"
import _ from "lodash"
import { Alert} from "@blueprintjs/core"
import { getItemFromLocalStorage, removeItemFromLocalStorage, saveInLocalStorage} from "../../../services/localstorage"

import { getRandomID } from "../../../services/random"
import { constructSampleNames } from "../../../services/samples"

import { useGetGenotypes } from "../../../hooks/queries/genotype.hooks"
import { useNavigate } from "react-router"
import { AxiosError } from "axios"
import { extractTagsFromFeature } from "../../../services/unit/traverse"
import { indexStrings } from "../../../services/arrays"

import { SubmissionPanelStack } from "./panels/TabStack"
//move to service
export function get_proteome_id(datasetAttributeValues) {
    return _.has(datasetAttributeValues,"att_proteome") && datasetAttributeValues["att_proteome"].length > 0? datasetAttributeValues["att_proteome"].map(attributeValue => attributeValue.tag) : []
    
}



const randomInitLinkID = getRandomID(5)
const initSubmissionState = {
    tag: "",
    numberReplicates: 0,
    sampleNumber: 0, 
            
            replicates : [],
            sampleNames: [],
            sampleNamesFixed: false,
            collaborators : [],
            attributeTable: [],
            samplesAttributes: [],
            metatext: {},
            genotypes: {},
            links : [{id : randomInitLinkID, link : "", comment : ""}],
            // attributes: {sampleNumber : 0, replicates : 0},
            datasetAttributeValues: {},
    datasetAttributes: [],
    selected_traits: {}, // the dataset traits,
        genotypeAttributes : [],
    rerenderTableDependency: 0,
    userUnitInput: {},
    datasetAttributeUnits: {},
    sampleUserUnitInput : {},
}
            
function InitialSubmission({
    logout,
    sampleNames = [],
    loadingFileProps,
    init_submission_tag
    }   
) {
    
    const preDefinedSampleNames = sampleNames.length > 0 
    //check if submission is from an existing file...
    const submitExistingData = _.isObject(loadingFileProps) && _.has(loadingFileProps,"dataArray") && _.isArray(loadingFileProps.dataArray) && loadingFileProps.dataArray.length > 0 
    const redirect = useNavigate()
    const [submission, setSubmission] = useState({ ...initSubmissionState, sampleNames, attributes : {sampleNumber : sampleNames.length}})
    const [alertProps, setAlertProps] = useState({isOpen : false, children : <div></div>})
    const { mutate : postSubmission, isLoading : submissionLoading, isError : submissionFailed, error : submissionError } = usePostSubmission()
    const { data: metatext } = useGetSubmissionMetatext({}) 
    const { data: submission_tag, isLoading: submissionIDLoading, error: submissionAPIError, isError: submissionIsError, refetch : refetchSubmissionID } = useGetSubmissionsID({},{enabled : !_.isString(init_submission_tag)})
    const proteome_ids = _.isObject(submission) ? get_proteome_id(submission.datasetAttributeValues) : [] 
    const {data : genotypes, isLoading : genotypeIsLoading, error : genotypeError, isError : genotypeIsError, refetch : refetchGenotypes } = useGetGenotypes({proteome_tags : proteome_ids},{enabled : proteome_ids.length > 0})

    const tag = useMemo(() => _.isString(init_submission_tag) ? init_submission_tag : _.isObject(submission_tag) ?submission_tag.id : undefined,[_.isObject(submission_tag),submission_tag])
    
    
    useEffect(() => {
        loadSubmission()
    }, [])

    useEffect(() => {
        if (preDefinedSampleNames) {
            setSubmission(prevValues => {return {...prevValues, sampleNamesFixed : true}})
        }
    }, [preDefinedSampleNames])
    
    useEffect(() => {

        //handle changes that effect the samples names 
        const sampleNumber = parseInt(submission.sampleNumber)
        if (!_.isNumber(sampleNumber)) return 
        if (!_.isString(tag )) return
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
                attributeTable.push( [] ) //Object.fromEntries(_.map(existingAttributeTags, groupingAttributeTag => [[groupingAttributeTag],[]])))
            })
        }
        const constructedSampleNames = !preDefinedSampleNames ? constructSampleNames({submission_tag : tag, sampleNumber : sampleNumber, sampleAttributes : attributeTable, sampleGenotypes : [], include_sample_attributes : submission.samplesAttributes}) : sampleNames

        setSubmission(prevValues => {
            return {
                ...prevValues,
                genotypeAttributes,
                sampleNames: constructedSampleNames,
                attributeTable,
                tag, rerenderTableDependency: [Math.random()]
            }
        })

    }, [submission.sampleNumber, tag ])
    
    console.log(submission)

    const onSubmissionRequest = () => {
        // check the submisison before sending it to the API 
        // note that the API should also do its own checking. 

        let errMsgs = [] //collect error messages
        const numberSamples = submission.sampleNames.length
        const maxReplicateID = _.toInteger(submission.numberReplicates)
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

        //perform check in backend....
        // let requiredAttributeNotSubmitted = _.filter(attributesRequiredForSubmission, attrRequired => !(objectHasKey({
        //                 object: submission.datasetAttributeValues, keyName: attrRequired.tag})
        //     && submission.datasetAttributeValues[attrRequired.tag].length > 0))
        
        
        
        // // TO DO check if present in samples attributes
        // if (attributeTable.length > 0) {
        //     // check the attributes that are maybe in the sample attributes.
        //     requiredAttributeNotSubmitted = requiredAttributeNotSubmitted.filter(reqAttr => !_.has(attributeTable[0],reqAttr.tag))
        // }
        

        // if (requiredAttributeNotSubmitted.length > 0) {
        //     errMsgs.push("Mandatory Dataset Attributes Missing: "+_.join(requiredAttributeNotSubmitted.map(attr => attr.text), ", "))
        // }

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
            else {
                submissionDetails["genotypes"] = indexStrings(submission["genotypes"].map(genotype => genotype.map(g => g.tag)))
            }
            //submissionDetails["datasetAttributes"] = _.map(submission.datasetAttributes, datasetAttribute => datasetAttribute.tag)
            submissionDetails["datasetAttributes"] = _.fromPairs(_.keys(submission["datasetAttributeValues"])
                .filter(key => _.isArray(submission["datasetAttributeValues"][key]) && submission["datasetAttributeValues"][key].length > 0).map(key => [key, submission["datasetAttributeValues"][key].map(t => t.tag)]))
            
  

            // const sampleAttributeTags = attributeTable.map(item => {
            //     const d = _.keys(item).map(key => [key,item[key].map(trait => trait.tag)])
            //     return _.fromPairs(d)
            // })
            submissionDetails["collaborators"] = submission.collaborators.map(u => u.tag)
            submissionDetails["samplesAttributes"] = indexStrings(sampleAttributeTags)
            submissionDetails["tag"] = tag 
            submissionDetails["title"] = submission.title 
            submissionDetails["replicates"] = validReplicates
            submissionDetails["links"] = submission.links.filter(linkProps => linkProps.link !== "")
            submissionDetails["includes_data"] = submitExistingData
            submissionDetails["data_array"] = submitExistingData ? loadingFileProps.dataArray.map(row_data =>
            loadingFileProps.sampleColumnsIdx.map(rowIndex => row_data[rowIndex] === "NaN" || row_data[rowIndex] === "" ? NaN : _.toNumber(row_data[rowIndex]))) : undefined
            submissionDetails["data_sample_names"] = submitExistingData ? loadingFileProps.sampleColumnsIdx.map(rowIdx => loadingFileProps.columnNames[rowIdx]) : []
            submissionDetails["data_index"] = findFeatures(loadingFileProps)
            //submissionDetails["samplesAttributesInput"] = submission.samplesAttributesUnit


            console.log(extractTagsFromFeature(submission.userUnitInput ))
            submissionDetails["datasetAttributeInput"] = extractTagsFromFeature(submission.userUnitInput )
            submissionDetails["sampleUserUnitInput"] = submission.sampleUserUnitInput

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
                            resetSubmission()
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

    /**
     * 
     * @param {Object} loadingFileProps - The loading file props to find the index of the feature column, essential if the submission process
     * is started from files loading. 
     * @returns {String[]} The data index (feature tag) from a loaded data table file. 
     */
    const findFeatures = (loadingFileProps) => {
        if (!submitExistingData) return undefined 
        const feature_index = loadingFileProps.columnNames.indexOf(loadingFileProps.keyColumnName)
        return loadingFileProps.dataArray.map(rowData => rowData[feature_index]) 
    }


    /**
     * @description Closes the alert window and loggs the user out 
     * if the error is of status 401. 
     * @param {AxiosError} error - The potential error returned from an axios request. 
     */
    const closeAlertAndLogout = (error) => {
        // function to handle alert closing 
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
        else {
            setSubmission(initSubmissionState)
        }
    }


    
    const resetAlert = () => {
        // close the alert 
        setAlertProps(prevValues => { return { ...prevValues, isOpen: false } })
    }

    if (submissionIsError) return <APIError {...{error : submissionAPIError}} />
    if (submissionIDLoading) return <div>Loading...</div>

    return (
        <div className="flex flex-column">
            <Alert style={{minWidth:"min(60vw,600px)"}} canEscapeKeyCancel={true} canOutsideClickCancel={true}
                onConfirm={resetAlert} onClose={resetAlert} {...alertProps} />
        <div className="flex flex-column container--scroll-y-hide-x padding--medium intent-margin-top--little intent-margin-right intent-padding-right--little" style={{maxHeight : "84vh",position:"relative"}}>
            {/* <div style={{position:"-webkit-sticky",right:50,top:0}}>
                <Button text="Submit" />
            </div> */}
                {/* <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <h3>Information</h3>
            <p>
                In this section, you can enter details about your new project. If you are looking for advice for your experimental design visit the <a href="/submission/help"><span className="a-span">help section</span></a>.</p>
            <p>The unique dataset tag <span className="h0-span">{tag }</span> has been created for your submission. Please include this unique identifier in any request about your project.
                All files (such as raw file) will include the identifier. Please note that you and your collaborators will be notified via email when the state of your project changes.
                The meta data are based on pre-defined attributes/ontologies and hence it might happen that you are missing an attribute for your project. 
                    </p>
                    <span className="h0-span">Please take care to fill out the submission in a meticulously way. Data without carefully curated meta data are less informative.</span>
            </div> */}
            {/* <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <h3>1. Contact and Collaborators</h3>
                <span>Project owner: </span><span className="h0-span">{authenticationStatus.firstname} {authenticationStatus.lastname}</span>
                    <div><span>Unique identifier: </span> <span className="h0-span">{tag}</span></div>
                    
                    <UserInput selectedUsers={submission.collaborators} onUserSelect={handleCollaboratorSelection} isRequired={false} showLabel={true}  helperText="Collaborators will also be informed about the state of your project." />
                  
            </div> */}
            {/* <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                <h3>2. Mandatory Attributes</h3>
                <p>Attributes that are required for the project submission. </p>
                    <TextInput placeholder="Set the title of your submission.."
                        hint="Project Title"
                        value={_.isString(submission.attributes["title"]) ? submission.attributes["title"] : ""}
                        callbackKey="title"
                        onChange={(callbackKey, title) => onInputChange(callbackKey, title)} />
                    
                    <MandatoryAttributes
                        selectedDatasetAttributes={submission.datasetAttributeValues}
                        onAttributeValueSelect={handleDatasetAttributeSelection} /> 
                
                </div> */}
            
            {/* <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
                    <h3>4. Meta Text</h3>
            
                    <MetaText metatextValues={submission.metatext} {...{ onMetaTextChange }} />
            
            </div> */}
                
                <SubmissionPanelStack {...{submission, setSubmission, onSubmissionRequest, saveSubmission, resetSubmission}} />
            
                {/* <DatasetLinks index={4} links={submission.links} addLink={addLink} removeLink={removeLinkByIndex} onChange={handleLinkChange} /> */}

            
            <div>

            {/* <GenotypeGen    /> */}
                       
                        {/* <GenotypeGenerator /> */}
                {/* <GenotypeGenerator /> */}
                {/* <Button onClick={handleGenotypeCreation} /> */}
                    {/* <GenotypeGenerator
                        proteome_ids={proteome_ids.filter(proteome_id => proteome_id !== "controls")}
                        attributes={attributesForGenotype}
                        // attributeValuesByID={attributeValuesByAtrributeID}
                        //onSelection={genotypeSelection}
                        genotypes={submission.genotypes} 
                        {...{handlePositionSelection, refetchGenotypes }}/>
                             */}
                        
                {/* <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
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
                            value={submission.replicates===0?"":_.toString(submission.replicates)} onChange={(callbackKey, value) => onInputChange(callbackKey, value)} />
                    <NumericValueInput
                            disabled={preDefinedSampleNames}
                            hint={"Number of samples"}
                            placeholder="Number of samples"
                            callbackKey={"sampleNumber"}
                            value={submission.sampleNumber===0?"":_.toString(submission.sampleNumber)} onChange={(callbackKey, value) => onInputChange(callbackKey, value)} />
                    <SampleAttributeTableWrapper {...{
                            submission,
                            genotypes,
                            updateSubmission: setSubmission,
                            numberReplicates: submission.replicates
                        }} />
                </div> */}
            </div> 
            
       
                     
            </div>
            {/* <div className="flex padding--medium">
                <Button text="Submit" onClick={onSubmssionRequest} intent="primary" />
                <Button text="Save" onClick={saveSubmission} />
                <Button text="Reset Form" onClick={resetSubmission} />
            </div> */}
            
            </div>
        )
    }

    InitialSubmission.propTypes  = {
    authenticationStatus: PropTypes.object.isRequired,
    
}


export default InitialSubmission