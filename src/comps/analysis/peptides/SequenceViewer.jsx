import { useMemo, useState } from "react";
import _ from "lodash";

/**
 * SequenceViewer component for visualizing peptides mapped to a protein sequence.
 * 
 * @param {Object} props
 * @param {string} props.sequence - The protein amino acid sequence (e.g., "MKTIIALSYIFCLVFA...")
 * @param {Array<Object>} props.peptides - Array of peptide objects to display on the sequence
 * @param {number} [props.charactersPerLine=60] - Number of amino acids to display per line
 * @param {number} [props.charWidth=14] - Width of each character in pixels
 * @param {number} [props.lineHeight=24] - Height of each line in pixels
 * @param {Object} [props.colors] - Custom colors for peptide highlights
 * @param {string} [props.searchTerm=""] - Optional search term to filter/highlight peptides
 * @param {Function} [props.onPeptideClick] - Callback when a peptide is clicked: (peptide) => void
 * @param {Function} [props.onPeptideHover] - Callback when a peptide is hovered: (peptide) => void
 * @returns {JSX.Element}
 * 
 * @example
 * // Example peptides array:
 * const peptides = [
 *   {
 *     tag: "PEP_001_001",           // Unique identifier for the peptide
 *     start: 1,                     // 1-indexed start position in the sequence
 *     end: 10,                      // 1-indexed end position in the sequence
 *     sequence: "MKTIIALSYI",       // Amino acid sequence (optional, derived from sequence if missing)
 *     score: 95.5,                  // Quality score (optional)
 *     intensity: 12345.67,          // Signal intensity (optional)
 *     missedCleavages: 0,          // Number of missed cleavages (optional)
 *     modifications: ["Carbamidomethyl (C)"], // Array of modifications (optional)
 *     submission_tag: "SUB_001"    // Source submission tag (optional)
 *   },
 *   {
 *     tag: "PEP_001_002",
 *     start: 11,
 *     end: 25,
 *     sequence: "FCLVFAGEAMSLEQ",
 *     score: 88.2,
 *     modifications: ["Carbamidomethyl (C)"]
 *   }
 *   // Note: Multiple peptides can have the same start/end positions
 *   // (e.g., from missed cleavages or different charge states)
 * ]
 * 
 * // Usage:
 * <SequenceViewer
 *   sequence="MKTIIALSYIFCLVFAGEAMSLEQ..."
 *   peptides={peptides}
 *   onPeptideClick={(peptide) => console.log("Selected:", peptide.tag)}
 *   onPeptideHover={(peptide) => console.log("Hovered:", peptide.tag)}
 * />
 */
