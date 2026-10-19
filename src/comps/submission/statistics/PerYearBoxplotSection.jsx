import _ from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { Menu, MenuItem, Popover } from "@blueprintjs/core"
import viz from "@mitocube/viz"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"

/**
 * Shared shell for per-year boxplot statistics. Expects quantile rows of the
 * form { year, min, q25, median, q75, max, N }, one box per year, laid out
 * side by side (no overlap) on a shared y scale.
 */
export function PerYearBoxplotSection({
    title,
    description,
    data,
    isSuccess,
    isLoading,
    isError,
    error,
    yaxisLabel,
    medianSuffix = "",
    svgHeight = 260
}) {
    const rows = _.isArray(data) ? data : []
    const years = useMemo(() => _.uniq(rows.map(d => d.year)).sort((a, b) => a - b), [rows])
    const [selectedYears, setSelectedYears] = useState(null)

    useEffect(() => {
        if (selectedYears === null && years.length > 0) {
            setSelectedYears(_.takeRight(years, 5))
        }
    }, [years, selectedYears])

    const visibleRows = selectedYears === null ? rows : rows.filter(d => selectedYears.includes(d.year))
    const visibleYears = visibleRows.map(d => d.year)
    const remainingYears = years.filter(y => !visibleYears.includes(y))
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
    }, [isSuccess, rows.length])

    return <div className="bg--white div--round padding--medium margin-top--medium">
        <h4 style={{ margin: 0 }}>{title}</h4>
        {description ? <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{description}</p> : null}
        {isError ? <div style={{ color: "#a82a2a" }}>Failed to load statistics. {_.get(error, "message", "")}</div> : null}
        {isLoading ? <div>Loading...</div> : null}
        {isSuccess && rows.length === 0 ? <div>No data available yet.</div> : null}
        {isSuccess && rows.length > 0 ? <div className="flex flex-column">
            <div className="flex" style={{ gap: "0.3rem", margin: "0.3rem 0" }}>
                <span style={{ fontSize: "0.75rem", color: "#888", alignSelf: "center" }}>Years:</span>
                {visibleYears.map(year => <OptionButton
                    key={year}
                    isSelected={true}
                    onClick={() => setSelectedYears(visibleYears.filter(y => y !== year))}
                >
                    {year}
                </OptionButton>)}
                {remainingYears.length > 0 ? <Popover
                    placement="bottom"
                    content={<Menu>
                        {remainingYears.map(year => <MenuItem
                            key={year}
                            text={year}
                            onClick={() => setSelectedYears(_.union(visibleYears, [year]))}
                        />)}
                    </Menu>}
                >
                    <OptionButton isSelected={false}>More years…</OptionButton>
                </Popover> : null}
            </div>
            <div ref={chartAreaRef} style={{ width: "100%" }}>
                <viz.charts.minimal.MinimalBoxplots
                    qs={visibleRows}
                    xtickLabels={visibleYears.map(String)}
                    width={chartAreaWidth || 640}
                    height={svgHeight}
                    showMedian={true}
                    medianSuffix={medianSuffix}
                    yaxisLabel={yaxisLabel}
                />
            </div>
        </div> : null}
    </div>
}
