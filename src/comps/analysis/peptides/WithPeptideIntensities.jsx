import { useMemo, useRef, useState } from "react";
import _ from "lodash";
import { api } from "@/api";

/**
 * WithPeptideIntensities - Prefetch component for peptide intensity data.
 * 
 * Similar to WithTagMaps, this component prefetches intensity data for a set of peptide tags.
 * The intensity data is fetched on-demand when peptides are hovered/selected in the visualization.
 * 
 * This follows the same pattern as WithTagMaps:
 * 1. Accepts a list of peptide tags to prefetch
 * 2. Fetches intensity data via API: GET /peptides/{peptide_tag}/intensities
 * 3. Passes the intensity data to the child component
 * 
 * @param {Object} props
 * @param {React.Component} props.Component - The component to render with intensity data
 * @param {string[]} props.peptide_tags - Array of peptide tags to prefetch intensities for
 * @param {string[]} [props.sample_tags] - Array of sample tags (optional, extracted from data if not provided)
 * @param {Object} props - All other props are passed through to the Component
 * @returns {JSX.Element}
 * 
 * @example
 * // Example usage:
 * <WithPeptideIntensities
 *   Component={PeptideIntensityPlot}
 *   peptide_tags={["PEP_001_001", "PEP_001_002"]}
 *   sample_tags={["SAMPLE_A", "SAMPLE_B", "SAMPLE_C"]}
 *   selectedPeptideTags={["PEP_001_001"]}
 *   hoverPeptideTag="PEP_001_001"
 * />
 * 
 * @example
 * // The child component (PeptideIntensityPlot) receives:
 * // - intensityData: { peptide_tag: { tag, sequence, intensities: { sample_tag: intensity } } }
 * // - sampleTags: ["SAMPLE_A", "SAMPLE_B", "SAMPLE_C"]
 * // - isIntensityReady: boolean
 */
function WithPeptideIntensities({ Component, peptide_tags = [], sample_tags = [], ...rest }) {
    const peptideIntensityMapRef = useRef(new Map());
    const [isReady, setIsReady] = useState(false);

    // Extract sample tags from intensity data if not provided
    const allSampleTags = useMemo(() => {
        if (sample_tags.length > 0) return sample_tags;
        const samples = new Set();
        peptideIntensityMapRef.current.forEach((intensities, tag) => {
            if (intensities && intensities.intensities && typeof intensities.intensities === 'object') {
                Object.keys(intensities.intensities).forEach(s => samples.add(s));
            }
        });
        return Array.from(samples).sort();
    }, [sample_tags, peptide_tags]);

    // Fetch missing peptide intensities
    const missingPeptideTags = useMemo(() => {
        return peptide_tags.filter(tag => !peptideIntensityMapRef.current.has(tag));
    }, [peptide_tags]);

    // Use queries to fetch peptide intensities
    const intensityQueries = useMemo(() => {
        return missingPeptideTags.map(tag => ({
            tag,
            query: api.peptides.useGetPeptideIntensities(
                { peptide_tag: tag },
                { enabled: _.isString(tag), staleTime: Infinity }
            )
        }));
    }, [missingPeptideTags]);

    // Update the intensity map when queries complete
    useMemo(() => {
        let allReady = true;
        intensityQueries.forEach(({ tag, query }) => {
            if (query.data && !peptideIntensityMapRef.current.has(tag)) {
                peptideIntensityMapRef.current.set(tag, query.data);
            }
            if (query.isLoading || query.isFetching) {
                allReady = false;
            }
        });
        
        // Check if all required peptides have data
        const allHaveData = peptide_tags.every(tag => peptideIntensityMapRef.current.has(tag));
        if (allHaveData && missingPeptideTags.length === 0) {
            setIsReady(true);
        } else if (allReady && missingPeptideTags.length > 0) {
            // All queries completed but some might have failed
            setIsReady(true);
        }
    }, [intensityQueries, missingPeptideTags, peptide_tags]);

    // Convert map to plain object for passing to children
    const intensityData = useMemo(() => {
        const data = {};
        peptide_tags.forEach(tag => {
            if (peptideIntensityMapRef.current.has(tag)) {
                data[tag] = peptideIntensityMapRef.current.get(tag);
            }
        });
        return data;
    }, [peptide_tags]);

    // If we're still loading and have missing peptides, show loading state
    // But we'll let the child component handle the actual loading display
    // This allows for graceful degradation

    return (
        <Component
            {...rest}
            intensityData={intensityData}
            sampleTags={allSampleTags}
            isIntensityReady={isReady}
        />
    );
}

export default WithPeptideIntensities;
