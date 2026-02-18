import _ from "lodash";
import PropTypes from "prop-types"; 
import hooks from "@mitocube/api-hooks"

import ResultChart from "../../protein/charts/resultCard/chart";
import {Responsive, WidthProvider } from "react-grid-layout"
import { useEffect, useRef, useState } from "react";

FeatureDataView.propTypes = {
    features : PropTypes.arrayOf(PropTypes.string).isRequired
}
FeatureDataView.defaultProps = {
    features: []
};

export function FeatureData({ feature_tag, submission_tag }) {

    const { data, isLoading } = hooks.features.data.useGetFeatureDataForSubmission({ tag: feature_tag, submission_tag }, { enabled: !!feature_tag && !!submission_tag, staleTime: 60000 });
    const {data : feature} = hooks.features.useGetFeatureInfo({ tag : feature_tag }, { enabled : !!feature_tag})

    const { data: attributes, isLoading : isSampleCAAttributeLoading } = hooks.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({tag : submission_tag}, {enabled : _.isString(submission_tag), staleTime : Infinity})

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
                <ResultChart
                    yaxisName="value"
                    data={data?.data}
                    showMenu={true}
                    attribute_tags={attributes}
                    width={size.width || undefined}
                        height={size.height || undefined}
                        title={_.isObject(feature) && _.isString(feature.gene_name) ? feature.gene_name : feature_tag}
                />
            )}
        </div>
    );
}

export function FeatureDataView({ feature_tags, submission_tag }) {

        // build a simple initial layout (you can adjust sizing/positions as needed)
        const initialLayouts = feature_tags.map((ft, i) => ({
            i: `${ft}-${i}`,
            x: (i % 3) * 2,
            y: Math.floor(i / 3) * 6,
            w: 2,
            h: 6,
        }));
    return <div>
        <h3>Feature Plots</h3>
        <div className="flex">

            {_.isArray(feature_tags) ? feature_tags.map((feature_tag, idx) => {
                // render the whole grid once (when idx === 0) to make items movable/resizable with react-grid-layout
                if (idx !== 0) return null;

                const ResponsiveGridLayout = WidthProvider(Responsive);



                return (
                    <div style={{ width: "80vw", height : "90vh" }}>
                        <ResponsiveGridLayout
                            className="layout"
                            layouts={{ lg: initialLayouts }}
                            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                            cols={{ lg: 12, md: 10, sm: 6, xs: 2 }}
                            rowHeight={40}
                            isResizable={true}
                            isDraggable={true}
                            measureBeforeMount={false}
                            useCSSTransforms={true}
                        >
                            {feature_tags.map((feature_tag, i) => (
                                <div key={`${feature_tag}-${i}`} data-grid={initialLayouts[i]}>
                                    <div className="grid-item-content bg--lightgrey" style={{ width: "100%", height: "100%", marginBottom: "100px" }}>
                                        
                                        <FeatureData feature_tag={feature_tag} submission_tag={submission_tag} />
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