import { Loading } from "../../base/states/Loading";
import InteractiveChart from "../interactive";
import { ScatterPlot } from "../scatter";
import _ from "lodash"
import viz from "@mitocube/viz"
import { useMemo } from "react";
import { api } from "@/api";

export function FeatureCorrelationPlot({feature_tag_x, feature_tag_y, width = 500, height = 400, margin = {top : 5, left : 10, right : 10, bottom : 20}}) {
    
    
    const { data: feature_x, isSuccess: isSuccessFeatureX } = api.features.tag.useGetFeatureByTag({ tag: feature_tag_x })
    const {data : feature_y, isSuccess : isSuccessFeatureY } = api.features.tag.useGetFeatureByTag({tag : feature_tag_y})
    const { data: correlationData, isLoading, isFetching, isSuccess } = api.features.pairwiseQuant.useGetPairwiseFeatureQuant({ feature_tag_x, feature_tag_y }, { enabled: _.isString(feature_tag_x) && _.isString(feature_tag_y) })


    const r = useMemo(() => {
        if (isSuccess && _.isString(feature_tag_x) && _.isString(feature_tag_y) && correlationData.length > 4) {
            console.log("calculate ones!!")
            return viz.utils.linearRegression({ x: correlationData.map(d => d.x), y: correlationData.map(d => d.y) })
        }
        
    }, [feature_tag_x, feature_tag_y, isSuccess])


    return (
        <div style={{width : width + margin.left + margin.right, height : margin.top + margin.bottom + height}}>
        {isLoading || isFetching ? <Loading /> : null}
        {isSuccessFeatureX && isSuccessFeatureY && _.isArray(correlationData) && correlationData.length > 0 ? <InteractiveChart
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
                            width,
                            height,
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
                            svgID: "scatter_plot-corr",
                            linesBySlopeAndIntercept: [r]
                        }} />
                    )
                })
            }
            </InteractiveChart> : null}
            
        </div>
        
    )


    
}