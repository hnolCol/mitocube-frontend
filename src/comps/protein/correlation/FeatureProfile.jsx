

import InteractiveChart from "../../core/charts/interactive"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import viz from "@mitocube/viz"
import { Loading } from "../../core/base/states/Loading"


export function FeatureProfile({ tag, data, xaxisName, yaxisName, hoverProps, width = 550, height = 480., splitName = "tag" }) {
    
    const tags = Array.from(hoverProps.hoverIndices).map(idx => data[idx]["tag"])
    const { data: featureData, isLoading, isFetching, isSuccess } = hooks.features.quantification.useGetSampleAbundance({ tag }, { enabled: _.isString(tag), staleTime: Infinity })
    

    const { data: featureDataOther, isLoading: isLoadingOther, isFetching: isFetchingOther, isSuccess: isSuccessOther } = hooks.features.quantification.useGetSampleAbundance({ tag : tags[0] }, { enabled: _.isArray(tags) && tags.length > 0 && _.isString( tags[0]), staleTime: Infinity })
    const featureDataToPlot = _.isArray(featureDataOther) ? _.concat(featureData, featureDataOther) : featureData

    return <div>
        {isLoading || isFetching ? <Loading /> : null}
        {isSuccess ?
            <InteractiveChart
                data={featureDataToPlot}
                dataName={`${tag}-${_.isArray(tags) && tags.length > 0 ? tags[0] : ''}`}
                keyNames={[{ xaxisName: "sample_tag", yaxisName: "value" }]}> 
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
                    labelProps
                }, didx) => { 

                    return <viz.charts.ProfileChart {...{
                        key: `${chartIdx}-profile_chart`,
                        data,
                        xaxisName,
                        yaxisName,
                        colorName: "tag",
                        ...hoverProps,
                        ...filterProps,
                        ...labelProps,
                        limits,
                        containsNaN: true,
                        yaxisLabel: "log2 intensity",
                        width,
                        height,
                        splitName
                    }} /> 

                })
            }
        </InteractiveChart> : null}

        </div>

//  (chartData) => chartData.map(({ data, chartIdx, xaxisName, yaxisName, valid, limits, ...rest }) => {
//                 }) => { 
//                 return <viz.charts.ProfileChart {...{ data, xaxisName, yaxisName, ...hoverProps, ...filterProps, ...labelProps, limits }} /> 

}