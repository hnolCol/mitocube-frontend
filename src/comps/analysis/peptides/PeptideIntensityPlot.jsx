import { useMemo, useState } from "react";
import _ from "lodash";
import { scaleLinear, scaleOrdinal } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Group } from "@visx/group";
import { localPoint } from "@visx/event";
import { getColorPalette } from "@mitocube/viz/src/colors/palette";

/**
 * PeptideIntensityPlot - Visualizes peptide intensities across samples using @visx.
 * 
 * Displays line charts for selected peptides showing their intensity values
 * across all samples. Supports hover interactions and highlighting.
 * 
 * @param {Object} props
 * @param {string[]} props.selectedPeptideTags - Array of peptide tags to display
 * @param {string} [props.hoverPeptideTag] - Currently hovered peptide tag for highlighting
 * @param {Object} props.intensityData - Object mapping peptide tags to their data:
 *   { peptide_tag: { sample_tag: intensity, sequence?: string, ... } }
 * @param {string[]} [props.sampleTags] - Optional array of sample tags in display order.
 *   If not provided, sample tags are extracted from the intensity data.
 * @param {number} [props.width=600] - Component width in pixels
 * @param {number} [props.height=300] - Component height in pixels
 * @param {Function} [props.onPeptideHover] - Callback when a peptide is hovered: (peptideTag) => void
 * @returns {JSX.Element}
 * 
 * @example
 * // Example intensityData structure:
 * const intensityData = {
 *   "PEP_001_001": {
 *     tag: "PEP_001_001",
 *     sequence: "MKTIIALSYI",
 *     intensities: { "SAMPLE_A": 12345, "SAMPLE_B": 9876, "SAMPLE_C": 11234 }
 *   },
 *   "PEP_001_002": {
 *     tag: "PEP_001_002",
 *     sequence: "FCLVFAGEAMSLEQ",
 *     intensities: { "SAMPLE_A": 8765, "SAMPLE_B": 7654, "SAMPLE_C": 9876 }
 *   }
 * };
 * 
 * // Usage:
 * <PeptideIntensityPlot
 *   selectedPeptideTags={["PEP_001_001", "PEP_001_002"]}
 *   hoverPeptideTag="PEP_001_001"
 *   intensityData={intensityData}
 *   sampleTags={["SAMPLE_A", "SAMPLE_B", "SAMPLE_C"]}
 *   onPeptideHover={(tag) => console.log("Hovered:", tag)}
 * />
 */
