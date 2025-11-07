import { useGetSubmissionTag, useGetSubmissionMetatext, usePostSubmission } from "../../../hooks/queries/submission.hooks"
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
            research_aim: "", 
            replicates : [],
            sampleNames: [],
            sampleNamesFixed: false,
            samplesAttributes : [], 
            collaborators : [],
            attributeTable: [],
            metatext: {},
            genotypes: {},
            links : [{id : randomInitLinkID, link : "", comment : ""}],
            selected_traits: [], // the dataset traits,
            rerenderTableDependency: 0,
            title : ""
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
    
    const { mutate: postSubmission, isLoading: submissionLoading, isError: submissionFailed, error: submissionError } = usePostSubmission()
    const { data: metatext } = useGetSubmissionMetatext({}) 
    const { data: submission_tag, isLoading: submissionIDLoading, error: submissionAPIError, isError: submissionIsError, refetch : refetchSubmissionID } = useGetSubmissionTag({},{enabled : !_.isString(init_submission_tag)})
    const tag = useMemo(() => _.isString(init_submission_tag) ? init_submission_tag : _.isObject(submission_tag) ?submission_tag.tag : undefined,[_.isObject(submission_tag),submission_tag])
    
    
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
                sampleNames: constructedSampleNames,
                attributeTable,
                tag, rerenderTableDependency: [Math.random()]
            }
        })

    }, [submission.sampleNumber, tag ])


    const onSubmissionRequest = () => {
        // check the submisison before sending it to the API 
        // note that the API should also do its own checking. 

        let errMsgs = [] //collect error messages
        const numberSamples = submission.sampleNames.length
        const maxReplicateID = _.toInteger(submission.numberReplicates)
        const validReplicates = submission.replicates.filter((rep, idx) => _.isNumber(rep) && idx < numberSamples && rep <= maxReplicateID)
        const numberReplicates = validReplicates.length
        const attributeTable = submission.attributeTable.slice(0, numberSamples)
        // const allEmptyGenoypes = _.every(genotypeAttributes.map(attrs => attrs.length === 0))
        // const someEmptyGenotypes = _.some(genotypeAttributes.map(attrs => attrs.length === 0))
        
        
        if (!_.isString(submission.title) || submission.title.length < 10) {
            errMsgs.push("Title not defined or to short (<10 characters).")
        }

        if (numberSamples === 0) {
            errMsgs.push("No samples number provided.")
        }

        if (numberReplicates === 0) {
            errMsgs.push("No replicates defined for the samples.")
        }

        if (numberReplicates < numberSamples) {
            errMsgs.push("Less replicates defined than samples. Check for missing cells in the sample attribute table. Maybe you also changed the number of replicates after you defined them in the table.")
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
            let submissionDetails = { } // ...submission 
            // delete rendering float
            submissionDetails["title"] = submission.title 
            submissionDetails["sample_names"] = submission.sampleNames 
            submissionDetails["replicates"] = validReplicates
            submissionDetails["samples_attributes"] = attributeTable
            submissionDetails["dataset_attributes"] = submission.selected_traits
            submissionDetails["collaborators"] = submission.collaborators.slice()
            submissionDetails["research_aim"] = submission.metatext["metatext:research_aim"]
            submissionDetails["tag"] = tag 
            submissionDetails["metatext"] = submission.metatext
            delete submissionDetails["rerenderTableDependency"]
            delete submissionDetails["attributes"]

            submissionDetails["datasetAttributes"] = _.fromPairs(_.keys(submission["datasetAttributeValues"])
                .filter(key => _.isArray(submission["datasetAttributeValues"][key]) && submission["datasetAttributeValues"][key].length > 0).map(key => [key, submission["datasetAttributeValues"][key].map(t => t.tag)]))
            
            
            submissionDetails["links"] = submission.links.filter(linkProps => linkProps.link !== "")

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
                            // resetSubmission()
                            redirect("/submissions/view")
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
            <Alert
                style={{ minWidth: "min(60vw,600px)" }}
                canEscapeKeyCancel={true}
                canOutsideClickCancel={true}
                onConfirm={resetAlert}
                onClose={resetAlert} {...alertProps} />
            
            <div
                className="flex flex-column container--scroll-y-hide-x padding--medium margin-top--little margin-right intent-padding-right--little"
                style={{ height: "100%", position: "relative" }}>
                
                    <SubmissionPanelStack {...{
                        submission,
                        setSubmission,
                        onSubmissionRequest,
                        saveSubmission,
                        resetSubmission
                    }} />
            </div>
            
            </div>
        )
    }

    InitialSubmission.propTypes  = {
    authenticationStatus: PropTypes.object.isRequired,
    
}


export default InitialSubmission