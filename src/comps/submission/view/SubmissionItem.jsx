import PropTypes from "prop-types"
import SubmissionHeader from "./Header"
import { useState } from "react"
import { Alert, Collapse } from "@blueprintjs/core"
import ReactJson from 'react-json-view'
import _ from "lodash"


function SubmissionItem({
        dataID,
        token,
        handleDataChange,
        paramsFile,
        states,
        setAlertState,
        openSampleListDialog,
        openRenameGroupingDialog,
        isUpdated,
        setIsUpdated,
        openMethodEditingDialog,
        tagNames,
        openSubmissionOverviewDialog}) {
    
    const [isOpen, setIsOpen] = useState(false)
    const [alertDetails, setAlertDetails] = useState({
        isOpen: false,
        children: <div><p>Alert</p></div>,
        intent: "none",
        loading : false,
        onConfirm: undefined,
        onCancel: undefined,
        cancelButtonText : undefined
    })
    

    const onEditJsonParams = (params) => {
        
        if (["dataID","SampleNumber"].includes(params.name)){
            setAlertState({isOpen:true,alert:"danger",children:<div>The dataID, groupingNames and sample number cannot be changed.</div>})
            return false
        }
        else if (params.namespace.length > 0 && ["groupingNames"].includes(params.namespace[0])){
            setAlertState({isOpen:true,alert:"danger",children:<div>Please use the groupingNames rename dialog as this requires more complex changes - not saved!</div>})
            return false
        } 
        else if (params.namespace.length > 0 && "groupings" === params.namespace[0]){
            setAlertState({
                isOpen:true,
                alert:"warning",
                children:<div>You have changed some grouping which will affect the raw file creation. Please note that you will have to take care that all groupings are changed accordingly e.g. in all groupings.</div>})
                setIsUpdated(dataID,true)
                handleDataChange(dataID,params.updated_src)
                return true
        } 
        else if (params.name === "State" && !states.includes(params.new_value)){
            setAlertState({isOpen:true,children:<div>State must be one of the following: {states.join(", ")}</div>})
            return false
        }
        else if (params.name === "Creation Date" && params.new_value instanceof Date) {
            // this must actually be converted to string
            let dateString = fromDateToString(params.new_value)
            params.updated_src["Creation Date"] = dateString
            
        }
        else if (params.name === "Creation Date" && _.isNumber(params.new_value)) {
            // this must actually be converted to string
            params.updated_src["Creation Date"] = `${params.new_value}`
            
        }

        setIsUpdated(dataID,true)
        handleDataChange(dataID,params.updated_src)
         
    }


    const handleUpdate = (e) =>{

        axios.put('/api/data/submission/details', {token : token, dataID : dataID, paramsFile: paramsFile}).then(response => {
            if (response.data !== undefined && response.data.success){
                setIsUpdated(dataID,false)
                handleDataChange(dataID,response.data.paramsFile)
            }
            
            let msgText = response.data.msg !== undefined ? response.data.msg : response.data.error
            setAlertState({isOpen:true,children:<div>{msgText}</div>})
            
        })

    }

    const handleStateChange = (newState) => {
        // handle submission state change.
        if (paramsFile["State"] !== newState && states.includes(newState)) {
            paramsFile["State"] = newState
            handleDataChange(dataID,paramsFile)
            setIsUpdated(dataID,true)
            setAlertState({isOpen:true,children:<div>State of {dataID} changed to : {newState}. Please note that you still have to save/upload the changes.</div>})
        }
    }
    const handleDelete = () => {
        // handle delete of submission (actually putting to archive)
        axios.delete('/api/data/submission/details', {data : {token : token, dataID : dataID}}).then(response => {
            setAlertState({isOpen:true,children:<div>{response.data.msg}</div>})
        })
    }


    const resetAlert = () => {
        setAlertDetails(prevValues => {
            return { ...prevValues, isOpen: false, children: <div></div> }
        })

    }

    const alterAlertChildren = (children, isString = true, intent = "none", icon = "none", cancelButtonText = undefined, onConfirm = resetAlert, onCancel = undefined) => {
        if (isString) {
            setAlertDetails(prevValues => {
                return {
                    ...prevValues,
                    children: <div><p>{children}</p></div>,
                    intent,
                    icon,
                    cancelButtonText,
                    "onConfirm": onConfirm,
                    "onCancel": onCancel
                }
            })
        }
        else {
            setAlertDetails(prevValues => {
                return {
                    ...prevValues, children, intent, icon, cancelButtonText,
                    "onConfirm": onConfirm, "onCancel": onCancel
                }
            })
        }
    }

    // const uploadFile = (columnNames, dataArray, paramsFile) => {
        
    //     setAlertDetails(prevValues => { return { ...prevValues, loading: true } })
    //     const postData = { columnNames, values: dataArray, paramsFile, token, dataID }
    //     let commonAlertStateChange = {loading: false, "onConfirm" : resetAlert, cancelButtonText : undefined}
        
    //     axios.post('/api/dataset',
    //         postData, {
    //         headers: { 'Content-Type': 'application/json' }
    //     }).then(response => {
            
    //         if (MCSimpleResponseCheck(response.data)){
    //             let children = <div><p>Data successfully added to the MitoCube database.</p></div>
    //             setAlertDetails(prevValues => {
    //                 return {
    //                     ...prevValues,
    //                     children, ...commonAlertStateChange
    //                 }
    //             })
    //         }
    //         else {
    //             let children = <div><p>There was an error: {response.data["msg"]}.</p></div>
    //             setAlertDetails(prevValues => {
    //                 return {
    //                     ...prevValues,
    //                     icon : "error",
    //                     intent : "danger",
    //                     children, ...commonAlertStateChange
    //                 }
    //             })
    //         }
    //     }).catch((error) => {
    //         let children = <div><p>The API returned an unspecified error. {error}</p></div>
    //         setAlertDetails(prevValues => {
    //             return {
    //                 ...prevValues,
    //                 intent: "danger",
    //                 icon : "error",
    //                 children, ...commonAlertStateChange
    //             }
    //         })
    //     })

    // }

    // const handleFileUpload = (e, paramsFile) => {
    //     setAlertDetails(prevValues => {return {...prevValues,isOpen:true,children:<div><p>File reading started...</p></div>}})
    //     const fileList = e.target.files
    //     if (fileList.length === 1) {
    //         let file = fileList[0] //first item in files, we just want a single file
    //         if (file.type === "text/plain") {
    //             alterAlertChildren("Text file found...")
    //             const reader = new FileReader()
    //             reader.onload = (readEvent) => {
    //                 let {columnNames, dataArray} = readLinesAndColumnNamesFromTxtFile(readEvent)
    //                 let { success, expressionColumns } = getExpressionColumnsFromParamFile(paramsFile)
    //                 let allExpressionColumnsFound = checkForAllItemsInArray(columnNames,expressionColumns)
    //                 if (!success) {
    //                     alterAlertChildren("Only plain txt files are allowed.",true,"danger")
    //                 }
    //                 if (!columnNames.includes("Key")) {
    //                     alterAlertChildren("File column names (first row) must contain the column name 'Key'",true,"danger","error")
    //                 }
    //                 if (allExpressionColumnsFound) {
    //                     alterAlertChildren(`File checked. ${dataArray.length} data rows / features detected. Click okay to upload file to MitoCube database.`,
    //                         true, "success", "tick", "Cancel",() => uploadFile(columnNames,dataArray,paramsFile),resetAlert)
    //                 }
    //                 else {
    //                     let missingColumns = _.filter(expressionColumns, columnName => !columnNames.includes(columnName))
    //                     let children = <div>
    //                         <p>
    //                             Not all expression columns were found!<br></br><span style={{ fontWeight: "bold" }}>{missingColumns.length} of {expressionColumns.length}</span> specified could not be detected.
    //                             <br></br>Please ensure that the file contains all sample names specified in the paramsFile's groupings.
    //                         </p>
    //                         <div className="little-m" style={{maxHeight:"10rem",overflowY:"scroll",minWidth:"100%",paddingRight:"1rem"}}>
    //                             <p>The following files could not be found in the submitted data file.:</p>
    //                             <div className="vert-align-div">
    //                                 {missingColumns.map((missingColumnName, idx) => <div className="middle-m white-bg" style={{width:"100%"}} key={missingColumnName}>{idx} : {missingColumnName}</div>)}
    //                             </div>
    //                         </div>
                        
    //                     </div>
    //                     alterAlertChildren(children,false,"danger","error")
    //                 }
                    
    //             }
    //             reader.readAsText(file)
    //         }
    //         else {
    //             alterAlertChildren("Only plain txt files are allowed.",true,"danger","error")   
    //         }
    //     }
    //     else {
    //         alterAlertChildren("Please select a single file.",true,"danger","error")
    //     }
    // }


    return(
        <div className="submission__item__container">
            <Alert style={{minWidth:"50vw"}} {...{ ...alertDetails, canEscapeKeyCancel: false, canOutsideClickCancel: false }}
            />
    
        <SubmissionHeader 
                paramsFile = {paramsFile} 
                setIsOpen={setIsOpen} 
                handleDelete={handleDelete} 
                handleUpdate={handleUpdate}
                {...{
                    isUpdated,
                    isOpen,
                    states,
                    handleStateChange,
                    openSampleListDialog,
                    openRenameGroupingDialog,
                    openMethodEditingDialog,
                    tagNames,
                    //handleFileUpload,
                    openSubmissionOverviewDialog
                }}
                />
        
        <Collapse isOpen={isOpen}>
            <div style={{maxHeight:"50vh",overflowY:"scroll"}}>
            <ReactJson  
                src = {paramsFile} 
                displayDataTypes={false} 
                style={{ fontSize: ".75rem" }}
                name={false} onEdit={onEditJsonParams} />
            </div>
        </Collapse>
        </div>
    )
}


SubmissionItem.propTypes = {
    dataID: PropTypes.string.isRequired,
    paramsFile : PropTypes.object,
    token: PropTypes.string.isRequired,
    tagNames : PropTypes.arrayOf(PropTypes.string),
    handleDataChange : PropTypes.func,
    states: PropTypes.arrayOf(PropTypes.string),
    isUpdated : PropTypes.bool.isRequired,
    setAlertState : PropTypes.func,
    openSampleListDialog : PropTypes.func,
    openRenameGroupingDialog : PropTypes.func,
    
    setIsUpdated : PropTypes.func,
    openMethodEditingDialog : PropTypes.func,
    openSubmissionOverviewDialog : PropTypes.func,
    
}


export default SubmissionItem