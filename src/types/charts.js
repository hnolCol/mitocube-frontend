/**
 * @typedef ChartFilterProps 
 * @type {Object}
 * @property {Number[] | String[]} rerenderBackground - Array of values that cause a rerender of the background if any of the values changes.
 * @property {Set<Number>} filterIndices - Array of data indices if it not an empty set, only indices that are present will be shown.
 * @property {Number[]} filterRange - An array of two numbers, min and max that was used to filter.
 * @property {Set<Number>} searchIndices - The indicies that match a certain string based filtering.
 * @property {Function} resetSearchIdcs - Function to reset the search string based filtering.
 */

/**
 * @typedef ChartHoverProps
 * @type {Object}
 * @property {Object[]} hoverData - A subset of the original data that should be displayed as hover data
 * @property {Number[] | String[]} rerenderHover - Array of values that cause a rerender (e.g. must be controlled outside the plot)
 * when the hover daa change. Otherwise the underlying plot should not rerender.
 * @property {Number[]} hoverPosition - Position of the hover as x and y coordinates for left and top tooltip position.
 * @property {Number} hoverChart - The chartIdx that actually hovered. In case of multiple charts, the hover information is displayed in the other 
 * charts as well.
 */



// hoverProps : {hoverData : hoverData.data,rerenderHover : hoverData.rerender, hoverPosition : hoverData.rect, hoverChart : hoverData.hoverChart},


// filterProps: {
//     rerenderBackground: backgroundScatter.rerender,
//         filterIndices : backgroundScatter.filterIndices,
//         filterRange : backgroundScatter.filterRange,
//         searchIndices : backgroundScatter.searchIndices,
//             resetSearchIdcs
// }


/**
 * @typedef InteractiveChartResponse
 * @property {Object[]} data - The data as an array of objects for the interactive chart.
 * @property {Number} chartIdx - The index of the chart. 
 * @property {String} xaxisName - The keyName present in each item of the data array used for the x-axis
 * @property {String} yaxisName - The keyName present in each item of the data array used for the y-axis
 * @property {Object.<string, Boolean[]>} valid - ChartIdx (keys) based object with values as arrays with boolean indicating of 
 * the data array at the given index is valid (e.g. in x and yaxisNames valid values.)
 * @property {ChartFilterProps} filterProps The filter props of the interactive chart (either numeric filtering or text based)
 * @property {ChartHoverProps} hoverProps - The hover props. Includes a rerender signal for the hover scatter plots.
 */


// data,
//                                 chartIdx,
//                                 xaxisName,
//                                 yaxisName,
//                                 valid,
//                                 limits,
//                                 handleItemSelection,
//                                 findIndexInRectangle,
//                                 findDataInRectangle,
//                                 setHoverDataInRectangle,
//                                 handleNumericFilter,
//                                 handleStringSearch,
//                                 handleSearchByDataIndex,
//                                 hoverProps,
//                                 filterProps

/**
 * @typedef ChartMargins 
 * @property {Number} left - Left margin in pixels 
 * @property {Number} right - Right margin in pixels 
 * @property {Number} top - Top margin in pixels 
 * @property {Number} bottom - Bottom margin in pixels. 
 */

export default {}