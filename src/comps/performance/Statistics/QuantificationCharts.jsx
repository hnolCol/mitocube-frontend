import _ from "lodash"
import { useMemo, useState } from "react"
import { api } from "@/api"
import viz from "@mitocube/viz"
import { BigNumber, Card, PRIMARY_COLOR, useInstrumentOverview } from "./Components"

const THREE_YEARS_MS = 3 * 365 * 24 * 3600 * 1000
const METRIC_OPTIONS = [
    { key: "total", label: "Total" },
    { key: "perSample", label: "Per Sample" },
]

const groupProteins = summary =>
    viz.utils.groupByYearMonth(summary, {
        init: () => ({ proteins: 0, samples: 0, submissions: new Set() }),
        add: (b, d) => {
            b.proteins += d.protein_group_count || 0
            b.samples += d.sample_count || 0
            if (d.submission_tag) b.submissions.add(d.submission_tag)
            return b
        },
    })

function monthValue(m, metric) {
    if (!m || (m.samples === 0 && m.proteins === 0)) return null
    if (metric === "perSample") return m.samples > 0 ? m.proteins / m.samples : null
    return m.proteins
}

export function InstrumentQuantificationChart({ instrument_tag }) {
    const { data: summary, isSuccess } = api.instruments.core.useGetInstrumentQuantificationSummary({ tag: instrument_tag })
    const [metric, setMetric] = useState("total")
    const [pickedYears, setPickedYears] = useState(null) 

    const { years, byYear } = useMemo(
        () => (isSuccess && _.isArray(summary) ? groupProteins(summary) : { years: [], byYear: {} }),
        [summary, isSuccess]
    )

    const selectedYears = pickedYears ?? (years.length ? [years[0]] : [])
    const sortedSelected = [...selectedYears].sort((a, b) => a - b)
    const primaryYear = selectedYears.length ? Math.max(...selectedYears) : null

    const { data: uniqueCount, isSuccess: uniqueOk } = api.instruments.core.useGetInstrumentUniqueProteinGroupCount(
        { tag: instrument_tag, year: primaryYear },
        { enabled: primaryYear != null }
    )

    if (years.length === 0) {
        return <viz.text.EmptyState className="margin-top--medium">No quantification data yet</viz.text.EmptyState>
    }

    const series = sortedSelected.map(year => ({
        year,
        months: (byYear[year] || []).map(m => monthValue(m, metric)),
        color: viz.colors.series.seriesColor(years.indexOf(year)),
    }))
    const submissionCount = new Set(selectedYears.flatMap(y => (byYear[y] || []).flatMap(m => [...m.submissions]))).size

    return (
        <div className="margin-top--medium">
            <div className="flex justify-between center-items" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
                <viz.text.SectionLabel>PROTEINS QUANTIFIED</viz.text.SectionLabel>
                <viz.text.PillToggle options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
            </div>
            <div className="margin-top--little">
                <viz.text.ChipMultiSelect options={years} selected={selectedYears} onToggle={y => setPickedYears(_.xor(selectedYears, [y]))} />
            </div>
            <div className="flex margin-top--little" style={{ gap: "1.5rem", flexWrap: "wrap" }}>
                {primaryYear != null ? (
                    <BigNumber value={uniqueOk ? uniqueCount.toLocaleString() : "…"} label={`unique in ${primaryYear}`} />
                ) : null}
                <BigNumber value={submissionCount} label={`submission${submissionCount === 1 ? "" : "s"} (${sortedSelected.join(", ")})`} />
            </div>
            <div className="margin-top--little">
                <viz.charts.state.MonthlyBarLineChart
                    series={series}
                    tickStep={metric === "total" ? 1000 : 5}
                    decimals={metric === "perSample" ? 1 : 0}
                    showMedian={metric === "perSample"}
                />
            </div>
            {series.length > 1 ? <viz.text.Legend items={series.map(s => ({ label: s.year, color: s.color }))} /> : null}
        </div>
    )
}

export function InstrumentSamplesTrendChart({ instrument_tag }) {
    const timestamp_min = useMemo(() => Date.now() - THREE_YEARS_MS, [])
    const { data: summary, isSuccess } = api.instruments.core.useGetInstrumentQuantificationSummary({ tag: instrument_tag, timestamp_min })

    const series = useMemo(() => {
        if (!isSuccess || !_.isArray(summary)) return []
        const { years, byYear } = viz.utils.groupByYearMonth(summary, { add: (acc, d) => (acc ?? 0) + d.sample_count })
        return [...years].reverse().map((year, idx) => ({ year, months: byYear[year], color: viz.colors.series.seriesColor(idx) }))
    }, [summary, isSuccess])

    if (series.length === 0) return null

    return (
        <div className="margin-top--medium">
            <viz.text.SectionLabel>SAMPLES QUANTIFIED</viz.text.SectionLabel>
            <div className="margin-top--little">
                <viz.charts.state.MonthlyTrendLine series={series} yLabel="No. of samples" unit="samples" />
            </div>
            <viz.text.Legend items={series.map(s => ({ label: s.year, color: s.color }))} />
            <div className="margin-top--little" style={{ fontSize: "0.8rem", color: "#555" }}>
                <strong>{_.sumBy(summary, "sample_count")}</strong> samples quantified
            </div>
        </div>
    )
}

export function TotalVsQuantifiedStat({ instrument_tag }) {
    const instrument = useInstrumentOverview(instrument_tag)
    const { data: summary, isSuccess } = api.instruments.core.useGetInstrumentQuantificationSummary({ tag: instrument_tag })
    if (!instrument || !isSuccess) return null

    const total = instrument.sample_count
    const quantified = _.isArray(summary) ? _.sumBy(summary, "sample_count") : 0
    const pct = total > 0 ? Math.round((quantified / total) * 100) : 0

    return (
        <Card label="SAMPLES" style={{ height: "100%", boxSizing: "border-box" }}>
            <div className="flex" style={{ gap: "1.5rem" }}>
                <BigNumber stacked size="1.6rem" value={total} label="Total" />
                <BigNumber stacked size="1.6rem" value={quantified} label="Quantified" color={PRIMARY_COLOR} />
            </div>
            <div className="margin-top--little">
                <viz.charts.state.ProportionBar value={quantified} total={total} color={PRIMARY_COLOR} valueLabel="quantified" restLabel="not yet quantified" />
            </div>
            <div className="margin-top--little" style={{ fontSize: "0.75rem", color: "#aaa" }}>
                {pct}% of total samples quantified
            </div>
        </Card>
    )
}