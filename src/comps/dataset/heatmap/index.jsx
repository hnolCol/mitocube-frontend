import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { useGetDatasetHeatmap } from "../../../hooks/queries/datasets.hooks";
import Heatmap from "../../core/charts/heatmap";
import InteractiveChart from "../../core/charts/interactive";
import { InputGroup } from "@blueprintjs/core";
import _ from "lodash"
import { MultiProfiles } from "../../core/charts/profiles/MultiProfiles";




function DatasetHeatmap({}) {
    
    const { submission_tag } = useOutletContext()   
  
    const { data : heatmapData, isLoading, isFetching, isError, error } = useGetDatasetHeatmap({submission_tag})

     if (isError) return <APIError error={error} />
     if (isLoading || isFetching) return <div>Loading...</div>
     
    if (!_.isObject(heatmapData) || !_.has(heatmapData, "data") || !_.has(heatmapData,"cluster_indices")) return <div>The returned data are not in the correct format. Must be an object with 'data' and 'cluster_indices'</div>
    return (
        <div>
            <h2>Hierarchical Clustering</h2>
            <p>Analysis of Variance was performed on. The FDR cutoff was to 1% and <strong>{heatmapData.data.length}</strong> features were found significantly different.</p>
            <p>The data are divided into a total number of <strong>{heatmapData.n_clusters}</strong> clusters.</p>
            
            <InteractiveChart
                        data = {heatmapData.data}
                        keyNames={[
                        {
                            xaxisName: undefined,
                            yaxisName: heatmapData.value_names,
                        }]}
                        isPointChart={[false]}>
                        {
                    /**
                     * 
                     * @param {import("../../../types/charts").InteractiveChartResponse[]} chartData 
                     * @returns 
                     */
                        (chartData) => chartData.map(({
                    data,
                    chartIdx,
                    xaxisName,
                    yaxisName,
                    valid,
                    limits,
                    handleStringSearch,
                    handleSearchByDataIndex,
                    setHoverDataByDataIndex,
                    hoverProps,
                    filterProps
                        }, didx) => {
                    return (
                        <div>
                            <InputGroup onValueChange={(value, e) => handleStringSearch(heatmapData.label_names, value)} small={true} placeholder="Search for gene name..."/>
                            <div className="flex" style={{display:"grid", gridTemplateColumns : "500px 1fr", gridTemplateRows: "70vh"}}>
                            <div style={{overflowY:"scroll", gridColumn:1,gridRow:1, height:"1fr"}}>
                            <MultiProfiles {...{
                                chartIdx, data,
                                subsetIndices: heatmapData.cluster_indices,
                                colorName : "cluster",
                                yaxisLabel: "Z-Score",
                                xaxisLabel: "Samples",
                                ...hoverProps, ...filterProps,
                                limits, xaxisName, yaxisName, valid, labelNames: heatmapData.label_names,
                                    }} />
                            </div>

                                <div style={{overflowY:"scroll", gridColumn:2,gridRow:1, height:"1fr"}}>
                                    <Heatmap {...{
                                        data,
                                        clusterName : "cluster",
                                        valueNames: yaxisName,
                                        colorNames: heatmapData.color_names, labelNames: heatmapData.label_names, handleSearchByDataIndex, setHoverDataByDataIndex, ...filterProps, ...hoverProps
                                    }} />
                            </div>
                                </div>
                            </div>)
                })}

            </InteractiveChart> 


        </div>
    )


}


export default DatasetHeatmap