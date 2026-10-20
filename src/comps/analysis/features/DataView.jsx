import _ from "lodash";
import PropTypes from "prop-types"; 
import { api } from "@/api";
import { Button } from "@blueprintjs/core";

import ResultChart from "../../protein/charts/resultCard/chart";
import {Responsive, WidthProvider } from "react-grid-layout"
import { useEffect, useRef, useState } from "react";
import { getItemFromLocalStorage, saveInLocalStorage } from "../../../services/localstorage";
import { SubmissionTitle } from "../../submission/view/SubmissionTitle";
import { SubmissionMetadataDrawer } from "../../submission/view/SubmissionMetadataDrawer";
const ResponsiveGridLayout = WidthProvider(Responsive);

FeatureDataView.propTypes = {
    feature_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    submission_tags : PropTypes.arrayOf(PropTypes.string).isRequired
}
FeatureDataView.defaultProps = {
    features: []
};

const metrics_labels = {
    "raw": "Raw values",
    "z_score_sample": "Z-scores (sample-wise)",
    "z_score_protein_group": "Z-scores (protein group-wise)",
    "log2_fc_vs_mean": "Log2FC vs mean",
}

export function FeatureData({ feature_tag, submission_tag, showTitle = true, showProteinNameInTitle = true, onRemove, metrics = "raw", openMetadataDrawer }) {

    const { data, isLoading } = api.features.data.useGetFeatureDataForSubmission({ tag: feature_tag, submission_tag, metrics }, { enabled: _.isString(feature_tag) && _.isString(submission_tag), staleTime: 600000 });
    const {data : feature} = api.features.tag.useGetFeatureByTag({ tag : feature_tag }, { enabled : _.isString(feature_tag)})
    const { data: attributes, isLoading : isSampleCAAttributeLoading } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({tag : submission_tag}, {enabled : _.isString(submission_tag), staleTime : Infinity})
    const containerRef = useRef(null);
    const chartAreaRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        // the chart area element only exists once loading finished (it is behind the
        // loading gate), so the observer has to attach when that happens, not only on mount
        if (isLoading || isSampleCAAttributeLoading) return;

        const el = chartAreaRef.current;
        if (!el) return;

        const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [chartAreaRef, isLoading, isSampleCAAttributeLoading]);

    const hasData = _.isArray(data?.data) && !_.every(data.data, q => q.value === null);
    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%"}}>
            {isLoading || isSampleCAAttributeLoading ? (
                <div>Loading...</div>
            ) : (
                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        {showTitle && hasData && <SubmissionTitle tag={submission_tag} showEdit={false} showCopyToClipboard={false} />}
                        <div ref={chartAreaRef} style={{ flex: 1, minHeight: 0 }}>
                        {hasData ? <ResultChart
                        yaxisName="value"
                        featureTag={feature_tag}
                        submission_tag={submission_tag}
                        yAxisLabel={_.has(metrics_labels, metrics) ? metrics_labels[metrics] : "log2 intensity"}
                        data={data?.data}
                        showMenu={true}
                        attribute_tags={attributes}
                        width={size.width || undefined}
                        height={size.height || undefined}
                        title={!showProteinNameInTitle ? "" :  _.isObject(feature) && _.isString(feature.gene_name) ? feature.gene_name : feature_tag}
                        onRemove={onRemove}
                        openMetadataDrawer={openMetadataDrawer}
                        /> : <div>No data available or all quantified values are null.</div>}
                        </div>
                    </div>
            )}
        </div>
    );
}

const COLS_LG = 8;
const ITEM_W = 2;
const ITEM_H = 2;
const colsByBreakpoint = { lg: 8, md: 7, sm: 6, xs: 3 };

function buildLayout(feature_tags, submission_tags, cols) {
    const perRow = Math.max(1, Math.floor(cols / ITEM_W));
    return feature_tags.map((ft, i) => ({
        i: `${ft}-${i}-${submission_tags[i]}`,
        x: (i % perRow) * ITEM_W,
        y: Math.floor(i / perRow) * ITEM_H,
        w: ITEM_W,
        h: ITEM_H,
    }));
}

function buildLayouts(feature_tags, submission_tags) {
    return Object.fromEntries(
        Object.entries(colsByBreakpoint).map(([bp, cols]) => [bp, buildLayout(feature_tags, submission_tags, cols)])
    );
}

function mergeLayouts(prevLayouts, feature_tags, submission_tags) {
    const nextLayouts = {};
    for (const bp of Object.keys(colsByBreakpoint)) {
        const cols = colsByBreakpoint[bp];
        const prevItems = _.keyBy(_.get(prevLayouts, bp, []), "i");
        const perRow = Math.max(1, Math.floor(cols / ITEM_W));
        nextLayouts[bp] = feature_tags.map((ft, i) => {
            const id = `${ft}-${i}-${submission_tags[i]}`;
            const prev = prevItems[id];
            if (prev) return { ...prev, i: id };
            return {
                i: id,
                x: (i % perRow) * ITEM_W,
                y: Math.floor(i / perRow) * ITEM_H,
                w: ITEM_W,
                h: ITEM_H,
            };
        });
    }
    return nextLayouts;
}

