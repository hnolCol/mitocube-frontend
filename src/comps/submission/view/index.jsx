
import { useState } from "react"
import "../submission.css"
import _ from "lodash"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import { SubmissionContainer } from "./SubmissionContainer"



function SubmissionView({authenticationStatus, logout, submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery}) {


    // const [runlistDialog, setRunlistDialog] = useState({
    //     isOpen: false, 
    //     submission: {},
    //     onClose: undefined,
    //     isLoading: false,
    //     isSuccess: false,
    //     samplesAttributes : true // true samples, false for dataset
    // })

    // const [samplesAttributesDialog, setAttributesDialog] = useState({
    //     isOpen: false, 
    //     submission: {},
    //     onClose: undefined,
    //     isLoading: false,
    //     isSuccess: false,
    //     samplesAttributes : true // true samples, false for dataset
    // })

    return (
        <div className="no-scroll div--expand">
        
                        
                    <SubmissionContainer 
                            {...{
                            submissionFilter,
                            setSubmissionFilter,
                            submissionsQuery,
                            setSubmissionQuery,
                            }} />
            
        </div>
    )
}


export default SubmissionView

