import { useMemo, useState } from "react";
import _ from "lodash";

import APIError from "../../core/error/APIerror";
import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";

import HeatmapViz from "./HeatmapViz";

/**
 * Loads heatmap data and passes it to HeatmapViz component.
 * Handles data fetching and state management for heatmap analysis.
 */
function HeatmapLoad({ submission_tag }) {
    const [testProps, setTestProps] = useState({
        fdr: 0.01,
        n_clusters: 8,
        selected_annotation_tags: [],
        selected_ca_attribute_tags: []
    });
    const [viewProps, setViewProps] = useState({ showSearchInProfile: true, selectedCluster: [] });
    const [requiredProteinTags, setRequiredProteinTags] = useState([]);

    const { data: heatmapData, isLoading, isError, isFetching, error } = api.submissions.analysis.useGetSubmissionHeatmap(
        {
            tag: submission_tag,
            annotation_tag: testProps.selected_annotation_tags.length > 0 ? _.join(testProps.selected_annotation_tags, ";") : undefined,
            fdr: testProps.fdr,
            n_clusters: testProps.n_clusters
        },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    const { data: submissionSampleConditionApplications } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: 5000000 }
    );

    const { data: sample_ca_attribute_tags } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: 600000 }
    );

    const unique_ca_tags = useMemo(() => {
        if (!_.isArray(sample_ca_attribute_tags) || !_.isArray(submissionSampleConditionApplications)) return [];
        return _.uniq(
            sample_ca_attribute_tags
                .map(tag => submissionSampleConditionApplications.map(ca => ca[tag]).flat())
                .flat()
        );
    }, [_.join(sample_ca_attribute_tags, ";"), _.isArray(submissionSampleConditionApplications)]);

    if (isError) return <APIError error={error} />;
    if (isLoading || isFetching) return <div><Loading /> Clustering data containing NaN may take some time...</div>;
    if (!_.isObject(heatmapData) || !_.has(heatmapData, "data") || !_.has(heatmapData, "cluster_indices")) {
        return <div>The returned data are not in the correct format. Must be an object with 'data' and 'cluster_indices'</div>;
    }

    return (
        <WithTagMaps
            Component={HeatmapViz}
            ca_tags={unique_ca_tags}
            attribute_tags={sample_ca_attribute_tags}
            protein_tags={requiredProteinTags}
            heatmapData={heatmapData}
            submissionSampleConditionApplications={submissionSampleConditionApplications}
            testProps={testProps}
            setTestProps={setTestProps}
            viewProps={viewProps}
            setViewProps={setViewProps}
            unique_ca_tags={unique_ca_tags}
            setRequiredProteinTags={setRequiredProteinTags}
            showProteinSearch={true}
            proteinSearchProps={{ submission_tag }}
            submission_tag={submission_tag}
        />
    );
}

export default HeatmapLoad;
