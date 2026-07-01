import _ from "lodash";
import PropTypes from "prop-types"; 
import { api } from "@/api";

import ResultChart from "../../protein/charts/resultCard/chart";
import {Responsive, WidthProvider } from "react-grid-layout"
import { useEffect, useRef, useState } from "react";
import { SubmissionTitle } from "../../submission/view/SubmissionTitle";


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

export function FeatureData({ feature_tag, submission_tag, showTitle = true, showProteinNameInTitle = true, onRemove, metrics = "raw" }) {

    const { data, isLoading } = api.features.data.useGetFeatureDataForSubmission({ tag: feature_tag, submission_tag, metrics }, { enabled: _.isString(feature_tag) && _.isString(submission_tag), staleTime: 600000 });
    const {data : feature} = api.features.tag.useGetFeatureByTag({ tag : feature_tag }, { enabled : _.isString(feature_tag)})
    const { data: attributes, isLoading : isSampleCAAttributeLoading } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({tag : submission_tag}, {enabled : _.isString(submission_tag), staleTime : Infinity})
    const containerRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [containerRef]);

    
    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%"}}>
            {isLoading || isSampleCAAttributeLoading ? (
                <div>Loading...</div>
            ) : (
                    <div>
                        {showTitle && <SubmissionTitle tag={submission_tag} showEdit={false} showCopyToClipboard={false} />}
                <ResultChart
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
                        />
                    </div>
            )}
        </div>
    );
}

export function FeatureDataView({ feature_tags, submission_tags, showTitle = true, showProteinNameInTitle = true, onRemove, metrics = "raw" }) {
        // build a simple initial layout (you can adjust sizing/positions as needed)
        const initialLayouts = feature_tags.map((ft, i) => ({
            i: `${ft}-${i}-${submission_tags[i]}`,
            x: (i % 6) * 2,
            y: Math.floor(i / 6) * 6,
            w: 2,
            h: 2,
        }));
    return <div>
        <h3>Feature Plots</h3>
        <div className="flex">

            {_.isArray(feature_tags) ? feature_tags.map((feature_tag, idx) => {
                // render the whole grid once (when idx === 0) to make items movable/resizable with react-grid-layout
                if (idx !== 0) return null;

                const ResponsiveGridLayout = WidthProvider(Responsive);

                return (
                    <div style={{ width: "80vw", height : "80vh", overflowY : "scroll" }}>
                        <ResponsiveGridLayout
                            className="layout"
                            layouts={{ lg: initialLayouts }}
                            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                            cols={{ lg: 12, md: 10, sm: 8, xs: 4 }}
                            rowHeight={120}
                            isResizable={true}
                            isDraggable={true}
                            measureBeforeMount={false}
                            useCSSTransforms={true}
                        >
                            {feature_tags.map((feature_tag, i) => (
                                <div key={`${feature_tag}-${i}-${submission_tags[i]}`} data-grid={initialLayouts[i]}>
                                    <div className="grid-item-content bg--lightgrey" style={{ width: "100%", height: "100%", marginBottom: "100px" }}>
                                        
                                        <FeatureData feature_tag={feature_tag} submission_tag={submission_tags[i]} showTitle={showTitle} showProteinNameInTitle={showProteinNameInTitle} onRemove={onRemove} metrics={metrics} />
                                    </div>
                                </div>
                            ))}
                        </ResponsiveGridLayout>
                    </div>
                );
            })
                : null}

        </div>
        </div>
}
