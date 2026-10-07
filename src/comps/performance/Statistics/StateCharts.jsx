import _ from "lodash"
import { useMemo } from "react"
import { api } from "@/api"
import viz from "@mitocube/viz"
import { Card, PRIMARY_COLOR, RUNNING_STATE_TAG, useStateHistory } from "./Components"

export function InstrumentStateDurationChart({ instrument_tag }) {
    const { durations, states, ready } = useStateHistory(instrument_tag)
    const segments = useMemo(() => (ready ? viz.utils.totalDurationByState(durations, states) : []), [durations, states, ready])

    return (
        <div className="margin-top--medium">
            <viz.text.SectionLabel>STATE HISTORY</viz.text.SectionLabel>
            <div className="margin-top--little">
                {segments.length > 0 ? (
                    <viz.charts.state.StateDurationPie segments={segments} />
                ) : (
                    <viz.text.EmptyState>No state history</viz.text.EmptyState>
                )}
            </div>
        </div>
    )
}

export function InstrumentStateHeatmap({ instrument_tag }) {
    const { durations, states, ready } = useStateHistory(instrument_tag)
    const { years, byYear } = useMemo(
        () => (ready ? viz.utils.splitStatesByYear(durations, states) : { years: [], byYear: {} }),
        [durations, states, ready]
    )

    return (
        <Card label={years.length ? "TIME IN STATE BY YEAR" : null}>
            {years.length ? (
                <viz.charts.state.StateTimeline years={years} byYear={byYear} />
            ) : (
                <viz.text.EmptyState>No state history</viz.text.EmptyState>
            )}
        </Card>
    )
}

export function UtilizationStat({ instrument_tag }) {
    const { data: durations, isSuccess } = api.instruments.core.useGetInstrumentStateDurations({ tag: instrument_tag })
    const utilization = useMemo(
        () => (isSuccess && _.isArray(durations) ? viz.utils.stateTimeShare(durations, RUNNING_STATE_TAG) : null),
        [durations, isSuccess]
    )
    if (utilization == null) return null

    return (
        <Card label="UTILIZATION" style={{ height: "100%", boxSizing: "border-box" }}>
            <div className="flex center-items" style={{ gap: "1rem" }}>
                <div style={{ flexShrink: 0, width: "80px", height: "80px" }}>
                    <viz.charts.state.RingGauge percent={utilization} color={PRIMARY_COLOR} />
                </div>
                <div style={{ fontSize: "0.8rem", color: "#888", minWidth: 0 }}>
                    Time spent Running vs total tracked time since first recorded state.
                </div>
            </div>
        </Card>
    )
}