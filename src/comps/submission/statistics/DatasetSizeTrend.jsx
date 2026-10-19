import _ from "lodash"
import { useMemo, useRef, useState, useEffect } from "react"
import { LinePath, Circle } from "@visx/shape"
import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis"
import { Group } from "@visx/group"
import { scaleLinear, scaleBand } from "@visx/scale"
import { curveMonotoneX } from "@visx/curve"
import { Tooltip as BlueprintTooltip } from "@blueprintjs/core"
import { api } from "@/api"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { DownloadSvgButton } from "@/comps/core/base/buttons/DownloadSvgButton"
import { arrayObjectsToString, downloadTxtFile } from "@/services/downloads/txt"

const HEIGHT = 320
const MARGIN = { top: 20, right: 70, bottom: 50, left: 70 }

const AXIS_LABEL_PROPS = { fontSize: "0.8rem", textAnchor: "middle" }
const TICK_LABEL_PROPS = () => ({ fontSize: 10, textAnchor: "end", verticalAnchor: "middle" })
const TICK_LABEL_PROPS_RIGHT = () => ({ fontSize: 10, textAnchor: "start", verticalAnchor: "middle" })
const TOTALS_COLOR = "#7b4fd9"
const AVERAGE_COLOR = "#2f9b45"
const SAMPLES_COLOR = "#d9822b"

const VIEW_OPTIONS = [
    { key: "total", label: "Total per Year" },
    { key: "average", label: "Average per Submission" },
]

/**
 * Dataset size trend: quantified protein groups per year (E). Total mode shows
 * the sum of protein groups across submissions per year; average mode shows
 * the mean protein groups per submission per year. Samples per year (from the
 * existing samples counts endpoint) are always shown on the right axis for
 * context.
 * Expects rows of the form { year, protein_groups, submissions } from
 * /stats/submissions/counts/protein-groups.
 */
