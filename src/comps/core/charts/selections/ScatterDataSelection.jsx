import PropType from "prop-types"
import { Divider } from "@blueprintjs/core"
import { ScatterMarksSelection } from "../../../protein/charts/resultCard/chartselection/ScatterMarksSelection"
import { TextSelection } from "../../../protein/charts/resultCard/chartselection/TextSelection"
import { DownloadData } from "../../../protein/charts/resultCard/chartselection/DownloadChart"
import { AxisSelection } from "./AxisSelection"
import { AnnotationSelection } from "./AnnotationSelection"
import _ from "lodash"
import { StringSearch } from "./StringSearch"
import { ResetZoomSVG } from "../../svg/icons/chartSelection/ResetZoom"


ScatterDataSelection.propTypes = {
    keyNames: PropType.arrayOf(PropType.string).isRequired,
    title: PropType.string, 
    idx: PropType.number.isRequired,
    numericKeyNames: PropType.arrayOf(PropType.string).isRequired,
    selection: PropType.object,
    handleStringSearch: PropType.func.isRequired, 
    minimal: PropType.bool,
    downloadElements: PropType.arrayOf(PropType.oneOf(["svg", "data"])),
    elementNames: PropType.arrayOf(PropType.string),
    elementTypes: PropType.arrayOf(),
    fileNames: PropType.arrayOf(PropType.string),
    onAnnotationSelect: PropType.func 
}


ScatterDataSelection.defaultProps = {
    title: "",
    idx: 1,
    numericKeyNames: [],
    selection: {},
    minimal: true,
    downloadElements: [],
    elementNames: [],
    elementTypes: [],
    fileNames: [],
    onAnnotationSelect: null
    
}

/**
 * 
 * @param {Object} props
 * @param {String[]} props.keyNames All keyNames that can be selected.
 * @param {String[]} props.numericKeyNames Numeric keyNames
 * @param {Object} props.selection The current selection.
 * @param {[]} props.downloadElements - The SVG ID or the actually array data Object[]
 * @param {('svg'|'data')[]} props.elementTypes - The element types based on which the download function is set. 
 * @param {String[]} props.elementNames - What is shown to the user in the menu
 * @param {String[]} props.fileNames - The file names to download must match the length of elementNames and downloadElements. 

 * @returns 
 */
export function ScatterDataSelection({ keyNames, title, idx, numericKeyNames, selection, setSelection, minimal, handleStringSearch, downloadElements, elementNames, elementTypes, fileNames, itemIsAttribute = true, numericIsAttribute = true, chartIdx, 
                                        setTriggerResetAxisZoom, onAnnotationSelect, showAxisSelection = true, showMarksSelection = true }) {

    const nonNumericKeyNames = keyNames.filter(keyName => !numericKeyNames.includes(keyName))
    const onSelection = (key, value) => {
        setSelection(idx,key,value)
    }
    return (
        <div><h3>{title}</h3>
            <div className="flex center-items">
                {showAxisSelection ? <AxisSelection
                    keyNames={numericKeyNames}
                selection={selection}
                onSelectionChange={onSelection}
                    minimal={minimal}
                    itemIsAttribute={numericIsAttribute} /> : null}
                {showMarksSelection ?
                    <ScatterMarksSelection
                    keyNames={keyNames}
                    selection={selection}
                    onSelectionChange={onSelection}
                        minimal={minimal}
                    numericIsAttribute={numericIsAttribute}
                    itemIsAttribute={itemIsAttribute} /> : null}
                
        
                {_.isFunction(handleStringSearch) ? <StringSearch
                    idx = {idx}
                    keyNames={nonNumericKeyNames}
                    selection={selection}
                    onSelectionChange={onSelection}
                    minimal={minimal} 
                    handleStringSearch={handleStringSearch} 
                    itemIsAttribute={itemIsAttribute}
                /> : null }
                {_.isFunction(onAnnotationSelect) ? (
                    <AnnotationSelection
                        onAnnotationSelect={onAnnotationSelect}
                        minimal={minimal}
                    />
                ) : null}
                <div className="flex">
                    <Divider />
                    <DownloadData elements={downloadElements} elementNames={elementNames} elementTypes={elementTypes} fileNames={fileNames} itemIsAttribute={itemIsAttribute} />
                    <button style={{border : "none", backgroundColor : "transparent"}} onClick={() => setTriggerResetAxisZoom(chartIdx)}><ResetZoomSVG /></button>
            </div>

            </div>
            </div>
    )

}
