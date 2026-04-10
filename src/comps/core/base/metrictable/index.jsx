import PropTypes from "prop-types"
import "./table.css"
import { Button } from "@blueprintjs/core"
import { copyTextToClipboardFromArrayOfObjects } from "../../../../services/clipboard"
import _ from "lodash"
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette"



MetricTable.propTpyes = {
    data: PropTypes.array,
    
}

/**
 * @description JSX Element to display multiple metrices
 * @param {Object} props
 * @param {Object[]} props.data - The data metrices to display. Object are expected to have a ```text``` and ```value``` property. 
 * @param {Boolean} props.showClipboard - If true, a clipboard icon will be shown, a click on the icon copies the table. 
 * @param {Boolean} props.round - If true the value (if number) will be rounded using ```_.round(value, roundPrecision)```. 
 * @param {Number} props.roundPrecision - If rounding is enabled, the precision to be used. Defaults to 2. 
 * @param {String[]} props.highlight - Array of text values, if the text value of a row is included in the array, the row will be highlighted.
 * @returns {Element} JSX Element.
 */
function MetricTable({
    data = [{ text: "Proteins", value: 8230 }, { text: "Peptides", value: 28230 }, { text: "Material", value: "HeLa" }],
    showClipboard = false,
    round = true,
    roundPrecision = 2,
    highlight = []}) {
    
    return (
        <div className="table__container" style={{maxWidth: "15rem", fontSize : "0.75rem"}}>
            {showClipboard ? <Button icon="clipboard" small="true" minimal="true" onClick={() => copyTextToClipboardFromArrayOfObjects({ data })} /> : null}
            <table>
                <tbody>
                    {data.map((d, idx) => {
                    const highlightRow = _.isArray(highlight ) && _.includes(highlight, d.text)
                    return (
                        <tr key={`${idx}-metric-table-row`} >
                            <td className="table__item table__item--align-right" style={highlightRow ? { fontWeight: "600" } : {}}>
                                {d.text}: 
                            </td>
                            <td className="table__item table__item--align-left bg--lightgrey" style={{ color : highlightRow ? HIGHLIGHT_COLOR : "inherit", fontWeight : highlightRow ? "600" : "inherit" }}>
                                <span >{_.isNumber(d.value) && round ? _.round(d.value,roundPrecision) : _.isBoolean(d.value) ?  _.toString(d.value): d.value}</span>
                                
                            </td>
                        </tr>
                    )
                })}
                </tbody>
        
            </table>

        </div>
    )
}


export default MetricTable