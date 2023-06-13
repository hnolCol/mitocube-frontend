import { Button, ButtonGroup, Code, Menu, MenuItem, Icon } from "@blueprintjs/core"
import { useState } from "react"

import { Popover2} from "@blueprintjs/popover2"
import _ from "lodash"
import { downloadTxtFile } from "../../../services/downloads/txt"
import { extractGroupsByRunNameFromGrouping } from "../../../services/groupings/runNameWithGrouping"
import PropTypes from "prop-types"
import TooltipButton from "../../core/base/buttons/TooltipButton"

import "../submission.css"
import { Header } from "../../core/base/Header"
import SubmissionTimeLine from "./Timeline"
import { Combobox } from "../../core/input/Combobox"
import { downloadJSONFile } from "../../../services/downloads/json"
import { arrayOfObjectsToString } from "../../../services/arrays/transforms"

function extractMainParamsFromJSON(paramsFile) {
    //
    const extractedParams = Object.keys(paramsFile).map(v => {
        const value = paramsFile[v]
        return ({
            Parameter: v, Value: _.isString(value) ? _.replace(paramsFile[v], /\n/g, "") : _.isArray(value) && _.isString(value[0]) ? _.join(value, "\t") : JSON.stringify(value)
        })
    })
    
    return extractedParams 
}

