import { useMemo, useState } from "react";
import _ from "lodash";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Group } from "@visx/group";

/**
 * PositionCorrelationProfile - Shows average correlation vs. protein position.
 * 
 * Uses PRE-CALCULATED correlation matrix from the API.
 * For each peptide, calculates the average correlation with all other peptides
 * and plots it against the peptide's position in the protein.
 * 
 * Helps identify regions with different isoforms or measurement issues:
 * - High correlation across all positions: consistent measurement
 * - Low correlation at N/C terminals: potential isoforms
 * - Low correlation in middle: alternative splicing or modifications
 * 
 * @param {Object} props
 * @param {string[]} props.peptide_tags - Array of peptide tags to include
 * @param {Object} props.correlationData - Correlation data from API:
 *   { peptide_tags: string[], correlation_matrix: number[][], samples: string[] }
 * @param {string} [props.hoverPeptideTag] - Currently hovered peptide tag for highlighting
 * @param {string} [props.sequence] - Protein amino acid sequence (for domain scaling)
 * @param {number} [props.width=600] - Component width in pixels
 * @param {number} [props.height=300] - Component height in pixels
 * @param {Function} [props.onPeptideHover] - Callback when a peptide is hovered: (peptideTag) => void
 * @returns {JSX.Element}
 * 
 * @example
 * // Example correlationData from API:
 * const correlationData = {
 *   peptide_tags: ["PEP_001_001", "PEP_001_002", "PEP_001_003"],
 *   correlation_matrix: [
 *     [1.0, 0.95, 0.87],
 *     [0.95, 1.0, 0.92],
 *     [0.87, 0.92, 1.0]
 *   ],
 *   samples: ["SAMPLE_A", "SAMPLE_B", "SAMPLE_C"]
 * };
 * 
 * // Usage:
 * <PositionCorrelationProfile
 *   peptide_tags={["PEP_001_001", "PEP_001_002", "PEP_001_003"]}
 *   correlationData={correlationData}
 *   sequence="MKTIIALSYIFCLVFAGEAMSLEQ..."
 *   hoverPeptideTag="PEP_001_001"
 *   onPeptideHover={(tag) => console.log("Hovered:", tag)}
 * />
 */
function PositionCorrelationProfile({
    peptide_tags = [],
    correlationData = null,
    hoverPeptideTag = null,
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

    // Extract data from correlationData
    const matrixPeptideTags = useMemo(() => {
        return correlationData?.peptide_tags || [];
    }, [correlationData]);

    const correlationMatrix = useMemo(() => {
        return correlationData?.correlation_matrix || [];
    }, [correlationData]);

    // Filter peptide_tags to only those present in the correlation matrix
    const validPeptideTags = useMemo(() => {
        return peptide_tags.filter(tag => matrixPeptideTags.includes(tag));
    }, [peptide_tags, matrixPeptideTags]);

    // Create index map for matrix
    const peptideIndexInMatrix = useMemo(() => {
        const index = {};
        matrixPeptideTags.forEach((tag, idx) => {
            index[tag] = idx;
        });
        return index;
    }, [matrixPeptideTags]);

    // For position profile, we need peptide position information
    // This should come from the peptides data, but for now we'll use a simplified approach
    // In production, this would be passed as props or fetched from the peptides API
    // For demo purposes, we'll extract positions from the peptide tags (if they contain position info)
    // or use a default ordering
    
    // Since we don't have position info here, we'll use the order in peptide_tags
    // In production, you would pass peptide metadata including start/end positions
    const positionCorrelations = useMemo(() => {
        if (validPeptideTags.length < 2 || !correlationData) return [];
        
        return validPeptideTags.map((tag, idx) => {
            const matrixIdx = peptideIndexInMatrix[tag];
            if (matrixIdx === undefined) return null;
            
            // Calculate average correlation of this peptide with all others
            const row = correlationMatrix[matrixIdx];
            if (!row) return null;
            
            const correlations = [];
            for (let j = 0; j < row.length; j++) {
                if (j !== matrixIdx && !isNaN(row[j])) {
                    correlations.push(row[j]);
                }
            }
            
            const avgCorrelation = correlations.length > 0 
                ? correlations.reduce((a, b) => a + b, 0) / correlations.length 
                : 0;
            
            // Use index as position for now (in production, use actual peptide position)
            return {
                tag,
                position: idx * 10 + 5, // Default spacing
                avgCorrelation,
                correlationCount: correlations.length
            };
        }).filter(x => x !== null);
    }, [validPeptideTags, correlationData, peptideIndexInMatrix, correlationMatrix]);

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

    // Import localPoint from @visx/event
    import { localPoint } from "@visx/event";

    if (!correlationData || validPeptideTags.length < 2) {
        return (
            <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e9ecef", borderRadius: "4px" }}>
                <div style={{ color: "#6c757d" }}>
                    {correlationData ? "Select at least 2 peptides to view position correlation profile" : "Loading correlation data..."}
                </div>
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
                    label="Peptide Index"
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
                    <div>Position Index: {tooltipData.position.toFixed(0)}</div>
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

// Re-import Group from @visx/group for export
import { Group as GroupViz } from "@visx/group";

export default PositionCorrelationProfile;
