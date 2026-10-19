import { api } from "@/api"
import viz from "@mitocube/viz"
import { getQuantiles } from "@mitocube/viz/src/utils/stats"
import _ from "lodash"
import { useRef } from "react"
import { DownloadSvgButton } from "@/comps/core/base/buttons/DownloadSvgButton"

/**
 * 
 * @returns 
 */
export function QuantifiedProteinGroupsStatistics({ statisticsFilter }) {
    const { data } = api.submissions.counts.useGetSubmissionProteinGroupCount(statisticsFilter)
    const chartRef = useRef(null)

    if (!data) {
        return <div className="bg--white div--round padding--medium margin-top--medium">
            <h4 style={{ margin: 0 }}>Quantified Protein Groups</h4>
            <div>Loading...</div>
        </div>
    }
    const quantiles = getQuantiles(data.map(d => d.count), [0.0, 0.25, 0.5, 0.75, 1.0], 1.8, false)
    return <div className="bg--white div--round padding--medium margin-top--medium">
        <div className="flex justify-between center-items" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            <h4 style={{ margin: 0 }}>Quantified Protein Groups</h4>
            <div className="flex" style={{ gap: "0.3rem" }}>
                <DownloadSvgButton chartRef={chartRef} fileName="quantified_protein_groups.svg" />
            </div>
        </div>
        <div ref={chartRef}>
            <viz.charts.minimal.MinimalBoxplot
                q={_.fromPairs(quantiles.labels.map((l, i) => ([l, quantiles.values[i]])))}
                medianSuffix={""}
                showMedian={true}
                yaxisLabel={"Protein Groups Count"} />
        </div>
    </div>
}
