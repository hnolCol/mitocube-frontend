import { useMemo } from "react"
import _ from "lodash"
import { scaleBand, scaleLinear } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { GridRows } from "@visx/grid"
import { Group } from "@visx/group"
import { Text } from "@visx/text"
import { SVG } from "../SVGHeader"
import Bar from "../barplot/Bar"
import { getColorPalette } from "@mitocube/viz/src/colors/palette"
import { getAxisStrokeColor } from "@mitocube/viz/src/colors/stroke"

const DEFAULT_MARGINS = { left: 50, right: 15, bottom: 60, top: 15 }
const YEAR_OPACITY = { current: 1.0, previous: 0.45, older: 0.2 }

/**
 * Grouped bar chart comparing years (opacity) across categories (color).
 *
 * @param {Object} props
 * @param {Array} props.data - flat rows: [{ group, year, value }]
 * @param {Array} props.years - ordered years, ascending
 * @param {Array} props.groups - ordered group labels
 * @param {number} props.width
 * @param {number} props.height
 * @param {string} props.yaxisLabel
 * @param {string} props.svgID
 */
export function GroupedYearComparisonChart({
    data = [],
    years = [],
    groups = [],
    width = 640,
    height = 360,
    margins = DEFAULT_MARGINS,
    yaxisLabel = "Count",
    svgID = "grouped-year-comparison-chart"
}) {
    const currentYear = years.length > 0 ? Math.max(...years) : null
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom

    const valueByGroupYear = useMemo(() => {
        return _.fromPairs(data.map(d => [`${d.group}::${d.year}`, d.value]))
    }, [data])

    const yMax = useMemo(() => {
        return Math.max(1, ...data.map(d => d.value))
    }, [data])

    const xScale = useMemo(() => {
        return scaleBand({
            domain: groups,
            range: [margins.left, margins.left + chartWidth],
            round: true,
            padding: 0.3
        })
    }, [groups, width])

    const yearScale = useMemo(() => {
        return scaleBand({
            domain: years,
            range: [0, xScale.bandwidth()],
            round: true,
            padding: 0.1
        })
    }, [years, groups, width])

    const yScale = useMemo(() => {
        return scaleLinear({
            domain: [0, yMax * 1.1],
            range: [margins.top + chartHeight, margins.top],
            nice: true
        })
    }, [yMax, height])

    const colorPalette = useMemo(() => getColorPalette(Math.max(groups.length, 1)), [groups])
    const colorByGroup = useMemo(() => {
        return _.fromPairs(groups.map((g, i) => [g, colorPalette[i % colorPalette.length]]))
    }, [groups])

    const yearOpacity = year => {
        if (year === currentYear) return YEAR_OPACITY.current
        return year === currentYear - 1 ? YEAR_OPACITY.previous : YEAR_OPACITY.older
    }

    return (
        <SVG {...{ width, height, svgID }}>
            <AxisLeft scale={yScale} left={margins.left} label={yaxisLabel} labelOffset={25} numTicks={6} />
            <GridRows
                scale={yScale}
                stroke={getAxisStrokeColor()}
                width={chartWidth}
                numTicks={6}
                left={margins.left}
                strokeWidth={0.5}
                top={margins.top}
            />
            {groups.map(group => {
                const x0 = xScale(group)
                return <Group key={`group-${group}`}>
                    {years.map(year => {
                        const value = valueByGroupYear[`${group}::${year}`]
                        if (value === undefined) return null
                        const x = x0 + yearScale(year)
                        const y = yScale(value)
                        return <Bar
                            key={`bar-${group}-${year}`}
                            x={x}
                            y1={y}
                            y0={yScale(0)}
                            width={yearScale.bandwidth()}
                            fill={colorByGroup[group]}
                            opacity={yearOpacity(year)}
                        />
                    })}
                </Group>
            })}
            <AxisBottom
                scale={xScale}
                top={margins.top + chartHeight}
                label="Research Group"
                numTicks={Math.max(groups.length, 1)}
                tickLabelProps={() => ({ textAnchor: "end", angle: -30, fontSize: 10, x: 0, y: 0 })}
            />
            <Group top={margins.top + chartHeight + margins.bottom - 20}>
                {years.map((year, i) => <Group key={`year-${year}`} left={margins.left + i * 60}>
                    <rect
                        x={0}
                        y={-10}
                        width={12}
                        height={12}
                        fill={"#888888"}
                        opacity={yearOpacity(year)}
                    />
                    <Text x={17} y={0} fontSize={11} verticalAnchor="middle">{year}</Text>
                </Group>)}
            </Group>
        </SVG>
    )
}

export default GroupedYearComparisonChart
