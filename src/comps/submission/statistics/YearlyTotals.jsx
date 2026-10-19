import _ from "lodash"
import { useMemo, useRef, useState, useEffect } from "react"
import { LinePath, Circle } from "@visx/shape"
import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis"
import { GridRows } from "@visx/grid"
import { Group } from "@visx/group"
import { scaleLinear, scaleBand } from "@visx/scale"
import { curveMonotoneX } from "@visx/curve"
import { schemeCategory10 } from "d3-scale-chromatic"
import { Tooltip as BlueprintTooltip } from "@blueprintjs/core"
import { api } from "@/api"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"

const HEIGHT = 340
const MARGIN = { top: 20, right: 60, bottom: 40, left: 60 }
const SUBMISSIONS_COLOR = "#4a90d9"
const SAMPLES_COLOR = "#d9822b"

const SPLIT_OPTIONS = [
    { key: "total", label: "Total" },
    { key: "research_group", label: "Research Group" },
    { key: "user", label: "User" },
]

const MAX_SERIES = 7
const OTHERS_COLOR = "#9aa0a6"

/**
 * Submissions (left y-axis) and samples (right y-axis) per year as line graphs.
 * Total mode sums the per-group rows of the research group counts endpoints;
 * research group and user modes draw one line per group / user. The user counts
 * endpoint provides submission counts only, so the samples axis is hidden in
 * user mode. No additional backend endpoints are required.
 */
