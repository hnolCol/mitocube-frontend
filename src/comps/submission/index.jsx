import { Outlet } from "react-router";
import Tabs from "../core/navigation/tabs";


function SubmissionHeader({ }) {
    
    return (
        <div>
            <Tabs tabs={[
                { text: "New Submission", to: "/submission/new" },
                { text: "Submissions", to: "/submission/view" },
                { text: "Statistics", to: "/submission/statistics" },
                { text : "Help", to : "/submission/help"}]} />
            <div className="no-scroll">
            <Outlet />
            </div>
            
        </div>
    )
}

export default SubmissionHeader