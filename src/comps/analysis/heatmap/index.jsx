import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import InteractiveChart from "../../core/charts/interactive";
import { Checkbox, InputGroup } from "@blueprintjs/core";
import _, { set } from "lodash"
import { MultiProfiles } from "../../core/charts/profiles/MultiProfiles";
import viz from "@mitocube/viz"
import hooks from "@mitocube/api-hooks"
import { FeatureSearch } from "../../core/input/api/FeatureSearch";
import { useState } from "react";
import { Combobox } from "../../core/input/Combobox";
import { addItemToArrayOrRemoveIfPresentByTag, addStringToArrayOrRemove } from "../../../services/arrays/transforms";
import NumericValueInput from "../../core/input/Numeric";
import { AnnotationSelectionMenu } from "../../core/base/annotations/AnnotationSelectionMenu";

function DatasetHeatmap() {

    const { submission_tag } = useOutletContext()   
    const [testProps, setTestProps] = useState({ fdr: 0.05, selected_annotation_tags: [] })
    const [viewProps, setViewProps] = useState({showSearchInProfile : true, selectedCluster : []})
    const colorPalette = viz.colors.palette.STD_CHART_COLOR_PALETTE
    const { data: heatmapData, isLoading, isError, isFetching, error } = hooks.submissions.analysis.useGetSubmissionHeatmap({ tag: submission_tag, annotation_tag : testProps.selected_annotation_tags.length > 0 ? _.join(testProps.selected_annotation_tags,";") : undefined }, { enabled: _.isString(submission_tag), staleTime: 50000 })
    const { data: submissionSampleConditionApplications, isLoading : sampleCaIsLoading } = hooks.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : submission_tag}, {enabled : _.isString(submission_tag), staleTime : 50000})

    if (isError) return <APIError error={error} />
    if (isLoading || isFetching || sampleCaIsLoading) return <div>Loading...</div>
    if (!_.isObject(heatmapData) || !_.has(heatmapData, "data") || !_.has(heatmapData, "cluster_indices")) return <div>The returned data are not in the correct format. Must be an object with 'data' and 'cluster_indices'</div>
    
    const sample_ca_attribute_tags = _.keys(submissionSampleConditionApplications[0]).filter(k => k !== "tag")
    
    const handleAnnotationSelection = (e, tag) => {
        if (_.isArray(tag)) {
            setTestProps(prevProps => {

                return { ...prevProps, selected_annotation_tags: [] }
            })
        }
        else if (_.isString(tag)) {
            setTestProps(prevProps => {
                const selected_annotation_tags = addStringToArrayOrRemove({ array: prevProps.selected_annotation_tags, string: tag })
                return { ...prevProps, selected_annotation_tags }
            })
        }
    }


    return (
        <div>
            <h2>Hierarchical Clustering</h2>
            <p>The FDR cutoff was to {_.round(heatmapData.fdr*100,2)}% and <strong>{heatmapData.data.length}</strong> features were found significantly different.</p>
            <p>The data are divided into a total number of <strong>{heatmapData.n_clusters}</strong> clusters.</p>
            <div className="flex flex-column">
                <AnnotationSelectionMenu
                    placeholder={testProps.selected_annotation_tags.length === 0? "Select annotations" : `${testProps.selected_annotation_tags.length} selected`}
                    onSelection={handleAnnotationSelection}
                    onRemove={(e,tag) => handleAnnotationSelection(e,tag)}
                    selected_tags={testProps.selected_annotation_tags} />
                <span className="font-size--smallest">Data will be filtered after statistical analysis to be part of the given annotation. For example : MitoCarta 3.0</span>
            </div>
            <div className="flex center-items" style={{ gap: "10px" }}>
                                <div className="flex flex-column center-items"><div>FDR cutoff:</div></div>
                                 <NumericValueInput minValue={-0.01} maxValue={1.0} placeholder="Enter FDR cutoff" label="FDR Cutoff" value={testProps.fdr} onValueChange={(_,value) => setTestProps({...testProps, fdr: value})} />
            </div>
            
            
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
                            
                            <div className="flex center-items" style={{gap: "10px", marginLeft : "2rem", marginRight : "2rem"}}>
                            <div style={{flex: 1}}><FeatureSearch  compare_to_list={data.map(t => t.tag)} onIndexFind={(idcs) => handleSearchByDataIndex(chartIdx, idcs)} /></div>
                            <Checkbox label="Show search results in profile plot" checked={viewProps.showSearchInProfile} onChange={(e) => setViewProps({...viewProps, showSearchInProfile: e.target.checked})} />
                            </div>
                            
                            
                            
                            <div className="flex" style={{ display: "flex", height: "75vh" }}>
                                
                                <div style={{ overflowY: "scroll", flex: "0 0 500px", height: "100%" }}>
                                    <div className="margin--medium padding--medium">
                                        <Combobox
                                
                                        selectedItems={_.isArray(viewProps.selectedCluster) ? viewProps.selectedCluster.map(item => item.tag) : []}
                                        onChange={(item) => {setViewProps({...viewProps, selectedCluster : addItemToArrayOrRemoveIfPresentByTag({array : viewProps.selectedCluster, item})})}}
                                        items={_.keys(heatmapData.cluster_indices).sort().map((i, idx) => { return { tag: i, text: `Cluster ${i} (${heatmapData.cluster_indices[i].length} features)`, clusterColor: colorPalette[idx % colorPalette.length] } })}
                                        colorKey="clusterColor" placeholder={viewProps.selectedCluster.length > 0 ? `${viewProps.selectedCluster.length} clusters selected` : "Select cluster"} />
                                    </div>
                                    <MultiProfiles {...{
                                chartIdx, data,
                                subsetIndices: heatmapData.cluster_indices,
                                colorName : "cluster",
                                yaxisLabel: "Z-Score",
                                xaxisLabel: "Samples",
                                        ...hoverProps, ...filterProps,
                                mergeHoverWithSearch : viewProps.showSearchInProfile,
                                limits, xaxisName, yaxisName, valid, labelNames: heatmapData.label_names,
                                    }} />
                            </div>

                                <div style={{ overflowY: "scroll", flex: 1, height: "100%" }}> 
                                    <viz.charts.HeatmapGrouping data={submissionSampleConditionApplications} binHeight={15} binWidth={15} is_condition_application={sample_ca_attribute_tags.map(i => true)} startX={15 + 15 / 4} startY={14} keyNames={sample_ca_attribute_tags} />
                                    <viz.charts.Heatmap
                                        {...{
                                            data,
                                            clusterName : "cluster",
                                            valueNames: yaxisName,
                                            colorNames: heatmapData.color_names,
                                            labelNames: heatmapData.label_names,
                                            handleSearchByDataIndex,
                                            setHoverDataByDataIndex,
                                            ...filterProps,
                                            ...hoverProps,
                                            isLabelFeatureTag: true,
                                            selectedClusters : viewProps.selectedCluster.map(c => _.toNumber(c.tag)),
                                            
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