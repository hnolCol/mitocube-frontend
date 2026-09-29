import { useMemo, useState } from "react";
import _ from "lodash";

import { Loading } from "@/comps/core/base/states/Loading";
import { Combobox } from "../../core/input/Combobox";

import SequenceViewer from "./SequenceViewer";
import PeptideIntensityPlot from "./PeptideIntensityPlot";
import PeptideCorrelationMatrix from "./PeptideCorrelationMatrix";
import PositionCorrelationProfile from "./PositionCorrelationProfile";
import WithPeptideIntensities from "./WithPeptideIntensities";

/**
 * Example peptide data for demonstration
 * In production, this will come from the API
 * 
 * Note: Peptides from different submissions can be included to show
 * peptides identified in this submission + peptides from reference submissions
 */
const EXAMPLE_PROTEINS = [
    {
        tag: "PROT_001",
        name: "Example Protein 1 - Cytochrome C",
        sequence: "MKTIIALSYIFCLVFAGEAMSLEQVAQDITTQGLQGLTGLQAPVLQAALREAGLESVTGLRPRGSHAAATRACLEAAAGPEALGAQAPLQGALQAGLQAPVLEAALQAGLQAPVLEAALQAGLQAP",
        peptides: [
            { tag: "PEP_001_001", start: 1, end: 10, sequence: "MKTIIALSYI", score: 95.5, missedCleavages: 0, modifications: [], submission_tag: "SUB_001" },
            { tag: "PEP_001_002", start: 11, end: 25, sequence: "FCLVFAGEAMSLEQ", score: 88.2, missedCleavages: 0, modifications: ["Carbamidomethyl (C)"], submission_tag: "SUB_001" },
            { tag: "PEP_001_003", start: 26, end: 40, sequence: "VAQDITTQGLQGLTG", score: 92.1, missedCleavages: 1, modifications: [], submission_tag: "SUB_001" },
            { tag: "PEP_001_004", start: 26, end: 35, sequence: "VAQDITTQGL", score: 78.3, missedCleavages: 0, modifications: [], submission_tag: "SUB_001" },
            { tag: "PEP_001_005", start: 41, end: 55, sequence: "LQAPVLQAALREAGL", score: 91.7, missedCleavages: 0, modifications: [], submission_tag: "SUB_001" },
            { tag: "PEP_001_006", start: 56, end: 70, sequence: "ESVTGLRPRGSHAAA", score: 85.4, missedCleavages: 1, modifications: [], submission_tag: "SUB_001" },
            { tag: "PEP_001_007", start: 71, end: 85, sequence: "TRACLEAAAGPEALG", score: 89.8, missedCleavages: 0, modifications: [], submission_tag: "SUB_001" },
            { tag: "PEP_001_008", start: 86, end: 100, sequence: "AQAPLQGALQAGLQA", score: 93.2, missedCleavages: 0, modifications: [], submission_tag: "SUB_001" },
            { tag: "PEP_001_009", start: 101, end: 120, sequence: "PVLEAALQAGLQAPVL", score: 87.6, missedCleavages: 1, modifications: [], submission_tag: "SUB_001" },
            // Reference peptides (no intensities)
            { tag: "PEP_REF_001", start: 5, end: 15, sequence: "IALSYIFCLVF", score: 99.9, missedCleavages: 0, modifications: [], submission_tag: "REF_DB" },
            { tag: "PEP_REF_002", start: 50, end: 65, sequence: "LQAPVLQAALREAGL", score: 95.0, missedCleavages: 0, modifications: [], submission_tag: "REF_DB" }
        ]
    },
    {
        tag: "PROT_002",
        name: "Example Protein 2 - Reference",
        sequence: "MAGICSEQUENCEDEMOFORPEPTIDEMAPPINGANDVISUALIZATIONTESTINGPURPOSESONLYTHANKYOU",
        peptides: [
            { tag: "PEP_REF_003", start: 1, end: 10, sequence: "MAGICSEQU", score: 99.9, missedCleavages: 0, modifications: [], submission_tag: "REF_DB" },
            { tag: "PEP_REF_004", start: 11, end: 20, sequence: "NCEDMOFORP", score: 95.0, missedCleavages: 0, modifications: [], submission_tag: "REF_DB" },
            { tag: "PEP_REF_005", start: 21, end: 30, sequence: "EPTIDEMAPP", score: 90.0, missedCleavages: 0, modifications: [], submission_tag: "REF_DB" },
            { tag: "PEP_REF_006", start: 31, end: 40, sequence: "INGANDVISU", score: 88.0, missedCleavages: 0, modifications: [], submission_tag: "REF_DB" },
            { tag: "PEP_REF_007", start: 41, end: 50, sequence: "ALIZATIONTE", score: 92.0, missedCleavages: 0, modifications: [], submission_tag: "REF_DB" },
            { tag: "PEP_REF_008", start: 51, end: 60, sequence: "STINGPURPO", score: 85.0, missedCleavages: 0, modifications: [], submission_tag: "REF_DB" }
        ]
    }
];

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
 * Example intensity data for demonstration
 * In production, this will come from the prefetch API calls
 */