function PeptideIntensityPlot({
    selectedPeptideTags = [],
    hoverPeptideTag = null,
    intensityData = {},
    sampleTags = [],
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
        // Extract from intensity data
        const samples = new Set();
        Object.values(intensityData).forEach(pepData => {
            if (pepData && pepData.intensities && typeof pepData.intensities === 'object') {
                Object.keys(pepData.intensities).forEach(s => samples.add(s));
            }
        });
        return Array.from(samples).sort();
    }, [intensityData, sampleTags]);

    // Filter to selected peptides that have data
    const validPeptides = useMemo(() => {
        return selectedPeptideTags.filter(tag => intensityData[tag]?.intensities);
    }, [selectedPeptideTags, intensityData]);

    // Get intensity arrays for each peptide
    const getPeptideIntensities = (peptideTag) => {
        const pepData = intensityData[peptideTag];
        if (!pepData?.intensities) return allSampleTags.map(() => null);
        return allSampleTags.map(sample => pepData.intensities[sample] || null);
    };

    // Scales
    const xScale = useMemo(() => {
        return scaleLinear({
            domain: [0, allSampleTags.length - 1],
            range: [0, innerWidth],
            nice: true
        });
    }, [allSampleTags.length, innerWidth]);

    const yScale = useMemo(() => {
        // Get all intensities for scaling
        const allIntensities = validPeptides.flatMap(tag => {
            return getPeptideIntensities(tag).filter(v => v !== null);
        });
        
        if (allIntensities.length === 0) return scaleLinear({ domain: [0, 1], range: [innerHeight, 0] });
        
        const min = Math.min(...allIntensities);
        const max = Math.max(...allIntensities);
        const padding = (max - min) * 0.1 || 1;
        
        return scaleLinear({
            domain: [min - padding, max + padding],
            range: [innerHeight, 0],
            nice: true
        });
    }, [validPeptides, allSampleTags, innerHeight]);

    // Color scale for peptides
    const colorScale = useMemo(() => {
        const colorPalette = getColorPalette(validPeptides.length || 1);
        return scaleOrdinal({
            domain: validPeptides,
            range: colorPalette
        });
    }, [validPeptides]);

    // Handle mouse events for tooltips
    const handleMouseMove = (event, peptideTag) => {
        const point = localPoint(event);
        if (!point) return;
        
        const sampleIndex = Math.round(xScale.invert(point.x));
        if (sampleIndex < 0 || sampleIndex >= allSampleTags.length) return;
        
        const pepData = intensityData[peptideTag];
        if (!pepData?.intensities) return;
        
        const sampleTag = allSampleTags[sampleIndex];
        const intensity = pepData.intensities[sampleTag];
        
        if (intensity !== undefined && intensity !== null) {
            setTooltipData({
                peptideTag,
                sampleTag,
                intensity,
                peptideSequence: pepData.sequence || peptideTag
            });
            setTooltipLeft(point.x + margin.left);
            setTooltipTop(point.y + margin.top);
        }
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
        if (onPeptideHover) onPeptideHover(null);
    };

    const handleMouseEnter = (peptideTag) => {
        if (onPeptideHover) onPeptideHover(peptideTag);
    };

    if (validPeptides.length === 0) {
        return (
            <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e9ecef", borderRadius: "4px" }}>
                <div style={{ color: "#6c757d" }}>Select peptides to view intensities</div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }}>
            <svg width={width} height={height}>
                <defs>
                    {/* Gradient for hover effect */}
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0.2} />
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
                    label="Samples"
                    labelOffset={30}
                    labelProps={{ fontSize: 12, fill: "#212529" }}
                    tickLabelProps={{ fontSize: 10, fill: "#6c757d" }}
                    tickFormat={(index) => allSampleTags[index] || String(index)}
                />
                <AxisLeft
                    scale={yScale}
                    left={margin.left}
                    top={margin.top}
                    label="Intensity"
                    labelOffset={30}
                    labelProps={{ fontSize: 12, fill: "#212529" }}
                    tickLabelProps={{ fontSize: 10, fill: "#6c757d" }}
                />

                {/* Line paths for each peptide */}
                <Group top={margin.top} left={margin.left}>
                    {validPeptides.map((peptideTag, pidx) => {
                        const intensities = getPeptideIntensities(peptideTag);
                        const color = colorScale(peptideTag);
                        const isHovered = hoverPeptideTag === peptideTag;
                        
                        // Create points array
                        const points = intensities.map((intensity, sidx) => ({
                            x: xScale(sidx),
                            y: intensity !== null ? yScale(intensity) : null,
                            intensity,
                            sampleTag: allSampleTags[sidx]
                        })).filter(p => p.y !== null);

                        // Draw line
                        if (points.length > 1) {
                            return (
                                <Group key={`peptide-line-${peptideTag}`}>
                                    <LinePath
                                        data={points}
                                        x={(d) => d.x}
                                        y={(d) => d.y}
                                        stroke={isHovered ? "#ff6b6b" : color}
                                        strokeWidth={isHovered ? 3 : 2}
                                        strokeOpacity={0.8}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        onMouseMove={(e) => handleMouseMove(e, peptideTag)}
                                        onMouseEnter={() => handleMouseEnter(peptideTag)}
                                        onMouseLeave={handleMouseLeave}
                                    />
                                    
                                    {/* Circles at each data point */}
                                    {points.map((point, idx) => (
                                        <circle
                                            key={`point-${peptideTag}-${idx}`}
                                            cx={point.x}
                                            cy={point.y}
                                            r={isHovered ? 6 : 4}
                                            fill={isHovered ? "#ff6b6b" : color}
                                            fillOpacity={0.8}
                                            stroke="white"
                                            strokeWidth={isHovered ? 2 : 1}
                                            onMouseMove={(e) => handleMouseMove(e, peptideTag)}
                                            onMouseEnter={() => handleMouseEnter(peptideTag)}
                                            onMouseLeave={handleMouseLeave}
                                        />
                                    ))}
                                </Group>
                            );
                        }
                        return null;
                    })}
                </Group>

                {/* Legend */}
                <Group top={margin.top} left={margin.left + innerWidth + 10}>
                    {validPeptides.slice(0, 10).map((peptideTag, idx) => {
                        const color = colorScale(peptideTag);
                        const isHovered = hoverPeptideTag === peptideTag;
                        return (
                            <Group key={`legend-${peptideTag}`} top={idx * 20}>
                                <line
                                    x1={0}
                                    y1={0}
                                    x2={15}
                                    y2={0}
                                    stroke={isHovered ? "#ff6b6b" : color}
                                    strokeWidth={2}
                                />
                                <text
                                    x={20}
                                    y={5}
                                    fontSize={11}
                                    fill={isHovered ? "#ff6b6b" : "#212529"}
                                    fontWeight={isHovered ? "bold" : "normal"}
                                >
                                    {peptideTag}
                                </text>
                            </Group>
                        );
                    })}
                    {validPeptides.length > 10 && (
                        <text x={0} y={210} fontSize={10} fill="#6c757d">
                            +{validPeptides.length - 10} more
                        </text>
                    )}
                </Group>
            </svg>

            {/* Tooltip */}
            {tooltipData && (
                <div
                    style={{
                        position: "absolute",
                        top: tooltipTop - 50,
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
                    <div><strong>{tooltipData.peptideTag}</strong></div>
                    <div>Sample: {tooltipData.sampleTag}</div>
                    <div>Intensity: {tooltipData.intensity.toFixed(2)}</div>
                    <div>Seq: {tooltipData.peptideSequence.slice(0, 20)}{tooltipData.peptideSequence.length > 20 ? "..." : ""}</div>
                </div>
            )}
        </div>
    );
}

export default PeptideIntensityPlot;