export function DatasetSizeTrendSection({ statisticsFilter }) {

    const [view, setView] = useState("total")

    const { data: pgRows, isLoading, isSuccess, isError, error } = api.stats.submissions.useGetProteinGroupCounts(
        { ...statisticsFilter },
        { retry: false }
    )
    const { data: sampleRows } = api.stats.submissions.useGetResearchGroupSampleCounts({ ...statisticsFilter }, { retry: false })

    const { years, pgPerYear, submissionsPerYear, avgPerYear, samplesPerYear } = useMemo(() => {
        const pgs = _.isArray(pgRows) ? pgRows : []
        const smps = _.isArray(sampleRows) ? sampleRows : []
        const years = _.uniq(pgs.map(d => d.year)).filter(_.isNumber).sort((a, b) => a - b)
        const rowsFor = year => pgs.filter(d => _.toNumber(d.year) === year)
        const pgPerYear = years.map(year => _.sumBy(rowsFor(year), "protein_groups"))
        const submissionsPerYear = years.map(year => _.sumBy(rowsFor(year), "submissions"))
        const avgPerYear = years.map((year, i) => submissionsPerYear[i] > 0 ? (pgPerYear[i] / submissionsPerYear[i]) : null)
        const samplesPerYear = years.map(year => _.sumBy(smps.filter(d => d.year === year), "value"))
        return { years, pgPerYear, submissionsPerYear, avgPerYear, samplesPerYear }
    }, [pgRows, sampleRows])

    const [chartAreaWidth, setChartAreaWidth] = useState(null)
    const chartAreaRef = useRef(null)

    useEffect(() => {
        const el = chartAreaRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const update = () => setChartAreaWidth(el.clientWidth)
        update()
        const observer = new ResizeObserver(update)
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const width = _.isNumber(chartAreaWidth) && chartAreaWidth > 0 ? chartAreaWidth : 600
    const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 50)
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom

    const xScale = useMemo(() => scaleBand({
        domain: years.length > 0 ? years : ["-"],
        range: [MARGIN.left, MARGIN.left + innerWidth],
        padding: 0.4
    }), [years, innerWidth])

    const primaryValues = view === "total" ? pgPerYear : avgPerYear
    const maxPrimary = _.max([_.max(primaryValues.filter(_.isNumber), 0), 1])

    const leftScale = useMemo(() => scaleLinear({
        domain: [0, maxPrimary * 1.1],
        range: [MARGIN.top + innerHeight, MARGIN.top],
        nice: true
    }), [maxPrimary, innerHeight])

    const maxSamples = _.max([_.max(samplesPerYear, 1), 1])
    const samplesScale = useMemo(() => scaleLinear({
        domain: [0, maxSamples * 1.1],
        range: [MARGIN.top + innerHeight, MARGIN.top],
        nice: true
    }), [maxSamples, innerHeight])

    const hasData = years.length > 0 && primaryValues.filter(_.isNumber).length > 0
    const downloadRows = years.map((year, i) => ({
        year,
        protein_groups: view === "total" ? pgPerYear[i] : avgPerYear[i],
        submissions: submissionsPerYear[i],
        samples: samplesPerYear[i]
    }))
    const primaryColor = view === "total" ? TOTALS_COLOR : AVERAGE_COLOR
    const xCenter = year => (xScale(year) + xScale.bandwidth() / 2) || MARGIN.left
    const primaryValue = i => _.isNumber(primaryValues[i]) ? primaryValues[i] : null

    return <div className="bg--white div--round padding--medium margin-top--medium">
        <div className="flex justify-between center-items" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            <h4 style={{ margin: 0 }}>Dataset Size Trend</h4>
            <div className="flex center-items" style={{ gap: "0.3rem" }}>
                {VIEW_OPTIONS.map(option => <OptionButton
                    key={option.key}
                    isSelected={view === option.key}
                    onClick={() => setView(option.key)}
                >
                    {option.label}
                </OptionButton>)}
                {isSuccess && hasData ? <button
                    className="basic-button--small"
                    onClick={() => downloadTxtFile(arrayObjectsToString({ array: downloadRows }), "dataset_size_trend")}
                >
                    Download
                </button> : null}
                {isSuccess && hasData ? <DownloadSvgButton chartRef={chartAreaRef} fileName="dataset_size_trend.svg" /> : null}
            </div>
        </div>
        <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            {view === "total"
                ? "Total quantified protein groups across all submissions per year (left axis), with the number of samples per year for context (right axis)."
                : "Average quantified protein groups per submission per year (left axis), with the number of samples per year for context (right axis)."}
        </p>
        {isError ? <div style={{ color: "#a82a2a" }}>Failed to load statistics. {_.get(error, "message", "")}</div> : null}
        {isLoading ? <div>Loading...</div> : null}
        {isSuccess && !hasData ? <div>No data available yet.</div> : null}
        {isSuccess && hasData ? <div ref={chartAreaRef}>
            <svg width={width} height={HEIGHT}>
                <AxisBottom
                    top={MARGIN.top + innerHeight}
                    scale={xScale}
                    tickFormat={_.toString}
                    tickLength={3}
                    tickLabelProps={() => ({ fontSize: 10, textAnchor: "middle", verticalAnchor: "start" })}
                />
                <AxisLeft
                    scale={leftScale}
                    left={MARGIN.left}
                    numTicks={5}
                    label={view === "total" ? "Protein Groups (total)" : "Protein Groups (avg/submission)"}
                    labelOffset={40}
                    labelProps={AXIS_LABEL_PROPS}
                    tickLength={3}
                    tickLabelProps={TICK_LABEL_PROPS}
                />
                <AxisRight
                    scale={samplesScale}
                    left={MARGIN.left + innerWidth}
                    numTicks={5}
                    label="Samples"
                    labelOffset={40}
                    labelProps={AXIS_LABEL_PROPS}
                    tickLength={3}
                    tickLabelProps={TICK_LABEL_PROPS_RIGHT}
                />
                <Group>
                    <LinePath
                        data={years}
                        x={xCenter}
                        y={(year, i) => leftScale(primaryValue(i) || 0)}
                        stroke={primaryColor}
                        strokeWidth={2}
                        curve={curveMonotoneX}
                    />
                    <LinePath
                        data={years}
                        x={xCenter}
                        y={(year, i) => samplesScale(samplesPerYear[i])}
                        stroke={SAMPLES_COLOR}
                        strokeWidth={2}
                        curve={curveMonotoneX}
                    />
                    {years.map((year, i) => <Group key={year}>
                        {_.isNumber(primaryValue(i)) ? <Circle cx={xCenter(year)} cy={leftScale(primaryValue(i))} r={3.5} fill={primaryColor} /> : null}
                        <Circle cx={xCenter(year)} cy={samplesScale(samplesPerYear[i])} r={3.5} fill={SAMPLES_COLOR} />
                    </Group>)}
                    {years.map((year, i) => <BlueprintTooltip
                        key={year}
                        content={<div>
                            <div><strong>{year}</strong></div>
                            {_.isNumber(primaryValue(i)) ? <div>{primaryValue(i)} protein groups {view === "average" ? "per submission (avg)" : "(total)"}</div> : null}
                            <div>{submissionsPerYear[i]} submissions</div>
                            <div>{samplesPerYear[i]} samples</div>
                        </div>}
                    >
                        <circle cx={xCenter(year)} cy={MARGIN.top} r={9} fill="transparent" />
                    </BlueprintTooltip>)}
                </Group>
            </svg>
            <div className="flex center-items" style={{ gap: "1rem", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                <span className="flex center-items" style={{ gap: "0.3rem" }}>
                    <span style={{ width: "0.75rem", height: "0.25rem", backgroundColor: primaryColor, display: "inline-block" }} />
                    {view === "total" ? "Protein Groups (total)" : "Protein Groups (avg/submission)"}
                </span>
                <span className="flex center-items" style={{ gap: "0.3rem" }}>
                    <span style={{ width: "0.75rem", height: "0.25rem", backgroundColor: SAMPLES_COLOR, display: "inline-block" }} />
                    Samples
                </span>
            </div>
        </div> : null}
    </div>
}
