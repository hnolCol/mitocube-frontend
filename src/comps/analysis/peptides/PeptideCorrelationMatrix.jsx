import { useMemo, useState } from "react";
import _ from "lodash";
import { scaleLinear } from "@visx/scale";
import { HeatmapRect, HeatmapCircle } from "@visx/heatmap";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";

/**
 * Calculate Pearson correlation between two arrays
 */
function calculatePearsonCorrelation(arr1, arr2) {
    if (arr1.length !== arr2.length || arr1.length === 0) return null;
    
    const n = arr1.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
    
    for (let i = 0; i < n; i++) {
        const x = arr1[i];
        const y = arr2[i];
        if (x === null || y === null) continue;
        
        sum1 += x;
        sum2 += y;
        sum1Sq += x * x;
        sum2Sq += y * y;
        pSum += x * y;
    }
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - (sum1 * sum1 / n)) * (sum2Sq - (sum2 * sum2 / n)));
    
    if (den === 0) return 0;
    return num / den;
}

/**
 * PeptideCorrelationMatrix - Heatmap showing pairwise peptide correlations
 * 
 * @param {Object} props
 * @param {string[]} props.selectedPeptideTags - Tags of selected peptides
 * @param {string} props.hoverPeptideTag - Currently hovered peptide tag
 * @param {Object} props.intensityData - { peptide_tag: { sample_tag: intensity } }
 * @param {string[]} props.sampleTags - Array of all sample tags
 * @param {number} props.width - Component width
 * @param {number} props.height - Component height
 * @param {Function} props.onPeptideHover - Callback when peptide is hovered
 * @returns {JSX.Element}
 */
function PeptideCorrelationMatrix({
    selectedPeptideTags = [],
    hoverPeptideTag = null,
    intensityData = {},
    sampleTags = [],
    width = 600,
    height = 500,
    onPeptideHover
}) {
    const [tooltipData, setTooltipData] = useState(null);

    // Margins
    const margin = { top: 20, right: 20, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Filter to selected peptides that have data
    const validPeptides = useMemo(() => {
        return selectedPeptideTags.filter(tag => intensityData[tag]);
    }, [selectedPeptideTags, intensityData]);

    // Get sample tags from data if not provided
    const allSampleTags = useMemo(() => {
        if (sampleTags.length > 0) return sampleTags;
        const samples = new Set();
        Object.values(intensityData).forEach(pepData => {
            if (pepData && typeof pepData === 'object') {
                Object.keys(pepData).forEach(s => samples.add(s));
            }
        });
        return Array.from(samples).sort();
    }, [intensityData, sampleTags]);

    // Get intensity arrays for each peptide
    const getPeptideIntensities = (peptideTag) => {
        const pepData = intensityData[peptideTag];
        if (!pepData) return [];
        return allSampleTags.map(sample => pepData[sample] || null);
    };

    // Calculate correlation matrix
    const correlationMatrix = useMemo(() => {
        const matrix = {};
        
        for (let i = 0; i < validPeptides.length; i++) {
            const tag1 = validPeptides[i];
            matrix[tag1] = {};
            
            for (let j = 0; j < validPeptides.length; j++) {
                const tag2 = validPeptides[j];
                const intensities1 = getPeptideIntensities(tag1);
                const intensities2 = getPeptideIntensities(tag2);
                
                // Only calculate upper triangle
                if (i <= j) {
                    const corr = calculatePearsonCorrelation(intensities1, intensities2);
                    matrix[tag1][tag2] = corr;
                    
                    // Mirror to lower triangle
                    if (!matrix[tag2]) matrix[tag2] = {};
                    matrix[tag2][tag1] = corr;
                }
            }
        }
        
        return matrix;
    }, [validPeptides, allSampleTags, intensityData]);

    // Create sorted list of peptides for consistent ordering
    const peptideOrder = useMemo(() => {
        return [...validPeptides].sort();
    }, [validPeptides]);

    // Create index map
    const peptideIndex = useMemo(() => {
        const index = {};
        peptideOrder.forEach((tag, idx) => {
            index[tag] = idx;
        });
        return index;
    }, [peptideOrder]);

    // Cell size based on number of peptides
    const cellSize = useMemo(() => {
        const maxCells = Math.max(peptideOrder.length, 20);
        return Math.min(Math.floor(innerWidth / maxCells), Math.floor(innerHeight / maxCells), 25);
    }, [peptideOrder.length, innerWidth, innerHeight]);

    // Scales
    const xScale = useMemo(() => {
        return scaleLinear({
            domain: [0, peptideOrder.length],
            range: [0, innerWidth],
            nice: true
        });
    }, [peptideOrder.length, innerWidth]);

    const yScale = useMemo(() => {
        return scaleLinear({
            domain: [0, peptideOrder.length],
            range: [0, innerHeight],
            nice: true
        });
    }, [peptideOrder.length, innerHeight]);

    // Color scale for correlation values
    const colorScale = useMemo(() => {
        return scaleLinear({
            domain: [-1, 0, 1],
            range: ["#4285f4", "#ffffff", "#ff6b6b"]
        });
    }, []);

    const handleMouseEnter = (peptideTagX, peptideTagY) => {
        setTooltipData({
            peptideX: peptideTagX,
            peptideY: peptideTagY,
            correlation: correlationMatrix[peptideTagX]?.[peptideTagY]
        });
        if (onPeptideHover) {
            onPeptideHover(peptideTagX);
        }
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
        if (onPeptideHover) {
            onPeptideHover(null);
        }
    };

    if (validPeptides.length < 2) {
        return (
            <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e9ecef", borderRadius: "4px" }}>
                <div style={{ color: "#6c757d" }}>Select at least 2 peptides to view correlations</div>
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
                    {peptideOrder.map((tagY, rowIdx) => {
                        return peptideOrder.map((tagX, colIdx) => {
                            const correlation = correlationMatrix[tagX]?.[tagY];
                            const isHoveredX = hoverPeptideTag === tagX;
                            const isHoveredY = hoverPeptideTag === tagY;
                            const isDiagonal = tagX === tagY;
                            
                            if (correlation === null || correlation === undefined) return null;
                            
                            return (
                                <HeatmapRect
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

                {/* Row labels (peptide tags on left) */}
                {peptideOrder.map((tag, idx) => {
                    const isHovered = hoverPeptideTag === tag;
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

                {/* Column labels (peptide tags on bottom) */}
                {peptideOrder.map((tag, idx) => {
                    const isHovered = hoverPeptideTag === tag;
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
                    <div><strong>{tooltipData.peptideX}</strong> ↔ <strong>{tooltipData.peptideY}</strong></div>
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

// Helper component
import { Group } from "@visx/group";

export default PeptideCorrelationMatrix;
