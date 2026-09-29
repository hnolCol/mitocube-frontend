import { useMemo, useState } from "react";
import _ from "lodash";

import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";

import PeptidesViz from "./PeptidesViz";

/**
 * Loads peptides data and passes it to PeptidesViz component.
 * Handles data fetching and state management for peptides analysis.
 */
function PeptidesLoad({ submission_tag }) {
    const [requiredProteinTags, setRequiredProteinTags] = useState([]);

    const { data: peptidesData, isLoading, isError, error } = api.submissions.analysis.useGetSubmissionPeptides(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    const { data: attribute_ca_tags, isSuccess } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications(
        { tag: submission_tag, return_unique: true },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    const { ca_attribute_tags, ca_tags } = useMemo(() => {
        if (!isSuccess || !_.isObject(attribute_ca_tags)) return { ca_attribute_tags: [], ca_tags: [] };
        const ca_attribute_tags = _.keys(attribute_ca_tags);
        const ca_tags = _.values(attribute_ca_tags).flat();
        return { ca_attribute_tags, ca_tags };
    }, [submission_tag, isSuccess, attribute_ca_tags]);

    if (isError) return <div>Error loading peptides data: {error?.message}</div>;
    if (isLoading) return <Loading />;
    if (!peptidesData) return <div>No peptides data found for this submission.</div>;

    return (
        <WithTagMaps
            Component={PeptidesViz}
            attribute_tags={ca_attribute_tags}
            ca_tags={ca_tags}
            protein_tags={requiredProteinTags}
            showProteinSearch={true}
            proteinSearchProps={{ submission_tag }}
            submission_tag={submission_tag}
            peptidesData={peptidesData}
            isLoading={isLoading}
            setRequiredProteinTags={setRequiredProteinTags}
        />
    );
}

export default PeptidesLoad;
