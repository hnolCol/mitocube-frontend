
import { Outlet } from "react-router";
import Tabs from "../core/navigation/tabs";

/**
 * Header of the compare section. Cross-submission comparison views live here
 * (in contrast to the submission-scoped analysis views under /submissions/:tag).
 */
function CompareHeader() {

    return (
        <div className="no-scroll div--expand" style={{ display: "flex", flexDirection: "column" }}>
            <Tabs tabs={[
                { text: "Volcano plot", to: "/compare/volcano" }]} />
            <div className="no-scroll div--expand" style={{ flex: 1, minHeight: 0 }}>
                <Outlet />
            </div>
        </div>
    )
}

export default CompareHeader
