import { api } from "@/api";
import LineChart from "../../core/charts/linechart"
import _ from "lodash"
import { Loading } from "../../core/base/states/Loading"
import { useEffect, useState } from "react"
export function SamplePGCounts({ tag }) { 
    const [plotData, setPlotData] = useState([])
    const {data : pgCount} = api.submissions.counts.useGetSubmissionProteinGroupCount({ tag })
    const { data : samplePGCounts, isSuccess, isLoading } = api.submissions.counts.useGetSubmissionSampleProteinGroupCount({ tag })

    console.log(samplePGCounts, "Sample PG Counts inside component")
    console.log(pgCount, "PG Count inside component")
    useEffect(() => { 

        if (isSuccess && _.isArray(samplePGCounts) && samplePGCounts.length > 0 && _.isNumber(pgCount)) {
            console.log(samplePGCounts, "Sample PG Counts inside useEffect")
            const updatedData = samplePGCounts.map((counts, idx) => {
                console.log(counts, "Counts inside map")
                return { ...counts, idx: idx, "Coverage (%)" : _.round((counts.count / pgCount) * 100, 2) }
            })
            console.log(updatedData, "Plot Data inside useEffect")
            setPlotData(updatedData)
        }

    }, [tag, isSuccess, _.isArray(samplePGCounts), _.isNumber(pgCount), pgCount])

        console.log(plotData, "Plot Data")
    if (isLoading) return <Loading />

    if (isSuccess && samplePGCounts.length === 0) {
        return <div>No sample protein group counts found</div>
    }

    return (
        
        <div>


            {_.isArray(plotData) && plotData.length > 0 ? <LineChart
                data={plotData}
                xaxisName="idx"
                yaxisNames={["count"]}
                tooltipCircleNames={["count","Coverage (%)","tag","idx"]}
                yaxisStartsAtZero={true} /> : null}

        </div>
    )
}