const EXAMPLE_INTENSITIES = {
    "PEP_001_001": { tag: "PEP_001_001", sequence: "MKTIIALSYI", intensities: { SAMPLE_A: 12345, SAMPLE_B: 9876, SAMPLE_C: 11234, SAMPLE_D: 10567 } },
    "PEP_001_002": { tag: "PEP_001_002", sequence: "FCLVFAGEAMSLEQ", intensities: { SAMPLE_A: 8765, SAMPLE_B: 7654, SAMPLE_C: 9876, SAMPLE_D: 8765 } },
    "PEP_001_003": { tag: "PEP_001_003", sequence: "VAQDITTQGLQGLTG", intensities: { SAMPLE_A: 15678, SAMPLE_B: 14567, SAMPLE_C: 16789, SAMPLE_D: 15678 } },
    "PEP_001_004": { tag: "PEP_001_004", sequence: "VAQDITTQGL", intensities: { SAMPLE_A: 6543, SAMPLE_B: 5432, SAMPLE_C: 7654, SAMPLE_D: 6543 } },
    "PEP_001_005": { tag: "PEP_001_005", sequence: "LQAPVLQAALREAGL", intensities: { SAMPLE_A: 11234, SAMPLE_B: 10234, SAMPLE_C: 12345, SAMPLE_D: 11234 } },
    "PEP_001_006": { tag: "PEP_001_006", sequence: "ESVTGLRPRGSHAAA", intensities: { SAMPLE_A: 9876, SAMPLE_B: 8765, SAMPLE_C: 10987, SAMPLE_D: 9876 } },
    "PEP_001_007": { tag: "PEP_001_007", sequence: "TRACLEAAAGPEALG", intensities: { SAMPLE_A: 13456, SAMPLE_B: 12345, SAMPLE_C: 14567, SAMPLE_D: 13456 } },
    "PEP_001_008": { tag: "PEP_001_008", sequence: "AQAPLQGALQAGLQA", intensities: { SAMPLE_A: 14567, SAMPLE_B: 13456, SAMPLE_C: 15678, SAMPLE_D: 14567 } },
    "PEP_001_009": { tag: "PEP_001_009", sequence: "PVLEAALQAGLQAPVL", intensities: { SAMPLE_A: 10234, SAMPLE_B: 9234, SAMPLE_C: 11234, SAMPLE_D: 10234 } }
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
 * @param {Object} props.peptidesData - Data from API call 1: { proteins: [...] }
 * @param {Object} props.correlationData - Data from API call 2: { peptide_tags: [...], correlation_matrix: [...], samples: [...] }
 * @param {string} props.submission_tag - Current submission tag
 * @param {string} props.selectedProteinTag - Currently selected protein tag
 * @param {Function} props.setSelectedProteinTag - Callback to change selected protein
 * @param {string[]} props.selectedPeptideTags - Currently selected peptide tags
 * @param {Function} props.setSelectedPeptideTags - Callback to change selected peptides
 * @param {string} props.hoverPeptideTag - Currently hovered peptide tag
 * @param {Function} props.setHoverPeptideTag - Callback to change hovered peptide
 * @param {string[]} props.ca_tags - Condition application tags
 * @param {string[]} props.attribute_tags - Attribute tags
 * @param {Map} props.caTagMap - Condition application tag map
 * @param {Map} props.attributeTagMap - Attribute tag map
 * @param {Map} props.proteinTagMap - Protein tag map
 * @param {Function} props.setRequiredProteinTags - Callback for protein search
 * @returns {JSX.Element}
 */
function PeptidesViz({
    submission_tag,
    peptidesData,
    correlationData,
    selectedProteinTag,
    setSelectedProteinTag,
    setRequiredProteinTags,
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

    // Use example data if no API data is available
    const displayData = useMemo(() => {
        if (peptidesData && _.isArray(peptidesData.proteins)) {
            return peptidesData;
        }
        return { proteins: EXAMPLE_PROTEINS, samples: ["SAMPLE_A", "SAMPLE_B", "SAMPLE_C", "SAMPLE_D"] };
    }, [peptidesData]);

    // Use example correlation data if not available
    const displayCorrelation = useMemo(() => {
        if (correlationData && _.isArray(correlationData.peptide_tags)) {
            return correlationData;
        }
        return EXAMPLE_CORRELATION;
    }, [correlationData]);

    // Create combobox items for protein selection
    const proteinItems = useMemo(() => {
        return displayData.proteins.map((protein, index) => ({
            tag: protein.tag,
            text: `${protein.name || protein.tag} (${protein.sequence.length} aa, ${protein.peptides.length} peptides)`,
            index
        }));
    }, [displayData.proteins]);

    // Find selected protein
    const selectedProtein = useMemo(() => {
        if (!selectedProteinTag) {
            return displayData.proteins[0] || null;
        }
        return displayData.proteins.find(p => p.tag === selectedProteinTag) || displayData.proteins[0];
    }, [displayData.proteins, selectedProteinTag]);

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

    // Handle protein selection
    const handleProteinSelect = (item) => {
        setSelectedProteinTag(item.tag);
        setSelectedPeptideTags([]);
        setHoverPeptideTag(null);
    };

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

    return (
        <div className="div--expand" style={{ overflowY: "auto", height: "90vh", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2>Peptide Mapping & Analysis</h2>

            {/* Protein selection */}
            <div style={{ maxWidth: "600px" }}>
                <Combobox
                    selectedItems={[selectedProteinTag || displayData.proteins[0]?.tag]}
                    onChange={handleProteinSelect}
                    items={proteinItems}
                    placeholder="Select a protein"
                />
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
                        sample_tags={displayData.samples || displayCorrelation.samples}
                        selectedPeptideTags={selectedPeptideTags}
                        hoverPeptideTag={hoverPeptideTag}
                        width="100%"
                        height={350}
                        onPeptideHover={handlePeptideHover}
                    />
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
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>#</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Tag</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Sequence</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Position</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Length</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Score</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Missed Cleavages</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Modifications</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Submission</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Has Intensities</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Selected</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProtein.peptides.map((peptide, idx) => {
                            const isSelected = selectedPeptideTags.includes(peptide.tag);
                            const isHovered = hoverPeptideTag === peptide.tag;
                            const hasIntensities = identifiedPeptideTags.includes(peptide.tag);
                            return (
                                <tr
                                    key={peptide.tag || idx}
                                    style={{
                                        borderBottom: "1px solid #dee2e6",
                                        backgroundColor: isSelected ? "#e3f2fd" : idx % 2 === 0 ? "white" : "#f8f9fa"
                                    }}
                                    onMouseEnter={() => handlePeptideHover(peptide.tag)}
                                    onMouseLeave={() => handlePeptideHover(null)}
                                    onClick={() => handlePeptideSelect(peptide.tag)}
                                >
                                    <td style={{ padding: "8px", cursor: "pointer" }}>{idx + 1}</td>
                                    <td style={{ padding: "8px", fontFamily: "monospace", cursor: "pointer" }}>{peptide.tag || "-"}</td>
                                    <td style={{ padding: "8px", fontFamily: "monospace", cursor: "pointer" }}>
                                        {peptide.sequence || selectedProtein.sequence.slice(peptide.start - 1, peptide.end)}
                                    </td>
                                    <td style={{ padding: "8px", cursor: "pointer" }}>{peptide.start}-{peptide.end}</td>
                                    <td style={{ padding: "8px", cursor: "pointer" }}>{peptide.end - peptide.start + 1}</td>
                                    <td style={{ padding: "8px", cursor: "pointer" }}>{peptide.score?.toFixed(2) || "-"}</td>
                                    <td style={{ padding: "8px", cursor: "pointer" }}>{peptide.missedCleavages || 0}</td>
                                    <td style={{ padding: "8px", cursor: "pointer" }}>{peptide.modifications?.join(", ") || "-"}</td>
                                    <td style={{ padding: "8px", cursor: "pointer" }}>{peptide.submission_tag || "-"}</td>
                                    <td style={{ padding: "8px", cursor: "pointer" }}>
                                        {hasIntensities ? "✓" : "✗"}
                                    </td>
                                    <td style={{ padding: "8px", cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handlePeptideSelect(peptide.tag);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            disabled={!hasIntensities}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PeptidesViz;
