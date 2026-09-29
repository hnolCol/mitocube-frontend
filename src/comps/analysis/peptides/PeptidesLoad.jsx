import { useMemo } from "react";
import _ from "lodash";

import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";

import PeptidesViz from "./PeptidesViz";

/**
 * Loads peptides data for a single protein and passes it to PeptidesViz component.
 * 
 * Makes two API calls for a specific protein:
 * 1. GET /submissions/{submission_tag}/peptides - Gets protein + peptide definitions (filtered by protein_tag)
 * 2. GET /submissions/{submission_tag}/peptides/correlation - Gets correlation matrix for this protein's peptides
 * 
 * The intensity data is fetched on-demand via prefetch pattern (WithPeptideIntensities).
 * 
 * @param {Object} props
 * @param {string} props.submission_tag - The submission tag to load peptides for
 * @param {string} props.protein_tag - The specific protein tag to analyze
 * @returns {JSX.Element}
 */
function PeptidesLoad({ submission_tag, protein_tag }) {
    // Fetch condition application data for ca_tags
    const { data: attribute_ca_tags, isSuccess: caIsSuccess } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications(
        { tag: submission_tag, return_unique: true },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    // Fetch peptide data for this specific protein in the submission
    const { 
        data: peptidesData, 
        isLoading: peptidesLoading, 
        isError: peptidesError, 
        error: peptidesErrorObj 
    } = api.submissions.analysis.useGetSubmissionPeptides(
        { tag: submission_tag, protein_tag },
        { enabled: _.isString(submission_tag) && _.isString(protein_tag), staleTime: Infinity }
    );

    // Fetch correlation matrix for this protein's peptides
    const { 
        data: correlationData, 
        isLoading: correlationLoading, 
        isError: correlationError, 
        error: correlationErrorObj 
    } = api.submissions.analysis.useGetSubmissionPeptidesCorrelation(
        { tag: submission_tag, protein_tag },
        { enabled: _.isString(submission_tag) && _.isString(protein_tag), staleTime: Infinity }
    );

    const { ca_attribute_tags, ca_tags } = useMemo(() => {
        if (!caIsSuccess || !_.isObject(attribute_ca_tags)) return { ca_attribute_tags: [], ca_tags: [] };
        const ca_attribute_tags = _.keys(attribute_ca_tags);
        const ca_tags = _.values(attribute_ca_tags).flat();
        return { ca_attribute_tags, ca_tags };
    }, [submission_tag, caIsSuccess, attribute_ca_tags]);

    // Extract protein tags from peptides data for prefetching
    const proteinTags = useMemo(() => {
        if (!peptidesData || !_.isArray(peptidesData.proteins)) return [];
        return peptidesData.proteins.map(p => p.tag);
    }, [peptidesData]);

    // Loading states
    if (peptidesLoading || correlationLoading) return <Loading />;
    if (peptidesError) return <div>Error loading peptides: {peptidesErrorObj?.message}</div>;
    if (correlationError) return <div>Error loading correlations: {correlationErrorObj?.message}</div>;
    if (!peptidesData || !_.isArray(peptidesData.proteins) || peptidesData.proteins.length === 0) {
        return <div>No peptides data found for protein {protein_tag} in submission {submission_tag}.</div>;
    }

    return (
        <WithTagMaps
            Component={PeptidesViz}
            attribute_tags={ca_attribute_tags}
            ca_tags={ca_tags}
            protein_tags={proteinTags}
            submission_tag={submission_tag}
            peptidesData={peptidesData}
            correlationData={correlationData}
            selectedProteinTag={protein_tag}
        />
    );
}

export default PeptidesLoad;
