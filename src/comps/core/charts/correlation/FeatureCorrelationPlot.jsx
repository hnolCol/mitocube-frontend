import { useGetFeatureByTag, useGetPairwiseFeatureQuant } from "../../../../hooks/queries/feature.hooks";
import { Loading } from "../../base/states/Loading";
import InteractiveChart from "../interactive";
import { ScatterPlot } from "../scatter";
import _ from "lodash"
import hooks from "@mitocube/api-hooks"

export function FeatureCorrelationPlot({feature_tag_x, feature_tag_y, width = 200, height = 200, margin = {top : 5, left : 10, right : 10, bottom : 20}}) {
    
    
    const { data: feature_x, isSuccess: isSuccessFeatureX } = hooks.features.useGetFeatureByTag({ tag: feature_tag_x })
    const {data : feature_y, isSuccess : isSuccessFeatureY } = hooks.features.useGetFeatureByTag({tag : feature_tag_y})
    const { data: correlationData, isLoading, isFetching } = hooks.features.data.useGetPairwiseFeatureQuant({ feature_tag_x, feature_tag_y }, { enabled: _.isString(feature_tag_x) && _.isString(feature_tag_y) })
    
    return (
        <div className="flex flex-wrap" style={{width : "500px", backgroundColor : "yellow"}}>
        {isLoading || isFetching ? <Loading /> : null}
        {_.isArray(correlationData) && correlationData.length > 0 ? <InteractiveChart
                data={correlationData}
            dataName={`${feature_tag_x}-${feature_tag_y}`}
            keyNames={[
                {
                    xaxisName: "x",
                    yaxisName: "y",
                }]}
            isPointChart={[true]}>
            {
                /**
                 * 
                 * @param {import("../../../../types/charts").InteractiveChartResponse[]} chartData 
                 * @returns
                 */
                (chartData) => chartData.map(({
                    data,
                    chartIdx,
                    xaxisName,
                    yaxisName,
                    valid,
                    limits,
                    findDataInRectangle,
                    setHoverDataInRectangle,
                    hoverProps,
                    filterProps,
                    findClosestPoint
                }, didx) => {
                    return (
                        <ScatterPlot key={`${chartIdx}`}{...{
                            chartIdx,
                            //colorName: "",
                            //sizeName: selection.sizeName,
                            // tooltipNames : selection.tooltipNames,
                            data,
                            valid,
                            findClosestPoint,
                            findDataInRectangle,
                            setHoverDataInRectangle,
                            xaxisName,
                            yaxisName,
                            xaxisLabel: feature_x.gene_name,
                            yaxisLabel : feature_y.gene_name,
                            limits,
                            tooltipNames : ["sample_tag"],
                            tooltipSmall: false,
                            ...hoverProps,
                            ...filterProps,
                            rerenderBackground: `${filterProps.rerenderBackground}-${feature_tag_y}-${feature_tag_x}}`,
                            legend: true,
                            svgID: "scatter_plot-corr"
                        }} />
                    )
                })
            }
            </InteractiveChart> : null}
            
        </div>
        
    )


    
}