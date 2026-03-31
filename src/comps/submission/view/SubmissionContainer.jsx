import PropTypes, { array } from "prop-types"
import _ from "lodash"
import { MinimalSubmissionItem } from "./SubmissionItem"

import { getValueByKeyAndMergeToString } from "../../../services/arrays/transforms"
import { SubmissionFilterSelection } from "../filter"

import hooks from "@mitocube/api-hooks"
import { StateHeader } from "./StateHeader"

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
export function SubmissionsByState({ submissionFilter, submissionsQuery, minimal}) {

    const stateFilter = _.has(submissionFilter,"states") && submissionFilter.states.size > 0 ? _.join(Array.from(submissionFilter.states),";") : null
    const { data: submissionStates } = hooks.submissions.states.useGetStates()
    const { data: submission_by_state, isLoading, isFetching, isSuccess, isError, error } = hooks.submissions.query.useGetSubmissionByQuery({
            search_string: submissionsQuery.plain.length === 0 ? null : submissionsQuery.plain,
            group_by_state : true,
            state: stateFilter,
            genotype_tag: getValueByKeyAndMergeToString({ array: submissionFilter["genotype_tag"], keyName: "tag" }),
            user_tag: getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "tag" }),
            attribute_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_tag"], keyName: "tag" }),
            attribute_value_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_value_tag"], keyName: "tag" })
            }, { staleTime: 0 })

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



SubmissionContainer.propTypes = {
    submissionFilter: PropTypes.object.isRequired,
    setSubmissionQuery: PropTypes.func.isRequired,
    setSubmissionFilter: PropTypes.func.isRequired,
}



export function SubmissionContainer({ submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}) {
    
    return (
        <div>
            <SubmissionFilterSelection {...{
                submissionFilter,
                setSubmissionFilter,
                submissionsQuery,
                setSubmissionQuery,
            }}
                children={
                    
                    <div>
                        <SubmissionsByState submissionFilter={submissionFilter} submissionsQuery={submissionsQuery} />
                    </div>
                }
            />
        </div>

    )
}
