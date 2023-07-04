import { Code } from "@blueprintjs/core"
import { BaseDashboardIcon } from "../../svg/icons/dashboard/IconBase"
import UserDashboardIcon from "../../svg/icons/dashboard/User"
import MenuDashboardIcon from "../../svg/icons/dashboard/Menu"
import BasicMenu from "../../menu"
import { openInNewTab } from "../../../../services/tabs/newtab"
import { getGithubLink } from "../../links/github"



function Topbar({
    isAuthenticated = false,
    userRole = "guest",
    basePathName}) {
    return (

        <div className="flex justify-space-between">
            <div>{basePathName.toUpperCase()}</div>
            <div className="flex">
                <div className="flex flex-column justify-center">
                    <Code>role: {userRole}</Code>
                </div>
                <div className="bg--grey margin--little">
                    <BaseDashboardIcon width={30} height={30}>
                        <UserDashboardIcon />
                    </BaseDashboardIcon>
                </div>
                <div className="bg--grey margin--little">
                    <BasicMenu items={[
                        { text: "Report an issue", icon: "issue-new", onClick: () => openInNewTab(getGithubLink() + "/issues"), intent  :"danger"},
                        { text: "GitHub", icon: "git-branch", onClick: () => openInNewTab(getGithubLink()) },
                        { text: "Impressum", icon: "small-info-sign", href: "/impressum" },
                        { text: "Contact", href : "/contact", icon : "envelope"},
                        ]} />
                </div>
                
            </div>
        </div>
    )
}
    

export default Topbar