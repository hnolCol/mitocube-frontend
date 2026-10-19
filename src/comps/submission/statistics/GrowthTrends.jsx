import _ from "lodash"
import { useMemo, useRef, useState, useEffect } from "react"
import { LinePath, Circle, Bar } from "@visx/shape"
import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis"
import { Group } from "@visx/group"
import { scaleLinear, scaleBand } from "@visx/scale"
import { curveMonotoneX } from "@visx/curve"
import { Tooltip as BlueprintTooltip } from "@blueprintjs/core"
import { api } from "@/api"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { DownloadSvgButton } from "@/comps/core/base/buttons/DownloadSvgButton"
import { arrayObjectsToString, downloadTxtFile } from "@/services/downloads/txt"

const HEIGHT = 300
const MARGIN = { top: 20, right: 70, bottom: 50, left: 70 }
const SUBMISSIONS_COLOR = "#4a90d9"
const SAMPLES_COLOR = "#d9822b"
const MEDIAN_COLOR = "#2f9b45"
const VIEW_OPTIONS = [
    { key: "cumulative", label: "Cumulative" },
    { key: "yearly", label: "Per Year" },
]

const AXIS_LABEL_PROPS = { fontSize: "0.8rem", textAnchor: "middle" }
const TICK_LABEL_PROPS = () => ({ fontSize: 10, textAnchor: "end", verticalAnchor: "middle" })
const TICK_LABEL_PROPS_RIGHT = () => ({ fontSize: 10, textAnchor: "start", verticalAnchor: "middle" })

function useChartWidth() {
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
    return { chartAreaRef, chartAreaWidth }
}

/**
 * Growth trends over time, derived from rows already fetched by the statistics
 * page (no additional endpoints required):
 * - Submissions and samples per year and cumulative (A/B),
 * - Median project duration per year (C), from the durations quantile rows.
 */
