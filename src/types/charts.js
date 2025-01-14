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
 * @property {Set} hoverIndices -- The indices (e.g. item index in data) that are currently under the hovering event of the user. 
 * charts as well.
 */



/**
 * @typedef ChartLabelProps 
 * @
 */


// hoverProps : {hoverData : hoverData.data,rerenderHover : hoverData.rerender, hoverPosition : hoverData.rect, hoverChart : hoverData.hoverChart},


// filterProps: {
//     rerenderBackground: backgroundScatter.rerender,
//         filterIndices : backgroundScatter.filterIndices,
//         filterRange : backgroundScatter.filterRange,
//         searchIndices : backgroundScatter.searchIndices,
//             resetSearchIdcs
// }

// data,
//             chartIdx,
//             valid : validIndices[chartIdx],
//             xaxisName,
//             yaxisName,
//             limits,
//             handleItemSelection,
//             findIndexInRectangle,
//             findDataInRectangle,
//             setHoverDataInRectangle,
//             handleNumericFilter,
//             handleStringSearch,
//             handleSearchByDataIndex,
//             filterDataInKeyByValue,
//             setHoverDataByDataIndex,
//             findClosestPoint,
//             hoverProps : {hoverData : hoverData.data, rerenderHover : hoverData.rerender, hoverPosition : hoverData.rect, hoverChart : hoverData.hoverChart, hoverIndices : hoverData.idcs},
//             filterProps: { rerenderBackground: backgroundScatter.rerender, filterIndices: backgroundScatter.filterIndices, filterRange: backgroundScatter.filterRange, searchIndices: backgroundScatter.searchIndices, resetSearchIdcs, searchString : backgroundScatter.searchString },
//             labelProps : {labelIndices : labelData.idcs, labelRerender : labelData.rerender, labelChart : labelData.labelChart, lastSelected : labelData.lastSelected}
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
 * @property {} labelProps 
 * @property {Object.<string,Object.<string, Number>} limits The limits of the respective data, should include all xaxisName and yaxisName and is intended to be used 
 * to calculate the chart scale. The limit is provided by 'min' and 'max'. Example {"x" : {"min" : 0, "max" : 10}}
 * @property {Function} handleNumericFilter - Function that can handle a numeric filter. It takes the following 
 * arguments: (chartIdx, keyName, min = -Infinity, max = Infinity). The keyName indicates on which key in the data (list of objects) the
 * numeric filter should be applied. 
 * @property {Function} setHoverDataInRectangle Defines the rectangle for which the underlying data should be found. E.g. the mouse hovers
 * over the data point and the InteractiveChart is processing the data. Then the hover effect in on echart is transfered to all other charts. 
 * Takes the arguments: setHoverDataInRectangle = (chartIdx, minX, minY, maxX, maxY, screenPosition). minX, minY, maxX and maxY are data limits
 * to be used for filtering the data. Applied to the data plotted in the chart identified by its chartIdx. The screenPosition is the pixel screen position in x,y given as an array
 * @property {Function} findClosestPoint 
 * @property {Function} handleItemSelection 
 * @property {Function} handleStringSearch Function that handles a string search event. This is intended to be used for visualizing the data that match the filtering
 * @property {Function} 
 *  */


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