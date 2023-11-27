import { useMemo } from "react"
import { useGetSubmissionAttributesByTag, useGetSubmissionStates, useGetSubmissions } from "../../../hooks/queries/submission.hooks"
import _ from "lodash"
import LineChart from "../../core/charts/linechart"
import { getAndTransformDatesFromArrayOfObjectsByKey } from "../../../services/arrays/transforms"
import APIError from "../../core/error/APIerror"
import { getCountsByGroups, getUniqueSetsOfAllValuesinArrayOfObjects, getUniqueValuesAndCountsFromList, groupListByProperty } from "../../../services/arrays/groupby"
import { AttributeFilterSelection, StateFilterButton, UserFilterSelection, filterSubmissionByDatasetAttribute } from "../view/SubmissionContainer"
import { Button } from "@blueprintjs/core"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { useOutletContext } from "react-router"
import { getStateName } from "../../../services/states"
import moment from "moment"

function combineMultipleParamFilesFromSubmissions(submissions, dateHeader = "Creation Date") {
    if (_.isArray(submissions)) {

        const paramFiles = _.map(submissions, submission => submission.paramsFile)
        const paramFilesWithDate = getAndTransformDatesFromArrayOfObjectsByKey({
            data: paramFiles,
            keyName: dateHeader,
            dateFormat: "YYYYMMDD"
        })

        return paramFilesWithDate 

        // console.log(paramFilesWithDate)

        // const uniqueParamFileHeader = _.uniq(_.flatten(_.map(paramFiles, paramsFile => {
        //     return Object.keys(paramsFile)
        // })))

        

        // const paramFilesValues = _.map(uniqueParamFileHeader, paramFileHeader => {
        //     return ([paramFileHeader, _.map(submissions, submission => {
        //         var value = submission.paramsFile[paramFileHeader]
        //         return { dataID: submission.dataID, value, isNumeric : _.isNumber(value )}
        //     })])
        // })
       
        // var combinedParamFiles = Object.fromEntries(paramFilesValues)
        // const transfomredStringToDate = getAndTransformDatesFromArrayOfObjectsByKey({
        //     data: combinedParamFiles[dateHeader],
        //     keyName: "value",
        //     dateFormat: "YYYYMMDD"
        // })
        // combinedParamFiles["asDate"] = _.map(transfomredStringToDate, stringToDate => {return { dataID : stringToDate.dataID, value : stringToDate.asDate}})
        
        // return {combinedParamFiles : combinedParamFiles}
    }
}


function SubmissionStatistics({authenticationStatus}) {
    //fetch data from API
    // const { isSuccess, isLoading : submissionIDLoading, isFetching : submissionIDFetching, isError : submissionIsError, error : submissionAPIError, data } = useGetSubmissions()
    // const paramFilesWithDate = useMemo(() => { return isSuccess && _.isObject(data) && _.has(data, "submissions") ? combineMultipleParamFilesFromSubmissions(data.submissions) : {} }, [data])
    //fetch data from API
    const { submissionFilter, setSubmissionFilter,attributeSearchQuery, setAttributeSearchQuery } = useOutletContext() 

    const { isSuccess, isLoading, isFetching, isError, error, data: submissions, refetch : refetchSubmissions} = useGetSubmissions({ tokenString: authenticationStatus.token })    
    const {data : users, isLoading : userIsLoading, isFetching : userIsFetching} = useGetPublicUserInfo({ tokenString: authenticationStatus.token })
    const { data: states, isLoading: submissionStatesLoading } = useGetSubmissionStates({ tokenString: authenticationStatus.token },
        { staleTime: Infinity }) //request only once. 
    const { data: attributesByTag } = useGetSubmissionAttributesByTag({ tokenString: authenticationStatus.token }, { staleTime: Infinity })
    if (!_.isArray(submissions) || !_.isObject(users) || !_.isObject(attributesByTag)) return null 
    const submissionsByState = groupListByProperty(submissions, "state")
    const userLabelsInSubmssion = getUniqueValuesAndCountsFromList(submissions.map(submission => _.concat(submission.collaborators, submission.user_label)))
    const uniqueAtributesInSubmissions = getUniqueSetsOfAllValuesinArrayOfObjects(submissions.map(s => s.dataset_attributes))
    const datasetAttributeFilter = Object.keys(submissionFilter).filter(filterKey => filterKey !== "states") //exclude statefilter

    // if (submissionIsError) return <APIError {...{error : submissionAPIError}} />
    // if (submissionIDLoading || submissionIDFetching) return <div>Loading...</div>
    const usersByLabel = groupListByProperty(users.users, "label")
    const submissionMatchesFilterByIndex = Object.fromEntries(Object.keys(submissionsByState).map(
        state => [state, Object.fromEntries(_.map(submissionsByState[_.toString(state)], (submission, idx) => {
            return [idx, filterSubmissionByDatasetAttribute({
                submissionFilter,
                submissionDatasetAttributes: submission.dataset_attributes,
                datasetAttributeFilter
            })]
        }))]))

    let filteredSubmission = submissions.filter(submission => filterSubmissionByDatasetAttribute({
        submissionFilter,
        submissionDatasetAttributes: submission.dataset_attributes,
        datasetAttributeFilter
    }))
    // console.log(filteredSubmission)
    let dataForLineChart = filteredSubmission.map(d => {
        const stringAsMoment = moment.unix(d.created_on)
        const formattedDate = stringAsMoment._d
        const userFound = _.has(usersByLabel, d.user_label)
            return {
                ...d,
                asMoment: stringAsMoment,
                asDate : formattedDate,
                stateName: getStateName({ submissionStates : states, state: d.state }),
                user: userFound?usersByLabel[d.user_label][0]:{},
                user_name: userFound?`${usersByLabel[d.user_label][0].firstname} ${usersByLabel[d.user_label][0].lastname}`:""
            }
        })
    // console.log(dataForLineChart)
    // console.log(getCountsByGroups(submissions, ["state"],undefined))
    return (
        <div className="flex" style={{ width: "100%" }}>
            <div className="flex flex-column submission__side__filter__container ">
                <h3>States</h3>
                <div className="flex flex-column">
                    {Object.keys(states.states).map(stateName => {
                        const state = states.states[stateName]
                        const numSubmssionsInState = _.has(submissionsByState,state)?submissionsByState[state].length:0
                        return <StateFilterButton
                        numberSubmissionWithTag={numSubmssionsInState}
                        key={stateName}
                        {...{ submissionFilter, setSubmissionFilter, stateName, states }} />})}
                </div>
                <div>
                    <UserFilterSelection {...{submissionFilter,setSubmissionFilter,users : users.users,userLabelsInSubmssion}} />
                    <AttributeFilterSelection {...{uniqueAtributesInSubmissions,attributesByTag,submissionFilter, setSubmissionFilter, attributeSearchQuery, setAttributeSearchQuery}} />
                    <h3>Options</h3>
                    <Button minimal={true} text="Clear Filter" onClick={() => setSubmissionFilter({})}/>
                </div>
            </div>

        <div className="submission__items__container">
            
            <h1>Time Series</h1>
            <LineChart data={dataForLineChart} xAxisIsTime={true} xaxisName="asDate" yaxisNames={["n_samples"]} tooltipCircleNames={["n_samples","title","label"]} /> 

            <h1>Count plots</h1>
                

            </div>
            </div>
    )
}


export default SubmissionStatistics