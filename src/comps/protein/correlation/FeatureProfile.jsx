

import InteractiveChart from "../../core/charts/interactive"
import _ from "lodash"
import viz from "@mitocube/viz"
import { Loading } from "../../core/base/states/Loading"
import { api } from "@/api";

export function FeatureProfile({ tag, data, proteinTagMap, xaxisName, yaxisName, hoverProps, width = 550, height = 480., splitName = "tag", metrics = "log2_fc_vs_mean" }) {
    
    const tags = Array.from(hoverProps.hoverIndices).map(idx => data[idx]["tag"])
    const { data: featureData, isLoading, isFetching, isSuccess, error } = api.features.quantifications.useGetSampleAbundance({ tag, metrics }, { enabled: _.isString(tag), staleTime: Infinity })

    const { data: featureDataOther, isLoading: isLoadingOther, isFetching: isFetchingOther, isSuccess: isSuccessOther } = api.features.quantifications.useGetSampleAbundance({ tag : tags[0], metrics }, { enabled: _.isArray(tags) && tags.length > 0 && _.isString( tags[0]), staleTime: Infinity })
    const featureDataToPlot = _.isArray(featureDataOther) ? _.concat(featureData, featureDataOther) : featureData
    return <div>
        {isLoading || isFetching ? <Loading /> : null}
        {isSuccess ?
            <InteractiveChart
                data={featureDataToPlot}
                dataName={`${tag}-${_.isArray(tags) && tags.length > 0 ? tags[0] : ''}`}
                keyNames={[{ xaxisName: "sample_tag", yaxisName: "value" }]}
                passOnProps={{ includeXs: featureData.map(d => d.sample_tag) }}
            > 
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
                    // findDataInRectangle,
                    // setHoverDataInRectangle,
                    hoverProps,
                    filterProps,
                    // findClosestPoint,
                    labelProps,
                    includeXs
                }, didx) => { 

                    return <viz.charts.ProfileChart
                        key={`${chartIdx}-profile_chart`}
                        {...{
                        
                        data,
                        xaxisName,
                        yaxisName,
                        includeXs,
                        colorName: "tag",
                        ...hoverProps,
                        ...filterProps,
                        ...labelProps,
                        limits,
                        containsNaN: true,
                        yaxisLabel: "log2 intensity",
                        width,
                        height,
                        splitName,
                        proteinTagMap,
                        splitByProtein: true,
                    }} /> 

                })
            }
        </InteractiveChart> : null}

        </div>

}