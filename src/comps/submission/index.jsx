import { Outlet } from "react-router";
import Tabs from "../core/navigation/tabs";


function SubmissionHeader({ }) {

    const tabs = [
        { text: "Submissions", to: "/submissions" },
        { text: "Organize", to: "/submissions/organize" },
        { text: "Modular Processes", to: "/submissions/modular-processes" },
        { text: "Explore", to: "/submissions/explore" },
        { text: "New Submission", to: "/submissions/new" },
        { text: "Statistics", to: "/submissions/statistics" },
        { text : "Help", to : "/submissions/help"}]

    return (
        <div className="no-scroll div--expand">
            <Tabs tabs={tabs} />
            <div className="no-scroll div--expand">

                <Outlet />
            </div>

        </div>
    )
}

export default SubmissionHeader