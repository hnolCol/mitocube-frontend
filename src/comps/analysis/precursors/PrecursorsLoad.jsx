import { useMemo } from "react";
import _ from "lodash";
import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";
import PrecursorsViz from "./PrecursorsViz";

/**
 * Loads precursor data for a single protein group and passes it to the PrecursorsViz component.
 *
 * API calls for a specific protein group:
 * 1. GET /features/precursors/protein_groups/{protein_group_tag} - Gets the precursors of the
 *    protein group (filtered to the submission)
 * 2. GET /features/{tag}/sequence - Gets the protein group's sequence (via the first protein tag)
 *
 * The intensity data is fetched on-demand via the prefetch pattern (WithPrecursorIntensities).
 *
 * @param {Object} props
 * @param {string} props.submission_tag - The submission tag to load precursors for
 * @param {string} props.protein_tag - The protein group tag to analyze
 * @returns {JSX.Element}
 */
function PrecursorsLoad({ submission_tag, protein_tag }) {
    // Fetch condition application data for ca_tags
    const { data: attribute_ca_tags, isSuccess: caIsSuccess } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications(
        { tag: submission_tag, return_unique: true },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    // Fetch the precursors of this protein group quantified in the submission
    const {
        data: precursorsData,
        isLoading: precursorsLoading,
        isError: precursorsError,
        error: precursorsErrorObj
    } = api.features.precursors.useGetPrecursorsByProteinGroup(
        { protein_group_tag: protein_tag, submission_tag, limit: undefined },
        { enabled: _.isString(submission_tag) && _.isString(protein_tag), staleTime: Infinity }
    );

    // Fetch the sequence of the first protein of the protein group
    const firstProteinTag = useMemo(() => {
        const tags = _.isString(protein_tag) ? protein_tag.split(";") : [];
        return tags.length > 0 ? tags[0] : undefined;
    }, [protein_tag]);

    const {
        data: sequenceData,
        isLoading: sequenceLoading,
        isError: sequenceError,
        error: sequenceErrorObj
    } = api.features.sequence.useGetSequenceByFeatureKey(
        { tag: firstProteinTag },
        { enabled: _.isString(firstProteinTag), staleTime: Infinity }
    );

    const { ca_attribute_tags, ca_tags } = useMemo(() => {
        if (!caIsSuccess || !_.isObject(attribute_ca_tags)) return { ca_attribute_tags: [], ca_tags: [] };
        const ca_attribute_tags = _.keys(attribute_ca_tags);
        const ca_tags = _.values(attribute_ca_tags).flat();
        return { ca_attribute_tags, ca_tags };
    }, [submission_tag, caIsSuccess, attribute_ca_tags]);

    if (precursorsLoading || sequenceLoading) return <Loading />;
    if (precursorsError) return <div>Error loading precursors: {precursorsErrorObj?.message}</div>;
    if (sequenceError) return <div>Error loading sequence: {sequenceErrorObj?.message}</div>;

    return (
        <WithTagMaps
            Component={PrecursorsViz}
            attribute_tags={ca_attribute_tags}
            ca_tags={ca_tags}
            protein_tags={_.isString(protein_tag) ? protein_tag.split(";") : []}
            submission_tag={submission_tag}
            precursors={_.isArray(precursorsData) ? precursorsData : []}
            sequenceData={sequenceData}
            selectedProteinTag={protein_tag}
        />
    );
}

export default PrecursorsLoad;
