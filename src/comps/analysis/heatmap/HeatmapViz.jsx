import { useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";

import InteractiveChart from "../../core/charts/interactive";
import { MultiProfiles } from "../../core/charts/profiles/MultiProfiles";
import viz from "@mitocube/viz";
import { Combobox } from "../../core/input/Combobox";
import { addItemToArrayOrRemoveIfPresentByTag, addStringToArrayOrRemove } from "../../../services/arrays/transforms";
import { AnnotationSelectionMenu } from "../../core/base/annotations/AnnotationSelectionMenu";
import { AttributeSelection } from "../../core/base/attributes/AttributeSelection";
import { Attribute } from "@/comps/core/base/attributes/Attribute";

/**
 * Main heatmap visualization component.
 * Renders hierarchical clustering heatmap with interactive controls.
 */
function HeatmapViz({
    heatmapData,
    submissionSampleConditionApplications,
    testProps,
    setTestProps,
    viewProps,
    setViewProps,
    caTagMap,
    attributeTagMap,
    attribute_tags,
    setRequiredProteinTags,
    proteinTagMap,
    refetchedTrigger,
    proteinSearchResults,
    proteinIsLoading,
    submission_tag,
    setProteinSearchTrigger
}) {
    const scrollContainerRef = useRef(null);
    const colorPalette = viz.colors.palette.STD_CHART_COLOR_PALETTE;
    const [clusterInputValue, setClusterInputValue] = useState(String(testProps.n_clusters));
    const [fdrvInputValue, setFDRVInputValue] = useState(String(testProps.fdr));

    useEffect(() => {
        setClusterInputValue(String(testProps.n_clusters));
    }, [testProps.n_clusters]);

    useEffect(() => {
        setFDRVInputValue(String(testProps.fdr));
    }, [testProps.fdr]);

    const commitClusterCount = () => {
        const parsed = parseInt(clusterInputValue, 10);
        if (_.isFinite(parsed) && parsed >= 2 && parsed <= 30) {
            setTestProps(prev => ({ ...prev, n_clusters: parsed }));
        } else {
            setClusterInputValue(String(testProps.n_clusters));
        }
    };

    const commitFDR = (value) => {
        const parsed = parseFloat(value);
        if (_.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
            setTestProps(prev => ({ ...prev, fdr: parsed }));
        } else {
            setTestProps(prev => ({ ...prev, fdr: prev.fdr }));
        }
    };

    const handleAnnotationSelection = (e, tag) => {
        if (_.isArray(tag)) {
            setTestProps(prevProps => ({ ...prevProps, selected_annotation_tags: [] }));
        } else if (_.isString(tag)) {
            setTestProps(prevProps => ({
                ...prevProps,
                selected_annotation_tags: addStringToArrayOrRemove({ array: prevProps.selected_annotation_tags, string: tag })
            }));
        }
    };

    useEffect(() => {
        if (_.isArray(viewProps.selectedCluster) && viewProps.selectedCluster.length > 0) {
            scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
    }, [_.join(viewProps.selectedCluster, ";")]);

    useEffect(() => {
        if (_.isNumber(proteinSearchResults.trigger) && proteinSearchResults.values.length > 0) {
            scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
    }, [proteinSearchResults.trigger]);

    const passOnProps = useMemo(() => ({
        refetchedTrigger,
        setRequiredProteinTags,
        proteinTagMap,
        proteinIsLoading
    }), [refetchedTrigger, setRequiredProteinTags, proteinTagMap, proteinIsLoading]);

    const keyNames = useMemo(() => [
        {
            xaxisName: undefined,
            yaxisName: heatmapData.value_names,
        }
    ], [_.join(heatmapData.value_names)]);

    const filteredSampleConditionApplications = useMemo(() => {
        if (!_.isArray(submissionSampleConditionApplications) || !_.isArray(heatmapData.value_names)) {
            return submissionSampleConditionApplications;
        }
        const valueNameSet = new Set(heatmapData.value_names);
        const filtered = submissionSampleConditionApplications.filter(ca => valueNameSet.has(ca.tag));
        const valueNameIndex = Object.fromEntries(heatmapData.value_names.map((name, idx) => [name, idx]));
        return _.sortBy(filtered, ca => valueNameIndex[ca.tag]);
    }, [submissionSampleConditionApplications, heatmapData.value_names]);

    return (
        <div className="flex">
            <div style={{ maxWidth: "300px", marginRight: "1rem" }} className="flex flex-column">
                <h3>Settings</h3>

                {attribute_tags.length > 1 ? (
                    <div>
                        <span>Select a condition application attribute to perform the statistical analysis. By default the all attributes are considered.</span>
                        <AttributeSelection
                            attribute_tags={attribute_tags}
                            selected={testProps.selected_ca_attribute_tags}
                            onSelect={(attribute_tag) => setTestProps(prevProps => ({
                                ...prevProps,
                                selected_ca_attribute_tags: addStringToArrayOrRemove({
                                    array: prevProps.selected_ca_attribute_tags,
                                    string: attribute_tag
                                })
                            }))} />
                    </div>
                ) : (
                    <div className="flex" style={{ gap: "0.2rem" }}>
                        <span>Statistics is calculated using</span>
                        <Attribute attribute_tag={attribute_tags[0]} />
                    </div>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "auto 200px",
                        columnGap: "10px",
                        rowGap: "0.5rem",
                        alignItems: "center",
                    }}
                >
                    <div>FDR cutoff:</div>
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Enter FDR cutoff"
                        onBlur={e => commitFDR(e.target.value)}
                        value={fdrvInputValue}
                        onChange={(e) => { setFDRVInputValue(e.target.value); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.target.blur(); } }}
                        className="search-input"
                        style={{ width: "100%" }}
                    />

                    <div>Number of clusters:</div>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter number of clusters"
                        value={clusterInputValue}
                        onChange={(e) => setClusterInputValue(e.target.value)}
                        onBlur={commitClusterCount}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.target.blur(); } }}
                        className="search-input"
                        style={{ width: "100%" }}
                    />
                </div>

                <div className="flex flex-column">
                    <span>Select an annotation to subset the data.</span>
                    <AnnotationSelectionMenu
                        placeholder={testProps.selected_annotation_tags.length === 0 ? "Select annotations" : `${testProps.selected_annotation_tags.length} selected`}
                        onSelection={handleAnnotationSelection}
                        onRemove={(e, tag) => handleAnnotationSelection(e, tag)}
                        selected_tags={testProps.selected_annotation_tags}
                        submission_tags={[submission_tag]}
                    />
                    <span className="font-size--smallest">
                        Data will be filtered after statistical analysis to be part of the given annotation. For example: MitoCarta 3.0
                    </span>
                </div>

                <div>
                    <p>
                        The FDR cutoff was to {_.round(heatmapData.fdr * 100, 2)}% and 
                        <strong>{heatmapData.data.length}</strong> features were found significantly different.
                    </p>
                    <p>
                        The data are divided into a total number of <strong>{heatmapData.n_clusters}</strong> clusters.
                    </p>
                </div>
            </div>

            <InteractiveChart
                data={heatmapData.data}
                externalSearchResult={proteinSearchResults}
                keyNames={keyNames}
                passOnProps={passOnProps}
                isPointChart={[false]}
            >
                {(chartData) => chartData.map(({
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
                        <div key={didx}>
                            <div className="flex" style={{ display: "flex", height: "85vh" }}>
                                <div style={{ overflowY: "scroll", flex: "0 0 500px", height: "100%" }}>
                                    <div className="margin--medium padding--medium">
                                        <Combobox
                                            selectedItems={_.isArray(viewProps.selectedCluster) ? viewProps.selectedCluster.map(item => item.tag) : []}
                                            onChange={(item) => {
                                                setViewProps({ ...viewProps, selectedCluster: addItemToArrayOrRemoveIfPresentByTag({ array: viewProps.selectedCluster, item }) });
                                                setProteinSearchTrigger(Math.random());
                                            }}
                                            items={_.keys(heatmapData.cluster_indices).sort().map((i, idx) => ({
                                                tag: i,
                                                text: `Cluster ${i} (${heatmapData.cluster_indices[i].length} features)`,
                                                clusterColor: colorPalette[idx % colorPalette.length]
                                            }))}
                                            colorKey="clusterColor"
                                            placeholder={viewProps.selectedCluster.length > 0 ? `${viewProps.selectedCluster.length} clusters selected` : "Select cluster"}
                                        />
                                    </div>

                                    <MultiProfiles
                                        chartIdx={chartIdx}
                                        data={data}
                                        subsetIndices={heatmapData.cluster_indices}
                                        colorName="cluster"
                                        yaxisLabel="Z-Score"
                                        xaxisLabel="Samples"
                                        {...hoverProps}
                                        {...filterProps}
                                        mergeHoverWithSearch={viewProps.showSearchInProfile}
                                        limits={limits}
                                        xaxisName={xaxisName}
                                        yaxisName={yaxisName}
                                        valid={valid}
                                        proteinTagMap={proteinTagMap}
                                        labelNames={heatmapData.label_names}
                                    />
                                </div>

                                <div style={{ overflowY: "scroll", flex: 1, height: "100%" }}>
                                    <viz.charts.HeatmapGrouping
                                        data={filteredSampleConditionApplications}
                                        binHeight={15}
                                        binWidth={15}
                                        is_condition_application={attribute_tags.map(i => true)}
                                        startX={15 + 15 / 4}
                                        startY={14}
                                        keyNames={attribute_tags}
                                        caTagMap={caTagMap}
                                        attributeTagMap={attributeTagMap}
                                    />
                                    <viz.charts.Heatmap
                                        data={data}
                                        setRequiredProteinTags={setRequiredProteinTags}
                                        proteinTagMap={proteinTagMap}
                                        refetchedTrigger={refetchedTrigger}
                                        clusterName="cluster"
                                        valueNames={yaxisName}
                                        colorNames={heatmapData.color_names}
                                        labelNames={heatmapData.label_names}
                                        handleSearchByDataIndex={handleSearchByDataIndex}
                                        setHoverDataByDataIndex={setHoverDataByDataIndex}
                                        {...filterProps}
                                        {...hoverProps}
                                        isLabelFeatureTag={true}
                                        selectedClusters={viewProps.selectedCluster.map(c => _.toNumber(c.tag))}
                                        proteinIsLoading={proteinIsLoading}
                                        scrollContainerRef={scrollContainerRef}
                                        svgID={`heatmap-svg-${submission_tag}`}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </InteractiveChart>
        </div>
    );
}

export default HeatmapViz;
