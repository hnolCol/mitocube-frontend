import { Outlet } from "react-router";
import Tabs from "../core/navigation/tabs";


function PerformanceHeader({ }) {
    
    return (
        <div>
            <Tabs tabs={[
                { text: "Overview", to: "/performance/overview" },
                { text : "Instruments", to : "/performance/instruments"},
                { text: "Runs", to: "/performance/runs" },
                { text : "Help", to : "/performance/help"}]} />
            <div className="intent-margin-top">
            <Outlet />
            </div>
            
        </div>
    )
}



export default PerformanceHeader