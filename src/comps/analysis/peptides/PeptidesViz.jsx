import { useMemo, useState } from "react";
import _ from "lodash";

import { Loading } from "@/comps/core/base/states/Loading";
import { Combobox } from "../../core/input/Combobox";

import SequenceViewer from "./SequenceViewer";
import PeptideIntensityPlot from "./PeptideIntensityPlot";
import PeptideCorrelationMatrix from "./PeptideCorrelationMatrix";
import PositionCorrelationProfile from "./PositionCorrelationProfile";

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
            { tag: "PEP_001_001", start: 1, end: 10, sequence: "MKTIIALSYI", score: 95.5, missedCleavages: 0, modifications: [], submission_tag: "SUB_001", intensities: { SAMPLE_A: 12345, SAMPLE_B: 9876, SAMPLE_C: 11234, SAMPLE_D: 10567 } },
            { tag: "PEP_001_002", start: 11, end: 25, sequence: "FCLVFAGEAMSLEQ", score: 88.2, missedCleavages: 0, modifications: ["Carbamidomethyl (C)"], submission_tag: "SUB_001", intensities: { SAMPLE_A: 8765, SAMPLE_B: 7654, SAMPLE_C: 9876, SAMPLE_D: 8765 } },
            { tag: "PEP_001_003", start: 26, end: 40, sequence: "VAQDITTQGLQGLTG", score: 92.1, missedCleavages: 1, modifications: [], submission_tag: "SUB_001", intensities: { SAMPLE_A: 15678, SAMPLE_B: 14567, SAMPLE_C: 16789, SAMPLE_D: 15678 } },
            { tag: "PEP_001_004", start: 26, end: 35, sequence: "VAQDITTQGL", score: 78.3, missedCleavages: 0, modifications: [], submission_tag: "SUB_001", intensities: { SAMPLE_A: 6543, SAMPLE_B: 5432, SAMPLE_C: 7654, SAMPLE_D: 6543 } },
            { tag: "PEP_001_005", start: 41, end: 55, sequence: "LQAPVLQAALREAGL", score: 91.7, missedCleavages: 0, modifications: [], submission_tag: "SUB_001", intensities: { SAMPLE_A: 11234, SAMPLE_B: 10234, SAMPLE_C: 12345, SAMPLE_D: 11234 } },
            { tag: "PEP_001_006", start: 56, end: 70, sequence: "ESVTGLRPRGSHAAA", score: 85.4, missedCleavages: 1, modifications: [], submission_tag: "SUB_001", intensities: { SAMPLE_A: 9876, SAMPLE_B: 8765, SAMPLE_C: 10987, SAMPLE_D: 9876 } },
            { tag: "PEP_001_007", start: 71, end: 85, sequence: "TRACLEAAAGPEALG", score: 89.8, missedCleavages: 0, modifications: [], submission_tag: "SUB_001", intensities: { SAMPLE_A: 13456, SAMPLE_B: 12345, SAMPLE_C: 14567, SAMPLE_D: 13456 } },
            { tag: "PEP_001_008", start: 86, end: 100, sequence: "AQAPLQGALQAGLQA", score: 93.2, missedCleavages: 0, modifications: [], submission_tag: "SUB_001", intensities: { SAMPLE_A: 14567, SAMPLE_B: 13456, SAMPLE_C: 15678, SAMPLE_D: 14567 } },
            { tag: "PEP_001_009", start: 101, end: 120, sequence: "PVLEAALQAGLQAPVL", score: 87.6, missedCleavages: 1, modifications: [], submission_tag: "SUB_001", intensities: { SAMPLE_A: 10234, SAMPLE_B: 9234, SAMPLE_C: 11234, SAMPLE_D: 10234 } }
        ]
    },
    {
        tag: "PROT_002",
        name: "Example Protein 2 - Reference",
        sequence: "MAGICSEQUENCEDEMOFORPEPTIDEMAPPINGANDVISUALIZATIONTESTINGPURPOSESONLYTHANKYOU",
        peptides: [
            { tag: "PEP_REF_001", start: 1, end: 10, sequence: "MAGICSEQU", score: 99.9, missedCleavages: 0, modifications: [], submission_tag: "REF_001", intensities: { SAMPLE_A: 50000, SAMPLE_B: 45000, SAMPLE_C: 48000, SAMPLE_D: 47000 } },
            { tag: "PEP_REF_002", start: 11, end: 20, sequence: "NCEDMOFORP", score: 95.0, missedCleavages: 0, modifications: [], submission_tag: "REF_001", intensities: { SAMPLE_A: 45000, SAMPLE_B: 42000, SAMPLE_C: 44000, SAMPLE_D: 43000 } },
            { tag: "PEP_REF_003", start: 21, end: 30, sequence: "EPTIDEMAPP", score: 90.0, missedCleavages: 0, modifications: [], submission_tag: "REF_001", intensities: { SAMPLE_A: 40000, SAMPLE_B: 38000, SAMPLE_C: 39000, SAMPLE_D: 38500 } },
            { tag: "PEP_REF_004", start: 21, end: 28, sequence: "EPTIDEMA", score: 75.0, missedCleavages: 1, modifications: ["Oxidation (M)"], submission_tag: "REF_001", intensities: { SAMPLE_A: 25000, SAMPLE_B: 23000, SAMPLE_C: 24000, SAMPLE_D: 23500 } },
            { tag: "PEP_REF_005", start: 31, end: 40, sequence: "INGANDVISU", score: 88.0, missedCleavages: 0, modifications: [], submission_tag: "REF_001", intensities: { SAMPLE_A: 38000, SAMPLE_B: 36000, SAMPLE_C: 37000, SAMPLE_D: 36500 } },
            { tag: "PEP_REF_006", start: 41, end: 50, sequence: "ALIZATIONTE", score: 92.0, missedCleavages: 0, modifications: [], submission_tag: "REF_001", intensities: { SAMPLE_A: 42000, SAMPLE_B: 40000, SAMPLE_C: 41000, SAMPLE_D: 40500 } },
            { tag: "PEP_REF_007", start: 51, end: 60, sequence: "STINGPURPO", score: 85.0, missedCleavages: 0, modifications: [], submission_tag: "REF_001", intensities: { SAMPLE_A: 35000, SAMPLE_B: 33000, SAMPLE_C: 34000, SAMPLE_D: 33500 } }
        ]
    }
];

