import { Code, Menu, MenuItem, Popover, Position } from "@blueprintjs/core"
import { BaseDashboardIcon } from "../../svg/icons/dashboard/IconBase"
import UserDashboardIcon from "../../svg/icons/dashboard/User"
import MenuDashboardIcon from "../../svg/icons/dashboard/Menu"
import BasicMenu from "../../menu"
import { openInNewTab } from "../../../../services/tabs/newtab"
import { getGithubLink } from "../../links/github"
import { Header } from "../../base/Header"
import { useGetBackendInfo } from "../../../../hooks/queries/welcome.hooks"
import { getUserRoles } from "../../../../services/users/roles"





function Topbar({
    authenticationStatus,
    logout,
    applicationInfo,
    basePathName }) {
    const userRoles = getUserRoles() //get from API to do! 
    const { isSuccess: backendInfoIsSucces, data : backendInfo } = useGetBackendInfo({ tokenString: authenticationStatus.token }, { enabled : authenticationStatus.isAuth})

    
    return (

        <div className="flex justify-space-between">
            {/* <div>{basePathName.toUpperCase()}</div> */}
            <div className="flex flex-column justify-center">
                <Header text={backendInfoIsSucces?backendInfo.app_name:null} /></div>
            <div className="flex">
                <div className="flex flex-column justify-center">
                    <Code>role: {userRoles[authenticationStatus.role]}</Code>
                </div>
                <div className="bg--grey margin--little">
                    <Popover position={Position.BOTTOM_LEFT} content={<Menu>
                        <MenuItem text="Logout" icon="log-out"/>
                    </Menu>}>
                        <BaseDashboardIcon width={30} height={30}>
                            <UserDashboardIcon text=""/>
                        </BaseDashboardIcon>
                    </Popover>
                    
                </div>
                <div className="bg--grey margin--little">
                    <BasicMenu items={[
                        { text: "Report an issue", icon: "issue-new", onClick: () => openInNewTab(getGithubLink() + "/issues"), intent  :"danger"},
                        { text: "GitHub", icon: "git-branch", onClick: () => openInNewTab(getGithubLink()) },
                        { text: "Impressum", icon: "small-info-sign", href: "/impressum" },
                        { text: "Contact", href: "/contact", icon: "envelope" },
                        { text: `v.  ${backendInfoIsSucces?backendInfo.version:null}`, icon : "blank", disabled : true}
                        ]} />
                </div>
                
            </div>
        </div>
    )
}
    

export default Topbar