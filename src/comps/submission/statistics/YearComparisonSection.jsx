import _ from "lodash"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button, Menu, MenuItem, Popover } from "@blueprintjs/core"
import { GroupedYearComparisonChart } from "@mitocube/viz/src/charts/yearcomparison"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { arrayObjectsToString, downloadTxtFile } from "@/services/downloads/txt"

/**
 * Shared shell for year-comparison statistics. Expects rows of the form
 * { group, label, year, value } and renders a grouped bar chart where years
 * are encoded by opacity and groups by color.
 */
export function YearComparisonSection({
    title,
    description,
    data,
    isSuccess,
    isLoading,
    isError,
    error,
    yaxisLabel = "Count",
    xaxisLabel = undefined,
    controls = null,
    svgID = "year-comparison-chart"
}) {
    const rows = _.isArray(data) ? data : []
    const years = useMemo(() => _.uniq(rows.map(d => d.year)).sort((a, b) => a - b), [rows])
    const groups = useMemo(() => _.uniq(rows.map(d => d.group)), [rows])
    const pinnedYears = useMemo(() => _.takeRight(years, 3), [years])
    const [extraYears, setExtraYears] = useState([])
    const [showAllGroups, setShowAllGroups] = useState(false)
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

    const visibleYears = years.filter(y => pinnedYears.includes(y) || extraYears.includes(y))
    const visibleRows = rows.filter(d => visibleYears.includes(d.year))
    const remainingYears = years.filter(y => !visibleYears.includes(y))
    const visibleGroups = _.uniq(visibleRows.map(d => d.group))

    return <div className="bg--white div--round padding--medium margin-top--medium">
        <div className="flex justify-between center-items" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            <h4 style={{ margin: 0 }}>{title}</h4>
            {controls}
        </div>
        {description ? <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{description}</p> : null}
        {isError ? <div style={{ color: "#a82a2a" }}>Failed to load statistics. {_.get(error, "message", "")}</div> : null}
        {isLoading ? <div>Loading...</div> : null}
        {isSuccess && rows.length === 0 ? <div>No data available yet.</div> : null}
        {isSuccess && rows.length > 0 ? <div className="flex flex-column">
            <div className="flex" style={{ gap: "0.3rem", margin: "0.3rem 0" }}>
                <span style={{ fontSize: "0.75rem", color: "#888", alignSelf: "center" }}>Years:</span>
                {visibleYears.map(year => {
                    const isPinned = pinnedYears.includes(year)
                    return isPinned ? <span
                        key={year}
                        className="padding--little margin-left--little"
                        style={{ backgroundColor: "#efefef", borderRadius: "5px", fontSize: "0.85rem", cursor: "default" }}
                    >
                        {year}
                    </span> : <OptionButton
                        key={year}
                        isSelected={true}
                        onClick={() => setExtraYears(extraYears.filter(y => y !== year))}
                    >
                        {year}
                    </OptionButton>
                })}
                <Button
                    small
                    icon="download"
                    text="Download all years"
                    onClick={() => downloadTxtFile(arrayObjectsToString({ array: rows }), `${svgID}_all_years`)}
                />
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
                {visibleGroups.length > 1 ? <OptionButton
                    isSelected={showAllGroups}
                    onClick={() => setShowAllGroups(!showAllGroups)}
                >
                    {showAllGroups ? "Top groups" : "All groups"}
                </OptionButton> : null}
            </div>
            <div ref={chartAreaRef} style={{ width: "100%" }}>
                <GroupedYearComparisonChart
                    data={visibleRows}
                    years={visibleYears}
                    groups={visibleGroups}
                    colorGroups={groups}
                    width={chartAreaWidth || 640}
                    maxGroups={showAllGroups ? null : "auto"}
                    yaxisLabel={yaxisLabel}
                    xaxisLabel={xaxisLabel}
                    svgID={svgID}
                />
            </div>
        </div> : null}
    </div>
}
