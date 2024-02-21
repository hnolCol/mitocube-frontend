import { useGetSubmissionAttributesByTag, useGetSubmissionByQuery, useGetSubmissionStates, useGetSubmissions } from "../../../hooks/queries/submission.hooks"
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
import { UserSelection } from "../filter/UserSelection"
import { AttributeSelection } from "../filter/AttributeSelection"
import { StateSelection } from "../filter/StateSelection"
import TooltipButton from "../../core/base/buttons/TooltipButton"
import { Button, InputGroup } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import useDebounce from "../../../hooks/useDebounce"
import { getValueByKeyAndMergeToString } from "../../../services/arrays/transforms"



function SubmissionStatistics({ authenticationStatus, submissionsQuery, setSubmissionQuery, submissionFilter, setSubmissionFilter }) {        
    const [searchString, setSearchString] = useState(submissionsQuery.plain)
    const debouncedString = useDebounce(searchString,200)
    const { data: states, isLoading: submissionStatesLoading } = useGetSubmissionStates({},{staleTime: Infinity}) //request only once. 
    const {data : attributesByTag} = useGetSubmissionAttributesByTag({},{staleTime : Infinity})

    const stateFilter = _.has(submissionFilter, "states") && submissionFilter.states.size > 0 ? _.join(Array.from(submissionFilter.states), ";") : null
    // console.log(submissionFilter)
    // console.log(getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "label" }))
    const { data: submissionQuery, isLoading, isFetching, isSuccess, isError, error } = useGetSubmissionByQuery({
        query: debouncedString.length === 0 ? null : debouncedString,
        state: stateFilter,
        user_label : getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "label" }),
        attribute_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_tag"], keyName: "tag" }),
        attribute_value_tag: getValueByKeyAndMergeToString({array : submissionFilter["attribute_value_tag"], keyName : "tag"})
        //attribute_tag : 
    })

    useEffect(() => { setSubmissionQuery(prevValues => { return { ...prevValues, plain: debouncedString } }) }, [debouncedString])
    const submissionsByState = _.isObject(submissionQuery) && _.isArray(submissionQuery.submissions) ? groupListByProperty(submissionQuery.submissions, "state") : {}

    console.log(submissionsQuery)
    // const {uniqueAtributesInSubmissions,usersByDataLabel} = extractSubmissionDetails({submissions})
    // const usersByLabel = groupListByProperty(users, "label")
    // const filteredSubmissions = filterSubmissions({ submissions, submissionFilter, submissionsQuery, usersByDataLabel })   
    // const submissionsByState = groupListByProperty(filteredSubmissions, "state")
    // const userLabelsInSubmission = getUniqueValuesAndCountsFromList(filteredSubmissions.map(submission => _.concat(submission.collaborators, submission.user_label)))

    //get line data
    // let dataForLineChart = filteredSubmissions.map(d => {
    //     const stringAsMoment = moment.unix(d.created_on)
    //     const formattedDate = stringAsMoment._d
    //     const userFound = _.has(usersByLabel, d.user_label)
    //         return {
    //             ...d,
    //             asMoment: stringAsMoment,
    //             asDate : formattedDate,
    //             stateName: getStateName({ submissionStates : states, state: d.state }),
    //             user: userFound?usersByLabel[d.user_label][0]:{},
    //             user_name: userFound?`${usersByLabel[d.user_label][0].firstname} ${usersByLabel[d.user_label][0].lastname}`:""
    //         }
    // })
    if (!_.isObject(attributesByTag)) return null
    const attributeValuesByAttributeTag = groupListByProperty(_.values(attributesByTag.attribute_values), "attribute_tag")
    // const binnedSubmission = binDataByDate(filteredSubmissions)
    // const countBinnedSubmissions = _.sortBy(_.keys(binnedSubmission).map(d => {return {n : binnedSubmission[d].values.length, ...binnedSubmission[d].dates}}),"dateStart")
    // // console.log(dataForLineChart)
    // console.log(getCountsByGroups(submissions, ["state"],undefined))
    return (
        <div className="submission__wrapper">
        
        <div className="flex flex-column submission__side__filter__container" style={{gridRow : 1, gridColumn : 1}}>
            <h3>Submissions ({isSuccess? submissionQuery.query_count:"0"}/{isSuccess? submissionQuery.total_count:"0"})</h3>
            <div className="flex" style={{width: "100%"}}>
            <InputGroup value={searchString} fill = {true} placeholder="Search by label, metatext ..." small={true} onValueChange={value => setSearchString(value)} rightElement={<Button minimal={true} loading={isLoading || isFetching}/>}/>
            <TooltipButton content="Clear filter selection." icon="cross" small={true} onClick={() => setSubmissionFilter({})} intent={_.isEmpty(submissionFilter) ? "none" : "danger"} />
            </div>
            <StateSelection {...{ states, submissionsByState, submissionFilter, setSubmissionFilter }} /> 
            <AttributeSelection attributesByTag={attributesByTag.attributes} labels={isSuccess ? submissionQuery.labels : []} {...{ setSubmissionFilter, submissionFilter, attributeValuesByAttributeTag }} />
            <UserSelection {...{submissionFilter, setSubmissionFilter, labels: isSuccess ? submissionQuery.labels : []}} />
            </div>

            <div className="submission__items__container" style={{ gridRow: 1, gridColumn: 2 }}>
                <h3>Plots</h3>
                {/* <p>Submission : {filteredSubmissions.length}</p>
            <h1>Time Series</h1>
                {dataForLineChart.length > 0 ? <LineChart data={dataForLineChart} xAxisIsTime={true} xaxisName="asDate" yaxisNames={["n_samples"]} tooltipCircleNames={["n_samples", "title", "label", "user_name"]} showLine={false} /> : null}

                <h1>Count plots</h1>

                {countBinnedSubmissions.length > 1 ? <AnimatedBarplot leftLabel = "Number of submissions" title = "Submission by month" data={countBinnedSubmissions} yaxisName={"n"} xAxisIsTime={true} xaxisName={"dateMiddle"} />: null}
                 */}

            </div>
            </div>
    )
}


export default SubmissionStatistics