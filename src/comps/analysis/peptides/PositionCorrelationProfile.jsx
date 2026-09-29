import { useMemo, useState } from "react";
import _ from "lodash";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Group } from "@visx/group";
import { TooltipWithBounds } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { getColorPalette } from "@mitocube/viz/src/colors/palette";

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
 * PositionCorrelationProfile - Shows average correlation vs. protein position
 * Helps identify regions with different isoforms or measurement issues
 * 
 * @param {Object} props
 * @param {string[]} props.selectedPeptideTags - Tags of selected peptides
 * @param {string} props.hoverPeptideTag - Currently hovered peptide tag
 * @param {Object} props.intensityData - { peptide_tag: { sample_tag: intensity } }
 * @param {string[]} props.sampleTags - Array of all sample tags
 * @param {string} props.sequence - Protein amino acid sequence
 * @param {number} props.width - Component width
 * @param {number} props.height - Component height
 * @param {Function} props.onPeptideHover - Callback when peptide is hovered
 * @returns {JSX.Element}
 */
function PositionCorrelationProfile({
    selectedPeptideTags = [],
    hoverPeptideTag = null,
    intensityData = {},
    sampleTags = [],
    sequence = "",
    width = 600,
    height = 300,
    onPeptideHover
}) {
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipLeft, setTooltipLeft] = useState(0);
    const [tooltipTop, setTooltipTop] = useState(0);

    // Margins
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

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

    // Filter to selected peptides that have data
    const validPeptides = useMemo(() => {
        return selectedPeptideTags
            .filter(tag => intensityData[tag])
            .map(tag => ({
                tag,
                start: intensityData[tag]?.start || 0,
                end: intensityData[tag]?.end || 0,
                data: allSampleTags.map(sample => intensityData[tag]?.[sample] || null)
            }));
    }, [selectedPeptideTags, intensityData, allSampleTags]);

    // Calculate average correlation for each peptide position
    const positionCorrelations = useMemo(() => {
        if (validPeptides.length < 2) return [];
        
        return validPeptides.map(pep => {
            // Calculate average correlation of this peptide with all others
            const otherPeps = validPeptides.filter(p => p.tag !== pep.tag);
            const correlations = otherPeps.map(other => {
                return calculatePearsonCorrelation(pep.data, other.data);
            }).filter(c => c !== null);
            
            const avgCorrelation = correlations.length > 0 
                ? correlations.reduce((a, b) => a + b, 0) / correlations.length 
                : 0;
            
            // Use middle position
            const position = (pep.start + pep.end) / 2;
            
            return {
                tag: pep.tag,
                position,
                start: pep.start,
                end: pep.end,
                avgCorrelation,
                correlationCount: correlations.length
            };
        });
    }, [validPeptides]);

    // Sort by position
    const sortedPositions = useMemo(() => {
        return [...positionCorrelations].sort((a, b) => a.position - b.position);
    }, [positionCorrelations]);

    // Scales
    const xScale = useMemo(() => {
        if (sortedPositions.length === 0) {
            return scaleLinear({ domain: [0, sequence.length || 100], range: [0, innerWidth] });
        }
        const minPos = Math.min(...sortedPositions.map(p => p.position));
        const maxPos = Math.max(...sortedPositions.map(p => p.position));
        const padding = (maxPos - minPos) * 0.1 || 10;
        return scaleLinear({
            domain: [minPos - padding, maxPos + padding],
            range: [0, innerWidth],
            nice: true
        });
    }, [sortedPositions, sequence.length, innerWidth]);

    const yScale = useMemo(() => {
        if (sortedPositions.length === 0) {
            return scaleLinear({ domain: [-1, 1], range: [innerHeight, 0] });
        }
        const minCorr = Math.min(...sortedPositions.map(p => p.avgCorrelation), -1);
        const maxCorr = Math.max(...sortedPositions.map(p => p.avgCorrelation), 1);
        const padding = (maxCorr - minCorr) * 0.1 || 0.2;
        return scaleLinear({
            domain: [minCorr - padding, maxCorr + padding],
            range: [innerHeight, 0],
            nice: true
        });
    }, [sortedPositions, innerHeight]);

    // Color scale for correlation values
    const colorScale = useMemo(() => {
        return scaleLinear({
            domain: [-1, 0, 1],
            range: ["#4285f4", "#ffffff", "#ff6b6b"]
        });
    }, []);

    const handleMouseMove = (event, data) => {
        const point = localPoint(event);
        if (!point) return;
        
        setTooltipData(data);
        setTooltipLeft(point.x + margin.left);
        setTooltipTop(point.y + margin.top);
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
        if (onPeptideHover) onPeptideHover(null);
    };

    if (validPeptides.length < 2) {
        return (
            <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e9ecef", borderRadius: "4px" }}>
                <div style={{ color: "#6c757d" }}>Select at least 2 peptides to view position correlation profile</div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }}>
            <svg width={width} height={height}>
                <defs>
                    <linearGradient id="positionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4285f4" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#ff6b6b" />
                    </linearGradient>
                </defs>

                {/* Grid */}
                <GridRows
                    scale={yScale}
                    width={innerWidth}
                    stroke="#e9ecef"
                    strokeDasharray="2,2"
                    left={margin.left}
                />
                <GridColumns
                    scale={xScale}
                    height={innerHeight}
                    stroke="#e9ecef"
                    strokeDasharray="2,2"
                    top={margin.top}
                />

                {/* Axes */}
                <AxisBottom
                    scale={xScale}
                    top={margin.top + innerHeight}
                    left={margin.left}
                    label="Protein Position (aa)"
                    labelOffset={30}
                    labelProps={{ fontSize: 12, fill: "#212529" }}
                    tickLabelProps={{ fontSize: 10, fill: "#6c757d" }}
                    tickFormat={(pos) => Math.round(pos)}
                />
                <AxisLeft
                    scale={yScale}
                    left={margin.left}
                    top={margin.top}
                    label="Avg Correlation (r)"
                    labelOffset={30}
                    labelProps={{ fontSize: 12, fill: "#212529" }}
                    tickLabelProps={{ fontSize: 10, fill: "#6c757d" }}
                />

                {/* Correlation line */}
                <Group top={margin.top} left={margin.left}>
                    {sortedPositions.map((posData, idx) => {
                        const isHovered = hoverPeptideTag === posData.tag;
                        return (
                            <circle
                                key={`pos-${posData.tag}`}
                                cx={xScale(posData.position)}
                                cy={yScale(posData.avgCorrelation)}
                                r={isHovered ? 8 : 5}
                                fill={colorScale(posData.avgCorrelation)}
                                stroke={isHovered ? "#ff6b6b" : "#ffffff"}
                                strokeWidth={isHovered ? 2 : 1}
                                onMouseMove={(e) => handleMouseMove(e, posData)}
                                onMouseEnter={() => onPeptideHover?.(posData.tag)}
                                onMouseLeave={handleMouseLeave}
                            />
                        );
                    })}
                    
                    {/* Connecting line */}
                    <LinePath
                        data={sortedPositions}
                        x={(d) => xScale(d.position)}
                        y={(d) => yScale(d.avgCorrelation)}
                        stroke="#6c757d"
                        strokeWidth={2}
                        strokeOpacity={0.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Group>

                {/* Color legend */}
                <Group top={margin.top} left={margin.left + innerWidth + 20}>
                    <text x={0} y={-10} fontSize={11} fill="#212529">
                        Correlation
                    </text>
                    <rect x={0} y={0} width={100} height={20} fill="url(#positionGradient)" />
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
                        top: tooltipTop - 60,
                        left: tooltipLeft + 10,
                        backgroundColor: "white",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        padding: "8px 10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        fontSize: "12px",
                        pointerEvents: "none",
                        zIndex: 1000
                    }}
                >
                    <div><strong>{tooltipData.tag}</strong></div>
                    <div>Position: {tooltipData.start}-{tooltipData.end}</div>
                    <div>Avg Correlation: {tooltipData.avgCorrelation.toFixed(3)}</div>
                    <div>Based on {tooltipData.correlationCount} comparisons</div>
                </div>
            )}

            {/* Interpretation hints */}
            <div
                style={{
                    position: "absolute",
                    bottom: 10,
                    left: margin.left,
                    fontSize: "11px",
                    color: "#6c757d"
                }}
            >
                <span>Low correlation regions may indicate </span>
                <strong>isoforms</strong>
                <span> or </span>
                <strong>measurement issues</strong>
            </div>
        </div>
    );
}

// Re-import Group for the return
import { Group as GroupViz } from "@visx/group";

export default PositionCorrelationProfile;
