
import { useState } from "react"
import "../submission.css"
import _ from "lodash"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import { SubmissionContainer } from "./SubmissionContainer"



function SubmissionView({ submissionFilter, setSubmissionFilter, submissionsQuery, setSubmissionQuery, ...props }) {

    return (
        <div className="no-scroll div--expand">
        
                        
                    <SubmissionContainer 
                            {...{
                            submissionFilter,
                            setSubmissionFilter,
                            submissionsQuery,
                            setSubmissionQuery,
                            ...props
                            }} />
            
        </div>
    )
}


export default SubmissionView

