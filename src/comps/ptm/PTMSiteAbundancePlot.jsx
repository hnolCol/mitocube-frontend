import { useMemo, useState } from "react";
import _ from "lodash";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { localPoint } from "@visx/event";

/**
 * Bar chart of a PTM site's quantification values across samples.
 *
 * Data comes from GET /api/features/ptms/{ptm_site_tag}/abundance which returns
 * records of { sample_tag, value, score, site_localization }.
 *
 * @param {Object} props
 * @param {Object[]} props.abundanceData - Abundance records ({ sample_tag, value, score, site_localization }).
 * @param {number} [props.width=800]
 * @param {number} [props.height=400]
 * @returns {JSX.Element}
 */
function PTMSiteAbundancePlot({ abundanceData = [], width = 800, height = 400 }) {
    const [tooltip, setTooltip] = useState(null);

    const margin = { top: 20, right: 20, bottom: 120, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const records = useMemo(() => {
        return _.chain(abundanceData)
            .filter(d => _.isString(d.sample_tag) && _.isNumber(d.value))
            .sortBy("sample_tag")
            .value();
    }, [abundanceData]);

    const xScale = useMemo(() => {
        return scaleBand({
            domain: records.map(d => d.sample_tag),
            range: [0, innerWidth],
            padding: 0.2
        });
    }, [records, innerWidth]);

    const yScale = useMemo(() => {
        if (records.length === 0) return scaleLinear({ domain: [0, 1], range: [innerHeight, 0] });
        const values = records.map(d => d.value);
        let min = Math.min(...values, 0);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1 || 1;
        return scaleLinear({
            domain: [min - padding, max + padding],
            range: [innerHeight, 0],
            nice: true
        });
    }, [records, innerHeight]);

    if (records.length === 0) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e9ecef" }}>
                <p>This PTM site is not quantified in any sample.</p>
            </div>
        );
    }

    const handleMouseMove = (event, record) => {
        const point = localPoint(event);
        if (!point) return;
        setTooltip({
            record,
            left: point.x + 12,
            top: point.y - 12
        });
    };

    return (
        <div className="position--relative">
            <svg width={width} height={height}>
                <Group top={margin.top} left={margin.left}>
                    <GridRows
                        scale={yScale}
                        width={innerWidth}
                        stroke="#e9ecef"
                    />
                    {records.map(record => {
                        const barHeight = innerHeight - yScale(record.value);
                        const barWidth = xScale.bandwidth();
                        const barX = xScale(record.sample_tag);
                        const barY = yScale(record.value);
                        return (
                            <Bar
                                key={record.sample_tag}
                                x={barX}
                                y={barY}
                                width={barWidth}
                                height={Math.max(barHeight, 0)}
                                fill="#5c7cfa"
                                opacity={tooltip && tooltip.record.sample_tag === record.sample_tag ? 1 : 0.8}
                                onMouseMove={event => handleMouseMove(event, record)}
                                onMouseLeave={() => setTooltip(null)}
                            />
                        );
                    })}
                    <AxisBottom
                        top={innerHeight}
                        scale={xScale}
                        tickLabelProps={() => ({
                            fill: "#495057",
                            fontSize: 10,
                            textAnchor: "end",
                            angle: -45,
                            dy: "0.3em"
                        })}
                    />
                    <AxisLeft scale={yScale} />
                </Group>
            </svg>
            {tooltip ? (
                <div
                    style={{
                        position: "absolute",
                        left: tooltip.left,
                        top: tooltip.top,
                        backgroundColor: "white",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        fontSize: "11px",
                        pointerEvents: "none"
                    }}
                >
                    <div>{tooltip.record.sample_tag}</div>
                    <div>value: {_.round(tooltip.record.value, 3)}</div>
                    {_.isNumber(tooltip.record.score) ? <div>score: {_.round(tooltip.record.score, 3)}</div> : null}
                    {_.isNumber(tooltip.record.site_localization) ? <div>localization: {_.round(tooltip.record.site_localization, 3)}</div> : null}
                </div>
            ) : null}
        </div>
    );
}

export default PTMSiteAbundancePlot;