function SequenceViewer({
    sequence = "",
    peptides = [],
    charactersPerLine = 60,
    charWidth = 14,
    lineHeight = 24,
    colors = {
        background: "#f8f9fa",
        text: "#212529",
        peptideDefault: "#4285f4",
        peptideHover: "#ff6b6b",
        peptideMatch: "#51cf66",
        highlight: "#ffeaa7"
    },
    searchTerm = "",
    onPeptideClick,
    onPeptideHover
}) {
    const [hoveredPeptide, setHoveredPeptide] = useState(null);
    const [selectedPeptide, setSelectedPeptide] = useState(null);

    // Filter peptides by search term (search in tag, sequence, or modifications)
    const filteredPeptides = useMemo(() => {
        if (!searchTerm) return peptides;
        const lowerSearch = searchTerm.toLowerCase();
        return peptides.filter(peptide => {
            const tagMatch = peptide.tag && peptide.tag.toLowerCase().includes(lowerSearch);
            const seqMatch = peptide.sequence && peptide.sequence.toLowerCase().includes(lowerSearch);
            const modMatch = peptide.modifications && peptide.modifications.some(m => m.toLowerCase().includes(lowerSearch));
            return tagMatch || seqMatch || modMatch;
        });
    }, [peptides, searchTerm]);

    // Group peptides by their position ranges
    const peptideGroups = useMemo(() => {
        const groups = {};
        filteredPeptides.forEach((peptide, idx) => {
            const key = `${peptide.start}-${peptide.end}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push({ ...peptide, originalIndex: idx });
        });
        return groups;
    }, [filteredPeptides]);

    // Check if a peptide matches the search term
    const isPeptideMatch = (peptide) => {
        if (!searchTerm) return false;
        const lowerSearch = searchTerm.toLowerCase();
        const tagMatch = peptide.tag && peptide.tag.toLowerCase().includes(lowerSearch);
        const seqMatch = peptide.sequence && peptide.sequence.toLowerCase().includes(lowerSearch);
        const modMatch = peptide.modifications && peptide.modifications.some(m => m.toLowerCase().includes(lowerSearch));
        return tagMatch || seqMatch || modMatch;
    };

    // Generate color for each peptide based on its tag
    const getPeptideColor = (peptideTag, isMatch = false) => {
        if (peptideTag) {
            let hash = 0;
            for (let i = 0; i < peptideTag.length; i++) {
                hash = peptideTag.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash) % 360;
            return isMatch ? colors.peptideMatch : `hsl(${hue}, 80%, 60%)`;
        }
        return colors.peptideDefault;
    };

    const handlePeptideClick = (peptide) => {
        setSelectedPeptide(selectedPeptide?.tag === peptide.tag ? null : peptide);
        if (onPeptideClick) {
            onPeptideClick(peptide);
        }
    };

    const handlePeptideMouseEnter = (peptide) => {
        setHoveredPeptide(peptide);
        if (onPeptideHover) {
            onPeptideHover(peptide);
        }
    };

    const handlePeptideMouseLeave = () => {
        setHoveredPeptide(null);
        if (onPeptideHover) {
            onPeptideHover(null);
        }
    };

    // Calculate peptide position for rendering
    const getPeptidePosition = (start, end) => {
        const lineIndex = Math.floor(start / charactersPerLine);
        const lineStart = lineIndex * charactersPerLine;
        const x = (start - lineStart) * charWidth;
        const width = (end - start + 1) * charWidth;
        const y = lineIndex * lineHeight;
        return { x, y, width, lineIndex };
    };

    // Generate lines from the sequence
    const sequenceLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i < sequence.length; i += charactersPerLine) {
            lines.push(sequence.slice(i, i + charactersPerLine));
        }
        return lines;
    }, [sequence, charactersPerLine]);

    // Count matching peptides
    const matchCount = useMemo(() => {
        return filteredPeptides.length;
    }, [filteredPeptides]);

    // Calculate total width and height
    const totalWidth = charactersPerLine * charWidth + 100; // Extra space for position numbers
    const totalHeight = sequenceLines.length * lineHeight + 40;

    return (
        <div className="sequence-viewer" style={{ fontFamily: "monospace", margin: "1rem 0" }}>
            <div style={{ marginBottom: "1rem" }}>
                <strong>Protein Sequence:</strong> {sequence.length} amino acids
                {peptides.length > 0 && (
                    <span style={{ marginLeft: "1rem" }}>
                        <strong>Peptides:</strong> {peptides.length} total
                        {searchTerm && matchCount > 0 && (
                            <span style={{ marginLeft: "0.5rem" }}>
                                (<strong>{matchCount}</strong> matching search)
                            </span>
                        )}
                        {searchTerm && matchCount === 0 && (
                            <span style={{ marginLeft: "0.5rem", color: "#dc3545" }}>
                                (No matches)
                            </span>
                        )}
                    </span>
                )}
            </div>

            <div
                style={{
                    position: "relative",
                    width: `${totalWidth}px`,
                    minHeight: `${totalHeight}px`,
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    overflow: "auto",
                    backgroundColor: colors.background
                }}
            >
                {/* SVG overlay for peptide highlights */}
                <svg
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none"
                    }}
                >
                    {/* Render peptide highlights */}
                    {Object.entries(peptideGroups).map(([key, groupPeptides]) => {
                        const peptide = groupPeptides[0];
                        const { x, y, width } = getPeptidePosition(peptide.start - 1, peptide.end - 1);
                        const height = lineHeight - 4;
                        
                        // For overlapping peptides at same position, stack them
                        return groupPeptides.map((p, idx) => {
                            const offset = idx * 2;
                            const pIsMatch = isPeptideMatch(p);
                            return (
                                <rect
                                    key={`${p.tag || p.originalIndex}-${idx}`}
                                    x={x + 50} // Offset for position numbers
                                    y={y + 2 + offset}
                                    width={width}
                                    height={height - offset}
                                    fill={hoveredPeptide?.tag === p.tag ? colors.peptideHover : getPeptideColor(p.tag, pIsMatch)}
                                    fillOpacity={pIsMatch ? 0.5 : 0.3}
                                    stroke={hoveredPeptide?.tag === p.tag ? colors.peptideHover : getPeptideColor(p.tag, pIsMatch)}
                                    strokeWidth={pIsMatch ? 2 : 1}
                                    rx={2}
                                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                                    onMouseEnter={() => handlePeptideMouseEnter(p)}
                                    onMouseLeave={handlePeptideMouseLeave}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePeptideClick(p);
                                    }}
                                />
                            );
                        });
                    })}
                </svg>

                {/* Sequence lines with position numbers */}
                <div style={{ padding: "10px 0" }}>
                    {sequenceLines.map((line, lineIndex) => {
                        const startPos = lineIndex * charactersPerLine + 1;
                        return (
                            <div
                                key={lineIndex}
                                style={{
                                    display: "flex",
                                    marginBottom: "4px",
                                    minHeight: `${lineHeight}px`,
                                    alignItems: "center"
                                }}
                            >
                                {/* Position numbers */}
                                <div
                                    style={{
                                        width: "40px",
                                        textAlign: "right",
                                        paddingRight: "10px",
                                        color: "#6c757d",
                                        fontSize: "11px",
                                        userSelect: "none"
                                    }}
                                >
                                    {startPos}
                                </div>

                                {/* Sequence characters */}
                                <div style={{ display: "flex" }}>
                                    {line.split("").map((aa, charIndex) => {
                                        const globalIndex = lineIndex * charactersPerLine + charIndex;
                                        const position = globalIndex + 1;
                                        
                                        // Check if this position is part of any peptide
                                        const isInPeptide = peptides.some(p => p.start <= position && p.end >= position);
                                        // Check if this position has matching peptides (after search filter)
                                        const hasMatchAtPosition = filteredPeptides.some(p => p.start <= position && p.end >= position);
                                        
                                        return (
                                            <span
                                                key={globalIndex}
                                                style={{
                                                    width: `${charWidth}px`,
                                                    height: `${lineHeight}px`,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: hasMatchAtPosition ? colors.highlight : isInPeptide ? "#e9ecef" : "transparent",
                                                    fontFamily: "monospace",
                                                    fontSize: "12px",
                                                    fontWeight: hasMatchAtPosition ? "bold" : isInPeptide ? "600" : "normal",
                                                    cursor: "default"
                                                }}
                                                title={`Position ${position}`}
                                            >
                                                {aa}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tooltip for hovered peptide */}
                {hoveredPeptide && (
                    <div
                        style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: "white",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            padding: "10px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            zIndex: 1000,
                            maxWidth: "300px"
                        }}
                    >
                        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                            Peptide {hoveredPeptide.tag || hoveredPeptide.originalIndex + 1}
                        </div>
                        <div><strong>Tag:</strong> {hoveredPeptide.tag || "-"}</div>
                        <div><strong>Sequence:</strong> {hoveredPeptide.sequence || sequence.slice(hoveredPeptide.start - 1, hoveredPeptide.end)}</div>
                        <div><strong>Position:</strong> {hoveredPeptide.start}-{hoveredPeptide.end}</div>
                        <div><strong>Length:</strong> {hoveredPeptide.end - hoveredPeptide.start + 1} aa</div>
                        {hoveredPeptide.score !== undefined && (
                            <div><strong>Score:</strong> {hoveredPeptide.score.toFixed(2)}</div>
                        )}
                        {hoveredPeptide.intensity !== undefined && (
                            <div><strong>Intensity:</strong> {hoveredPeptide.intensity.toFixed(2)}</div>
                        )}
                        {hoveredPeptide.missedCleavages !== undefined && (
                            <div><strong>Missed Cleavages:</strong> {hoveredPeptide.missedCleavages}</div>
                        )}
                        {hoveredPeptide.modifications && hoveredPeptide.modifications.length > 0 && (
                            <div>
                                <strong>Modifications:</strong> {hoveredPeptide.modifications.join(", ")}
                            </div>
                        )}
                    </div>
                )}

                {/* Selected peptide details */}
                {selectedPeptide && (
                    <div
                        style={{
                            marginTop: "1rem",
                            padding: "10px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            borderRadius: "4px"
                        }}
                    >
                        <h4 style={{ marginTop: 0 }}>Selected Peptide: {selectedPeptide.tag}</h4>
                        <pre style={{ margin: 0, fontSize: "12px" }}>
                            {JSON.stringify(selectedPeptide, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{ marginTop: "1rem", fontSize: "12px", color: "#6c757d" }}>
                <span>Note: Multiple peptides at the same position (e.g., from missed cleavages) are stacked vertically.</span>
            </div>
        </div>
    );
}

export default SequenceViewer;
