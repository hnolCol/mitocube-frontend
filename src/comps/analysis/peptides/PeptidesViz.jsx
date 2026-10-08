import { useMemo, useState } from "react";
import _ from "lodash";

import { Loading } from "@/comps/core/base/states/Loading";

import SequenceViewer from "./SequenceViewer";
import PeptideIntensityPlot from "./PeptideIntensityPlot";
import PeptideCorrelationMatrix from "./PeptideCorrelationMatrix";
import PositionCorrelationProfile from "./PositionCorrelationProfile";
import WithPeptideIntensities from "./WithPeptideIntensities";

/**
 * Example correlation data for demonstration
 * In production, this will come from the API
 */
const EXAMPLE_CORRELATION = {
    peptide_tags: ["PEP_001_001", "PEP_001_002", "PEP_001_003", "PEP_001_004", "PEP_001_005"],
    correlation_matrix: [
        [1.0, 0.95, 0.87, 0.92, 0.88],
        [0.95, 1.0, 0.92, 0.89, 0.91],
        [0.87, 0.92, 1.0, 0.85, 0.83],
        [0.92, 0.89, 0.85, 1.0, 0.94],
        [0.88, 0.91, 0.83, 0.94, 1.0]
    ],
    samples: ["SAMPLE_A", "SAMPLE_B", "SAMPLE_C", "SAMPLE_D"]
};

/**
 * Main peptides visualization component.
 * Displays protein sequences with mapped peptides and intensity profiles.
 * 
 * Uses three API calls:
 * 1. GET /submissions/{tag}/peptides - Protein + peptide definitions (all peptides, no intensities)
 * 2. GET /submissions/{tag}/peptides/correlation - Pre-calculated correlation matrix
 * 3. GET /peptides/{tag}/intensities - On-demand intensity data via prefetch
 * 
 * @param {Object} props
 * @param {string} props.submission_tag - Current submission tag
 * @param {string} props.selectedProteinTag - Currently selected protein tag (passed from PeptidesLoad)
 * @param {Object} props.peptidesData - Data from API call 1: { proteins: [{ tag, name, sequence, peptides: [...] }] }
 * @param {Object} props.correlationData - Data from API call 2: { peptide_tags: [...], correlation_matrix: [...], samples: [...] }
 * @param {string[]} props.ca_tags - Condition application tags
 * @param {string[]} props.attribute_tags - Attribute tags
 * @param {Map} props.caTagMap - Condition application tag map
 * @param {Map} props.attributeTagMap - Attribute tag map
 * @param {Map} props.proteinTagMap - Protein tag map
 * @returns {JSX.Element}
 */
