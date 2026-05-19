import PropTypes, { array } from "prop-types"
import _ from "lodash"
import { MinimalSubmissionItem } from "./SubmissionItem"

import { getValueByKeyAndMergeToString } from "../../../services/arrays/transforms"
import { SubmissionFilterSelection } from "../filter"

import { StateHeader } from "./StateHeader"
import { api } from "@/api" 
import { useState } from "react"
import { MinimalUserIcon, User, UserIcon } from "@/comps/core/base/user"
import { UserFullName } from "@/comps/core/input/api/UserInput"


export const SUBMISSIONS_BY_OPTIONS = ["state", "user", "genotype", "date"]


SubmissionsByState.propTypes = {
    submissionFilter: PropTypes.object.isRequired,
    submissionsQuery: PropTypes.object.isRequired,
    minimal: PropTypes.bool
}

SubmissionsByState.defaultProps = {
    minimal: true
}
/**
 * @description The component that displays a list of submissions grouped by their state.
 * It uses the SubmissionItem component to display each submission.
 * @param {Object} props - The props object.
 * @param {Object} props.submissionFilter - The submission filter object.
 * @param {Object} props.submissionsQuery - The submissions query object.
 * @param {boolean} [props.minimal = true] - If true, uses MinimalSubmissionItem, otherwise uses SubmissionItem.
 * @returns {JSX.Element} The SubmissionsByState component.
 */
