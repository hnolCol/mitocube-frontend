
import { Button, FileInput, InputGroup } from "@blueprintjs/core"
import { handleFileInput } from "../../../services/file/readtxtfile"
import { Combobox } from "../../core/input/Combobox"
import _ from "lodash"
import { ItemTable } from "./Table"
import InitialSubmission from "../new/InitialSubmission"
import { useState } from "react"
 

const initState = {
    isLoading: false,
    submission_label : "",
    columnNames: [],
    dataArray: [],
    columnNamesForSelection: [],
    keyColumnName: "",
    sampleColumnsIdx: [],
    columnSelectionConfirmed: false
}

/**
 * 
 * @param {Object} props - The properties of the Component
 * @param {Function} props.logout - Logout the user. 
 * @returns 
 */
function AddExistingSubmission({ authenticationStatus, logout }) {

    const [loadingFileProps, setLoadingFileProps] = useState(initState)
    return (
        <div className="div--expand center-items flex-column flex">
            <Button icon="reset" text="Reset Form" onClick={() => setLoadingFileProps(initState)} minimal={true} intent="danger"/>

            {loadingFileProps.columnNames.length === 0 ?
                <div className="flex flex-column" style={{width : "min(600px,80vw)"}}>
                    
                    <h4>Dataset Label</h4>
                    <p>If you have already a dataset label (from previous submission), please provide it.</p>

                    <InputGroup placeholder="Dataset label (optional)"
                        value={loadingFileProps.submission_label}
                        onValueChange={(value) => setLoadingFileProps(prevValues => { return { ...prevValues, submission_label: value } })} />
                    <h4>File Input</h4>
                    <p>Please select a tab-delimited txt file. The file must have exactly one header and a column that contains the protein keys (Uniprot ID). Allowed extension are .txt and .tsv.</p>
                    <FileInput text="Choose file..." small={false} buttonText="..." onInputChange={(e) => handleFileInput({ e, callback: setLoadingFileProps })} disabled={loadingFileProps.isLoading}/>
                    {loadingFileProps.isLoading ? <p>Reading file..</p> : null}
                </div>
                // if text file is loadded 
                : !loadingFileProps.columnSelectionConfirmed  ?
                <div>
                    <p>File successfully uploaded</p>
                    <h4>Select the <strong>feature key</strong> column (Uniprot ID).</h4>
                    <Combobox
                        items={loadingFileProps.columnNamesForSelection}
                        value={loadingFileProps.keyColumnName}
                        labelKey={"firstValues"}
                        placeholder="Select key column."
                        callbackKey={"keyColumnName"}
                        onChange={(keyName, item) => setLoadingFileProps(prevValues => { return { ...prevValues, [keyName]: item.text } })}/>
                    <p>Please select the colum(s) that specify the samples (e.g. the intensity values).</p>
                    <div style={{height: " 50vh",overflowY:"scroll"}}>
                        <ItemTable
                            items={loadingFileProps.columnNames}
                            selectedItems={loadingFileProps.sampleColumnsIdx}
                            onSelection={(rowIdcs) => setLoadingFileProps(prevValues => { return { ...prevValues, sampleColumnsIdx : rowIdcs } })} />
                    </div>
                        <Button
                            intent="primary"
                            icon="step-forward"
                            text="Next"
                            disabled={!(loadingFileProps.sampleColumnsIdx.length && loadingFileProps.keyColumnName !== "")}
                            onClick={() => setLoadingFileProps(prevValues => { return { ...prevValues, columnSelectionConfirmed: true } })} />
                    </div> : <div>
                        <h4></h4>
                        <InitialSubmission sampleNames={loadingFileProps.sampleColumnsIdx.map(rowIdx => loadingFileProps.columnNames[rowIdx])}
                            {...{ loadingFileProps, authenticationStatus, submission_label: loadingFileProps.submission_label.length > 8 ? loadingFileProps.submission_label : undefined }} />
                        </div>
            
            }
            


        </div>
    )
}


AddExistingSubmission.propTypes = {

}




export default AddExistingSubmission