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
            <h4 style={{ margin: 0 }}>Project Duration</h4>
            <div className="flex" style={{ gap: "0.3rem" }}>
                <DownloadSvgButton chartRef={chartRef} fileName="project_duration.svg" />
            </div>
        </div>
        <div ref={chartRef}>
            {_.isObject(submissionDuration) ? <viz.charts.minimal.MinimalBoxplot q={submissionDuration} medianSuffix={"d"} showMedian={true} yaxisLabel={"Project Duration (days)"} /> : null}
        </div>
    </div>
}
