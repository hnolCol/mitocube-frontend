
import { useState } from "react"
import "../submission.css"
import _ from "lodash"
import { useGetSubmissionAttributesByTag, useGetSubmissionStates, useGetSubmissions, usePatchSubmission } from "../../../hooks/queries/submission.hooks"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import { SubmissionContainer } from "./SubmissionContainer"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { AttributeSelectionDialog } from "./dialogs/AttributeSelectionDialog"
import { EditSamplesAttributeDialog } from "./dialogs/SamplesAttributesDialog"
import { EditDatasetAttributeDialog } from "./dialogs/DatasetAttributesDialog"
import { RunlistCreatorDialog } from "./dialogs/RunlistDialog"
import { ChangeSubmissionUserDialog } from "./dialogs/ChangeSubmissionUserDialog"




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
    
    const [changeOwnerDialog, setChangeOwnerDialog] = useState({
        isOpen: false,
        submission: {},
        error : undefined,
        isLoading: false,
        success: false,
        submitted : false
    })

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
    const { data: submissionStates, isLoading: submissionStatesLoading } = useGetSubmissionStates({},{staleTime: Infinity}) //request only once. 
    
    const { isSuccess, isLoading, isFetching, isError, error, data: submissions, refetch : refetchSubmissions} = useGetSubmissions()    
    const {data : attributesByTag} = useGetSubmissionAttributesByTag({},{staleTime : Infinity})
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
        handleSubmissionDatasetAttributeUpdate(label, datasetAttributeValues, state, prevState, comment, setAttributesDialog)
    }
    
    const handleSubmissionDatasetAttributeUpdate = (label, datasetAttributeValues, state, prevState, comment = "", alertUpdateFn) => {
        // handle patching the submission.
        console.log(label)
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
        patchSubmission({label, data},
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
                        refetchSubmissions()
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
            alertUpdateFn(prevValues => {return {...prevValues,isLoading : patchSubmissionIsLoading}})
    }
    
    return (
        <div className="no-scroll">
            <ChangeSubmissionUserDialog {...changeOwnerDialog} {...{setChangeOwnerDialog}} />
            <AttributeSelectionDialog {...{ authenticationStatus, attributesByTag, setAttributeSelectionDialog }} {...attributeSelectionDialog}
                onSubmit={handleStateChangeAttributeUpdate} />
            {_.isArray(submissions) ? <EditSamplesAttributeDialog {...samplesAttributesDialog}
                isOpen={samplesAttributesDialog.isOpen && samplesAttributesDialog.samplesAttributes}
                onClose={() => setAttributesDialog(prevValues => {
                    return {
                        ...prevValues,
                        isOpen: false,
                        isLoading: false,
                        success: false,
                        submitted: false
                    }
                })} /> : null}
            {_.isArray(submissions) ? <EditDatasetAttributeDialog {...samplesAttributesDialog}
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
                })} /> : null}
            {_.isArray(submissions) ? <RunlistCreatorDialog {...runlistDialog} onClose={() => setRunlistDialog(prevValues => { return { ...prevValues, isOpen: false, isLoading : false, success : false, submitted : false } })}/>: null}
            {isLoading || isFetching || userIsFetching || userIsLoading ?
                <Loading /> : isError ?
                    <APIError error={error} /> : _.isObject(attributesByTag) && _.has(attributesByTag,"attributes") && _.has(attributesByTag,"attribute_values") && _.isArray(submissions) ? 
                        <SubmissionContainer states={submissionStates}
                            {...{
                            attributesByTag,
                            users: users,
                            submissionFilter,
                            setSubmissionFilter,
                            setAttributeSelectionDialog,
                            handleSubmissionDatasetAttributeUpdate,
                            submissionsQuery,
                            setSubmissionQuery,
                            setAttributesDialog,
                            setRunlistDialog,
                            setChangeOwnerDialog
                            }} /> : null}
            
        </div>
    )
}


export default SubmissionView

