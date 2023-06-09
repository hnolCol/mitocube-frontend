import { Dialog } from "@blueprintjs/core"
import { Header } from "../../../core/base/Header"
import { TableLikeItem } from "../../../core/base/tags/TableLikeItem"
import _ from "lodash"
import { extractGroupsByRunNameFromGrouping } from "../../../../services/groupings/runNameWithGrouping"

function SubmissionOverviewDialog(props) {
    
    const { dataID, paramsFile, paramNames, onClose, ...rest } = props

    if (dataID === undefined) return null 
    if (!_.isObject(paramsFile)) return null 
    if (_.isEmpty(paramsFile)) return null 
    
    console.log(paramNames)
    let groupingsMappedToRunNames = extractGroupsByRunNameFromGrouping(paramsFile)

    return (
        <Dialog className="middle-m" style={{ width: "80vw", height: "85vh" }} onClose={onClose} title={`Submission Overview ${dataID}`}{...rest}>
            <div className="dialog__container" style={{overflowY : "scroll"}}>
            {paramNames.map(attrName => {
                if (!_.has(paramsFile,attrName)) return null
                
                return (
                    <TableLikeItem key={attrName} {...{ attrName, attr: paramsFile[attrName] }} />
                )
            }
                )}
            <Header text="Sample Names"/>
            {Object.keys(groupingsMappedToRunNames).map(runName => <MCTableLikeItem key={runName} {... { attrName: runName, attr: groupingsMappedToRunNames[runName] }} />)}
            </div>
        </Dialog>
    )
}


export default SubmissionOverviewDialog