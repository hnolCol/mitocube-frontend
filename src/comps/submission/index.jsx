import { Outlet } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useState } from "react";


function SubmissionHeader({ }) {
    //submission filter defined.
    const [attributeSearchQuery, setAttributeSearchQuery] = useState("")
    const [submissionFilter, setSubmissionFilter] = useState({})
    return (
        <div className="no-scroll div--expand">
            <Tabs tabs={[
                { text: "New Submission", to: "/submission" },
                { text: "Submissions", to: "/submission/view" },
                { text: "Statistics", to: "/submission/statistics" },
                { text : "Help", to : "/submission/help"}]} />
            <div className="no-scroll div--expand">
            
                <Outlet context={{submissionFilter,setSubmissionFilter,attributeSearchQuery, setAttributeSearchQuery}} />
            </div>
            
        </div>
    )
}

export default SubmissionHeader