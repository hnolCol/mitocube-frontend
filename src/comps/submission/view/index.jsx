import { Button, ButtonGroup, MenuDivider, Alert, InputGroup, Dialog, DialogBody } from "@blueprintjs/core"
import { Tooltip2 } from "@blueprintjs/popover2"
import PropTypes from "prop-types"
import { useEffect, useMemo, useState } from "react"
import CreateSampleList from "./dialogs/CreateSampleList"
import SubmissionOverviewDialog from "./dialogs/SubmissionOverview"
import GroupingNameDialog from "./dialogs/GroupingRename"
import MethodEditingDialog from "./dialogs/ExperimentalInfoEditing"
import _ from "lodash"
import { Combobox } from "../../core/input/Combobox"
import { Header } from "../../core/base/Header"
import { useGetSubmissionAttributesByTag, useGetSubmissionStates, useGetSubmissions, usePatchSubmission } from "../../../hooks/queries/submission.hooks"
import APIError from "../../core/error/APIerror"
import Numeric from "../../core/metrics/Numeric"
import Loading from "../../core/base/loading"
import { SubmissionContainer } from "./SubmissionContainer"
import "../submission.css"
import TextInput from "../../core/input/Text"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { AttributeSlectionDialog } from "./dialogs/AttributeSelectionDialog"
import { useOutletContext } from "react-router"
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
   
    const [submissionDetails, setSubmissions] = useState({
        submissions: [],
        states: [],
        tagNames : [],
        searchColumns : [], //columns that are available from the 
        submissionSatesCounts: {}, //counts the states.
        submissionsToShow: [],
        submissionFilter: "None",
        searchString: "",
        submissionSummaryParams: []
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



    const [samplesAttributesDialog, setSamplesAttributesDialog] = useState({
        isOpen: false, 
        submission: {},
        onClose: undefined,
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
    
    const { isSuccess, isLoading, isFetching, isError, error, data: submissions, refetch : refetchSubmissions} = useGetSubmissions({ tokenString: authenticationStatus.token })    
    const {data : attributesByTag} = useGetSubmissionAttributesByTag({tokenString : authenticationStatus.token},{staleTime : Infinity})
    const {data : users, isLoading : userIsLoading, isFetching : userIsFetching} = useGetPublicUserInfo({ tokenString: authenticationStatus.token })
       
    const {
        mutate: patchSubmission,
        isLoading: patchSubmissionIsLoading,
        isSuccess: patchSubmissionSuccess,
        error: patchSubmissionError,
        isError: patchSubmissionIsError } = usePatchSubmission()
    
    const handleSubmissionDatasetAttributeUpdate = (label, datasetAttributeValues, state, prevState, comment = "") => {
        //datasetAttributeValues : Dict[str,List[AttributeValue]]
        //datasetAttributes: List[Attribute]
        
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
                    setAttributeSelectionDialog(prevValues => {
                        return {
                            ...prevValues,
                            isLoading: false,
                            submitted: true,
                            success: true
                        }
                    }),
                        refetchSubmissions()
                },
                onError: (error) => {
                    setAttributeSelectionDialog(prevValues => {
                        return {
                            ...prevValues,
                            isLoading: false,
                            submitted: true,
                            success: false,
                            error
                        }
                    })
                
                }
            })
        setAttributeSelectionDialog(prevValues => {return {...prevValues,isLoading : true}})
    }
    

    const getStateCounts = (states, submissions) => {
        //count the states 
        const stateCounts = Object.fromEntries(_.concat(["Total"],states).map(state => [state,0]))
        _.forEach(submissions, v => {
            stateCounts[v.paramsFile.State] += 1
            stateCounts["Total"] += 1 
        })
        return stateCounts
    }

    // const stateCounts = useMemo(() => {
    //     if (_.isObject(data) && _.isArray(data.states) && _.isArray(data.submissions)) {
    //         return getStateCounts(data.states, data.submissions)
    //     }
    //     return {}
    // },[data])


    const openRenameGroupingDialog = (dataID,paramsFile) => {
        setGroupingRenameDetails({isOpen:true,dataID:dataID,paramsFile:paramsFile,groupingNames:paramsFile.groupingNames})
    }

    const openMethodEditingDialog = (dataID,paramsFile) => {
        setExperimentalDetails({isOpen:true,dataID:dataID,paramsFile:paramsFile})
        setUpdatedState(dataID,true)
    }

    const closeMethodEditingDialog = () => {
        setExperimentalDetails(initExperimental)
    }

    const handleRenameGrouping = (renameDict, dataID, paramsFile) => {
        
        // renaming grouping names requires changes at multiple places including
        // the groupingCmap (e.g. color mappings for a grouping) as well as the groupingNames and the groupings.
        const groupingNamesToRename = Object.keys(renameDict)
        const originalGroupingNames = paramsFile.groupingNames
        const updatedGroupingNames = originalGroupingNames.map(groupingName => groupingNamesToRename.includes(groupingName)?renameDict[groupingName]:groupingName)
        var updated_src = {...paramsFile}
        updated_src["groupingNames"] = updatedGroupingNames
        var groupings = updated_src["groupings"]
        // add grouping cmap here! 
        const updatedGroupings = Object.fromEntries(Object.keys(groupings).map(v => [groupingNamesToRename.includes(v)?renameDict[v]:v,groupings[v]]))
        updated_src["groupings"] = updatedGroupings
        //update color mapping
        var groupingCmap = updated_src["groupingCmap"]
        const updatedCmapGrouping = Object.fromEntries(Object.keys(groupingCmap).map(v => [groupingNamesToRename.includes(v)?renameDict[v]:v,groupingCmap[v]]))
        updated_src["groupingCmap"] = updatedCmapGrouping

        handleSubmissionUpdate(dataID,updated_src)
        setUpdatedState(dataID,true)
        closeRenameGroupingDialog()
        

    }

    const closeRenameGroupingDialog = () => {
        //simply close the renaming dialog
        setGroupingRenameDetails(initRenameGrouping)
    }

    

    const handleFilterSelection = (filterName) => {
        var filteredSubmissions = getStringMatchSubmissions(submissionDetails.searchString)
        const submissionsFiltered = filterName === "None"?_.map(filteredSubmissions, v => v.dataID):_.map(_.filter(filteredSubmissions, v => v.paramsFile.State === filterName),v => v.dataID)
        setSubmissions(prevValues => {
            return { ...prevValues, "submissionsToShow":submissionsFiltered, "submissionFilter":filterName}})

    }

    const getStringMatchSubmissions = (searchString) => {
        if (searchString === "") return data.submissions
        const re = new RegExp(_.escapeRegExp(searchString), 'i')
        // search columns should be provided by API!
        const searchColumns = data.searchColumns.slice() // ["shortDescription","Material","Organism","dataID","Title","Email","Type","Experimentator"]
        const isMatch = result => _.filter(searchColumns.map(v => re.test(result.paramsFile[v]))).length > 0
        //const isMatch = result => re.test(result.shortDescription) | re.test(result.Material) | re.test(result.Organism) | re.test(result.dataID) | re.test(result.Title) | re.test(result.Email)  | re.test(result.Email)
        var filteredSubmissions = _.filter(data.submissions, isMatch)
        return filteredSubmissions
    }

    const handleSearchInput = (e) => {
        const searchString =  e.target.value 
        //const isMatch = result => re.test(result.shortDescription) | re.test(result.Material) | re.test(result.Organism) | re.test(result.dataID) | re.test(result.Title) | re.test(result.Email)  | re.test(result.Email)
        var filteredSubmissions = getStringMatchSubmissions(searchString)

        if (submissionDetails.submissionFilter !== undefined && submissionDetails.submissionFilter !== "None") {
            filteredSubmissions = _.filter(filteredSubmissions,v => v.paramsFile.State === submissionDetails.submissionFilter)
        }
        var filteredDataIDSubmissions  = filteredSubmissions.map(v => v.dataID)
        setSubmissions(prevValues => {
            return { ...prevValues, "submissionsToShow":filteredDataIDSubmissions,"searchString" : searchString}})
    }

    const openSampleListDialog = (dataID) => {
        setSampleListDialog({isOpen:true,dataID:dataID})
    }


    const handleSubmissionUpdate = (dataID,updated_src) => {
        
        let s = submissionDetails.submissions.map(v => {
            if (v.dataID === dataID){
                v.paramsFile = updated_src
                return v
            }
            else {
                return v
            }
        })

        // to show only the ones that were selected before

        setSubmissions(prevValues => {
            return { ...prevValues, "submissions":s, "submissionSatesCounts":getStateCounts(submissionDetails.states,s)}})
    }


    const setUpdatedState = (dataID,state=true) => {
        var copiedState = {...updatedDataIDs}
        copiedState[dataID] = state
        setUpdatedDataIDs(copiedState)
    }


    const downloadProjectSummary = (event, notThisState = undefined) => {
        //download the projects summary as a txt file.
        let submissions = submissionDetails.submissions
        if (submissions.length > 0) {
            let summaryColumns = submissionDetails.submissionSummaryParams
            if (_.isArray(summaryColumns) && summaryColumns.length > 0){ 
                let filteredSubmission = notThisState!==undefined?_.filter(submissions, v => v.paramsFile.State !== notThisState):submissions.slice()
                let submissionSummary = filteredSubmission.map(submission => Object.fromEntries(summaryColumns.map(sumColumn => [sumColumn, submission.paramsFile[sumColumn]])))
                downloadTxtFile(arrayOfObjectsToTabDel(submissionSummary,summaryColumns),`ProjectSummary(${notThisState===undefined?"allStates":"allStatesBut"+notThisState}).txt`)
            }
        }
    }


    const downloadNotLastStateProjects = (event) => {
        // download all projects that are not the last state (e.g. assuming that the last state in the list is done.)
        let notThisState = submissionDetails.states.slice(-1)[0]
        if (notThisState !== undefined) {
            downloadProjectSummary(undefined, notThisState)
        }
    }

    const openSubmissionOverviewDialog = (dataID, paramsFile) => {
        // openns a dialog to view the submission
        setSubissionOverviewDialog(prevValues => {return {...prevValues,isOpen : true, dataID : dataID, paramsFile: paramsFile}})
    }
    
    
    return (
        <div className="no-scroll">
            <AttributeSlectionDialog {...{ authenticationStatus, attributesByTag, setAttributeSelectionDialog}} {...attributeSelectionDialog} onSubmit={handleSubmissionDatasetAttributeUpdate}/>
            {_.isArray(submissions) ? <EditSamplesAttributeDialog {...samplesAttributesDialog} isOpen={samplesAttributesDialog.isOpen && samplesAttributesDialog.samplesAttributes} onClose={() => setSamplesAttributesDialog(prevValues => {return {...prevValues,isOpen : false}})}/> : null}
            {_.isArray(submissions) ? <EditDatasetAttributeDialog {...samplesAttributesDialog} onSubmit={handleSubmissionDatasetAttributeUpdate} isOpen={samplesAttributesDialog.isOpen && !samplesAttributesDialog.samplesAttributes} onClose={() => setSamplesAttributesDialog(prevValues => {return {...prevValues,isOpen : false}})}/> : null}
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

