

import PropTypes from "prop-types"
import _ from "lodash"
import Tabs from "../core/navigation/tabs"
import { Outlet } from "react-router"

    
function AdminHeader({ authenticationStatus }) {
    return (
        <div className="no-scroll div--expand">
            
            <Tabs tabs={[
                { text: "Attributes", to: "/admin/attributes" },
                { text: "Users", to: "/admin/users" },
                { text: "Genotypes", to: "/admin/genotypes" },
                { text: "Proteomes", to: "/admin/proteomes" },
                { text: "Filter sets", to: "/admin/sets" },
                { text: "Research Group", to: "/admin/researchgroup" },
                { text: "Phenotype", to: "/admin/phenotypes"},
                { text: "ShareToken", to: "/admin/sharetoken" }]} />
                
                <div className="no-scroll div--expand">
                <Outlet />
            </div>
            
            
        </div>
    )
}

export default AdminHeader