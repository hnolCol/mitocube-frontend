import { useGetSubmissionAttributesByTag, useGetSubmissionStates, useGetSubmissions } from "../../../hooks/queries/submission.hooks"
import _ from "lodash"
import LineChart from "../../core/charts/linechart"
import APIError from "../../core/error/APIerror"
import { getUniqueValuesAndCountsFromList, groupListByProperty } from "../../../services/arrays/groupby"
import { extractSubmissionDetails, filterSubmissions } from "../view/SubmissionContainer"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { getStateName } from "../../../services/states"
import moment from "moment"
import { SubmissionBaseFilter } from "../filter"
import Loading from "../../core/base/loading"



function SubmissionStatistics({authenticationStatus, submissionsQuery, setSubmissionQuery, submissionFilter, setSubmissionFilter}) {

    const { isSuccess, isLoading, isFetching, isError, error, data: submissions, refetch : refetchSubmissions} = useGetSubmissions({ tokenString: authenticationStatus.token })    
    const {data : users, isLoading : userIsLoading, isFetching : userIsFetching} = useGetPublicUserInfo({ tokenString: authenticationStatus.token })
    const { data: states, isLoading: submissionStatesLoading, isFetching : satesIsFetching } = useGetSubmissionStates()
    const { data: attributesByTag } = useGetSubmissionAttributesByTag({ tokenString: authenticationStatus.token }, { staleTime: Infinity })
    
    if (isError) return <APIError error={error} />
    if (isLoading || userIsLoading || userIsFetching || submissionStatesLoading || isFetching || satesIsFetching) return <Loading />
    if (!_.isArray(submissions) || !_.isObject(users) || !_.isObject(attributesByTag)) return null 
    if (submissions.length === 0) return <div><p>No submissions found. Please use the submission portal to create your first submission.</p></div>
    
    const {uniqueAtributesInSubmissions,usersByDataLabel} = extractSubmissionDetails({submissions})
    const usersByLabel = groupListByProperty(users, "label")
    const filteredSubmission = filterSubmissions({ submissions, submissionFilter, submissionsQuery, usersByDataLabel })   
    const submissionsByState = groupListByProperty(filteredSubmission, "state")
    const userLabelsInSubmission = getUniqueValuesAndCountsFromList(filteredSubmission.map(submission => _.concat(submission.collaborators, submission.user_label)))

    //get line data
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
                
                <SubmissionBaseFilter {...{
                    submissionsByState,
                    states,
                    submissionFilter,
                    submissionsQuery,
                    setSubmissionFilter,
                    setSubmissionQuery,
                    attributesByTag, userLabelsInSubmission,
                    uniqueAtributesInSubmissions,
                    users: users
                }} />

            </div>

        <div className="submission__items__container">
                <p>Submission : {filteredSubmission.length}</p>
            <h1>Time Series</h1>
                {dataForLineChart.length > 0 ? <LineChart data={dataForLineChart} xAxisIsTime={true} xaxisName="asDate" yaxisNames={["n_samples"]} tooltipCircleNames={["n_samples", "title", "label"]} /> : null}

                <h1>Count plots</h1>
                

            </div>
            </div>
    )
}


export default SubmissionStatistics