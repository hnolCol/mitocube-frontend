import { api } from "@/api"
import viz from "@mitocube/viz"
import _ from "lodash"
import { useRef } from "react"
import { DownloadSvgButton } from "@/comps/core/base/buttons/DownloadSvgButton"

export function SubmissionDuration({ statisticsFilter }) {
    const { data: submissionDuration, isLoading: isLoadingDuration } = api.stats.submissionDurations.useGetSubmissionDuration(statisticsFilter)
    const chartRef = useRef(null)

    return <div className="bg--white div--round padding--medium margin-top--medium">
        <div className="flex justify-between center-items" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            <h4 className="margin--none-reset">Project Duration</h4>
            <div className="flex gap--little">
                <DownloadSvgButton chartRef={chartRef} fileName="project_duration.svg" />
            </div>
        </div>
        <div ref={chartRef}>
            {_.isObject(submissionDuration) ? <viz.charts.minimal.MinimalBoxplot q={submissionDuration} medianSuffix={"d"} showMedian={true} yaxisLabel={"Project Duration (days)"} /> : null}
        </div>
    </div>
}
