
import { useState } from "react"
import "../submission.css"
import _ from "lodash"
import { useGetSubmissionAttributesByTag, useGetSubmissionStates, useGetSubmissions, usePatchSubmission } from "../../../hooks/queries/submission.hooks"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import { SubmissionContainer } from "./SubmissionContainer"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { AttributeSlectionDialog } from "./dialogs/AttributeSelectionDialog"
import { EditSamplesAttributeDialog } from "./dialogs/SamplesAttributesDialog"
import { EditDatasetAttributeDialog } from "./dialogs/DatasetAttributesDialog"




// SubmissionView.propTypes = {
//     token: PropTypes.string.isRequired, //the token 
//     logout : PropTypes.func.isRequired //logout if API returns that the token is not valid. 
// }
const initRenameGrouping = {
    isOpen: false,
    groupingNames: [],
    dataID: undefined,
    paramsFile: {}
}
const initExperimental = {
    isOpen: false,
    dataID: "",
    paramsFile: {}
}

function SubmissionView({authenticationStatus, logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}) {
    
    const [attributeSelectionDialog, setAttributeSelectionDialog] = useState({
        isOpen: false,
        attributeFilter: {},
        prevSelectedAttributes: {},
        submission: {},
        newSubmissionState: undefined,
        error : undefined,
        isLoading: false,
        success: false,
        submitted : false
    })



    const [samplesAttributesDialog, setSamplesAttributesDialog] = useState({
        isOpen: false, 
        submission: {},
        onClose: undefined,
        isLoading: false,
        isSuccess: false,
        samplesAttributes : true // true samples, false for dataset
    })


    // const [groupingRenameDetails, setGroupingRenameDetails] = useState(initRenameGrouping)
    // const [experimentalDetails, setExperimentalDetails] = useState(initExperimental)
    // const [sampleListDialog, setSampleListDialog] = useState({ isOpen: false })
    // const [subissionOverviewDialog, setSubissionOverviewDialog] = useState({ isOpen: false, dataID: undefined, paramsFile: {} })
    const [updatedDataIDs, setUpdatedDataIDs] = useState({})
    const [alertState, setAlertState] = useState({isOpen:false,children:<div>Warning!</div>})
    //fetch data from API
    const { data: submissionStates, isLoading: submissionStatesLoading } = useGetSubmissionStates({ tokenString: authenticationStatus.token },
        { staleTime: Infinity }) //request only once. 
    
    const { isSuccess, isLoading, isFetching, isError, error, data: submissions, refetch : refetchSubmissions} = useGetSubmissions()    
    const {data : attributesByTag} = useGetSubmissionAttributesByTag({tokenString : authenticationStatus.token},{staleTime : Infinity})
    const {data : users, isLoading : userIsLoading, isFetching : userIsFetching} = useGetPublicUserInfo()
       
    const {
        mutate: patchSubmission,
        isLoading: patchSubmissionIsLoading,
        isSuccess: patchSubmissionSuccess,
        isError: patchSubmissionIsError } = usePatchSubmission()
    
    
    const handleStateChangeAttributeUpdate = (label, datasetAttributeValues, state, prevState, comment = "") => {
        handleSubmissionDatasetAttributeUpdate(label, datasetAttributeValues, state, prevState, comment, setAttributeSelectionDialog)
    }

    const handleDatasetAttributeUpdate = (label, datasetAttributeValues, state, prevState, comment = "") => {
        handleSubmissionDatasetAttributeUpdate(label, datasetAttributeValues, state, prevState, comment, setSamplesAttributesDialog)
    }
    
    const handleSubmissionDatasetAttributeUpdate = (label, datasetAttributeValues, state, prevState, comment = "", alertUpdateFn) => {
        // handle patching the submission.
        
        let datasetAttributes = Object.keys(datasetAttributeValues).map(attributeTag => attributesByTag.attributes[attributeTag])
        let updatedSubmission = {datasetAttributes, datasetAttributeValues}
        const data = {
            datasetAttributes: updatedSubmission,
            state_change: {
                state,
                prev_state: prevState,
                comment
            }
        }
        patchSubmission({ tokenString: authenticationStatus.token, label, data},
            {
                onSuccess: () => {
                    alertUpdateFn(prevValues => {
                        return {
                            ...prevValues,
                            isLoading: patchSubmissionIsLoading,
                            submitted: true,
                            success: patchSubmissionSuccess
                        }
                    }),
                        refetchSubmissions()
                },
                onError: (error) => {
                    alertUpdateFn(prevValues => {
                        return {
                            ...prevValues,
                            isLoading: patchSubmissionIsLoading,
                            submitted: true,
                            success: patchSubmissionSuccess,
                            isError : patchSubmissionIsError,
                            error
                        }
                    })
                
                }
            })
            alertUpdateFn(prevValues => {return {...prevValues,isLoading : patchSubmissionIsLoading}})
    }
    

    // const downloadProjectSummary = (event, notThisState = undefined) => {
    //     //download the projects summary as a txt file.
    //     let submissions = submissionDetails.submissions
    //     if (submissions.length > 0) {
    //         let summaryColumns = submissionDetails.submissionSummaryParams
    //         if (_.isArray(summaryColumns) && summaryColumns.length > 0){ 
    //             let filteredSubmission = notThisState!==undefined?_.filter(submissions, v => v.paramsFile.State !== notThisState):submissions.slice()
    //             let submissionSummary = filteredSubmission.map(submission => Object.fromEntries(summaryColumns.map(sumColumn => [sumColumn, submission.paramsFile[sumColumn]])))
    //             downloadTxtFile(arrayOfObjectsToTabDel(submissionSummary,summaryColumns),`ProjectSummary(${notThisState===undefined?"allStates":"allStatesBut"+notThisState}).txt`)
    //         }
    //     }
    // }


    // const downloadNotLastStateProjects = (event) => {
    //     // download all projects that are not the last state (e.g. assuming that the last state in the list is done.)
    //     let notThisState = submissionDetails.states.slice(-1)[0]
    //     if (notThisState !== undefined) {
    //         downloadProjectSummary(undefined, notThisState)
    //     }
    // }

    // const openSubmissionOverviewDialog = (dataID, paramsFile) => {
    //     // openns a dialog to view the submission
    //     setSubissionOverviewDialog(prevValues => {return {...prevValues,isOpen : true, dataID : dataID, paramsFile: paramsFile}})
    // }
    
    //setAlertProps(prevValues => { return { ...prevValues, isOpen: false, isLoading : false, success : false, submitted : false } })
    return (
        <div className="no-scroll">
            <AttributeSlectionDialog {...{ authenticationStatus, attributesByTag, setAttributeSelectionDialog }} {...attributeSelectionDialog}
                onSubmit={handleStateChangeAttributeUpdate} />
            {_.isArray(submissions) ? <EditSamplesAttributeDialog {...samplesAttributesDialog}
                isOpen={samplesAttributesDialog.isOpen && samplesAttributesDialog.samplesAttributes}
                onClose={() => setSamplesAttributesDialog(prevValues => { return { ...prevValues, isOpen: false, isLoading : false, success : false, submitted : false } })} /> : null}
            {_.isArray(submissions) ? <EditDatasetAttributeDialog {...samplesAttributesDialog}
                onSubmit={handleDatasetAttributeUpdate} isOpen={samplesAttributesDialog.isOpen && !samplesAttributesDialog.samplesAttributes}
                onClose={() => setSamplesAttributesDialog(prevValues => { return { ...prevValues, isOpen: false, isLoading : false, success : false, submitted : false} })} /> : null}
            {isLoading || isFetching || userIsFetching || userIsLoading?
                <Loading /> : isError ?
                    <APIError error={error} /> : _.isObject(attributesByTag) && _.has(attributesByTag,"attributes") && _.has(attributesByTag,"attribute_values") && _.isArray(submissions) ? 
                        <SubmissionContainer states={submissionStates} {...{ submissions, attributesByTag, users : users, submissionFilter, setSubmissionFilter, setAttributeSelectionDialog, handleSubmissionDatasetAttributeUpdate, submissionsQuery, setSubmissionQuery, setSamplesAttributesDialog}} /> : null}
            {/* <Alert {...alertState} canEscapeKeyCancel={true} canOutsideClickCancel={true} onClose={e => setAlertState({ isOpen: false })} />
            <SubmissionOverviewDialog
                {...subissionOverviewDialog}
                canEscapeKeyCancel={true}
                canOutsideClickCancel={true}
                paramNames={submissionDetails.submissionSummaryParams}
                onClose={() => setSubissionOverviewDialog(prevValues => { return { ...prevValues, isOpen: false } })} />
            
             <CreateSampleList {...sampleListDialog} onClose={setSampleListDialog} handleDataChange={handleSubmissionUpdate} />
            <MethodEditingDialog
                {...experimentalDetails}
                methodsHeader="Experimental Info"
                handleDataChange = {handleSubmissionUpdate}
                onClose = {closeMethodEditingDialog}/>
            <GroupingNameDialog 
                {...groupingRenameDetails}
                closeDialog = {closeRenameGroupingDialog} 
                changeGroupingNames={handleRenameGrouping} /> */}
            
            {/* <div className="flex center-items justify-end intent-margin-bottom--little">
            
                {_.isObject(stateCounts) ? Object.keys(stateCounts).map((state, stateIdx) => {
                    return (
                        <div key={`${state}`}>
                            <Numeric
                                metric={stateCounts[state]}
                                label={state}
                                spanClassName={`h${stateIdx}-span`}
                                callbackOnClick={() => handleFilterSelection(state==="Total"?"None":state)} />
                        </div>
                    )}) : null
                }
        

            </div> */}
            {/* <div>
            <InputGroup 
                        leftIcon={"filter"} 
                        onChange={handleSearchInput}
                        placeholder="Filter submissions .." 
                        small={true} 
                        rightElement={
                            <div style={{ marginRight: "0.5rem" }}>
                                {
                                    isSuccess && _.isObject(data) ?
                            <p>{`${submissionDetails.submissionsToShow.length}/${data.submissions.length}`}</p> 
                                
                            : null}
                            
                        </div>}
                        />
                
                <div className="flex">

                
                    <ButtonGroup>
                        <Tooltip2 content={
                                <div>
                                <p>Download project summary of runs not equal to '{submissionDetails.states.slice(-1)[0]}'</p>
                                <p>as a txt tab delimted file.</p>
                                </div>}>
                        <Button
                            intent="success"
                            minimal={ true}
                            onClick={downloadNotLastStateProjects}
                                rightIcon={"download"} />
                        </Tooltip2>
                        
                        <Tooltip2 content={
                                <div>
                                <p>Download project summary of all projects in the database.</p>
                                </div>}>
                            <Button 
                                intent="warning"
                                minimal={true}
                                rightIcon={"download"}
                                onClick={downloadProjectSummary} />
                        </Tooltip2>
                        <MenuDivider/>
                        <Button text={"State Filter : "} minimal={true} small={true} />
                        
                        <Combobox 
                            items={_.concat(["None"],_.isObject(data) && _.has(data,"states")?data.states:[])} 
                            placeholder = {submissionDetails.submissionFilter!==undefined?submissionDetails.submissionFilter:"Filter .."} 
                            callback = {handleFilterSelection}
                            buttonProps = {{
                                minimal : true,
                                small : true,
                                intent : "primary"}
                                
                            }/>
                    </ButtonGroup>
                </div>
            
            </div> */}
            {/* <div className="submission__items__container">
                {_.isArray(data) ? data.map(v => {
                    return <SubmissionItem paramsFile={v}/>

                    // if ((submissionDetails.submissionsToShow.length === 0 &&
                    //     submissionDetails.searchString === "" &&
                    //     submissionDetails.submissionFilter === "None") || submissionDetails.submissionsToShow.includes(v.dataID)) {
                    //     return(
                    //     <SubmissionItem
                    //         key = {v.dataID} 
                    //          //= {token} token
                    //         handleDataChange = {handleSubmissionUpdate} 
                    //         openSampleListDialog = {openSampleListDialog}
                    //         openRenameGroupingDialog = {openRenameGroupingDialog}
                    //             openMethodEditingDialog={openMethodEditingDialog}
                    //             openSubmissionOverviewDialog={openSubmissionOverviewDialog}
                    //         setAlertState = {setAlertState} 
                    //         states={data.states}
                    //         tagNames={data.tagNames}
                            
                    //         isUpdated = {Object.keys(updatedDataIDs).includes(v.dataID)?updatedDataIDs[v.dataID]:false}
                    //         setIsUpdated = {setUpdatedState}
                    //         {...v}/>)
                    // }
                    // else {
                    //     return null
                    // }

                }): isLoading || isFetching ? <p>Loading...</p> :  isError ? <APIError error={error}/> :null}
            </div> */}
        </div>
    )
}


export default SubmissionView

