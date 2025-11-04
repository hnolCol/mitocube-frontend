
import React from 'react'
import { useState, useEffect } from 'react'
import {InputGroup, Dialog, Button, ButtonGroup, Menu, MenuItem, TextArea, H6, H5} from '@blueprintjs/core'
import _ from "lodash"
import { Popover2 } from '@blueprintjs/popover2'
import PropTypes from "prop-types"

MethodEditingDialog.defaultProps = {
    experimentalDetailHeaders : ["Research Aim","Additional Information","Sample Preparation"]
}


MethodEditingDialog.propTypes = {
    dataID: PropTypes.string.isRequired,
    paramsFile: PropTypes.object.isRequired,
    headerName: PropTypes.string, //the title of the project that should be displayed
    methodsHeader : PropTypes.string.isRequired, //header in params file that contains the methods defined as object{title : string, details:string }
    onClose: PropTypes.func.isRequired,
    handleDataChange: PropTypes.func.isRequired, // defines what happens when the params file changed.
    sectionSuggestions : PropTypes.array //sections of methods that are suggested to the user. Should be moved to the API.
}


function MethodEditingDialog({
        dataID,
        paramsFile,
        headerName = "Title",
        methodsHeader = "Experimental Info",
        onClose,
        handleDataChange,
        sectionSuggestions = ["Protein Digestion", "Liquid Chromatography & Mass Spectrometry", "Data Analysis"],
        ...rest }) {
    
    const [textDetails, setText] = useState({ "sections": {}, "infoText": "" })
    const [newHeader,setNewHeader] = useState("")

    useEffect(() => {
        if (methodsHeader in paramsFile){
            let experimentalInfo = paramsFile[methodsHeader]
            const textDetailsExtracted = Object.fromEntries(experimentalInfo.map(v => [v.title,v.description])) //curcial to have title, and details here
            setText(prevValues => {return {...prevValues, "sections":textDetailsExtracted}})
        }
    },[paramsFile])

    const onTextChange = (header,value, infoText = "") => {
        let textDetailSections = textDetails.sections
        textDetailSections[header] = value
        setText(prevValues => { 
            return {...prevValues, "sections":textDetailSections,"infoText" : infoText}}
            )
               
    }

    const addHeader = () => {
        setText(prevValues => { 
            return {...prevValues, "infoText":""}}
            )
        if (newHeader !== undefined && _.isString(newHeader) && newHeader !== "" && !Object.keys(textDetails.sections).includes(newHeader)) {
        
           onTextChange(newHeader,"",`Section ${newHeader} created.`)
           
            
        }
        else{
            setText(prevValues => { 
                return {...prevValues, "infoText":"Section name missing or existed already."}}
                )
        }
    }


    const submitChanges = () => {

        var updated_src = {...paramsFile}
        let updatedExperimentalDetails = Object.keys(textDetails.sections).map(v=> {return( {title:v,details:textDetails.sections[v]} )})
        updated_src[methodsHeader] = updatedExperimentalDetails
        if (_.isFunction(handleDataChange)) {
            handleDataChange(dataID,updated_src)
        }
        onClose()

    }

    
    return(
        <Dialog {...rest}
            canOutsideClickClose={true}
            canEscapeKeyClose={true}
            onClose={onClose}
            style={{ minWidth: "60vw" }}
            isCloseButtonShown={true}
            icon="info-sign"
            title="Edit Experimental Info">
            
            <div className="dialog__container">
            
                <div>
                    <H6>{paramsFile.Title}({dataID})</H6>
                    <p>Researcher: {paramsFile["Experimentator"]}</p>
                    <p>Please note that you have to save changes after editing the params file in the main view.</p>
                </div>

                <div className='flex justify-space-between center-items'>
                <InputGroup 
                    small={true} 
                    fill={true} 
                    placeholder="Enter new section name .." 
                    value={newHeader} 
                    onChange={e => setNewHeader(e.target.value)}
                    onKeyUp={e => {
                        if (e.code === "Enter") {
                          e.preventDefault();
                          addHeader()
                          // tried all this stuff, but nothing stops the future OK button from handling the event!
                          ;}}}
                    />
                
                <Popover2 content={
                        <Menu>
                            {sectionSuggestions.map(v =>{
                                return(
                                    <MenuItem key={v} text={v} onClick={e => setNewHeader(v)}/>
                                )
                            })}
                        </Menu>}>
                <Button icon={"chevron-down"} minimal={true}/>
                </Popover2>
                <Button icon="add" minimal={true} onClick={addHeader}/>
                </div>
            
                <div style={{fontSize:"0.65rem"}}>
                    <p>{textDetails.infoText}</p>
                </div>
                <div style={{width:"100%",height:"auto", maxHeight:"60vh",overflowY:"scroll",paddingRight:"1.5rem",paddingBottom:"1rem",marginTop:"0.5rem"}}>
                {Object.keys(textDetails.sections).map(v => {
                    return(
                        <div key={v} className="margin-top--little">
                             <H5>{v}</H5>
                            <TextArea  onChange={e => onTextChange(v, e.target.value)} fill={true} value={textDetails.sections[v]} growVertically={true} />
                        </div>
                    )
                })}
                </div>
                
                <ButtonGroup >
                    <Button text="Edit" onClick={submitChanges} intent="primary"/>
                    <Button text="Cancel" intent="none" onClick={onClose}/>
                </ButtonGroup>
            </div>
        </Dialog>
    )
    
}



export default MethodEditingDialog
