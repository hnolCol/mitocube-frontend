import { useMemo } from "react";
import _ from "lodash";
import { useQueries } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { mapAbundanceRowsToIntensities } from "./precursorUtils";

/**
 * WithPrecursorIntensities - Prefetch component for precursor intensity data.
 *
 * Fetches the abundance of the given precursor tags for the current submission
 * via GET /features/precursors/{precursor_tag}/abundance and passes the
 * aggregated intensity data to the wrapped component.
 *
 * @param {Object} props
 * @param {React.Component} props.Component - The component to render with intensity data
 * @param {string} props.submission_tag - The submission tag to limit the abundance data to
 * @param {string[]} props.precursor_tags - Array of precursor tags to prefetch intensities for
 * @param {string[]} [props.sample_tags] - Array of sample tags (optional, extracted from data if not provided)
 * @param {Object} props - All other props are passed through to the Component
 * @returns {JSX.Element}
 *
 * The child component receives:
 * - intensityData: { precursor_tag: { tag, sequence, intensities: { sample_tag: value } } }
 * - sampleTags: string[]
 * - isIntensityReady: boolean
 */
function WithPrecursorIntensities({ Component, submission_tag, precursor_tags = [], sample_tags = [], ...rest }) {
    const abundanceQueries = useQueries({
        queries: precursor_tags.map(tag => ({
            queryKey: ["getPrecursorAbundance", tag, submission_tag],
            queryFn: async () => {
                const res = await apiClient.get(`/features/precursors/${tag}/abundance`, {
                    params: { submission_tags: submission_tag }
                });
                return res.data;
            },
            enabled: _.isString(tag) && _.isString(submission_tag),
            staleTime: Infinity
        }))
    });

    const { intensityData, sampleTags, isReady } = useMemo(() => {
        const allRows = abundanceQueries.flatMap(q => _.isArray(q.data) ? q.data : []);
        const data = mapAbundanceRowsToIntensities(allRows, submission_tag);
        const samples = sample_tags.length > 0
            ? sample_tags
            : _.uniq(allRows.map(r => r?.sample_tag).filter(_.isString)).sort();
        const ready = precursor_tags.length > 0 && abundanceQueries.every(
            (q, idx) => !_.isString(precursor_tags[idx]) || (!q.isLoading && !q.isFetching)
        );
        return { intensityData: data, sampleTags: samples, isReady: ready };
    }, [abundanceQueries, precursor_tags, sample_tags, submission_tag]);

    return (
        <Component
            {...rest}
            intensityData={intensityData}
            sampleTags={sampleTags}
            isIntensityReady={isReady}
        />
    );
}

export default WithPrecursorIntensities;
