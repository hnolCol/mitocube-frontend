import _ from "lodash"
import { StatisticsFilterSelection } from "./StatisticsFilterSelection"
import { SubmissionDuration } from "./SubmissionDuration"
import { PerYearDistributions } from "./PerYearDistributions"
import { QuantifiedProteinGroupsStatistics } from "./QuantifiedProteins"
import { ResearchGroupStatistics } from "./ResearchGroupStatistics"
import { UserStatistics } from "./UserStatistics"

function ActiveFiltersBanner({ submissionFilter, setSubmissionFilter }) {

    const hasStateFilter = _.has(submissionFilter, "states") && submissionFilter.states.size > 0
    const hasUserFilter = _.isArray(submissionFilter.user) && submissionFilter.user.length > 0
    const hasGenotypeFilter = _.isArray(submissionFilter.genotype_tag) && submissionFilter.genotype_tag.length > 0
    const hasCAFilter = _.isArray(submissionFilter.ca_tags) && submissionFilter.ca_tags.length > 0
    const hasActiveFilter = hasStateFilter || hasUserFilter || hasGenotypeFilter || hasCAFilter

    if (!hasActiveFilter) {
        return <p>The statistics below are calculated on all submissions.</p>
    }

    return <div
        className="flex center-items"
        style={{ gap: "0.5rem", padding: "0.5rem 0.75rem", backgroundColor: "#fff8e6", border: "1px solid #e6c55a", borderRadius: "3px", flexWrap: "wrap" }}
    >
        <span style={{ fontWeight: "500" }}>Filtered statistics:</span>
        {hasStateFilter ? <span>States ({submissionFilter.states.size})</span> : null}
        {hasUserFilter ? <span>Users ({submissionFilter.user.length})</span> : null}
        {hasGenotypeFilter ? <span>Genotypes ({submissionFilter.genotype_tag.length})</span> : null}
        {hasCAFilter ? <span>Condition Applications ({submissionFilter.ca_tags.length})</span> : null}
        <span className="basic-button--small" style={{ cursor: "pointer" }} onClick={() => setSubmissionFilter({})}>
            Clear ✕
        </span>
    </div>
}

function SubmissionStatistics({ submissionFilter, setSubmissionFilter }) {

    const stateFilter = _.has(submissionFilter, "states") && submissionFilter.states.size > 0 ? _.join(Array.from(submissionFilter.states), ";") : null
    const userTagsFilter = _.isArray(submissionFilter.user) && submissionFilter.user.length > 0
        ? _.join(submissionFilter.user.map(u => u.tag), ";")
        : null
    const caTagsFilter = _.isArray(submissionFilter.ca_tags) && submissionFilter.ca_tags.length > 0
        ? _.join(submissionFilter.ca_tags, ";")
        : null
    const genotypeTagsFilter = _.isArray(submissionFilter.genotype_tag) && submissionFilter.genotype_tag.length > 0
        ? _.join(submissionFilter.genotype_tag, ";")
        : null
    const includeSampleCA = _.has(submissionFilter, "include_sample_ca") ? submissionFilter.include_sample_ca : false

    const statisticsFilter = { state: stateFilter, user_tags: userTagsFilter, genotype_tags: genotypeTagsFilter, ca_tags: caTagsFilter, include_sample_ca: includeSampleCA }

    return <StatisticsFilterSelection
        {...{ submissionFilter, setSubmissionFilter }}
        children={<div>
            <h3>Statistics</h3>
            <p>Explore submissions and samples by research group, user and year, as well as submission durations and quantified protein groups.</p>
            <ActiveFiltersBanner {...{ submissionFilter, setSubmissionFilter }} />
            <ResearchGroupStatistics statisticsFilter={statisticsFilter} />
            <UserStatistics stateFilter={stateFilter} statisticsFilter={statisticsFilter} />
            <SubmissionDuration statisticsFilter={statisticsFilter} />
            <PerYearDistributions stateFilter={stateFilter} statisticsFilter={statisticsFilter} />
            <QuantifiedProteinGroupsStatistics statisticsFilter={statisticsFilter} />
        </div>} />
}

export default SubmissionStatistics
