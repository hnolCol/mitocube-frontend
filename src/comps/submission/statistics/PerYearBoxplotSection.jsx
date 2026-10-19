import _ from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { Menu, MenuItem, Popover } from "@blueprintjs/core"
import viz from "@mitocube/viz"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { DownloadSvgButton } from "@/comps/core/base/buttons/DownloadSvgButton"

/**
 * Shared shell for per-year boxplot statistics. Expects quantile rows of the
 * form { year, min, q25, median, q75, max, N }, one box per year, laid out
 * side by side (no overlap) on a shared y scale. The last years (up to
 * pinnedYearCount) remain as toggle chips and are on by default.
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
    svgHeight = 260,
    pinnedYearCount = 3
}) {
    const rows = _.isArray(data) ? data : []
    const years = useMemo(() => _.uniq(rows.map(d => d.year)).sort((a, b) => a - b), [rows])
    const pinnedYears = useMemo(() => _.takeRight(years, pinnedYearCount), [years, pinnedYearCount])
    const [extraYears, setExtraYears] = useState([])
    const [hiddenPinnedYears, setHiddenPinnedYears] = useState([])

    const visibleYears = years.filter(y => pinnedYears.includes(y) || extraYears.includes(y))
    const shownYears = visibleYears.filter(y => !hiddenPinnedYears.includes(y))
    const visibleRows = rows.filter(d => shownYears.includes(d.year))
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
                {visibleYears.map(year => {
                    const isPinned = pinnedYears.includes(year)
                    if (isPinned) {
                        const isShown = !hiddenPinnedYears.includes(year)
                        return <button
                            key={year}
                            className="basic-button--small"
                            style={{ backgroundColor: isShown ? undefined : "#f9f9f9", opacity: isShown ? undefined : 0.5 }}
                            onClick={() => setHiddenPinnedYears(isShown ? _.union(hiddenPinnedYears, [year]) : hiddenPinnedYears.filter(y => y !== year))}
                        >
                            {year}
                        </button>
                    }
                    return <OptionButton
                        key={year}
                        isSelected={true}
                        onClick={() => setExtraYears(extraYears.filter(y => y !== year))}
                    >
                        {year}
                    </OptionButton>
                })}
                {remainingYears.length > 0 ? <Popover
                    placement="bottom"
                    content={<Menu>
                        {remainingYears.map(year => <MenuItem
                            key={year}
                            text={year}
                            onClick={() => setExtraYears(_.union(extraYears, [year]))}
                        />)}
                    </Menu>}
                >
                    <OptionButton isSelected={false}>More years…</OptionButton>
                </Popover> : null}
                <DownloadSvgButton chartRef={chartAreaRef} fileName={`${title.replace(/\s+/g, "_").toLowerCase()}.svg`} />
            </div>
            <div ref={chartAreaRef} style={{ width: "100%" }}>
                <viz.charts.minimal.MinimalBoxplots
                    qs={visibleRows}
                    width={chartAreaWidth || 640}
                    height={svgHeight}
                    spaceBetween={40}
                    showMedian={true}
                    medianSuffix={medianSuffix}
                    yaxisLabel={yaxisLabel}
                />
            </div>
        </div> : null}
    </div>
}
