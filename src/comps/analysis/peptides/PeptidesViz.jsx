import { useMemo, useState } from "react";
import _ from "lodash";

import { Loading } from "@/comps/core/base/states/Loading";
import { Combobox } from "../../core/input/Combobox";

import SequenceViewer from "./SequenceViewer";

/**
 * Example peptide data for demonstration
 * In production, this will come from the API
 */
const EXAMPLE_PROTEINS = [
    {
        tag: "P12345",
        name: "Example Protein 1",
        sequence: "MKTIIALSYIFCLVFAGEAMSLEQVAQDITTQGLQGLTGLQAPVLQAALREAGLESVTGLRPRGSHAAATRACLEAAAGPEALGAQAPLQGALQAGLQAPVLEAALQAGLQAPVLEAALQAGLQAP",
        peptides: [
            { id: 0, start: 1, end: 10, sequence: "MKTIIALSYI", score: 95.5, intensity: 12345.67, missedCleavages: 0, modifications: [] },
            { id: 1, start: 11, end: 25, sequence: "FCLVFAGEAMSLEQ", score: 88.2, intensity: 8765.43, missedCleavages: 0, modifications: ["Carbamidomethyl (C)"] },
            { id: 2, start: 26, end: 40, sequence: "VAQDITTQGLQGLTG", score: 92.1, intensity: 15678.90, missedCleavages: 1, modifications: [] },
            { id: 3, start: 26, end: 35, sequence: "VAQDITTQGL", score: 78.3, intensity: 6543.21, missedCleavages: 0, modifications: [] },
            { id: 4, start: 41, end: 55, sequence: "LQAPVLQAALREAGL", score: 91.7, intensity: 11234.56, missedCleavages: 0, modifications: [] },
            { id: 5, start: 56, end: 70, sequence: "ESVTGLRPRGSHAAA", score: 85.4, intensity: 9876.54, missedCleavages: 1, modifications: [] },
            { id: 6, start: 71, end: 85, sequence: "TRACLEAAAGPEALG", score: 89.8, intensity: 13456.78, missedCleavages: 0, modifications: [] },
            { id: 7, start: 86, end: 100, sequence: "AQAPLQGALQAGLQA", score: 93.2, intensity: 14567.89, missedCleavages: 0, modifications: [] },
            { id: 8, start: 101, end: 120, sequence: "PVLEAALQAGLQAPVL", score: 87.6, intensity: 10234.56, missedCleavages: 1, modifications: [] }
        ]
    },
    {
        tag: "P67890",
        name: "Example Protein 2",
        sequence: "MAGICSEQUENCEDEMOFORPEPTIDEMAPPINGANDVISUALIZATIONTESTINGPURPOSESONLYTHANKYOU",
        peptides: [
            { id: 0, start: 1, end: 10, sequence: "MAGICSEQU", score: 99.9, intensity: 50000.00, missedCleavages: 0, modifications: [] },
            { id: 1, start: 11, end: 20, sequence: "NCEDMOFORP", score: 95.0, intensity: 45000.00, missedCleavages: 0, modifications: [] },
            { id: 2, start: 21, end: 30, sequence: "EPTIDEMAPP", score: 90.0, intensity: 40000.00, missedCleavages: 0, modifications: [] },
            { id: 3, start: 21, end: 28, sequence: "EPTIDEMA", score: 75.0, intensity: 25000.00, missedCleavages: 1, modifications: ["Oxidation (M)"] },
            { id: 4, start: 31, end: 40, sequence: "INGANDVISU", score: 88.0, intensity: 38000.00, missedCleavages: 0, modifications: [] },
            { id: 5, start: 41, end: 50, sequence: "ALIZATIONTE", score: 92.0, intensity: 42000.00, missedCleavages: 0, modifications: [] },
            { id: 6, start: 51, end: 60, sequence: "STINGPURPO", score: 85.0, intensity: 35000.00, missedCleavages: 0, modifications: [] }
        ]
    }
];

/**
 * Main peptides visualization component.
 * Displays protein sequences with mapped peptides.
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

    // Use example data if no API data is available
    const displayData = useMemo(() => {
        // If peptidesData is available from API, use it
        if (peptidesData && _.isArray(peptidesData.proteins)) {
            return peptidesData.proteins;
        }
        // Otherwise use example data
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

    if (isLoading) return <Loading />;
    if (!isReady) return <Loading />;

    return (
        <div className="div--expand" style={{ overflowY: "auto", height: "90vh" }}>
            <h2>Peptide Mapping</h2>

            {/* Protein selection */}
            {displayData.length > 1 && (
                <div style={{ marginBottom: "1rem", maxWidth: "600px" }}>
                    <Combobox
                        selectedItems={[proteinItems[selectedProteinIndex]?.tag]}
                        onChange={(item) => setSelectedProteinIndex(item.index)}
                        items={proteinItems}
                        placeholder="Select a protein"
                    />
                </div>
            )}

            {/* Protein info */}
            <div
                style={{
                    marginBottom: "1rem",
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
            </div>

            {/* Sequence viewer */}
            <SequenceViewer
                sequence={selectedProtein.sequence}
                peptides={selectedProtein.peptides}
                charactersPerLine={60}
            />

            {/* Peptides table */}
            <div style={{ marginTop: "2rem" }}>
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
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Sequence</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Position</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Length</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Score</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Intensity</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Missed Cleavages</th>
                            <th style={{ padding: "8px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Modifications</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedProtein.peptides.map((peptide, idx) => (
                            <tr
                                key={peptide.id || idx}
                                style={{
                                    borderBottom: "1px solid #dee2e6",
                                    backgroundColor: idx % 2 === 0 ? "white" : "#f8f9fa"
                                }}
                            >
                                <td style={{ padding: "8px" }}>{idx + 1}</td>
                                <td style={{ padding: "8px", fontFamily: "monospace" }}>
                                    {peptide.sequence || selectedProtein.sequence.slice(peptide.start - 1, peptide.end)}
                                </td>
                                <td style={{ padding: "8px" }}>{peptide.start}-{peptide.end}</td>
                                <td style={{ padding: "8px" }}>{peptide.end - peptide.start + 1}</td>
                                <td style={{ padding: "8px" }}>{peptide.score?.toFixed(2) || "-"}</td>
                                <td style={{ padding: "8px" }}>{peptide.intensity?.toFixed(2) || "-"}</td>
                                <td style={{ padding: "8px" }}>{peptide.missedCleavages || 0}</td>
                                <td style={{ padding: "8px" }}>
                                    {peptide.modifications?.join(", ") || "-"}
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