/**
 * Main peptides visualization component.
 * Displays protein sequences with mapped peptides and intensity profiles.
 */
function PeptidesViz({
    submission_tag,
    peptidesData,
    isLoading,
    caTagMap,
    attributeTagMap,
    proteinTagMap,
    isReady,
    proteinIsLoading,
    proteinSearchResults,
    setRequiredProteinTags,
    showHoverLabels
}) {
    const [selectedProteinIndex, setSelectedProteinIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPeptideTags, setSelectedPeptideTags] = useState([]);
    const [hoverPeptideTag, setHoverPeptideTag] = useState(null);
    const [activeView, setActiveView] = useState("sequence"); // sequence, correlation, position

    // Use example data if no API data is available
    const displayData = useMemo(() => {
        if (peptidesData && _.isArray(peptidesData.proteins)) {
            return peptidesData.proteins;
        }
        return EXAMPLE_PROTEINS;
    }, [peptidesData]);

    // Create combobox items for protein selection
    const proteinItems = useMemo(() => {
        return displayData.map((protein, index) => ({
            tag: protein.tag,
            text: `${protein.name || protein.tag} (${protein.sequence.length} aa, ${protein.peptides.length} peptides)`,
            index
        }));
    }, [displayData]);

    const selectedProtein = displayData[selectedProteinIndex] || displayData[0];

    // Extract sample tags from selected peptides
    const allSampleTags = useMemo(() => {
        const samples = new Set();
        selectedPeptideTags.forEach(tag => {
            const pep = selectedProtein.peptides.find(p => p.tag === tag);
            if (pep?.intensities) {
                Object.keys(pep.intensities).forEach(s => samples.add(s));
            }
        });
        return Array.from(samples).sort();
    }, [selectedPeptideTags, selectedProtein.peptides]);

    // Create intensity data object for visualization components
    const intensityData = useMemo(() => {
        const data = {};
        selectedProtein.peptides.forEach(pep => {
            data[pep.tag] = {
                ...pep,
                intensities: pep.intensities || {}
            };
        });
        return data;
    }, [selectedProtein.peptides]);

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

    if (isLoading) return <Loading />;
    if (!isReady) return <Loading />;

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
            {displayData.length > 1 && (
                <div style={{ maxWidth: "600px" }}>
                    <Combobox
                        selectedItems={[proteinItems[selectedProteinIndex]?.tag]}
                        onChange={(item) => {
                            setSelectedProteinIndex(item.index);
                            setSelectedPeptideTags([]);
                            setHoverPeptideTag(null);
                        }}
                        items={proteinItems}
                        placeholder="Select a protein"
                    />
                </div>
            )}

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
                <div><strong>Peptides Detected:</strong> {selectedProtein.peptides.length}</div>
                <div><strong>Selected:</strong> {selectedPeptideTags.length} peptides for intensity analysis</div>
            </div>

            {/* TOP ROW: Sequence Viewer + Intensity Plot */}
            <div style={{ display: "flex", gap: "1rem", minHeight: "400px" }}>
                {/* Sequence Viewer (left, 60%) */}
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

                {/* Intensity Plot (right, 40%) */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                        Peptide Intensities Across Samples
                    </div>
                    <PeptideIntensityPlot
                        selectedPeptideTags={selectedPeptideTags}
                        hoverPeptideTag={hoverPeptideTag}
                        intensityData={intensityData}
                        sampleTags={allSampleTags}
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
                            selectedPeptideTags={selectedPeptideTags}
                            hoverPeptideTag={hoverPeptideTag}
                            intensityData={intensityData}
                            sampleTags={allSampleTags}
                            width="100%"
                            height={400}
                            onPeptideHover={handlePeptideHover}
                        />
                    )}
                    
                    {activeView === "position" && (
                        <PositionCorrelationProfile
                            selectedPeptideTags={selectedPeptideTags}
                            hoverPeptideTag={hoverPeptideTag}
                            intensityData={intensityData}
                            sampleTags={allSampleTags}
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
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Selected</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProtein.peptides.map((peptide, idx) => {
                            const isSelected = selectedPeptideTags.includes(peptide.tag);
                            const isHovered = hoverPeptideTag === peptide.tag;
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
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handlePeptideSelect(peptide.tag);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
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