export function YearlyTotalsSection({ statisticsFilter }) {

    const [split, setSplit] = useState("total")

    const { data: submissionRows, isLoading: isLoadingSubmissions, isSuccess: isSubmissionsSuccess, isError: isSubmissionsError, error: submissionsError } =
        api.stats.submissions.useGetResearchGroupSubmissionCounts({ ...statisticsFilter }, { retry: false })
    const { data: sampleRows, isLoading: isLoadingSamples, isSuccess: isSamplesSuccess, isError: isSamplesError, error: samplesError } =
        api.stats.submissions.useGetResearchGroupSampleCounts({ ...statisticsFilter }, { retry: false })
    const { data: userRows, isLoading: isLoadingUsers, isSuccess: isUsersSuccess, isError: isUsersError, error: usersError } =
        api.stats.submissions.useGetUserSubmissionCounts({ ...statisticsFilter }, { retry: false })

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

    const subs = useMemo(() => _.isArray(submissionRows) ? submissionRows : [], [submissionRows])
    const smps = useMemo(() => _.isArray(sampleRows) ? sampleRows : [], [sampleRows])
    const usrs = useMemo(() => _.isArray(userRows) ? userRows : [], [userRows])

    const { years, series, samplesPerYear } = useMemo(() => {
        const allYears = _.union(subs.map(d => d.year), smps.map(d => d.year), usrs.map(d => d.year)).filter(_.isNumber).sort((a, b) => a - b)
        const samplesPerYear = allYears.map(year => _.sumBy(smps.filter(d => d.year === year), "value"))

        let series = []
        if (split === "total") {
            series = [{
                group: "Total",
                color: SUBMISSIONS_COLOR,
                valuesPerYear: allYears.map(year => _.sumBy(subs.filter(d => d.year === year), "value"))
            }]
        } else {
            const source = split === "research_group" ? subs : usrs
            const groups = _.uniq(source.map(d => d.group))
            let groupSeries = groups
                .map((group, gi) => ({
                    group,
                    color: schemeCategory10[(gi + 1) % 10],
                    valuesPerYear: allYears.map(year => _.sumBy(source.filter(d => d.group === group && d.year === year), "value"))
                }))
                .filter(s => _.sum(s.valuesPerYear) > 0)
            groupSeries = _.orderBy(groupSeries, [s => _.sum(s.valuesPerYear)], ["desc"])
            if (groupSeries.length > MAX_SERIES) {
                const kept = _.take(groupSeries, MAX_SERIES)
                const rest = groupSeries.slice(MAX_SERIES)
                kept.push({
                    group: `Others (${rest.length})`,
                    color: OTHERS_COLOR,
                    valuesPerYear: allYears.map((year, i) => _.sum(rest.map(s => s.valuesPerYear[i])))
                })
                groupSeries = kept
            }
            series = groupSeries
        }
        return { years: allYears, series, samplesPerYear }
    }, [subs, smps, usrs, split])

    const width = _.isNumber(chartAreaWidth) && chartAreaWidth > 0 ? chartAreaWidth : 600
    const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 50)
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom

    const xScale = useMemo(() => scaleBand({
        domain: years.length > 0 ? years : ["-"],
        range: [MARGIN.left, MARGIN.left + innerWidth],
        padding: 0.4
    }), [years, innerWidth])

    const maxSubmissions = _.max([_.max(_.flatMap(series, s => s.valuesPerYear).filter(_.isNumber), 0), 1])
    const submissionsScale = useMemo(() => scaleLinear({
        domain: [0, maxSubmissions * 1.1],
        range: [MARGIN.top + innerHeight, MARGIN.top],
        nice: true
    }), [maxSubmissions, innerHeight])

    const showSamplesAxis = split !== "user"
    const maxSamples = _.max([_.max(samplesPerYear, 1), 1])
    const samplesScale = useMemo(() => scaleLinear({
        domain: [0, maxSamples * 1.1],
        range: [MARGIN.top + innerHeight, MARGIN.top],
        nice: true
    }), [maxSamples, innerHeight])

    const isLoading = isLoadingSubmissions || isLoadingSamples || (split === "user" && isLoadingUsers)
    const isError = isSubmissionsError || (split === "user" ? isUsersError : isSamplesError)
    const isSuccess = isSubmissionsSuccess && (split === "user" ? isUsersSuccess : isSamplesSuccess)
    const error = submissionsError || (split === "user" ? usersError : samplesError)
    const hasData = years.length > 0 && series.length > 0

    const xCenter = year => (xScale(year) + xScale.bandwidth() / 2) || MARGIN.left

    return <div className="bg--white div--round padding--medium margin-top--medium">
        <div className="flex justify-between center-items" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            <h4 style={{ margin: 0 }}>Submissions and Samples per Year</h4>
            <div className="flex center-items" style={{ gap: "0.3rem" }}>
                {SPLIT_OPTIONS.map(option => <OptionButton
                    key={option.key}
                    isSelected={split === option.key}
                    onClick={() => setSplit(option.key)}
                >
                    {option.label}
                </OptionButton>)}
            </div>
        </div>
        <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            {split === "total"
                ? "Total number of submissions (left axis) and samples (right axis) per year, aggregated over all research groups."
                : split === "research_group"
                    ? "Number of submissions (left axis) and samples (right axis) per year, one line per research group."
                    : "Number of submissions per year, one line per user. Sample counts are not available per user, so the samples axis is hidden."}
        </p>
        {isError ? <div style={{ color: "#a82a2a" }}>Failed to load statistics. {_.get(error, "message", "")}</div> : null}
        {isLoading ? <div>Loading...</div> : null}
        {isSuccess && !hasData ? <div>No data available yet.</div> : null}
        {isSuccess && hasData ? <div ref={chartAreaRef}>
            <svg width={width} height={HEIGHT}>
                <GridRows
                    scale={submissionsScale}
                    width={innerWidth}
                    left={MARGIN.left}
                    top={MARGIN.top}
                    stroke="#e0e0e0"
                />
                <AxisBottom
                    top={MARGIN.top + innerHeight}
                    scale={xScale}
                    tickFormat={_.toString}
                />
                <AxisLeft
                    scale={submissionsScale}
                    left={MARGIN.left}
                    numTicks={5}
                    label="Submissions"
                    labelOffset={-45}
                />
                {showSamplesAxis ? <AxisRight
                    scale={samplesScale}
                    left={MARGIN.left + innerWidth}
                    numTicks={5}
                    label="Samples"
                    labelOffset={45}
                /> : null}
                <Group>
                    {series.map(s => <Group key={s.group}>
                        <LinePath
                            data={years}
                            x={xCenter}
                            y={(year, i) => submissionsScale(s.valuesPerYear[i])}
                            stroke={s.color}
                            strokeWidth={2}
                            curve={curveMonotoneX}
                        />
                        {years.map((year, i) => <Circle
                            key={year}
                            cx={xCenter(year)}
                            cy={submissionsScale(s.valuesPerYear[i])}
                            r={3.5}
                            fill={s.color}
                        />)}
                    </Group>)}
                    {showSamplesAxis ? <Group>
                        <LinePath
                            data={years}
                            x={xCenter}
                            y={(year, i) => samplesScale(samplesPerYear[i] || 0)}
                            stroke={SAMPLES_COLOR}
                            strokeWidth={2}
                            curve={curveMonotoneX}
                        />
                        {years.map((year, i) => <Circle
                            key={year}
                            cx={xCenter(year)}
                            cy={samplesScale(samplesPerYear[i] || 0)}
                            r={3.5}
                            fill={SAMPLES_COLOR}
                        />)}
                    </Group> : null}
                    {years.map((year, i) => <BlueprintTooltip
                        key={year}
                        content={<div style={{ maxWidth: "14rem" }}>
                            <div><strong>{year}</strong></div>
                            {series.map(s => <div key={s.group} className="flex center-items" style={{ gap: "0.3rem" }}>
                                <span style={{ width: "0.6rem", height: "0.6rem", backgroundColor: s.color, display: "inline-block", borderRadius: "2px" }} />
                                {s.group}: {s.valuesPerYear[i] || 0} submissions
                            </div>)}
                            {showSamplesAxis ? <div>{samplesPerYear[i]} samples (total)</div> : null}
                        </div>}
                    >
                        <circle cx={xCenter(year)} cy={MARGIN.top} r={9} fill="transparent" />
                    </BlueprintTooltip>)}
                </Group>
            </svg>
            {series.length > 1 ? <div className="flex flex--wrap" style={{ gap: "0.75rem", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                {series.map(s => <span key={s.group} className="flex center-items" style={{ gap: "0.3rem" }}>
                    <span style={{ width: "0.75rem", height: "0.25rem", backgroundColor: s.color, display: "inline-block" }} />
                    {s.group}
                </span>)}
            </div> : null}
            {series.length === 1 ? <div className="flex center-items" style={{ gap: "1rem", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                <span className="flex center-items" style={{ gap: "0.3rem" }}>
                    <span style={{ width: "0.75rem", height: "0.25rem", backgroundColor: SUBMISSIONS_COLOR, display: "inline-block" }} />
                    Submissions
                </span>
                {showSamplesAxis ? <span className="flex center-items" style={{ gap: "0.3rem" }}>
                    <span style={{ width: "0.75rem", height: "0.25rem", backgroundColor: SAMPLES_COLOR, display: "inline-block" }} />
                    Samples
                </span> : null}
            </div> : null}
        </div> : null}
    </div>
}
