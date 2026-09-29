import { useMemo, useState } from "react";
import _ from "lodash";

import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";

import PeptidesViz from "./PeptidesViz";

/**
 * Loads peptides data and passes it to PeptidesViz component.
 * Handles data fetching and state management for peptides analysis.
 * 
 * Makes two API calls:
 * 1. GET /submissions/{submission_tag}/peptides - Gets protein + peptide definitions
 * 2. GET /submissions/{submission_tag}/peptides/correlation - Gets correlation matrix
 * 
 * The intensity data is fetched on-demand via prefetch pattern (WithPeptideIntensities).
 * 
 * @param {Object} props
 * @param {string} props.submission_tag - The submission tag to load peptides for
 * @returns {JSX.Element}
 */
function PeptidesLoad({ submission_tag }) {
    const [requiredProteinTags, setRequiredProteinTags] = useState([]);
    const [selectedProteinTag, setSelectedProteinTag] = useState(null);

    // Fetch condition application data for ca_tags
    const { data: attribute_ca_tags, isSuccess: caIsSuccess } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications(
        { tag: submission_tag, return_unique: true },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    // Fetch peptide data for this submission (per protein)
    const { data: peptidesData, isLoading: peptidesLoading, isError: peptidesError, error: peptidesErrorObj } = api.submissions.analysis.useGetSubmissionPeptides(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    // Fetch correlation matrix for peptides
    const { data: correlationData, isLoading: correlationLoading, isError: correlationError, error: correlationErrorObj } = api.submissions.analysis.useGetSubmissionPeptidesCorrelation(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: Infinity }
    );

    const { ca_attribute_tags, ca_tags } = useMemo(() => {
        if (!caIsSuccess || !_.isObject(attribute_ca_tags)) return { ca_attribute_tags: [], ca_tags: [] };
        const ca_attribute_tags = _.keys(attribute_ca_tags);
        const ca_tags = _.values(attribute_ca_tags).flat();
        return { ca_attribute_tags, ca_tags };
    }, [submission_tag, caIsSuccess, attribute_ca_tags]);

    // Extract peptide tags from all proteins for prefetching
    const peptideTags = useMemo(() => {
        if (!peptidesData || !_.isArray(peptidesData.proteins)) return [];
        return peptidesData.proteins.flatMap(p => p.peptides.map(pep => pep.tag));
    }, [peptidesData]);

    // Determine selected protein (first one by default)
    const selectedProtein = useMemo(() => {
        if (!peptidesData || !_.isArray(peptidesData.proteins) || peptidesData.proteins.length === 0) {
            return null;
        }
        return peptidesData.proteins.find(p => p.tag === selectedProteinTag) || peptidesData.proteins[0];
    }, [peptidesData, selectedProteinTag]);

    // Loading states
    if (peptidesLoading || correlationLoading) return <Loading />;
    if (peptidesError) return <div>Error loading peptides: {peptidesErrorObj?.message}</div>;
    if (correlationError) return <div>Error loading correlations: {correlationErrorObj?.message}</div>;
    if (!peptidesData || !_.isArray(peptidesData.proteins) || peptidesData.proteins.length === 0) {
        return <div>No peptides data found for this submission.</div>;
    }

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
            correlationData={correlationData}
            selectedProteinTag={selectedProteinTag}
            setSelectedProteinTag={setSelectedProteinTag}
            setRequiredProteinTags={setRequiredProteinTags}
        />
    );
}

export default PeptidesLoad;
