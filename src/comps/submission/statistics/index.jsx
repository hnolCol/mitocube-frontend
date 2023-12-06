import { useGetSubmissionAttributesByTag, useGetSubmissionStates, useGetSubmissions } from "../../../hooks/queries/submission.hooks"
import _ from "lodash"
import LineChart from "../../core/charts/linechart"
import APIError from "../../core/error/APIerror"
import { binDataByDate, getUniqueValuesAndCountsFromList, groupListByProperty } from "../../../services/arrays/groupby"
import { extractSubmissionDetails, filterSubmissions } from "../view/SubmissionContainer"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { getStateName } from "../../../services/states"
import moment from "moment"
import { SubmissionBaseFilter } from "../filter"
import Loading from "../../core/base/loading"
import { AnimatedBarplot } from "../../core/charts/barplot/AnimatedBarplot"
import PercentageLine from "../../core/charts/percentage/line"



function SubmissionStatistics({authenticationStatus, submissionsQuery, setSubmissionQuery, submissionFilter, setSubmissionFilter}) {

    const { isLoading, isFetching, isError, error, data: submissions, refetch : refetchSubmissions} = useGetSubmissions({ tokenString: authenticationStatus.token })    
    const {data : users, isLoading : userIsLoading, isFetching : userIsFetching} = useGetPublicUserInfo({ tokenString: authenticationStatus.token })
    const { data: states, isLoading: submissionStatesLoading, isFetching : satesIsFetching } = useGetSubmissionStates()
    const { data: attributesByTag } = useGetSubmissionAttributesByTag({ tokenString: authenticationStatus.token }, { staleTime: Infinity })
    
    if (isError) return <APIError error={error} />
    if (isLoading || userIsLoading || userIsFetching || submissionStatesLoading || isFetching || satesIsFetching) return <Loading />
    if (!_.isArray(submissions) || !_.isObject(users) || !_.isObject(attributesByTag)) return null 
    if (submissions.length === 0) return <div><p>No submissions found. Please use the submission portal to create your first submission.</p></div>
    
    const {uniqueAtributesInSubmissions,usersByDataLabel} = extractSubmissionDetails({submissions})
    const usersByLabel = groupListByProperty(users, "label")
    const filteredSubmissions = filterSubmissions({ submissions, submissionFilter, submissionsQuery, usersByDataLabel })   
    const submissionsByState = groupListByProperty(filteredSubmissions, "state")
    const userLabelsInSubmission = getUniqueValuesAndCountsFromList(filteredSubmissions.map(submission => _.concat(submission.collaborators, submission.user_label)))

    //get line data
    let dataForLineChart = filteredSubmissions.map(d => {
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
    
    const binnedSubmission = binDataByDate(filteredSubmissions)
    const countBinnedSubmissions = _.sortBy(_.keys(binnedSubmission).map(d => {return {n : binnedSubmission[d].values.length, ...binnedSubmission[d].dates}}),"dateStart")
    console.log(filteredSubmissions)
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

        <div style={{height : "90vh", overflowY:"scroll"}}>
                <p>Submission : {filteredSubmissions.length}</p>
            <h1>Time Series</h1>
                {dataForLineChart.length > 0 ? <LineChart data={dataForLineChart} xAxisIsTime={true} xaxisName="asDate" yaxisNames={["n_samples"]} tooltipCircleNames={["n_samples", "title", "label", "user_name"]} showLine={false} /> : null}

                <h1>Count plots</h1>

                {countBinnedSubmissions.length > 1 ? <AnimatedBarplot leftLabel = "Number of submissions" title = "Submission by month" data={countBinnedSubmissions} yaxisName={"n"} xAxisIsTime={true} xaxisName={"dateMiddle"} />: null}
                

            </div>
            </div>
    )
}


export default SubmissionStatistics