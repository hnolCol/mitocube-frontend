import PropTypes from "prop-types"
import GroupedTabs from "../core/navigation/tabs/GroupedTabs"
import { Outlet } from "react-router"

const ADMIN_TAB_GROUPS = [
    {
        text: "Experimental Metadata",
        tabs: [
            { text: "Attributes", to: "/admin/attributes" },
            { text: "Genotypes", to: "/admin/genotypes" },
            { text: "Phenotypes", to: "/admin/phenotypes" },
            { text: "Annotations", to: "/admin/annotations" },
            { text: "Proteomes", to: "/admin/proteomes" },
            { text: "Crosslink Resources", to: "/admin/externalresources" },
        ]
    },
    {
        text: "People & Organizations",
        tabs: [
            { text: "Users", to: "/admin/users" },
            { text: "Research Groups", to: "/admin/researchgroup" },
            { text: "Consortiums", to: "/admin/consortiums" },
        ]
    },
    {
        text: "Samples & Protocols",
        tabs: [
            { text: "Plates", to: "/admin/plates" },
            { text: "Protocols", to: "/admin/protocols" },
        ]
    },
    {
        text: "Instrument Maintenance",
        tabs: [
            { text: "Symptoms", to: "/admin/symptoms" },
            { text: "Spare Parts", to: "/admin/spareparts" },
            { text: "Procedures", to: "/admin/procedure" },
            { text: "External Services", to: "/admin/externalservice" },
        ]
    },
    {
        text: "Platform & Content",
        tabs: [
            { text: "News", to: "/admin/news" },
            { text: "Policy", to: "/admin/policy" },
            { text: "Impressum", to: "/admin/impressum" },
            { text: "Reports", to: "/admin/reports" },
        ]
    },
]

function AdminHeader({ authenticationStatus }) {
    return (
        <div className="no-scroll div--expand">
            <GroupedTabs groups={ADMIN_TAB_GROUPS} />
            <div className="no-scroll div--expand">
                <Outlet />
            </div>
        </div>
    )
}

export default AdminHeader