export function SubmissionsByState({ submission_by_state, minimal}) {

    
    const { data: submissionStates } = api.submissions.states.useGetStates()

    return (
        <div>
            {_.isArray(submissionStates) && submissionStates
                .filter(state_tag => _.has(submission_by_state, state_tag) && _.isArray(submission_by_state[state_tag]) && submission_by_state[state_tag].length > 0)
                .map((state_tag, idx) => {
                    return <div key={`${state_tag}-${idx}`}>
                        <StateHeader key={`${idx}-${state_tag}`} tag={state_tag} />
                        <div className="flex flex-column padding-left--little margin-bottom--little">
                            {submission_by_state[state_tag].map((submission_tag, submissionIdx) => {
                                return (
                                    <div key={`${submission_tag}-${submissionIdx}`}>
                                        {minimal ? <MinimalSubmissionItem tag={submission_tag} /> : null}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
            }) }
        </div>

    )
}

export function SubmissionsByUser({ submission_by_user, minimal = true}) {
    const user_tags = _.keys(submission_by_user)
    return (
        <div>
            {_.isObject(submission_by_user) && _.map(user_tags, (user_tag, idx) => {
                console.log("user_tag", user_tag)
                return <div key={user_tag}>
                    <div className="flex center-items"><MinimalUserIcon user_tag={user_tag} /> <UserFullName tag={user_tag}/></div>
                    <div className="flex flex-column padding-left--little margin-bottom--little">
                    {_.isArray(submission_by_user[user_tag]) && submission_by_user[user_tag].map((submission_tag, submissionIdx) => {
                        return (
                            <div key={`${submission_tag}-${submissionIdx}`}>
                                {/* // If minimalView is true, use MinimalSubmissionItem, otherwise use SubmissionItem */}
                                {minimal ? <MinimalSubmissionItem tag={submission_tag} /> : null}
                            </div>
                        )
                    })}
                    </div>
                </div>
            }) }
        </div>

    )
}


/**
 * 
 * @param {Object} props 
 * @param {string} props.submissionBy - The criteria to group submissions by. "state", "user", "date"
 * @returns 
 */
export function SubmissionBy({ submissionBy = "state", submissionFilter, submissionsQuery, minimal, validState  }) { 
    
    const submissionByState = submissionBy === "state" ? true : false
    const submissionByUser = submissionBy === "user" ? true : false 
    const submissionByGenotype = submissionBy === "genotype" ? true : false 
    const submissionByDate = submissionBy === "date" ? true : false 

    console.log(submissionByState, submissionByUser, submissionByGenotype, submissionByDate)
    
    const stateFilter = _.isNumber(validState) ? _.toString(validState) : _.has(submissionFilter,"states") && submissionFilter.states.size > 0 
        ? _.join(Array.from(submissionFilter.states),";") 
        : null
    
    const genotypeTagString = _.isArray(submissionFilter["genotype_tag"]) && submissionFilter["genotype_tag"].length > 0
        ? _.join(submissionFilter["genotype_tag"], ";")
        : null
    
    const { data: submission_by, isLoading, isFetching, isSuccess, isError, error } = api.submissions.query.useGetSubmissionByQuery({
            search_string: submissionsQuery.plain.length === 0 ? null : submissionsQuery.plain,
            group_by_state: submissionByState,
            group_by_user :submissionByUser,
            state: stateFilter,
            genotype_tag: genotypeTagString,
            user_tag: getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "tag" }),
            attribute_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_tag"], keyName: "tag" }),
            attribute_value_tag: getValueByKeyAndMergeToString({ array: submissionFilter["trait_tag"], keyName: "tag" })
        }, { staleTime: 0 })
    console.log(submission_by)
    return (<div>

        {isError ? <APIError error={error} /> : null}
        {isLoading || isFetching ? <div>Loading...</div> : null}
        {isSuccess && _.isObject(submission_by) ?
            submissionByState ?
                <SubmissionsByState submission_by_state={submission_by} submissionFilter={submissionFilter} submissionsQuery={submissionsQuery} minimal={minimal} /> : 
            submissionByUser ? <SubmissionsByUser submission_by_user={submission_by} submissionFilter={submissionFilter} submissionsQuery={submissionsQuery} minimal={minimal} /> : null : null}

    </div>)
}




SubmissionContainer.propTypes = {
    submissionFilter: PropTypes.object.isRequired,
    setSubmissionQuery: PropTypes.func.isRequired,
    setSubmissionFilter: PropTypes.func.isRequired,
    orderBy: PropTypes.string,
    validState: PropTypes.number,
}



export function SubmissionContainer({ submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery, validState }) {

    const [orderBy, setOrderBy] = useState("state")
    const fixedState = _.isNumber(validState)
    const stateFilter = fixedState ? _.toString(validState) : _.has(submissionFilter, "states") && submissionFilter.states.size > 0
        ? _.join(Array.from(submissionFilter.states), ";")
        : null
    
    const genotypeTagString = _.isArray(submissionFilter["genotype_tag"]) && submissionFilter["genotype_tag"].length > 0
        ? _.join(submissionFilter["genotype_tag"], ";")
        : null

    const { data: counts, isSuccess } = api.submissions.query.useGetSubmissionQueryCount({
        search_string: submissionsQuery.plain.length === 0 ? null : submissionsQuery.plain,
        state: stateFilter,
        genotype_tag: genotypeTagString,
        user_tag: getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "tag" }),
        attribute_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_tag"], keyName: "tag" }),
        trait_tag: getValueByKeyAndMergeToString({ array: submissionFilter["trait_tag"], keyName: "tag" }),
        attribute_value_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_value_tag"], keyName: "tag" }),
        include_sample_ca: submissionFilter.include_sample_ca || false,
    }, { staleTime: 0 })

    return (
        <div>
            <SubmissionFilterSelection {...{
                submissionFilter,
                setSubmissionFilter,
                submissionsQuery,
                setSubmissionQuery,
                submissionQueryResult : counts,
                orderBy, 
                setOrderBy,
                fixedState:  fixedState,
                isSuccess
            }}
                children={
                    
                    <div>
                
                       <SubmissionBy submissionBy={orderBy} submissionFilter={submissionFilter} submissionsQuery={submissionsQuery} validState={validState} /> 
                    </div>
                }
            />
        </div>

    )
}
