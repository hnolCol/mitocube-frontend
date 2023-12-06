import { Code, Dialog, DialogBody, DialogFooter, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core"
import { BaseDashboardIcon } from "../../svg/icons/dashboard/IconBase"
import UserDashboardIcon from "../../svg/icons/dashboard/User"
import MenuDashboardIcon from "../../svg/icons/dashboard/Menu"
import BasicMenu from "../../menu"
import { openInNewTab } from "../../../../services/tabs/newtab"
import { getGithubLink } from "../../links/github"
import { Header } from "../../base/Header"
import { useGetBackendInfo } from "../../../../hooks/queries/welcome.hooks"
import { useGetUserRoles } from "../../../../hooks/queries/user.hooks"
import _ from "lodash"
import { BaseDialog } from "../dialogs/BaseDialog"
import { useState } from "react"
import { EditUser } from "../../base/user/EditUser"

function Topbar({
    authenticationStatus,
    logout,
    applicationInfo,
    basePathName }) {
    
    const [dialogProps, setDialogProps] = useState({isOpen : false})
    const { data: userRoles } = useGetUserRoles({}, { enabled: authenticationStatus.isAuth, staleTime: 3000000 })
    const { isSuccess: backendInfoIsSucces, data: backendInfo } = useGetBackendInfo({ tokenString: authenticationStatus.token },
        {
            enabled: authenticationStatus.isAuth,
            
        })

    if (!authenticationStatus.isAuth) return <div className="flex justify-end"><div className="bg--grey margin--little"><BasicMenu disabled={true} /> </div></div>
    
    const onEidt = (e) => {

        setDialogProps(prevValues => {
            return {
                ...prevValues,
                isOpen: true,
                title : "Edit User",
                children: <EditUser userLabel={authenticationStatus.label} />
            }
        })
    }

    return (

        <div className="flex justify-space-between">
            <BaseDialog {...{...dialogProps}} onClose={() => setDialogProps(prevValues => {return{...prevValues,isOpen : false}})}/>
            {/* <div>{basePathName.toUpperCase()}</div> */}
            <div className="flex flex-column justify-center">
                <Header text={backendInfoIsSucces?backendInfo.app_name:null} /></div>
            <div className="flex">
                <div className="flex flex-column justify-center">
                    <Code>role: {_.isObject(userRoles)?userRoles[authenticationStatus.role]:null}</Code>
                </div>
                <div className="bg--grey margin--little">
                    <Popover position={Position.BOTTOM_LEFT} content={<Menu>
                        <MenuItem disabled={true} text={`${authenticationStatus.firstname} ${authenticationStatus.lastname}`} />
                        <MenuDivider />
                        <MenuItem text="Edit" icon="edit" onClick={onEidt}/>
                        <MenuItem text="Logout" icon="log-out" onClick={logout}/>
                    </Menu>}>
                        <BaseDashboardIcon width={30} height={30}>
                            <UserDashboardIcon text={`${authenticationStatus.firstname[0]}${authenticationStatus.lastname[0]}`} />
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