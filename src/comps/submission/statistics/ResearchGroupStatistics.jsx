import _ from "lodash"
import { api } from "@/api"
import { YearComparisonSection } from "./YearComparisonSection"
import { ResearchGroupInput } from "@/comps/core/input/api/ResearchGroupInput"

/**
 * Submissions (A) and samples (B) per research group, comparing years.
 * Years are encoded by bar opacity, research groups by color.
 * Submittable to the research group filter selection.
 */
export function ResearchGroupStatistics({ stateFilter }) {
    const { data: submissionData, isLoading: isLoadingSubmissions, isSuccess: isSubmissionsSuccess, isError: isSubmissionsError, error: submissionsError } =
        api.stats.submissions.useGetResearchGroupSubmissionCounts({ state: stateFilter }, { retry: false })
    const { data: sampleData, isLoading: isLoadingSamples, isSuccess: isSamplesSuccess, isError: isSamplesError, error: samplesError } =
        api.stats.submissions.useGetResearchGroupSampleCounts({ state: stateFilter }, { retry: false })

    const submissionRows = _.isArray(submissionData) ? submissionData : []
    const sampleRows = _.isArray(sampleData) ? sampleData : []

    return <div>
        <YearComparisonSection
            title="Submissions per Research Group"
            description="Number of submissions per research group. Bar opacity indicates the year (current year is opaque), colors indicate research groups."
            data={submissionRows}
            isSuccess={isSubmissionsSuccess}
            isLoading={isLoadingSubmissions}
            isError={isSubmissionsError}
            error={submissionsError}
            yaxisLabel="Submissions"
            xaxisLabel="Research Group"
            svgID="rg-submission-counts-chart"
        />
        <YearComparisonSection
            title="Samples per Research Group"
            description="Number of samples per research group. Bar opacity indicates the year (current year is opaque), colors indicate research groups."
            data={sampleRows}
            isSuccess={isSamplesSuccess}
            isLoading={isLoadingSamples}
            isError={isSamplesError}
            error={samplesError}
            yaxisLabel="Samples"
            xaxisLabel="Research Group"
            svgID="rg-sample-counts-chart"
        />
    </div>
}