function PeptidesViz({
    submission_tag,
    selectedProteinTag,
    peptidesData,
    correlationData,
    // From WithTagMaps
    caTagMap,
    attributeTagMap,
    proteinTagMap,
    ca_tags,
    attribute_tags
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPeptideTags, setSelectedPeptideTags] = useState([]);
    const [hoverPeptideTag, setHoverPeptideTag] = useState(null);
    const [activeView, setActiveView] = useState("sequence"); // sequence, correlation, position

    // Use example correlation data if not available
    const displayCorrelation = useMemo(() => {
        if (correlationData && _.isArray(correlationData.peptide_tags)) {
            return correlationData;
        }
        return EXAMPLE_CORRELATION;
    }, [correlationData]);

    // Find selected protein from peptidesData
    const selectedProtein = useMemo(() => {
        if (!peptidesData || !_.isArray(peptidesData.proteins)) {
            return null;
        }
        return peptidesData.proteins.find(p => p.tag === selectedProteinTag) || peptidesData.proteins[0];
    }, [peptidesData, selectedProteinTag]);

    // Get peptide tags for the selected protein
    const proteinPeptideTags = useMemo(() => {
        if (!selectedProtein) return [];
        return selectedProtein.peptides.map(p => p.tag);
    }, [selectedProtein]);

    // Filter to peptides that have intensity data (for intensity plot)
    // In production, these would be the peptides from the current submission
    const identifiedPeptideTags = useMemo(() => {
        if (!selectedProtein) return [];
        return selectedProtein.peptides
            .filter(p => p.submission_tag === submission_tag)
            .map(p => p.tag);
    }, [selectedProtein, submission_tag]);

    // Handle peptide selection
    const handlePeptideSelect = (peptideTag) => {
        setSelectedPeptideTags(prev => {
            if (prev.includes(peptideTag)) {
                return prev.filter(t => t !== peptideTag);
            }
            return [...prev, peptideTag];
        });
    };

    // Handle peptide hover
    const handlePeptideHover = (peptideTag) => {
        setHoverPeptideTag(peptideTag);
    };

    // Handle selection of peptides in SequenceViewer
    const handleSequencePeptideClick = (peptide) => {
        handlePeptideSelect(peptide.tag);
    };

    if (!selectedProtein) {
        return <Loading />;
    }

    // View toggle options
    const viewOptions = [
        { value: "sequence", label: "Sequence View" },
        { value: "correlation", label: "Correlation Matrix" },
        { value: "position", label: "Position Profile" }
    ];

    // Get samples from peptidesData or correlationData
    const samples = useMemo(() => {
        if (peptidesData?.samples && _.isArray(peptidesData.samples)) {
            return peptidesData.samples;
        }
        if (correlationData?.samples && _.isArray(correlationData.samples)) {
            return correlationData.samples;
        }
        return displayCorrelation.samples;
    }, [peptidesData, correlationData, displayCorrelation]);

    return (
        <div className="div--expand" style={{ overflowY: "auto", height: "90vh", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3>Peptide Mapping & Analysis</h3>

            {/* Protein info */}
            <div
                style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    border: "1px solid #e9ecef"
                }}
            >
                <div><strong>Protein:</strong> {selectedProtein.name || selectedProtein.tag}</div>
                <div><strong>Tag:</strong> {selectedProtein.tag}</div>
                <div><strong>Length:</strong> {selectedProtein.sequence.length} amino acids</div>
                <div><strong>All Peptides:</strong> {selectedProtein.peptides.length} (Reference + Identified)</div>
                <div><strong>Identified Peptides:</strong> {identifiedPeptideTags.length} (with intensities)</div>
                <div><strong>Selected:</strong> {selectedPeptideTags.length} peptides for intensity analysis</div>
            </div>

            {/* Search bar */}
            <div style={{ maxWidth: "600px" }}>
                <input
                    type="text"
                    placeholder="Search peptides by tag, sequence, or modification..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    style={{ width: "100%", padding: "8px", fontSize: "14px" }}
                />
            </div>

            {/* TOP ROW: Sequence Viewer + Intensity Plot */}
            <div style={{ display: "flex", gap: "1rem", minHeight: "400px" }}>
                {/* Sequence Viewer (left, 60%) - Shows ALL peptides */}
                <div style={{ flex: 2, minWidth: "400px" }}>
                    <SequenceViewer
                        sequence={selectedProtein.sequence}
                        peptides={selectedProtein.peptides}
                        charactersPerLine={60}
                        searchTerm={searchTerm}
                        onPeptideClick={handleSequencePeptideClick}
                        onPeptideHover={handlePeptideHover}
                        colors={{
                            background: "#f8f9fa",
                            text: "#212529",
                            peptideDefault: "#4285f4",
                            peptideHover: "#ff6b6b",
                            peptideMatch: "#51cf66",
                            highlight: "#ffeaa7"
                        }}
                    />
                </div>

                {/* Intensity Plot (right, 40%) - Shows only identified peptides WITH intensities */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                        Peptide Intensities Across Samples
                    </div>
                    <WithPeptideIntensities
                        Component={PeptideIntensityPlot}
                        peptide_tags={selectedPeptideTags.length > 0 ? selectedPeptideTags : identifiedPeptideTags}
                        sample_tags={samples}
                        selectedPeptideTags={selectedPeptideTags}
                        hoverPeptideTag={hoverPeptideTag}
                        width="100%"
                        height={350}
                        onPeptideHover={handlePeptideHover}
                    />
                    
                    {/* Selected peptides list with deselect option */}
                    {selectedPeptideTags.length > 0 && (
                        <div
                            style={{
                                marginTop: "1rem",
                                padding: "10px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "4px",
                                border: "1px solid #e9ecef"
                            }}
                        >
                            <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "13px" }}>
                                Selected Peptides ({selectedPeptideTags.length}):
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {selectedPeptideTags.map(peptideTag => {
                                    const peptide = selectedProtein.peptides.find(p => p.tag === peptideTag);
                                    return (
                                        <div
                                            key={peptideTag}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.25rem",
                                                padding: "4px 8px",
                                                backgroundColor: "#e3f2fd",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => handlePeptideSelect(peptideTag)}
                                            title={`Click to deselect`}
                                        >
                                            <span style={{ fontFamily: "monospace" }}>{peptideTag}</span>
                                            <span style={{ color: "#6c757d", fontSize: "11px", marginLeft: "0.25rem" }}>
                                                \u00d7
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setSelectedPeptideTags([])}
                                style={{
                                    marginTop: "0.5rem",
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    backgroundColor: "transparent",
                                    border: "1px solid #dee2e6",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    color: "#6c757d"
                                }}
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                    
                    {/* Show hint when no peptides selected */}
                    {selectedPeptideTags.length === 0 && identifiedPeptideTags.length > 0 && (
                        <div
                            style={{
                                marginTop: "1rem",
                                padding: "8px",
                                backgroundColor: "#fff3cd",
                                borderRadius: "4px",
                                border: "1px solid #ffc107",
                                fontSize: "12px",
                                color: "#856404"
                            }}
                        >
                            <strong>Tip:</strong> Click on peptides in the sequence to select them for intensity analysis.
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM ROW: Toggleable views */}
            <div
                style={{
                    borderTop: "1px solid #e9ecef",
                    paddingTop: "1rem"
                }}
            >
                {/* View toggle */}
                <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>View:</span>
                    {viewOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setActiveView(option.value)}
                            style={{
                                padding: "6px 12px",
                                border: "1px solid #dee2e6",
                                borderRadius: "4px",
                                backgroundColor: activeView === option.value ? "#4285f4" : "white",
                                color: activeView === option.value ? "white" : "#212529",
                                cursor: "pointer",
                                fontSize: "13px"
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Active view */}
                <div style={{ minHeight: "400px" }}>
                    {activeView === "sequence" && (
                        <div style={{ padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px", border: "1px solid #e9ecef" }}>
                            <p>Sequence view is shown in the top row. Use the search and selection tools above.</p>
                        </div>
                    )}
                    
                    {activeView === "correlation" && (
                        <PeptideCorrelationMatrix
                            peptide_tags={identifiedPeptideTags}
                            correlationData={displayCorrelation}
                            hoverPeptideTag={hoverPeptideTag}
                            width="100%"
                            height={400}
                            onPeptideHover={handlePeptideHover}
                        />
                    )}
                    
                    {activeView === "position" && (
                        <PositionCorrelationProfile
                            peptide_tags={identifiedPeptideTags}
                            correlationData={displayCorrelation}
                            hoverPeptideTag={hoverPeptideTag}
                            sequence={selectedProtein.sequence}
                            width="100%"
                            height={400}
                            onPeptideHover={handlePeptideHover}
                        />
                    )}
                </div>
            </div>

            {/* Peptides table */}
            <div style={{ marginTop: "1rem" }}>
                <h3>Peptide Details</h3>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "13px"
                    }}
                >
                    <thead>
                        <tr style={{ backgroundColor: "#f8f9fa" }}>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Tag</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Position</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Sequence</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Score</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Modifications</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #dee2e6" }}>Submission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProtein.peptides
                            .filter(peptide => {
                                if (!searchTerm) return true;
                                const lowerSearch = searchTerm.toLowerCase();
                                const tagMatch = peptide.tag && peptide.tag.toLowerCase().includes(lowerSearch);
                                const seqMatch = peptide.sequence && peptide.sequence.toLowerCase().includes(lowerSearch);
                                const modMatch = peptide.modifications && peptide.modifications.some(m => m.toLowerCase().includes(lowerSearch));
                                return tagMatch || seqMatch || modMatch;
                            })
                            .map(peptide => (
                                <tr
                                    key={peptide.tag}
                                    style={{
                                        backgroundColor: selectedPeptideTags.includes(peptide.tag) ? "#e3f2fd" : "transparent",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => handlePeptideSelect(peptide.tag)}
                                    onMouseEnter={() => handlePeptideHover(peptide.tag)}
                                    onMouseLeave={() => handlePeptideHover(null)}
                                >
                                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>
                                        <span style={{ fontFamily: "monospace" }}>{peptide.tag}</span>
                                    </td>
                                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>
                                        {peptide.start}-{peptide.end}
                                    </td>
                                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>
                                        <span style={{ fontFamily: "monospace" }}>{peptide.sequence}</span>
                                    </td>
                                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>
                                        {peptide.score?.toFixed(1)}
                                    </td>
                                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>
                                        {peptide.modifications?.length > 0 ? peptide.modifications.join(", ") : "-"}
                                    </td>
                                    <td style={{ padding: "8px", borderBottom: "1px solid #dee2e6" }}>
                                        <span style={{ fontFamily: "monospace", fontSize: "0.85em" }}>{peptide.submission_tag}</span>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PeptidesViz;
