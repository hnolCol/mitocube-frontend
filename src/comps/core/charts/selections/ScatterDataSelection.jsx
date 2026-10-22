import PropType from "prop-types"
import { Divider } from "@blueprintjs/core"
import _ from "lodash"
import { ScatterMarksSelection } from "../../../protein/charts/resultCard/chartselection/ScatterMarksSelection"
import { TextSelection } from "../../../protein/charts/resultCard/chartselection/TextSelection"
import { DownloadData } from "../../../protein/charts/resultCard/chartselection/DownloadChart"
import { AxisSelection } from "./AxisSelection"
import { AnnotationSelection } from "./AnnotationSelection"
import { StringSearch } from "./StringSearch"
import { ResetZoomSVG } from "../../svg/icons/chartSelection/ResetZoom"

ScatterDataSelection.propTypes = {
    keyNames: PropType.arrayOf(PropType.string).isRequired,
    title: PropType.string,
    idx: PropType.number.isRequired,
    numericKeyNames: PropType.arrayOf(PropType.string).isRequired,
    selection: PropType.object,
    setSelection: PropType.func.isRequired,
    handleStringSearch: PropType.func,
    minimal: PropType.bool,
    downloadElements: PropType.arrayOf(PropType.oneOfType([PropType.string, PropType.arrayOf(PropType.object)])),
    elementNames: PropType.arrayOf(PropType.string),
    elementTypes: PropType.arrayOf(PropType.oneOf(["svg", "data"])),
    fileNames: PropType.arrayOf(PropType.string),
    onAnnotationSelect: PropType.func,
    setSelection: PropType.func.isRequired,
    chartIdx: PropType.number,
    colorAndSizeKeyNames: PropType.arrayOf(PropType.string),
    setTriggerResetAxisZoom: PropType.func,
    showAxisSelection: PropType.bool,
    showMarksSelection: PropType.bool,
    colorAndSizeAreAttributes: PropType.bool
}



/**
 * @description Toolbar above a scatter chart to select the plotted key names (x/y axis, color, size),
 * search/filter the data, download the chart elements and reset the zoom. Each feature is only rendered
 * if its required props are provided.
 * @param {Object} props
 * @param {String[]} props.keyNames - All keyNames available in the data. Used for the marks (color/size) selection.
 * @param {String[]} props.numericKeyNames - Numeric keyNames. Used for the x/y axis selection.
 * @param {Object} props.selection - The current selection (e.g. xaxisName, yaxisName, colorName, sizeName, filterNames).
 * @param {Function} props.setSelection - Called as setSelection(idx, key, value) when a selection changes.
 * @param {Number} props.idx - Index of the chart within the parent, used to address the selection entry.
 * @param {Number} props.chartIdx - Index of the chart within the whole chart series.
 * @param {Function} props.handleStringSearch - If provided, a search input is shown. Called with (keyNames, searchString).
 * @param {[]} props.downloadElements - The SVG ID or the actual array data Object[]
 * @param {('svg'|'data')[]} props.elementTypes - The element types based on which the download function is set.
 * @param {String[]} props.elementNames - What is shown to the user in the download menu.
 * @param {String[]} props.fileNames - The file names to download must match the length of elementNames and downloadElements.
 * @param {Boolean} props.itemIsAttribute - If true, non-numeric items are treated as attribute tags (fetched from the backend).
 * @param {Boolean} props.numericIsAttribute - If true, numeric items (x/y axis) are treated as attribute tags.
 * @param {Function} props.onAnnotationSelect - If provided, an annotation selection is shown.
 * @param {Function} props.setTriggerResetAxisZoom - If provided, a reset zoom button is shown. Called with the chartIdx.
 * @param {Boolean} props.showAxisSelection - If the x/y axis selection should be shown.
 * @param {Boolean} props.showMarksSelection - If the color/size selection should be shown.
 * @param {Boolean} props.colorAndSizeAreAttributes - If the color/size items should be treated as attribute tags regardless of itemIsAttribute.
 * @returns
 */
export function ScatterDataSelection({ 
  keyNames, 
  title = "", 
  idx = 1, 
  numericKeyNames = [], 
  selection = {}, 
  setSelection, 
  minimal = true, 
  handleStringSearch, 
  downloadElements = [], 
  elementNames = [], 
  elementTypes = [], 
  fileNames = [], 
  itemIsAttribute = true, 
  numericIsAttribute = true, 
  chartIdx,                         
  colorAndSizeKeyNames = [],                             
  setTriggerResetAxisZoom, 
  onAnnotationSelect = null, 
  showAxisSelection = true, 
  showMarksSelection = true, 
  colorAndSizeAreAttributes = false }) {

    const nonNumericKeyNames = keyNames.filter(keyName => !numericKeyNames.includes(keyName))
    const onSelection = (key, value) => setSelection(idx, key, value)

    return (
        <div><h3>{title}</h3>
            <div className="flex center-items">
                {showAxisSelection ?
                    <AxisSelection
                        keyNames={numericKeyNames}
                        selection={selection}
                        onSelectionChange={onSelection}
                        minimal={minimal}
                        itemIsAttribute={numericIsAttribute} />
                    : null}
                {showMarksSelection ?
                    <ScatterMarksSelection
                        keyNames={colorAndSizeKeyNames.length === 0 ? keyNames : colorAndSizeKeyNames}
                        selection={selection}
                        onSelectionChange={onSelection}
                        minimal={minimal}
                        numericIsAttribute={numericIsAttribute}
                        itemIsAttribute={itemIsAttribute || colorAndSizeAreAttributes} />
                    : null}
                {_.isFunction(handleStringSearch) ?
                    <StringSearch
                        idx={idx}
                        keyNames={nonNumericKeyNames}
                        selection={selection}
                        onSelectionChange={onSelection}
                        minimal={minimal}
                        handleStringSearch={handleStringSearch}
                        itemIsAttribute={itemIsAttribute} />
                    : null}
                {_.isFunction(onAnnotationSelect) ?
                    <AnnotationSelection
                        onAnnotationSelect={onAnnotationSelect}
                        minimal={minimal} />
                    : null}
                <div className="flex">
                    <Divider />
                    <DownloadData
                        elements={downloadElements}
                        elementNames={elementNames}
                        elementTypes={elementTypes}
                        fileNames={fileNames}
                        itemIsAttribute={itemIsAttribute} />
                    {_.isFunction(setTriggerResetAxisZoom) ?
                        <button style={{ border: "none", backgroundColor: "transparent" }} onClick={() => setTriggerResetAxisZoom(chartIdx)}>
                            <ResetZoomSVG />
                        </button>
                        : null}
                </div>
            </div>
        </div>
    )
}
