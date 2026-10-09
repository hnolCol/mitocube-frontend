import { useMemo, useState } from "react";
import _ from "lodash";
import { scaleLinear } from "@visx/scale";
import { Group } from "@visx/group";

/**
 * PrecursorCorrelationMatrix - Heatmap showing pairwise precursor correlations.
 * 
 * Uses PRE-CALCULATED correlation matrix from the API (not client-side).
 * This is more efficient as the server calculates Pearson correlations once.
 * 
 * @param {Object} props
 * @param {string[]} props.precursor_tags - Array of precursor tags to display in the matrix
 * @param {Object} props.correlationData - Correlation data from API:
 *   { precursor_tags: string[], correlation_matrix: number[][], samples: string[] }
 * @param {string} [props.hoverPrecursorTag] - Currently hovered precursor tag for highlighting
 * @param {number} [props.width=600] - Component width in pixels
 * @param {number} [props.height=500] - Component height in pixels
 * @param {Function} [props.onPrecursorHover] - Callback when a precursor is hovered: (precursorTag) => void
 * @returns {JSX.Element}
 * 
 * @example
 * // Example correlationData from API:
 * const correlationData = {
 *   precursor_tags: ["PEP_001_001", "PEP_001_002", "PEP_001_003"],
 *   correlation_matrix: [
 *     [1.0, 0.95, 0.87],   // PEP_001_001 correlations
 *     [0.95, 1.0, 0.92],   // PEP_001_002 correlations
 *     [0.87, 0.92, 1.0]    // PEP_001_003 correlations
 *   ],
 *   samples: ["SAMPLE_A", "SAMPLE_B", "SAMPLE_C"]
 * };
 * 
 * // Usage:
 * <PrecursorCorrelationMatrix
 *   precursor_tags={["PEP_001_001", "PEP_001_002", "PEP_001_003"]}
 *   correlationData={correlationData}
 *   hoverPrecursorTag="PEP_001_001"
 *   onPrecursorHover={(tag) => console.log("Hovered:", tag)}
 * />
 */
