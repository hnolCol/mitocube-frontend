
import {api} from "@/api"
import { Boxplot } from "@/comps/core/charts/boxplot/Boxplot"
import viz from "@mitocube/viz"
import _ from "lodash"

export function QuantificationDistribution({ submission_tag, quantification_type = "protein_groups", width = 25, height = 500, margins = { left: 20, right: 5, bottom: 200, top: 15} }) {

    const { data, isLoading, isSuccess, isError, error } = api.submissions.quantifications.useGetSubmissionSampleQuantification({ tag: submission_tag, quantification_type }, { staleTime: Infinity })
    console.log(data)
    return <div className="flex flex-column" style={{gap : "0.2rem"}}>
        <h3>Quantification Distribution</h3>
        <span>All samples should have similar distributions. In case of significant deviations, further investigation is recommended. Admins and curators can exclude samples from statistical analysis.</span>
        {_.isArray(data) && <viz.charts.minimal.MinimalBoxplots qs={data.map(di => di[1])}
            fill={data.map(di => di[2])}
            margins={margins} boxWidth={20} spaceBetween={5} yaxisLabel="log2 LFQ intensity" width={25 * data.length + 100} height={height}
            showMedian={false} indicateN={false} verticalLineAtZero={false} xtickLabels={data.map(di => di[0])} />}
    </div>
}
