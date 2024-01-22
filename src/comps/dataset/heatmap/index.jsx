import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { useGetDatasetHeatmap } from "../../../hooks/queries/datasets.hooks";
import Heatmap from "../../core/charts/heatmap";
import MultipleMetrices from "../../core/metrics/collection";
import InteractiveChart from "../../core/charts/interactive";
import { ProfileChart } from "../../core/charts/profiles/ProfileChart";
import { InputGroup } from "@blueprintjs/core";

function DatasetHeatmap({}) {
    
    const { dataset_label, metadata } = useOutletContext()   
  
    const anovaDetails = {pvalue : 0.05, anovaType : "1-way ANOVA",grouping1 : "Genotype"}
   // const {data : heatmapData, isLoading : heatmapIsLoading, isError : heatmapIsError, error : heatmapError} = useGetDatasetHeatmap({dataID,token,anovaDetails},{staleTime : 300000})

    // console.log(heatmapData)

    // if (isError) return <APIError error={error} />
    // if (isLoading) return <div>Loading...</div>


    // if (heatmapIsLoading) return <div>Calculating ANOVA, clusters, and color values. Loading...</div>

    return (
        <div>
            <h2>Hierarchical Clustering</h2>

            
            <InteractiveChart
                        keyNames={[
                        {
                            xaxisName: undefined,
                            yaxisName: ["x","y","z","x","y","z"],
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
                            <InputGroup onValueChange={(value,e) => handleStringSearch(["label"],value)}/>
                            <ProfileChart {...{ chartIdx, data, ...hoverProps, ...filterProps, limits, xaxisName, yaxisName, valid, labelNames : ["label"]}} />
                            
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
                            <Heatmap {...{ data, valueNames: yaxisName, colorNames: ["z"], labelNames: ["label"], handleSearchByDataIndex, setHoverDataByDataIndex, ...filterProps, ...hoverProps}} />
                    </div>)
                })}

            </InteractiveChart> 


        </div>
    )


}


export default DatasetHeatmap