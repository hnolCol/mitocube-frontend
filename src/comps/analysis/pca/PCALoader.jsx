import _ from "lodash";
import { useMemo, useState } from "react";

import { api } from "@/api";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";

import PCAPlot from "./PCAPlot";

/**
 * Loads PCA data and passes it to PCAPlot component.
 * Handles data fetching and state management for PCA analysis.
 */
function PCALoader({ submission_tag, annotation_tag }) {
    const showHoverLabels = true;
    const [requiredProteinTags, setRequiredProteinTags] = useState([]);

    const { data: attribute_ca_tags, isSuccess } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications(
        { tag: submission_tag, return_unique: true },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    const { data: pcaresults, isSuccess: isPCADataSuccess, isLoading: isPCALoading } = api.submissions.analysis.useGetSubmissionPCA(
        { tag: submission_tag, annotation_tag },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    const { ca_attribute_tags, ca_tags } = useMemo(() => {
        if (!isSuccess || !_.isObject(attribute_ca_tags)) return { ca_attribute_tags: [], ca_tags: [] };
        const ca_attribute_tags = _.keys(attribute_ca_tags);
        const ca_tags = _.values(attribute_ca_tags).flat();
        return { ca_attribute_tags, ca_tags };
    }, [submission_tag, isSuccess, attribute_ca_tags]);

    return (
        <WithTagMaps
            Component={PCAPlot}
            attribute_tags={ca_attribute_tags}
            ca_tags={ca_tags}
            protein_tags={requiredProteinTags}
            showProteinSearch={true}
            proteinSearchProps={{ submission_tag }}
            submission_tag={submission_tag}
            pcaresults={pcaresults}
            isPCALoading={isPCALoading}
            showHoverLabels={showHoverLabels}
            setRequiredProteinTags={setRequiredProteinTags}
        />
    );
}

export default PCALoader;