function SubmissionHeader({ paramsFile,
    states,
    isOpen,
    setIsOpen,
    handleDelete,
    handleStateChange,
    isUpdated,
    handleUpdate,
    handleFileUpload,
    openSampleListDialog,
    openRenameGroupingDialog,
    openMethodEditingDialog,
    tagNames,
    openSubmissionOverviewDialog,
    emailParamName = "Email"}) {

    const [mouseOverDataID, setMouseOverDataID] = useState(false)

    const dateString =  `${paramsFile["Creation Date"].substring(0,4)}-${paramsFile["Creation Date"].substring(4,6)}-${paramsFile["Creation Date"].substring(6)}`
    
    const getDaysSinceSumbission = (dateString) => {

        const d =  new Date(dateString)
        const now = new Date()
        
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        return `${diffDays} days`
    }

    const getResearchAimFromParamsFile = (paramsFile) => {
        if (paramsFile.shortDescription !== undefined && _.isString(paramsFile.shortDescription)) {
            return paramsFile.shortDescription //older naming
        }
        else {
            if (_.has(paramsFile, "Experimental Info") && _.isArray(paramsFile["Experimental Info"])) {
                let researchAim = _.filter(paramsFile["Experimental Info"], expInfo => expInfo.title === "Research Aim")
                if (researchAim.length > 0) {
                    return researchAim[0].details
                }
                return ""
            }
        }
    }

    return(
        <div key={paramsFile.dataID} className="submission__header__container"
            onMouseEnter={e => setMouseOverDataID(true)}
            onMouseLeave={e => setMouseOverDataID(false)}>
        
            <div className="submission__header__upper-container">
                <div className="margin-top-bottom--little intent-margin-left intent-margin-top--medium">
                <Header text={paramsFile.Title} fontWeight={mouseOverDataID?550:500} hexColor={mouseOverDataID? "#b66476":"#2F5597"}/>
                </div>
                <div className="margin-top-bottom--little intent-margin-right font-size--small">
                    {getResearchAimFromParamsFile(paramsFile)}
                </div>
                <div className="flex flex--wrap margin-top-bottom--little">
                    {tagNames.map(k => {
                        return (
                            <div key={k} className="intent-margin-right--little">
                            <Code>{paramsFile[k]}</Code>
                        </div>
                        )
                    })}                           
                </div>

            <ButtonGroup vertical={false} className="margin-top-bottom--little">

                    <Button
                        text="Save" 
                        rightIcon="floppy-disk" 
                        disabled={!isUpdated} 
                        onClick={handleUpdate} 
                        intent={!isUpdated?"none":"primary"} 
                        minimal={true} />
                    
                        <Popover2 content={
                            <Menu>
                                <MenuItem text="Grouping Names" onClick={() => openRenameGroupingDialog(paramsFile.dataID,paramsFile)}/>
                                <MenuItem text="Digestion / LC-MS Method" onClick={() => openMethodEditingDialog(paramsFile.dataID,paramsFile)}/>
                                <MenuItem 
                                    text={isOpen?"Close params file":"Edit params file"} 
                                    intent = {isOpen?"danger":"none"}
                                    onClick={() => setIsOpen(!isOpen)}/>

                            </Menu>}>
                        <Button icon={"edit"} 
                                minimal={true} 
                                intent={isOpen?"primary":"none"}/>
                    </Popover2>

                    <TooltipButton
                        content={<div><p>Send email to project's users</p></div>}
                        icon="envelope"
                        onClick={paramsFile[emailParamName] !== undefined ? () =>
                            window.open(`mailto:${_.isArray(paramsFile[emailParamName]) ?
                                _.join(paramsFile[emailParamName], ",") : paramsFile[emailParamName]}?subject=MitoCube Dataset Request ${paramsFile.dataID}`, "_blank") : undefined} />
                    
                    <TooltipButton
                        content={<div><p>Open Submission Overview</p></div>}
                        icon="eye-open"
                        onClick={() => openSubmissionOverviewDialog(paramsFile.dataID,paramsFile)} />
                 
                    <TooltipButton
                        content={<div>
                            <p>Create a sample list (Run Name and Plate position + Groupings) for example Xcalibur.</p>
                            <p>It is recommended to scramble the runs.</p>
                            </div>}
                        icon="th-list"
                        onClick={() => openSampleListDialog(paramsFile.dataID)}/>

                        <Combobox 
                                items = {states} 
                                placeholder="State .."
                                callback = {handleStateChange}
                                buttonProps = {{
                                            minimal : true,
                                            small : true,
                                            icon : "tag"
                        }} />
                    
                    {/* <Tooltip2 content={<div><p>Upload file (quantitative matrix) for submission and transfer to MitoCube database for direct accessment.</p></div>}>
                        <label style={{outline:"none"}}>
                            <input className="bp4-file-input" type="file" multiple={false} onChange={(e) => handleFileUpload(e, paramsFile)} disabled={true} />
                            
                            <div style={{ marginTop: "2px" }} className="bp4-button bp4-minimal">
                                <div className="hor-aligned-div">
                                    <div style={{minWidth:"1rem"}}><Icon icon="upload" /></div>
                                    <div>Upload</div>
                                </div>
                            </div>
                        </label>
                    </Tooltip2> */}

                    <div style={{minWidth:"4rem"}}></div>
                    <TooltipButton
                        content={<p>Download complete paramter file as a json file.</p>}
                        icon="download"
                        intent="primary"
                        onClick={() => downloadJSONFile(paramsFile, `params-${paramsFile.dataID}`)}/>
                    
                    <TooltipButton
                        content={<p>Download submission summary as tab-delimited text file.</p>}
                        icon="download"
                        intent="success"
                        onClick={() => downloadTxtFile(arrayOfObjectsToString(extractMainParamsFromJSON({ ...paramsFile, ...extractGroupsByRunNameFromGrouping(paramsFile)}),["Parameter","Value"]),`params-${paramsFile.dataID}.txt`)}/>
                        
                    <TooltipButton
                        content={<p>Place project to archive.</p>}
                        icon="trash"
                        intent="danger"
                        onClick={handleDelete}/>
                                     
                    </ButtonGroup>
                    </div>

                <div className="submission-box" >
                            {dateString} ({getDaysSinceSumbission(dateString)})
                            <SubmissionTimeLine states={states} state={paramsFile.State}/>
                </div>
                </div>
    )
}


export default SubmissionHeader





