
import { Button, FileInput, InputGroup } from "@blueprintjs/core"
import { handleFileInput } from "../../../services/file/readtxtfile"
import { Combobox } from "../../core/input/Combobox"
import _ from "lodash"
import { useState } from "react"
import { ItemTable } from "../add/Table"
 

const initState = {
    isLoading: false,
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
 * @returns 
 */
export function AddProteinTable({ }) {

    const [loadingFileProps, setLoadingFileProps] = useState(initState)
    return (
        
        <div className="div--expand center-items flex-column flex">
            {loadingFileProps.columnNames.length === 0 ?
                <div className="flex flex-column">
                    <p>Please select a tab-delimited txt file. The file must have exactly one header and a column that contains the protein keys (Uniprot ID). Allowed extension are .txt and .tsv.</p>
                    <FileInput text="Choose file..." small={false} buttonText="..." onInputChange={(e) => handleFileInput({ e, callback: setLoadingFileProps })} disabled={loadingFileProps.isLoading}/>
                    {loadingFileProps.isLoading ? <p>Reading file..</p> : null}
                </div>
                // if text file is loadded 
                : !loadingFileProps.columnSelectionConfirmed  ?
                <div style={{width : "100%"}}>
                    <h4>Select the <strong>feature key</strong> column (Uniprot ID).</h4>
                    <Combobox
                        items={loadingFileProps.columnNamesForSelection}
                        value={loadingFileProps.keyColumnName}
                            labelKey={"firstValues"}
                            fill={true}
                        placeholder="Select key column."
                        callbackKey={"keyColumnName"}
                        onChange={(keyName, item) => setLoadingFileProps(prevValues => { return { ...prevValues, [keyName]: item.text } })}/>
                    <p>Please select the colum(s) that specify the samples (e.g. the intensity values).</p>
                    <div style={{height: " 40vh",overflowY:"scroll"}}>
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
                    </div> : 
                    <div>
                        <p>Protein file loaded and saved.</p>
                        <Button text="Reset" icon="reset" small={true} />
                    </div>
            
            }
            
            <Button icon="reset" text="Reset Form" onClick={() => setLoadingFileProps(initState)} minimal={true} intent="danger"/>

        </div>
    )
}