export function GrowthTrendsSection({ statisticsFilter }) {

    const { data: submissionRows, isSuccess: isSubsSuccess } = api.stats.submissions.useGetResearchGroupSubmissionCounts({ ...statisticsFilter }, { retry: false })
    const { data: sampleRows } = api.stats.submissions.useGetResearchGroupSampleCounts({ ...statisticsFilter }, { retry: false })
    const { data: durationRows } = api.stats.submissionDurations.useGetSubmissionDuration({
        state_01: 0,
        state_02: 4,
        aggregate: "dist",
        group_by_year: true,
        ...statisticsFilter
    }, { retry: false, enabled: _.isNull(statisticsFilter.state) })

    const [view, setView] = useState("yearly")

    const { years, submissionsPerYear, samplesPerYear, cumulativeSubmissions, cumulativeSamples, medianDurationsPerYear } = useMemo(() => {
        const subs = _.isArray(submissionRows) ? submissionRows : []
        const smps = _.isArray(sampleRows) ? sampleRows : []
        const durs = _.isArray(durationRows) ? durationRows : []
        const years = _.union(subs.map(d => d.year), smps.map(d => d.year)).filter(_.isNumber).sort((a, b) => a - b)
        const submissionsPerYear = years.map(year => _.sumBy(subs.filter(d => d.year === year), "value"))
        const samplesPerYear = years.map(year => _.sumBy(smps.filter(d => d.year === year), "value"))
        let cumulativeSubmissions = []
        let cumulativeSamples = []
        _.reduce(submissionsPerYear, (acc, v) => { acc += v; cumulativeSubmissions.push(acc); return acc }, 0)
        _.reduce(samplesPerYear, (acc, v) => { acc += v; cumulativeSamples.push(acc); return acc }, 0)
        const medianDurationsPerYear = years.map(year => {
            const row = durs.find(d => _.toNumber(d.year) === _.toNumber(year))
            return row && _.isNumber(row.median) ? row.median : null
        })
        return { years, submissionsPerYear, samplesPerYear, cumulativeSubmissions, cumulativeSamples, medianDurationsPerYear }
    }, [submissionRows, sampleRows, durationRows])

    const { chartAreaRef, chartAreaWidth } = useChartWidth()
    const width = _.isNumber(chartAreaWidth) && chartAreaWidth > 0 ? chartAreaWidth : 600
    const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 50)
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom

    const xScale = useMemo(() => scaleBand({
        domain: years.length > 0 ? years : ["-"],
        range: [MARGIN.left, MARGIN.left + innerWidth],
        padding: 0.4
    }), [years, innerWidth])

    const submissionsValues = view === "cumulative" ? cumulativeSubmissions : submissionsPerYear
    const samplesValues = view === "cumulative" ? cumulativeSamples : samplesPerYear

    const leftScale = useMemo(() => scaleLinear({
        domain: [0, _.max([_.max(submissionsValues, 1), 1]) * 1.1],
        range: [MARGIN.top + innerHeight, MARGIN.top],
        nice: true
    }), [submissionsValues, innerHeight])

    const rightScale = useMemo(() => scaleLinear({
        domain: [0, _.max([_.max(samplesValues, 1), 1]) * 1.1],
        range: [MARGIN.top + innerHeight, MARGIN.top],
        nice: true
    }), [samplesValues, innerHeight])

    const hasData = years.length > 0
    const xCenter = year => (xScale(year) + xScale.bandwidth() / 2) || MARGIN.left
    const downloadRows = years.map((year, i) => ({
        year,
        submissions: submissionsValues[i],
        samples: samplesValues[i],
        median_project_duration_days: medianDurationsPerYear[i]
    }))

    return <div className="bg--white div--round padding--medium margin-top--medium">
        <div className="flex justify-between center-items" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            <h4 style={{ margin: 0 }}>Growth Trends</h4>
            <div className="flex center-items" style={{ gap: "0.3rem" }}>
                {VIEW_OPTIONS.map(option => <OptionButton
                    key={option.key}
                    isSelected={view === option.key}
                    onClick={() => setView(option.key)}
                >
                    {option.label}
                </OptionButton>)}
                {isSubsSuccess && hasData ? <button
                    className="basic-button--small"
                    onClick={() => downloadTxtFile(arrayObjectsToString({ array: downloadRows }), "growth_trends")}
                >
                    Download
                </button> : null}
                {isSubsSuccess && hasData ? <DownloadSvgButton chartRef={chartAreaRef} fileName="growth_trends.svg" /> : null}
            </div>
        </div>
        <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            Submissions (left axis) and samples (right axis) {view === "cumulative" ? "cumulated over time" : "per year"}{medianDurationsPerYear.some(_.isNumber) ? ", with the median project duration per year (green, dashed, right axis, days)" : ""}.
        </p>
        {isSubsSuccess && hasData ? <div ref={chartAreaRef}>
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
                    label="Submissions"
                    labelOffset={30}
                    labelProps={AXIS_LABEL_PROPS}
                    tickLength={3}
                    tickLabelProps={TICK_LABEL_PROPS}
                />
                <AxisRight
                    scale={rightScale}
                    left={MARGIN.left + innerWidth}
                    numTicks={5}
                    label="Samples"
                    labelOffset={30}
                    labelProps={AXIS_LABEL_PROPS}
                    tickLength={3}
                    tickLabelProps={TICK_LABEL_PROPS_RIGHT}
                />
                <Group>
                    <LinePath
                        data={years}
                        x={xCenter}
                        y={(year, i) => leftScale(submissionsValues[i])}
                        stroke={SUBMISSIONS_COLOR}
                        strokeWidth={2}
                        curve={curveMonotoneX}
                    />
                    <LinePath
                        data={years}
                        x={xCenter}
                        y={(year, i) => rightScale(samplesValues[i])}
                        stroke={SAMPLES_COLOR}
                        strokeWidth={2}
                        curve={curveMonotoneX}
                    />
                    {years.map((year, i) => <Group key={year}>
                        <Circle cx={xCenter(year)} cy={leftScale(submissionsValues[i])} r={3.5} fill={SUBMISSIONS_COLOR} />
                        <Circle cx={xCenter(year)} cy={rightScale(samplesValues[i])} r={3.5} fill={SAMPLES_COLOR} />
                    </Group>)}
                    {medianDurationsPerYear.some(_.isNumber) ? <LinePath
                        data={years.filter((year, i) => _.isNumber(medianDurationsPerYear[i]))}
                        x={xCenter}
                        y={year => rightScale(medianDurationsPerYear[years.indexOf(year)])}
                        stroke={MEDIAN_COLOR}
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        curve={curveMonotoneX}
                    /> : null}
                    {years.map((year, i) => <BlueprintTooltip
                        key={year}
                        content={<div>
                            <div><strong>{year}</strong></div>
                            <div>{submissionsValues[i]} submissions</div>
                            <div>{samplesValues[i]} samples</div>
                            {_.isNumber(medianDurationsPerYear[i]) ? <div>{_.round(medianDurationsPerYear[i], 1)} days median project duration</div> : null}
                        </div>}
                    >
                        <circle cx={xCenter(year)} cy={MARGIN.top} r={9} fill="transparent" />
                    </BlueprintTooltip>)}
                </Group>
            </svg>
            <div className="flex center-items" style={{ gap: "1rem", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                <span className="flex center-items" style={{ gap: "0.3rem" }}>
                    <span style={{ width: "0.75rem", height: "0.25rem", backgroundColor: SUBMISSIONS_COLOR, display: "inline-block" }} />
                    Submissions
                </span>
                <span className="flex center-items" style={{ gap: "0.3rem" }}>
                    <span style={{ width: "0.75rem", height: "0.25rem", backgroundColor: SAMPLES_COLOR, display: "inline-block" }} />
                    Samples
                </span>
                {medianDurationsPerYear.some(_.isNumber) ? <span className="flex center-items" style={{ gap: "0.3rem" }}>
                    <span style={{ width: "0.75rem", height: "0.25rem", backgroundColor: MEDIAN_COLOR, display: "inline-block" }} />
                    Median project duration (days)
                </span> : null}
            </div>
        </div> : <div>No data available yet.</div>}
    </div>
}

/**
 * Active users per year: distinct users with at least one submission per year.
 * Derived from the per-user counts rows (a user appears with value > 0 per
 * year they submitted), so no additional endpoint is required.
 */
export function ActiveUsersSection({ statisticsFilter }) {

    const { data: userRows, isLoading, isSuccess, isError, error } = api.stats.submissions.useGetUserSubmissionCounts({ ...statisticsFilter }, { retry: false })

    const { years, activeUsersPerYear } = useMemo(() => {
        const usrs = _.isArray(userRows) ? userRows : []
        const years = _.uniq(usrs.map(d => d.year)).filter(_.isNumber).sort((a, b) => a - b)
        const activeUsersPerYear = years.map(year => usrs.filter(d => d.year === year && d.value > 0).length)
        return { years, activeUsersPerYear }
    }, [userRows])

    const { chartAreaRef, chartAreaWidth } = useChartWidth()
    const width = _.isNumber(chartAreaWidth) && chartAreaWidth > 0 ? chartAreaWidth : 600
    const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 50)
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom

    const xScale = useMemo(() => scaleBand({
        domain: years.length > 0 ? years : ["-"],
        range: [MARGIN.left, MARGIN.left + innerWidth],
        padding: 0.4
    }), [years, innerWidth])

    const yScale = useMemo(() => scaleLinear({
        domain: [0, _.max([_.max(activeUsersPerYear, 1), 1]) * 1.1],
        range: [MARGIN.top + innerHeight, MARGIN.top],
        nice: true
    }), [activeUsersPerYear, innerHeight])

    const hasData = years.length > 0
    const xCenter = year => (xScale(year) + xScale.bandwidth() / 2) || MARGIN.left
    const downloadRows = years.map((year, i) => ({ year, active_users: activeUsersPerYear[i] }))

    return <div className="bg--white div--round padding--medium margin-top--medium">
        <div className="flex justify-between center-items" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            <h4 style={{ margin: 0 }}>Active Users per Year</h4>
            {isSuccess && hasData ? <div className="flex center-items" style={{ gap: "0.3rem" }}>
                <button
                    className="basic-button--small"
                    onClick={() => downloadTxtFile(arrayObjectsToString({ array: downloadRows }), "active_users_per_year")}
                >
                    Download
                </button>
                <DownloadSvgButton chartRef={chartAreaRef} fileName="active_users_per_year.svg" />
            </div> : null}
        </div>
        <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            Distinct users with at least one submission per year. Shows whether growth is driven by more users or more submissions per user.
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
                    scale={yScale}
                    left={MARGIN.left}
                    numTicks={5}
                    label="Active Users"
                    labelOffset={30}
                    labelProps={AXIS_LABEL_PROPS}
                    tickLength={3}
                    tickLabelProps={TICK_LABEL_PROPS}
                />
                <Group>
                    {years.map((year, i) => <Bar
                        key={year}
                        x={xScale(year)}
                        y={yScale(activeUsersPerYear[i])}
                        width={xScale.bandwidth()}
                        height={Math.max(innerHeight - (yScale(activeUsersPerYear[i]) - MARGIN.top), 0)}
                        fill={SUBMISSIONS_COLOR}
                        opacity={0.85}
                        rx={3}
                    />)}
                    {years.map((year, i) => <BlueprintTooltip
                        key={year}
                        content={<div><strong>{year}</strong><div>{activeUsersPerYear[i]} active users</div></div>}
                    >
                        <circle cx={xCenter(year)} cy={yScale(activeUsersPerYear[i])} r={9} fill="transparent" />
                    </BlueprintTooltip>)}
                </Group>
            </svg>
        </div> : null}
    </div>
}
