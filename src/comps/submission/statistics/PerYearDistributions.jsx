import _ from "lodash"
import { api } from "@/api"
import { PerYearBoxplotSection } from "./PerYearBoxplotSection"

/**
 * Per-year distribution statistics: project duration quantiles and samples
 * per submission quantiles, one boxplot box per year.
 */
export function PerYearDistributions({ stateFilter }) {
    const { data: durationData, isLoading: isLoadingDurations, isSuccess: isDurationsSuccess, isError: isDurationsError, error: durationsError } =
        api.stats.submissionDurations.useGetSubmissionDuration({
            state_01: "submitted",
            state_02: "done",
            aggregate: "dist",
            group_by_year: true,
            state: stateFilter
        }, { retry: false })

    const { data: samplesData, isLoading: isLoadingSamples, isSuccess: isSamplesSuccess, isError: isSamplesError, error: samplesError } =
        api.stats.submissionDurations.useGetSamplesPerSubmission({
            state: stateFilter
        }, { retry: false })

    return <div>
        <PerYearBoxplotSection
            title="Project Duration per Year"
            description="Distribution of the duration from submitted to done per year. Boxes span the 25th to 75th percentile, the line indicates the median, whiskers the min/max, and the number above each box the count of projects."
            data={durationData}
            isSuccess={isDurationsSuccess}
            isLoading={isLoadingDurations}
            isError={isDurationsError}
            error={durationsError}
            yaxisLabel="Project Duration (days)"
            medianSuffix="d"
        />
        <PerYearBoxplotSection
            title="Samples per Project per Year"
            description="Distribution of the number of samples per project per year. Boxes span the 25th to 75th percentile, the line indicates the median, whiskers the min/max, and the number above each box the count of projects."
            data={samplesData}
            isSuccess={isSamplesSuccess}
            isLoading={isLoadingSamples}
            isError={isSamplesError}
            error={samplesError}
            yaxisLabel="Samples per Project"
        />
    </div>
}
