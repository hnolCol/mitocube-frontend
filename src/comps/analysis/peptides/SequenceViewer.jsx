import { useMemo, useState } from "react";
import _ from "lodash";

/**
 * SequenceViewer component for visualizing peptides mapped to a protein sequence.
 * 
 * @param {Object} props
 * @param {string} props.sequence - The protein amino acid sequence
 * @param {Array} props.peptides - Array of peptide objects with start, end, and metadata
 * @param {number} props.charactersPerLine - Number of amino acids to display per line (default: 60)
 * @param {number} props.charWidth - Width of each character in pixels (default: 14)
 * @param {number} props.lineHeight - Height of each line in pixels (default: 24)
 * @param {Object} props.colors - Custom colors for peptide highlights (default: palette)
 * @returns {JSX.Element}
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
        highlight: "#ffeaa7"
    }
}) {
    const [hoveredPeptide, setHoveredPeptide] = useState(null);
    const [selectedPeptide, setSelectedPeptide] = useState(null);

    // Group peptides by their position ranges
    const peptideGroups = useMemo(() => {
        const groups = {};
        peptides.forEach((peptide, idx) => {
            const key = `${peptide.start}-${peptide.end}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push({ ...peptide, id: idx });
        });
        return groups;
    }, [peptides]);

    // Generate lines from the sequence
    const sequenceLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i < sequence.length; i += charactersPerLine) {
            lines.push(sequence.slice(i, i + charactersPerLine));
        }
        return lines;
    }, [sequence, charactersPerLine]);

    // Calculate peptide position for rendering
    const getPeptidePosition = (start, end) => {
        const lineIndex = Math.floor(start / charactersPerLine);
        const lineStart = lineIndex * charactersPerLine;
        const x = (start - lineStart) * charWidth;
        const width = (end - start + 1) * charWidth;
        const y = lineIndex * lineHeight;
        return { x, y, width, lineIndex };
    };

    // Generate color for each peptide group
    const getPeptideColor = (peptideId) => {
        // Use a consistent color based on peptide ID for same peptides
        const hue = (peptideId * 137) % 360;
        return `hsl(${hue}, 80%, 60%)`;
    };

    const handlePeptideClick = (peptide) => {
        setSelectedPeptide(selectedPeptide?.id === peptide.id ? null : peptide);
    };

    // Calculate total width and height
    const totalWidth = charactersPerLine * charWidth + 100; // Extra space for position numbers
    const totalHeight = sequenceLines.length * lineHeight + 40;

    return (
        <div className="sequence-viewer" style={{ fontFamily: "monospace", margin: "1rem 0" }}>
            <div style={{ marginBottom: "1rem" }}>
                <strong>Protein Sequence:</strong> {sequence.length} amino acids
                {peptides.length > 0 && (
                    <span style={{ marginLeft: "1rem" }}>
                        <strong>Peptides:</strong> {peptides.length} detected
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
                            return (
                                <rect
                                    key={`${p.id}-${idx}`}
                                    x={x + 50} // Offset for position numbers
                                    y={y + 2 + offset}
                                    width={width}
                                    height={height - offset}
                                    fill={hoveredPeptide?.id === p.id ? colors.peptideHover : getPeptideColor(p.id)}
                                    fillOpacity={0.3}
                                    stroke={hoveredPeptide?.id === p.id ? colors.peptideHover : getPeptideColor(p.id)}
                                    strokeWidth={1}
                                    rx={2}
                                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                                    onMouseEnter={() => setHoveredPeptide(p)}
                                    onMouseLeave={() => setHoveredPeptide(null)}
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
                                        
                                        return (
                                            <span
                                                key={globalIndex}
                                                style={{
                                                    width: `${charWidth}px`,
                                                    height: `${lineHeight}px`,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: isInPeptide ? colors.highlight : "transparent",
                                                    fontFamily: "monospace",
                                                    fontSize: "12px",
                                                    fontWeight: isInPeptide ? "bold" : "normal",
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
                            Peptide {hoveredPeptide.id + 1}
                        </div>
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
                        <h4 style={{ marginTop: 0 }}>Selected Peptide</h4>
                        <pre style={{ margin: 0, fontSize: "12px" }}>
                            {JSON.stringify(selectedPeptide, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{ marginTop: "1rem", fontSize: "12px", color: "#6c757d" }}>
                <span>Note: Multiple peptides at the same position (e.g., from missed cleavages) are stacked.</span>
            </div>
        </div>
    );
}

export default SequenceViewer;
