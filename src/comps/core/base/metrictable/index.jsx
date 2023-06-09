import PropTypes from "prop-types"
import "./table.css"
import { Button } from "@blueprintjs/core"
import { copyTextToClipboardFromArrayOfObjects } from "../../../../services/clipboard"

MetricTable.propTpyes = {
    data: PropTypes.array,
    
}

// metric table show a name of a metric and a value. 
// hence it has only two columns 
function MetricTable({data = [{name : "Proteins", value : 8230}, {name : "Peptides", value : 28230}, {name : "Material", value : "HeLa"}], showClipboard = false}) {
    

    return (
        <div className="table__container">
            {showClipboard ? <Button icon="clipboard" small="true" minimal="true" onClick={() => copyTextToClipboardFromArrayOfObjects({ data })} /> : null}
            <table>
                <tbody>
                {data.map((d,idx) => {
                    return (
                        <tr key={`${idx}-metric-table-row`}>
                            <td className="table__item table__item--align-right">
                                {d.name}: 
                            </td>
                            <td className="table__item--align-center bg--lightgrey">
                                <span className={`h${0}-span`}>{d.value}</span>
                                
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