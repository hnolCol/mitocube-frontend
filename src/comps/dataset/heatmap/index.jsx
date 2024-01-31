import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { useGetDatasetHeatmap } from "../../../hooks/queries/datasets.hooks";
import Heatmap from "../../core/charts/heatmap";
import MultipleMetrices from "../../core/metrics/collection";
import InteractiveChart from "../../core/charts/interactive";
import { ProfileChart } from "../../core/charts/profiles/ProfileChart";
import { InputGroup } from "@blueprintjs/core";
import _ from "lodash"
import { MultiProfiles } from "../../core/charts/profiles/MultiProfiles";
function DatasetHeatmap({}) {
    
    const { dataset_label, metadata } = useOutletContext()   
  
    const anovaDetails = { pvalue: 0.05, anovaType: "1-way ANOVA", grouping1: "Genotype" }
    
    const { data : heatmapData, isLoading, isFetching, isError, error } = useGetDatasetHeatmap({dataset_label})
   // const {data : heatmapData, isLoading : heatmapIsLoading, isError : heatmapIsError, error : heatmapError} = useGetDatasetHeatmap({dataID,token,anovaDetails},{staleTime : 300000})

    // console.log(heatmapData)
     if (isError) return <APIError error={error} />
     if (isLoading || isFetching) return <div>Loading...</div>
     
 
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
                    handleItemSelection,
                    findIndexInRectangle,
                    findDataInRectangle,
                    setHoverDataInRectangle,
                    handleNumericFilter,
                    handleStringSearch,
                    handleSearchByDataIndex,
                    filterDataInKeyByValue,
                    setHoverDataByDataIndex,
                    hoverProps,
                    filterProps
                        }, didx) => {
                    return (
                        <div>
                            <InputGroup onValueChange={(value, e) => handleStringSearch(heatmapData.label_names, value)} />
                            <div className="flex">
                            <MultiProfiles {...{
                                chartIdx, data,
                                subsetIndices : heatmapData.cluster_indices,
                                yaxisLabel: "Z-Score",
                                xaxisLabel: "Samples",
                                ...hoverProps, ...filterProps,
                                limits, xaxisName, yaxisName, valid, labelNames: heatmapData.label_names,
                            }} />

                            {/* <ProfileChart {...{
                                chartIdx, data,
                                yaxisLabel: "Z-Score",
                                xaxisLabel: "Samples",
                                ...hoverProps, ...filterProps,
                                limits, xaxisName, yaxisName, valid, labelNames: heatmapData.label_names,
                            }} /> */}
                            
                        {/* <ScatterPlot key={`${chartIdx}`}{...{
                            chartIdx,
                            colorName: selection.colorName,
                            sizeName: selection.sizeName,
                            tooltipNames : selection.tooltipNames,
                            data,
                            valid,
                            findDataInRectangle,
                            setHoverDataInRectangle,
                            xaxisName,
                            yaxisName,
                            limits,
                            tooltipSmall : false,
                            tooltipNames : _.concat(["index"],sampleAttributeNames),
                            ...hoverProps,
                            ...filterProps,
                            attributesByTag,
                            legend: true,
                                handleSearchByDataIndex,
                                filterDataInKeyByValue,
                            svgID : "scatter_plot-pca-projection"
                        
                        
                            }} /> */}
                                <div>
                                    <Heatmap {...{
                                        data,
                                        clusterName : "cluster",
                                        valueNames: yaxisName, colorNames: heatmapData.color_names, labelNames: heatmapData.label_names, handleSearchByDataIndex, setHoverDataByDataIndex, ...filterProps, ...hoverProps
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