import { SubmissionFilterSelection } from "../filter"
import _ from "lodash"
import { SubmissionDuration } from "./SubmissionDuration"
import { PerYearDistributions } from "./PerYearDistributions"
import { QuantifiedProteinGroupsStatistics } from "./QuantifiedProteins"
import { ResearchGroupStatistics } from "./ResearchGroupStatistics"
import { UserStatistics } from "./UserStatistics"

function SubmissionStatistics({ submissionsQuery, setSubmissionQuery, submissionFilter, setSubmissionFilter }) {

    const stateFilter = _.has(submissionFilter, "states") && submissionFilter.states.size > 0 ? _.join(Array.from(submissionFilter.states), ";") : null

    return <SubmissionFilterSelection
        {...{
            submissionFilter,
            setSubmissionFilter,
            submissionsQuery,
            setSubmissionQuery,
        }}
        children={<div>
            <h3>Statistics</h3>
            <p>Explore submissions and samples by research group, user and year, as well as submission durations and quantified protein groups.</p>
            <ResearchGroupStatistics stateFilter={stateFilter} />
            <UserStatistics stateFilter={stateFilter} />
            <SubmissionDuration />
            <PerYearDistributions stateFilter={stateFilter} />
            <QuantifiedProteinGroupsStatistics />
        </div>} />
}

export default SubmissionStatistics
