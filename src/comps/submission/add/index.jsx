
import { Button, FileInput, SegmentedControl } from "@blueprintjs/core"
import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import { readLinesAndColumnNamesFromTxtFile } from "../../../services/file/readtxtfile"
import { arraysInArrayHaveSameLength } from "../../../services/arrays/checks"
import { Combobox } from "../../core/input/Combobox"
import _ from "lodash"




// const newFiles = e.target.files;
// const fileName = newFiles[0].name;
// const extension = fileName.split(".").pop();
// const isSupported = ["txt"].includes(extension);

// if (isSupported){
//     const reader = new FileReader()
//     reader.onload = (readEvent) => {
        
//         let { columnNames, dataArray } = readLinesAndColumnNamesFromTxtFile(readEvent)
        



/**
 * 
 * @param {Object} props - The properties of the Component
 * @param {import("../../../types/authentication").AuthenticationStatus} props.authenticationStatus - The user authentication status 
 * @param {Function} props.logout - Logout the user. 
 * @returns 
 */
function AddExistingSubmission({authenticationStatus, logout}) {
    const [submission, setSubmission] = useState({})
    const [loadingFileProps, setLoadingFileProps] = useState({isLoading : false, columnNames : [], dataArray : [], columnNamesForSelection : []})


    const handleFileInput = (e) => {
        setLoadingFileProps(prevValues => {return {...prevValues, isLoading : true}})
        const newFiles = e.target.files;
        const fileName = newFiles[0].name;
        const extension = fileName.split(".").at(-1)
        const isSupported = ["txt", "tsv"].includes(extension);
        if (isSupported) {
            const reader = new FileReader()
            reader.onload = (readEvent) => {
                let { columnNames, dataArray } = readLinesAndColumnNamesFromTxtFile({ readEvent })
                console.log(columnNames, dataArray)
                if (arraysInArrayHaveSameLength(dataArray)) return 

                const columnNamesWithValues = columnNames.map((columnName, idx) => {
                    return { text: columnName, description: _.join(_.range(3).map(rowIdx => dataArray[rowIdx][idx]), ", ") }
                })

                setLoadingFileProps(prevValues => {return {...prevValues,isLoading : false, columnNames, dataArray, columnNamesForSelection : columnNamesWithValues}})

            }
            reader.readAsText(e.target.files[0])
        }

    }

    return (
        <div>
            <Button icon="reset" onClick={() => setLoadingFileProps(prevValues => { return { ...prevValues, columnNames: [] } })} minimal={true} intent="danger"/>
        
            {loadingFileProps.columnNames.length === 0 ?
                <div>
                    <p>Please select the utilized Software to generate the output file.</p>
                    <h4>Software</h4>
                    <SegmentedControl
                        options={[{ label: "DIA-NN", value: "diann" }, { label: "MaxQuant", value: "maxquant" }, { label: "Spectronaut", value: "spec" }]}
                        small={true}
                        fill={false}
                        intent="primary"
                        defaultValue="diann"
                    />

                    <h4>File Format</h4>
                    <p>Please select the file format. Wide format indicates that features are present in rows and samples in columns. While a long format indicates that there is a column such as 'raw.files' or 'samples' as well as some kind of quantitiy measure column. The row number is then equal to n_features x n_samples.</p>
                    
                    <SegmentedControl
                        options={[{ label: "wide (features x samples)", value: "wide" }, { label: "long", value: "long" }]}
                        small={true}
                        fill={false}
                        defaultValue="wide"
                    />

                    <h4>File Input</h4>
                    <p>Please select a tab-delimited txt file. The file must have exactly one header. Allowed extension are .txt and .tsv.</p>
                    <FileInput text="Choose file..." small={true} buttonText="..." onInputChange={handleFileInput} disabled={loadingFileProps.isLoading}/>
                    {loadingFileProps.isLoading ? <p>Reading file..</p> : null}</div>
                // if text file is loadded 
                :
                
                <div>
                    <p>File successfully uploaded</p>
                    <h4>Select the feature key column (Uniprot ID).</h4>
                    <Combobox items={loadingFileProps.columnNamesForSelection} labelKey={"description"} placeholder="Select key column." />
                    

                    <p>Please select the colum(s) that specify the samples.</p>
                </div>}
            


        </div>
    )
}


AddExistingSubmission.propTypes = {

}




export default AddExistingSubmission