
import { FileInput, SegmentedControl } from "@blueprintjs/core"
import PropTypes from "prop-types"
import { useState } from "react"


/**
 * 
 * @param {Object} props - The properties of the Component
 * @param {import("../../../types/authentication").AuthenticationStatus} props.authenticationStatus - The user authentication status 
 * @param {Function} props.logout - Logout the user. 
 * @returns 
 */
function AddExistingSubmission({authenticationStatus, logout}) {
    const [submission, setSubmission] = useState({})
    const [loadingFileProps, setLoadingFileProps] = useState({})

    return (
        <div>
            <p>Please select the utilized Software to generate the output file.</p>
            <SegmentedControl options={[{ label: "DIA-NN" }, { label: "MaxQuant" }, {label : "Spectronaut"}]} small={true} />
            <FileInput text="Choose file..." small={true} buttonText="..." />
            


        </div>
    )
}


AddExistingSubmission.propTypes = {

}




export default AddExistingSubmission