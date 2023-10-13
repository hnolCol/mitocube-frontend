import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { useGetDatasetHeatmap } from "../../../hooks/queries/datasets.hooks";
import Heatmap from "../../core/charts/heatmap";
import MultipleMetrices from "../../core/metrics/collection";

function DatasetHeatmap({}) {
    
    const { datasetInfo, dataID, isLoading, isFetched, isError, error, token } = useOutletContext()   
  
    const anovaDetails = {pvalue : 0.05, anovaType : "1-way ANOVA",grouping1 : "Genotype"}
    const {data : heatmapData, isLoading : heatmapIsLoading, isError : heatmapIsError, error : heatmapError} = useGetDatasetHeatmap({dataID,token,anovaDetails},{staleTime : 300000})

    console.log(heatmapData)

    if (isError) return <APIError error={error} />
    if (isLoading) return <div>Loading...</div>


    if (heatmapIsLoading) return <div>Calculating ANOVA, clusters, and color values. Loading...</div>

    return (
        <div>

            <MultipleMetrices metrices={[
                { label: "Number Features", metric: heatmapData.params.heatmap.values.length },
                { label: "Clusters", metric: 8 },
                { label: "p-value", metric: anovaDetails.pvalue },
                { label: "Anova Type", metric: anovaDetails.anovaType },
                { label: "Grouping", metric: anovaDetails.grouping1}]} />
            
            <Heatmap
                data={heatmapData.params.heatmap.values}
                colorNames={heatmapData.params.heatmap.colorNames}
                valueNames={heatmapData.params.heatmap.valueNames}
                labelNames={heatmapData.params.heatmap.labelNames}
                clusterName={heatmapData.params.heatmap.clusterName} />

        </div>
    )


}


export default DatasetHeatmap