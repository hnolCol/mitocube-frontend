
import hooks from "@mitocube/api-hooks"
import viz from "@mitocube/viz" 
import { getQuantiles } from "@mitocube/viz/src/utils/stats"
import _ from "lodash"

/**
 * 
 * @returns 
 */
export function QuantifiedProteinGroupsStatistics() {

    const { data } = hooks.submissions.counts.useGetSubmissionProteinGroupCount({})
    if (!data) {
        return <div>Loading...</div>
    }
    const quantiles = getQuantiles(data.map(d => d.count), [0.0, 0.25, 0.5, 0.75, 1.0], 1.8, false, "values", ["min", "q1", "median", "q3", "max"])
    return <div>
        <viz.charts.minimal.MinimalBoxplot
            q={_.fromPairs(quantiles.labels.map((l, i) => ([l, quantiles.values[i]])))}
            medianSuffix={""}
            showMedian={true}
            yaxisLabel={"Protein Groups Count"} />
    </div>
}