const LAYOUTS_STORAGE_KEY = "featureDataGridLayouts";

function loadStoredLayouts(storageKey) {
    if (!_.isString(storageKey)) return null;
    try {
        const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: LAYOUTS_STORAGE_KEY, parseJson: true });
        if (!itemFound || !_.isObject(itemValue)) return null;
        const stored = itemValue[storageKey];
        if (!_.isObject(stored)) return null;
        return stored;
    } catch (error) {
        console.error("Error loading grid layouts from localStorage:", error);
        return null;
    }
}

function saveStoredLayouts(storageKey, layouts) {
    if (!_.isString(storageKey)) return;
    try {
        const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: LAYOUTS_STORAGE_KEY, parseJson: true });
        const all = itemFound && _.isObject(itemValue) ? itemValue : {};
        all[storageKey] = layouts;
        saveInLocalStorage({ itemName: LAYOUTS_STORAGE_KEY, itemValue: JSON.stringify(all) });
    } catch (error) {
        console.error("Error saving grid layouts to localStorage:", error);
    }
}

export function FeatureDataView({ feature_tags, submission_tags, showTitle = true, showProteinNameInTitle = true, onRemove, metrics = "raw", layoutStorageKey }) {
    const [metadataDrawer, setMetadataDrawer] = useState({ isOpen: false, submission_tag: undefined })
    const [layouts, setLayouts] = useState(() => {
        const stored = loadStoredLayouts(layoutStorageKey);
        return stored ? mergeLayouts(stored, feature_tags, submission_tags) : buildLayouts(feature_tags, submission_tags);
    });

    const tagsKey = feature_tags.join("|") + "#" + submission_tags.join("|");
    const layoutsRef = useRef(layouts);
    layoutsRef.current = layouts;
    const tagsKeyRef = useRef(tagsKey);
    if (tagsKeyRef.current !== tagsKey) {
        tagsKeyRef.current = tagsKey;
        const merged = mergeLayouts(layoutsRef.current, feature_tags, submission_tags);
        layoutsRef.current = merged;
        setLayouts(merged);
    }

    const handleLayoutChange = (_layout, allLayouts) => {
        setLayouts(allLayouts);
        saveStoredLayouts(layoutStorageKey, allLayouts);
    };

    const handleResetLayout = () => {
        const defaults = buildLayouts(feature_tags, submission_tags);
        layoutsRef.current = defaults;
        setLayouts(defaults);
        saveStoredLayouts(layoutStorageKey, defaults);
    };

    return <div style={{ overflowY: "hidden", height: "100%" }}>
        <SubmissionMetadataDrawer
            isOpen={metadataDrawer.isOpen}
            submission_tag={metadataDrawer.submission_tag}
            onClose={() => setMetadataDrawer({ isOpen: false, submission_tag: undefined })}
        />
        <h3 style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            Feature Plots
            <Button icon="reset" intent="danger" variant="minimal" onClick={handleResetLayout} text="Reset layout" />
        </h3>
        <div className="flex">

            {_.isArray(feature_tags) ? feature_tags.map((feature_tag, idx) => {
                // render the whole grid once (when idx === 0) to make items movable/resizable with react-grid-layout
                if (idx !== 0) return null;

                

                return (
                    <div style={{ width: "100%", height : "80vh", overflowY : "scroll", paddingRight : "1rem" }}>
                        <ResponsiveGridLayout
                            className="layout"
                            layouts={layouts}
                            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                            cols={colsByBreakpoint}
                            rowHeight={180}
                            isResizable={true}
                            isDraggable={true}
                            measureBeforeMount={false}
                            useCSSTransforms={true}
                            onLayoutChange={handleLayoutChange}
                        >
                            {feature_tags.map((feature_tag, i) => {
                                const itemKey = `${feature_tag}-${i}-${submission_tags[i]}`;
                                return (
                                    <div key={itemKey}>
                                        <div className="grid-item-content bg--lightgrey" style={{ width: "100%", height: "100%" }}>
                                            <FeatureData
                                                feature_tag={feature_tag}
                                                submission_tag={submission_tags[i]}
                                                showTitle={showTitle}
                                                showProteinNameInTitle={showProteinNameInTitle}
                                                onRemove={onRemove}
                                                metrics={metrics}
                                                openMetadataDrawer={setMetadataDrawer}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </ResponsiveGridLayout>
                    </div>
                );
            })
                : null}

        </div>
        </div>
}
