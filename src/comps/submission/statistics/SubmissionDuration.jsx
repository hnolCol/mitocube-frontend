import { api } from "@/api";
import viz from "@mitocube/viz"
import _ from "lodash"

export function SubmissionDuration({ }) {
    const { data: submissionDuration, isLoading: isLoadingDuration } = api.stats.submissionDurations.useGetSubmissionDuration({})

    

    return <div>
           {_.isObject(submissionDuration) ? <viz.charts.minimal.MinimalBoxplot q={submissionDuration} medianSuffix={"d"} showMedian={true} yaxisLabel={"Project Duration (days)"} /> : null}
    </div>

}