
/**
 * @description Calcultates the ```chartWidth```and ```chartHeight``` based on the defined margins.
 * @param {Object} props 
 * @param {Number} props.width 
 * @param {Number} props.height 
 * @param {import("../../types/charts").ChartMargins} props.margins 
 * @returns {Object}  The chartWidth and chartHeight in an object.
 */
export function getChartWidthAndHeightWithMargins({width, height, margins}) {
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom
    return {chartWidth, chartHeight}
}