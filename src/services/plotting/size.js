export function getChartWidthAndHeightWithMargins(width, height, margins) {
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom
    return {chartWidth, chartHeight}
}