import _ from "lodash"
import { useState } from "react"
import { api } from "@/api"
import { YearComparisonSection } from "./YearComparisonSection"
import { ResearchGroupInput } from "@/comps/core/input/api/ResearchGroupInput"

/**
 * Submissions per user (C), subsettable by research groups.
 * Users are the colored groups, years are encoded by bar opacity.
 */
export function UserStatistics({ stateFilter }) {
    const [research_group_tags, setResearchGroupTags] = useState([])

    const { data, isLoading, isSuccess, isError, error } = api.stats.submissions.useGetUserSubmissionCounts(
        { state: stateFilter, research_group_tags },
        { retry: false }
    )

    const rows = _.isArray(data) ? data : []

    const controls = <div className="flex center-items" style={{ gap: "0.4rem" }}>
        {research_group_tags.map(tag => <span
            key={tag}
            className="basic-button--small"
            style={{ cursor: "pointer" }}
            onClick={() => setResearchGroupTags(research_group_tags.filter(t => t !== tag))}
        >
            {tag} ✕
        </span>)}
        <ResearchGroupInput
            selected_rg_tags={research_group_tags}
            onSelect={tag => setResearchGroupTags(research_group_tags.includes(tag) ? research_group_tags : [...research_group_tags, tag])}
            placeholder="Subset by Research Group"
        />
    </div>

    return <YearComparisonSection
        title="Submissions per User"
        description="Number of submissions per user. Colors indicate users, bar opacity indicates the year. Subset the users by their research groups."
        data={rows}
        isSuccess={isSuccess}
        isLoading={isLoading}
        isError={isError}
        error={error}
        yaxisLabel="Submissions"
        xaxisLabel="User"
        controls={controls}
        svgID="user-submission-counts-chart"
    />
}
