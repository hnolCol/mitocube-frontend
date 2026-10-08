import { useMemo, useState } from "react";
import _ from "lodash";

/**
 * SequenceViewer component for visualizing precursors mapped to a protein sequence.
 *
 * @param {Object} props
 * @param {string} props.sequence - The protein amino acid sequence
 * @param {Array<Object>} props.precursors - Array of precursor objects to display on the sequence
 *   ({ tag, sequence, charge, start, end }) with 1-indexed inclusive positions
 * @param {number} [props.charactersPerLine=60] - Number of amino acids to display per line
 * @param {number} [props.charWidth=14] - Width of each character in pixels
 * @param {number} [props.lineHeight=24] - Height of each line in pixels
 * @param {Object} [props.colors] - Custom colors for precursor highlights
 * @param {string} [props.searchTerm=""] - Optional search term to filter/highlight precursors
 * @param {Function} [props.onPrecursorClick] - Callback when a precursor is clicked: (precursor) => void
 * @param {Function} [props.onPrecursorHover] - Callback when a precursor is hovered: (precursor) => void
 * @returns {JSX.Element}
 */
function SequenceViewer({
    sequence = "",
    precursors = [],
    charactersPerLine = 60,
    charWidth = 14,
    lineHeight = 24,
    colors = {
        background: "#f8f9fa",
        text: "#212529",
        precursorDefault: "#4285f4",
        precursorHover: "#ff6b6b",
        precursorMatch: "#51cf66",
        highlight: "#ffeaa7"
    },
    searchTerm = "",
    onPrecursorClick,
    onPrecursorHover
}) {
    const [hoveredPrecursor, setHoveredPrecursor] = useState(null);
    const [selectedPrecursor, setSelectedPrecursor] = useState(null);

    const filteredPrecursors = useMemo(() => {
        if (!searchTerm) return precursors;
        const lowerSearch = searchTerm.toLowerCase();
        return precursors.filter(precursor => {
            const tagMatch = precursor.tag && precursor.tag.toLowerCase().includes(lowerSearch);
            const seqMatch = precursor.sequence && precursor.sequence.toLowerCase().includes(lowerSearch);
            const chargeMatch = precursor.charge !== undefined && String(precursor.charge).includes(lowerSearch);
            return tagMatch || seqMatch || chargeMatch;
        });
    }, [precursors, searchTerm]);

    const precursorGroups = useMemo(() => {
        const groups = {};
        filteredPrecursors.forEach((precursor, idx) => {
            const key = `${precursor.start}-${precursor.end}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push({ ...precursor, originalIndex: idx });
        });
        return groups;
    }, [filteredPrecursors]);

    const isPrecursorMatch = (precursor) => {
        if (!searchTerm) return false;
        const lowerSearch = precursor.tag?.toLowerCase() || "";
        const lowerSeq = precursor.sequence?.toLowerCase() || "";
        return lowerSearch.length > 0 && (
            lowerSearch.includes(searchTerm.toLowerCase()) ||
            lowerSeq.includes(searchTerm.toLowerCase())
        );
    };

    const getPrecursorColor = (precursorTag, isMatch = false) => {
        if (precursorTag) {
            let hash = 0;
            for (let i = 0; i < precursorTag.length; i++) {
                hash = precursorTag.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash) % 360;
            return isMatch ? colors.precursorMatch : `hsl(${hue}, 80%, 60%)`;
        }
        return colors.precursorDefault;
    };

    const handlePrecursorClick = (precursor) => {
        setSelectedPrecursor(selectedPrecursor?.tag === precursor.tag ? null : precursor);
        if (onPrecursorClick) onPrecursorClick(precursor);
    };

    const handlePrecursorMouseEnter = (precursor) => {
        setHoveredPrecursor(precursor);
        if (onPrecursorHover) onPrecursorHover(precursor);
    };

    const handlePrecursorMouseLeave = () => {
        setHoveredPrecursor(null);
        if (onPrecursorHover) onPrecursorHover(null);
    };

    const getPrecursorPosition = (start, end) => {
        const lineIndex = Math.floor(start / charactersPerLine);
        const lineStart = lineIndex * charactersPerLine;
        const x = (start - lineStart) * charWidth;
        const width = (end - start + 1) * charWidth;
        const y = lineIndex * lineHeight;
        return { x, y, width, lineIndex };
    };

    const sequenceLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i < sequence.length; i += charactersPerLine) {
            lines.push(sequence.slice(i, i + charactersPerLine));
        }
        return lines;
    }, [sequence, charactersPerLine]);

    const matchCount = filteredPrecursors.length;

    const totalWidth = charactersPerLine * charWidth + 100;
    const totalHeight = sequenceLines.length * lineHeight + 40;

    return (
        <div className="sequence-viewer" style={{ fontFamily: "monospace", margin: "1rem 0" }}>
            <div style={{ marginBottom: "1rem" }}>
                <strong>Protein Sequence:</strong> {sequence.length} amino acids
                {precursors.length > 0 && (
                    <span style={{ marginLeft: "1rem" }}>
                        <strong>Precursors:</strong> {precursors.length} total
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
                    {Object.entries(precursorGroups).map(([key, groupPrecursors]) => {
                        const precursor = groupPrecursors[0];
                        const { x, y, width } = getPrecursorPosition(precursor.start - 1, precursor.end - 1);
                        const height = lineHeight - 4;
                        return groupPrecursors.map((p, idx) => {
                            const offset = idx * 2;
                            const pIsMatch = isPrecursorMatch(p);
                            return (
                                <rect
                                    key={`${p.tag}-${idx}`}
                                    x={x + 50}
                                    y={y + 2 + offset}
                                    width={width}
                                    height={height - offset}
                                    fill={hoveredPrecursor?.tag === p.tag ? colors.precursorHover : getPrecursorColor(p.tag, pIsMatch)}
                                    fillOpacity={pIsMatch ? 0.5 : 0.3}
                                    stroke={hoveredPrecursor?.tag === p.tag ? colors.precursorHover : getPrecursorColor(p.tag, pIsMatch)}
                                    strokeWidth={pIsMatch ? 2 : 1}
                                    rx={2}
                                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                                    onMouseEnter={() => handlePrecursorMouseEnter(p)}
                                    onMouseLeave={handlePrecursorMouseLeave}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrecursorClick(p);
                                    }}
                                />
                            );
                        });
                    })}
                </svg>
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
                                <div style={{ display: "flex" }}>
                                    {line.split("").map((aa, charIndex) => {
                                        const globalIndex = lineIndex * charactersPerLine + charIndex;
                                        const position = globalIndex + 1;
                                        const isInPrecursor = precursors.some(p => p.start <= position && p.end >= position);
                                        const hasMatchAtPosition = filteredPrecursors.some(p => p.start <= position && p.end >= position);
                                        return (
                                            <span
                                                key={globalIndex}
                                                style={{
                                                    width: `${charWidth}px`,
                                                    height: `${lineHeight}px`,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: hasMatchAtPosition ? colors.highlight : isInPrecursor ? "#e9ecef" : "transparent",
                                                    fontFamily: "monospace",
                                                    fontSize: "12px",
                                                    fontWeight: hasMatchAtPosition ? "bold" : isInPrecursor ? "600" : "normal",
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
                {hoveredPrecursor && (
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
                            Precursor {hoveredPrecursor.tag}
                        </div>
                        <div><strong>Tag:</strong> {hoveredPrecursor.tag || "-"}</div>
                        <div><strong>Sequence:</strong> {hoveredPrecursor.sequence || sequence.slice(hoveredPrecursor.start - 1, hoveredPrecursor.end)}</div>
                        <div><strong>Charge:</strong> {hoveredPrecursor.charge ?? hoveredPrecursor.tag?.split(".")[1] ?? "-"}</div>
                        <div><strong>Position:</strong> {hoveredPrecursor.start}-{hoveredPrecursor.end}</div>
                        <div><strong>Length:</strong> {hoveredPrecursor.end - hoveredPrecursor.start + 1} aa</div>
                    </div>
                )}
                {selectedPrecursor && (
                    <div
                        style={{
                            marginTop: "1rem",
                            padding: "10px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            borderRadius: "4px"
                        }}
                    >
                        <h4 style={{ marginTop: 0 }}>Selected Precursor: {selectedPrecursor.tag}</h4>
                        <pre style={{ margin: 0, fontSize: "12px" }}>
                            {JSON.stringify(selectedPrecursor, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
            <div style={{ marginTop: "1rem", fontSize: "12px", color: "#6c757d" }}>
                <span>Note: Multiple precursors at the same position (e.g., different charge states) are stacked vertically.</span>
            </div>
        </div>
    );
}

export default SequenceViewer;
