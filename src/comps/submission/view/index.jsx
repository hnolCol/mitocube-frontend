
import { useState } from "react"
import "../submission.css"
import _ from "lodash"
import { useGetSubmissionStates, useGetSubmissions, usePatchSubmissionDatasetAttributes } from "../../../hooks/queries/submission.hooks"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import { SubmissionContainer } from "./SubmissionContainer"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { AttributeSelectionDialog } from "./dialogs/AttributeSelectionDialog"
import { EditSamplesAttributeDialog } from "./dialogs/SamplesAttributesDialog"
import { EditDatasetAttributeDialog } from "./dialogs/EditDatasetAttributes"
import { RunlistCreatorDialog } from "./dialogs/RunlistDialog"
import { ChangeSubmissionUserDialog } from "./dialogs/ChangeSubmissionUserDialog"


function SubmissionView({authenticationStatus, logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}) {
    
    const [changeOwnerDialog, setChangeOwnerDialog] = useState({
        isOpen: false,
        submission: {},
        // error : undefined,
        // isLoading: false,
        // success: false,
        // submitted : false
    })


    const [attributeSelectionDialog, setAttributeSelectionDialog] = useState({
        isOpen: false,
        attributeFilter: {},
        prevSelectedAttributes: {},
        submission_tag: undefined,
        newSubmissionState: undefined,
        error : undefined,
        isLoading: false,
        success: false,
        submitted : false
    })

    const [runlistDialog, setRunlistDialog] = useState({
        isOpen: false, 
        submission: {},
        onClose: undefined,
        isLoading: false,
        isSuccess: false,
        samplesAttributes : true // true samples, false for dataset
    })

    const [samplesAttributesDialog, setAttributesDialog] = useState({
        isOpen: false, 
        submission: {},
        onClose: undefined,
        isLoading: false,
        isSuccess: false,
        samplesAttributes : true // true samples, false for dataset
    })

    //fetch data from API
    const { data: submissionStates, isLoading: submissionStatesLoading, isError, error } = useGetSubmissionStates({},{staleTime: Infinity}) //request only once. 
    
    // const { isSuccess, wsLoading, isFetching, isError, error, data: submissions, refetch : refetchSubmissions} = useGetSubmissions()    
    const {data : users, isLoading : userIsLoading, isFetching : userIsFetching} = useGetPublicUserInfo()
       
    const {mutate: patchSubmission, isLoading: patchSubmissionIsLoading} = usePatchSubmissionDatasetAttributes()

    const handleStateChangeAttributeUpdate = (tag, datasetAttributes, datasetAttributeValues, state, prevState, comment = "") => {
        handleSubmissionDatasetAttributeUpdate(tag, datasetAttributes, datasetAttributeValues, state, prevState, comment, setAttributeSelectionDialog)
    }

    const handleDatasetAttributeUpdate = (tag, datasetAttributes, datasetAttributeValues, state, prevState, comment = "") => {
        handleSubmissionDatasetAttributeUpdate(tag, datasetAttributes, datasetAttributeValues, state, prevState, comment, setAttributesDialog)
    }
    
    const handleSubmissionDatasetAttributeUpdate = (tag, datasetAttributes, datasetAttributeValues, state, prevState, comment = "", alertUpdateFn) => {
        // handle patching the submission.
    
        let updatedSubmission = {datasetAttributes, datasetAttributeValues}
        const updatedDatasetAttributes = {
            datasetAttributes: updatedSubmission,
            state_change: {
                state,
                prev_state: prevState,
                comment
            }
        }
        patchSubmission({tag, datasetAttributes : updatedDatasetAttributes},
            {
                onSuccess: () => {
                    alertUpdateFn(prevValues => {
                        return {
                            ...prevValues,
                            isLoading: patchSubmissionIsLoading,
                            submitted: true,
                            success: true
                        }
                    }),
                        console.log //undefined //refetch submission?
                },
                onError: (error) => {
                    alertUpdateFn(prevValues => {
                        return {
                            ...prevValues,
                            isLoading: patchSubmissionIsLoading,
                            submitted: true,
                            success: false,
                            isError : true,
                            error
                        }
                    })
                
                }
            })
    alertUpdateFn(prevValues => {return {...prevValues, isLoading : true}})
    }
    return (
        <div className="no-scroll">
            <ChangeSubmissionUserDialog {...changeOwnerDialog} {...{setChangeOwnerDialog}} />
            {/* <AttributeSelectionDialog {...{attributesByTag, setAttributeSelectionDialog }} {...attributeSelectionDialog} */}
                {/* onSubmit={handleStateChangeAttributeUpdate} /> */}
            {/* <EditSamplesAttributeDialog {...samplesAttributesDialog}
                isOpen={samplesAttributesDialog.isOpen && samplesAttributesDialog.samplesAttributes}
                onClose={() => setAttributesDialog(prevValues => {
                    return {
                        ...prevValues,
                        isOpen: false,
                        isLoading: false,
                        success: false,
                        submitted: false
                    }
                })} /> */}
            <EditDatasetAttributeDialog {...samplesAttributesDialog}
                onSubmit={handleDatasetAttributeUpdate}
                isOpen={samplesAttributesDialog.isOpen && !samplesAttributesDialog.samplesAttributes}
                onClose={() => setAttributesDialog(prevValues => {
                    return {
                        ...prevValues,
                        isOpen: false,
                        isLoading: false,
                        success: false,
                        submitted: false
                    }
                })} /> 
            <RunlistCreatorDialog {...runlistDialog} onClose={() => setRunlistDialog(prevValues => { return { ...prevValues, isOpen: false, isLoading : false, success : false, submitted : false } })}/>
            {userIsFetching || userIsLoading ?
                <Loading /> : isError ?
                    <APIError error={error} /> :
                        <SubmissionContainer states={submissionStates}
                            {...{
                            users: users,
                            submissionFilter,
                            setSubmissionFilter,
                            setAttributeSelectionDialog,
                            handleSubmissionDatasetAttributeUpdate,
                            submissionsQuery,
                            setSubmissionQuery,
                            setAttributesDialog,
                            setRunlistDialog,
                            setChangeOwnerDialog,
                            }} />}
            
        </div>
    )
}


export default SubmissionView