function PrecursorCorrelationMatrix({
    precursor_tags = [],
    correlationData = null,
    hoverPrecursorTag = null,
    width = 600,
    height = 500,
    onPrecursorHover
}) {
    const [tooltipData, setTooltipData] = useState(null);

    // Margins
    const margin = { top: 20, right: 20, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Extract data from correlationData
    const matrixPrecursorTags = useMemo(() => {
        return correlationData?.precursor_tags || [];
    }, [correlationData]);

    const correlationMatrix = useMemo(() => {
        return correlationData?.correlation_matrix || [];
    }, [correlationData]);

    // Filter precursor_tags to only those present in the correlation matrix
    const validPrecursorTags = useMemo(() => {
        return precursor_tags.filter(tag => matrixPrecursorTags.includes(tag));
    }, [precursor_tags, matrixPrecursorTags]);

    // Create sorted list of precursors for consistent ordering
    const precursorOrder = useMemo(() => {
        return [...validPrecursorTags].sort();
    }, [validPrecursorTags]);

    // Create index maps
    const precursorIndexInOrder = useMemo(() => {
        const index = {};
        precursorOrder.forEach((tag, idx) => {
            index[tag] = idx;
        });
        return index;
    }, [precursorOrder]);

    const precursorIndexInMatrix = useMemo(() => {
        const index = {};
        matrixPrecursorTags.forEach((tag, idx) => {
            index[tag] = idx;
        });
        return index;
    }, [matrixPrecursorTags]);

    // Cell size based on number of precursors
    const cellSize = useMemo(() => {
        const maxCells = Math.max(precursorOrder.length, 20);
        return Math.min(Math.floor(innerWidth / maxCells), Math.floor(innerHeight / maxCells), 25);
    }, [precursorOrder.length, innerWidth, innerHeight]);

    // Scales
    const xScale = useMemo(() => {
        return scaleLinear({
            domain: [0, precursorOrder.length],
            range: [0, innerWidth],
            nice: true
        });
    }, [precursorOrder.length, innerWidth]);

    const yScale = useMemo(() => {
        return scaleLinear({
            domain: [0, precursorOrder.length],
            range: [0, innerHeight],
            nice: true
        });
    }, [precursorOrder.length, innerHeight]);

    // Color scale for correlation values
    const colorScale = useMemo(() => {
        return scaleLinear({
            domain: [-1, 0, 1],
            range: ["#4285f4", "#ffffff", "#ff6b6b"]
        });
    }, []);

    // Get correlation value from matrix
    const getCorrelation = (tagX, tagY) => {
        const idxX = precursorIndexInMatrix[tagX];
        const idxY = precursorIndexInMatrix[tagY];
        if (idxX === undefined || idxY === undefined) return null;
        if (idxX >= correlationMatrix.length || idxY >= correlationMatrix[idxX].length) return null;
        return correlationMatrix[idxX][idxY];
    };

    const handleMouseEnter = (precursorTagX, precursorTagY) => {
        const corr = getCorrelation(precursorTagX, precursorTagY);
        setTooltipData({
            precursorX: precursorTagX,
            precursorY: precursorTagY,
            correlation: corr
        });
        if (onPrecursorHover) {
            onPrecursorHover(precursorTagX);
        }
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
        if (onPrecursorHover) {
            onPrecursorHover(null);
        }
    };

    if (!correlationData || validPrecursorTags.length < 2) {
        return (
            <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e9ecef", borderRadius: "4px" }}>
                <div style={{ color: "#6c757d" }}>
                    {correlationData ? "Select at least 2 precursors to view correlations" : "Loading correlation data..."}
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }}>
            <svg width={width} height={height}>
                <defs>
                    <linearGradient id="correlationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4285f4" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#ff6b6b" />
                    </linearGradient>
                </defs>

                {/* Heatmap cells */}
                <Group top={margin.top} left={margin.left}>
                    {precursorOrder.map((tagY, rowIdx) => {
                        return precursorOrder.map((tagX, colIdx) => {
                            const correlation = getCorrelation(tagX, tagY);
                            const isHoveredX = hoverPrecursorTag === tagX;
                            const isHoveredY = hoverPrecursorTag === tagY;
                            const isDiagonal = tagX === tagY;
                            
                            if (correlation === null || correlation === undefined) return null;
                            
                            return (
                                <rect
                                    key={`cell-${tagX}-${tagY}`}
                                    x={xScale(colIdx + 0.5) - cellSize / 2}
                                    y={yScale(rowIdx + 0.5) - cellSize / 2}
                                    width={cellSize}
                                    height={cellSize}
                                    fill={isDiagonal ? "#e9ecef" : colorScale(correlation)}
                                    stroke={isHoveredX || isHoveredY ? "#ff6b6b" : "#ffffff"}
                                    strokeWidth={isHoveredX || isHoveredY ? 2 : 0.5}
                                    opacity={isDiagonal ? 0.5 : 1}
                                    onMouseEnter={() => handleMouseEnter(tagX, tagY)}
                                    onMouseLeave={handleMouseLeave}
                                />
                            );
                        });
                    })}
                </Group>

                {/* Row labels (precursor tags on left) */}
                {precursorOrder.map((tag, idx) => {
                    const isHovered = hoverPrecursorTag === tag;
                    return (
                        <text
                            key={`row-label-${tag}`}
                            x={margin.left - 10}
                            y={yScale(idx + 0.5) + 5}
                            textAnchor="end"
                            fontSize={cellSize * 0.6}
                            fill={isHovered ? "#ff6b6b" : "#212529"}
                            fontWeight={isHovered ? "bold" : "normal"}
                        >
                            {tag}
                        </text>
                    );
                })}

                {/* Column labels (precursor tags on bottom) */}
                {precursorOrder.map((tag, idx) => {
                    const isHovered = hoverPrecursorTag === tag;
                    return (
                        <text
                            key={`col-label-${tag}`}
                            x={xScale(idx + 0.5)}
                            y={margin.top + innerHeight + 20}
                            textAnchor="middle"
                            fontSize={cellSize * 0.6}
                            fill={isHovered ? "#ff6b6b" : "#212529"}
                            fontWeight={isHovered ? "bold" : "normal"}
                            transform={`rotate(-45, ${xScale(idx + 0.5)}, ${margin.top + innerHeight + 20})`}
                        >
                            {tag}
                        </text>
                    );
                })}

                {/* Color legend */}
                <Group top={margin.top} left={margin.left + innerWidth + 20}>
                    <text x={0} y={-10} fontSize={11} fill="#212529">
                        Correlation
                    </text>
                    <rect x={0} y={0} width={100} height={20} fill="url(#correlationGradient)" />
                    <text x={0} y={25} fontSize={10} fill="#6c757d">-1</text>
                    <text x={50} y={25} fontSize={10} fill="#6c757d" textAnchor="middle">0</text>
                    <text x={100} y={25} fontSize={10} fill="#6c757d" textAnchor="end">+1</text>
                </Group>
            </svg>

            {/* Tooltip */}
            {tooltipData && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "white",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        padding: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        fontSize: "12px",
                        pointerEvents: "none",
                        zIndex: 1000
                    }}
                >
                    <div><strong>{tooltipData.precursorX}</strong> ↔ <strong>{tooltipData.precursorY}</strong></div>
                    <div>Pearson r: {tooltipData.correlation !== null ? tooltipData.correlation.toFixed(3) : "N/A"}</div>
                    <div style={{ fontSize: "10px", color: "#6c757d", marginTop: "5px" }}>
                        {tooltipData.correlation > 0.8 ? "Highly correlated" : 
                         tooltipData.correlation < -0.5 ? "Negatively correlated" : 
                         "Moderately correlated"}
                    </div>
                </div>
            )}
        </div>
    );
}

// Import Group from @visx/group
import { Group as GroupViz } from "@visx/group";

export default PrecursorCorrelationMatrix;
