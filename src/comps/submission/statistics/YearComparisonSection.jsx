import _ from "lodash"
import { useEffect, useMemo, useState } from "react"
import { Menu, MenuItem, Popover } from "@blueprintjs/core"
import { GroupedYearComparisonChart } from "@mitocube/viz/src/charts/yearcomparison"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"

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
    const [selectedYears, setSelectedYears] = useState(null)

    useEffect(() => {
        if (selectedYears === null && years.length > 0) {
            setSelectedYears(_.takeRight(years, 3))
        }
    }, [years, selectedYears])

    const visibleYears = selectedYears === null ? years : years.filter(y => selectedYears.includes(y))
    const visibleRows = selectedYears === null ? rows : rows.filter(d => selectedYears.includes(d.year))
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
            <GroupedYearComparisonChart
                data={visibleRows}
                years={visibleYears}
                groups={visibleGroups}
                yaxisLabel={yaxisLabel}
                xaxisLabel={xaxisLabel}
                svgID={svgID}
            />
        </div> : null}
    </div>
}
