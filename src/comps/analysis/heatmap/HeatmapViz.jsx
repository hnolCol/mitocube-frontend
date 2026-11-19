import { useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import { Checkbox, Dialog, DialogBody, HTMLTable } from "@blueprintjs/core";

import InteractiveChart from "../../core/charts/interactive";
import { MultiProfiles } from "../../core/charts/profiles/MultiProfiles";
import viz from "@mitocube/viz";
import { Combobox } from "../../core/input/Combobox";
import { addItemToArrayOrRemoveIfPresentByTag, addStringToArrayOrRemove } from "../../../services/arrays/transforms";
import { AnnotationSelectionMenu } from "../../core/base/annotations/AnnotationSelectionMenu";
import { AttributeSelection } from "../../core/base/attributes/AttributeSelection";
import { Attribute } from "@/comps/core/base/attributes/Attribute";
import { getUniqueValuesInArrayOfObjects } from "../../../services/arrays/unique";
import { downloadTxtFile, arrayOfObjectsToTabDel } from "../../../services/downloads/txt";
import { downloadSvgFromString } from "../../../services/downloads/svg";
import { buildHeatmapSvg, buildHeatmapLegendSvg } from "../../../services/downloads/heatmapSvg";

/**
 * Dialog to select the subset of samples the heatmap statistics are performed on.
 * Selection is applied (and the data refetched) only after clicking "Apply".
 */
function SampleSelectionDialog({ sampleTags, sampleConditionApplications, attribute_tags, attributeTagMap, caTagMap, selectedSampleTags, isOpen, onClose, onApply }) {
    const [draftSelection, setDraftSelection] = useState(selectedSampleTags)
    useEffect(() => {
        if (isOpen) setDraftSelection(selectedSampleTags)
    }, [isOpen])
    const toggleSample = (tag) => setDraftSelection(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    const allSelected = draftSelection.length === sampleTags.length
    const caByTag = useMemo(() => new Map((_.isArray(sampleConditionApplications) ? sampleConditionApplications : [])
        .map(ca => [ca.tag, ca])), [sampleConditionApplications])
    const displayValue = (value) => {
        if (_.isArray(value)) return value.map(displayValue).join(", ")
        if (!_.isString(value)) return "-"
        const mapped = caTagMap instanceof Map ? caTagMap.get(value) : undefined
        if (_.isString(mapped) && mapped.length > 0) return mapped
        if (_.isObject(mapped) && _.isString(mapped.text) && mapped.text.length > 0) return mapped.text
        return value
    }
    const attributeName = (tag) => {
        const mapped = attributeTagMap instanceof Map ? attributeTagMap.get(tag) : undefined
        if (_.isString(mapped) && mapped.length > 0) return mapped
        if (_.isObject(mapped) && _.isString(mapped.text) && mapped.text.length > 0) return mapped.text
        return tag
    }
    return <Dialog isOpen={isOpen} onClose={onClose} title="Select samples for the statistical analysis" style={{ width: "75vw", maxWidth: "1200px" }}>
        <DialogBody>
            <p className="font-size--small">
                The statistical analysis (ANOVA) and clustering are performed only on the selected samples.
                At least two samples must be selected. By default all samples of the submission are used.
            </p>
            <div className="flex center-items margin-bottom--little" style={{ gap: "0.4rem" }}>
                <button className="basic-button--small"
                    onClick={() => setDraftSelection(allSelected ? [] : [...sampleTags])}>
                    {allSelected ? "Select none" : "Select all"}
                </button>
                <span className="font-size--smallest">{draftSelection.length} of {sampleTags.length} samples selected</span>
            </div>
            <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
                <HTMLTable compact={true} striped={true} style={{ width: "100%" }}>
                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#ffffff", zIndex: 1, boxShadow: "0 1px 0 rgba(0,0,0,0.2)" }}>
                        <tr>
                            <th></th>
                            <th>Sample</th>
                            {(_.isArray(attribute_tags) ? attribute_tags : []).map(attribute_tag =>
                                <th key={attribute_tag}>{attributeName(attribute_tag)}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {sampleTags.map(tag => {
                            const ca = caByTag.get(tag)
                            return <tr key={tag} style={{ cursor: "pointer" }} onClick={() => toggleSample(tag)}>
                                <td><Checkbox checked={draftSelection.includes(tag)} onChange={() => toggleSample(tag)} /></td>
                                <td className="font-size--smallest">{tag}</td>
                                {(_.isArray(attribute_tags) ? attribute_tags : []).map(attribute_tag =>
                                    <td key={attribute_tag} className="font-size--smallest">{displayValue(ca?.[attribute_tag])}</td>)}
                            </tr>
                        })}
                    </tbody>
                </HTMLTable>
            </div>
            <div className="flex center-items margin-top--little" style={{ gap: "0.4rem", justifyContent: "flex-end" }}>
                <button className="basic-button--small" onClick={onClose}>Cancel</button>
                <button className="basic-button--small"
                    disabled={draftSelection.length < 2}
                    onClick={() => { onApply(draftSelection); onClose() }}>
                    Apply
                </button>
            </div>
        </DialogBody>
    </Dialog>
}

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
    const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false);

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

    const clusterItems = useMemo(() => {
        const clusterValues = getUniqueValuesInArrayOfObjects({ data: heatmapData.data, keyName: "cluster" });
        const clusterColorMap = Object.fromEntries(clusterValues.map((value, idx) => [String(value), colorPalette[idx % colorPalette.length]]));
        return _.keys(heatmapData.cluster_indices).sort().map((i) => ({
            tag: i,
            text: `Cluster ${i} (${heatmapData.cluster_indices[i].length} features)`,
            clusterColor: clusterColorMap[String(i)]
        }));
    }, [heatmapData, colorPalette]);

    const keyNames = useMemo(() => [
        {
            xaxisName: undefined,
            yaxisName: heatmapData.value_names,
        }
    ], [_.join(heatmapData.value_names)]);

    const sampleTags = useMemo(() => (_.isArray(submissionSampleConditionApplications)
        ? submissionSampleConditionApplications.map(ca => ca.tag).filter(_.isString)
        : []), [_.join(submissionSampleConditionApplications?.map(ca => ca?.tag))]);

    const selectedSampleTags = useMemo(() => (_.isArray(testProps.selected_sample_tags)
        ? testProps.selected_sample_tags.filter(tag => sampleTags.includes(tag))
        : []), [testProps.selected_sample_tags, sampleTags]);

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
        <div className="flex" style={{ flex: 1, minHeight: 0 }}>
            <div style={{ maxWidth: "300px", marginRight: "1rem", overflowY: "auto", minHeight: 0 }} className="flex flex-column">
                <h3>Settings</h3>

                <h4>Subsetting</h4>
                {attribute_tags.length > 1 ? (
                    <div className="flex flex-column">
                        <span className="font-size--small">Select a condition application attribute to perform the statistical analysis. By default all attributes are considered.</span>
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
                    <div className="flex gap--tiny center-items">
                        <span className="font-size--small">Statistics is calculated using</span>
                        <Attribute attribute_tag={attribute_tags[0]} />
                    </div>
                )}

                <div className="flex flex-column">
                    <span className="font-size--small">Select an annotation to subset the data.</span>
                    <AnnotationSelectionMenu
                        placeholder={testProps.selected_annotation_tags.length === 0 ? "Select annotations" : `${testProps.selected_annotation_tags.length} selected`}
                        vertical={true}
                        onSelection={handleAnnotationSelection}
                        onRemove={(e, tag) => handleAnnotationSelection(e, tag)}
                        selected_tags={testProps.selected_annotation_tags}
                        submission_tags={[submission_tag]}
                    />
                    <span className="font-size--smallest">
                        Data will be filtered after statistical analysis to be part of the given annotation. For example: MitoCarta 3.0
                    </span>
                </div>

                <div className="flex flex-column">
                    <span className="font-size--small">Select the samples to include in the statistical analysis. By default all samples are used.</span>
                    <button className="basic-button--small"
                        onClick={() => setIsSampleDialogOpen(true)}>
                        {selectedSampleTags.length === 0
                            ? `All samples (${sampleTags.length})`
                            : `${selectedSampleTags.length} of ${sampleTags.length} samples selected`}
                    </button>
                    {selectedSampleTags.length > 0 ? <button className="basic-button--small"
                        onClick={() => setTestProps(prevProps => ({ ...prevProps, selected_sample_tags: [] }))}>
                        Reset to all samples
                    </button> : null}
                </div>
                <SampleSelectionDialog
                    sampleTags={sampleTags}
                    sampleConditionApplications={submissionSampleConditionApplications}
                    attribute_tags={attribute_tags}
                    attributeTagMap={attributeTagMap}
                    caTagMap={caTagMap}
                    selectedSampleTags={selectedSampleTags}
                    isOpen={isSampleDialogOpen}
                    onClose={() => setIsSampleDialogOpen(false)}
                    onApply={(selected) => setTestProps(prevProps => ({ ...prevProps, selected_sample_tags: selected }))}
                />

                <h4>Statistics</h4>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "auto 200px",
                        columnGap: "10px",
                        rowGap: "0.5rem",
                        alignItems: "center",
                    }}
                >
                    <div className="font-size--small">FDR cutoff:</div>
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

                    <div className="font-size--small">Number of clusters:</div>
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

                <div className="font-size--small">
                    <p>
                        The FDR cutoff was to {_.round(heatmapData.fdr * 100, 2)}% and 
                        <strong>{heatmapData.data.length}</strong> features were found significantly different.
                    </p>
                    <p>
                        The data are divided into a total number of <strong>{heatmapData.n_clusters}</strong> clusters.
                    </p>
                </div>

                <h4>Export</h4>
                <div className="flex flex-column gap--tiny">
                    <button className="basic-button width--full"
                        onClick={() => downloadSvgFromString(
                            buildHeatmapSvg({
                                data: heatmapData.data,
                                valueNames: heatmapData.value_names,
                                colorNames: (_.isArray(heatmapData.color_names) ? heatmapData.color_names : []),
                                proteinTagMap
                            }),
                            `heatmap-${submission_tag}.svg`
                        )}>
                        Heatmap (SVG)
                    </button>
                    <button className="basic-button width--full"
                        onClick={() => downloadSvgFromString(
                            buildHeatmapLegendSvg({ heatmapData }),
                            `heatmap-legend-${submission_tag}.svg`
                        )}>
                        Legend (SVG)
                    </button>
                    <button className="basic-button width--full"
                        onClick={() => downloadTxtFile(
                            arrayOfObjectsToTabDel(heatmapData.data, _.keys(heatmapData.data[0])),
                            `heatmap-${submission_tag}.txt`
                        )}>
                        Data (TXT)
                    </button>
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
                        <div key={didx} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                            <div className="flex" style={{ display: "flex", flex: 1, minHeight: 0 }}>
                                <div style={{ overflowY: "scroll", flex: "0 0 500px", height: "100%" }}>
                                    <div className="margin--medium padding--medium">
                                        <Combobox
                                            selectedItems={_.isArray(viewProps.selectedCluster) ? viewProps.selectedCluster.map(item => item.tag) : []}
                                            onChange={(item) => {
                                                setViewProps({ ...viewProps, selectedCluster: addItemToArrayOrRemoveIfPresentByTag({ array: viewProps.selectedCluster, item }) });
                                                setProteinSearchTrigger(Math.random());
                                            }}
                                            items={clusterItems}
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
