import { Code, Dialog, DialogBody, DialogFooter, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core"
import { BaseDashboardIcon } from "../../svg/icons/dashboard/IconBase"
import UserDashboardIcon from "../../svg/icons/dashboard/User"
import BasicMenu from "../../menu"
import { openInNewTab } from "../../../../services/tabs/newtab"
import { Header } from "../../base/Header"
import _ from "lodash"
import { BaseDialog } from "../dialogs/BaseDialog"
import { useState } from "react"
import { EditUser } from "../../base/user/EditUser"
import { Link } from "react-router-dom"
import { TermsOfUse } from "../../documents/TermsOfUse"
import hooks from "@mitocube/api-hooks"

/**
 * 
 * @param {Object} props 
 * @param {import("../../../../types/authentication").AuthenticationStatus} props.authenticationStatus 
 * @param {Function} props.logout - A function to log the user out. 
 * @returns 
 */
function Topbar({authenticationStatus,logout, user_tag}) {

    const [dialogProps, setDialogProps] = useState({isOpen : false})
    const { isSuccess: backendInfoIsSucces, data: backendInfo } = hooks.info.useGetBackendInfo({},{staleTime : Infinity})

    const { data : userRole } =  hooks.users.useGetUserRoleByTag({tag : user_tag}, {enabled : authenticationStatus.isAuth && _.isString(user_tag)})
    const { data : user, isSuccess} = hooks.users.useGetPublicUserByTag({tag : user_tag}, {enabled : authenticationStatus.isAuth && _.isString(user_tag)})
    const initials = isSuccess ? `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase() : ""
    if (!authenticationStatus.isAuth) return <div className="flex justify-end"><div className="bg--grey margin--little"><BasicMenu disabled={true} /> </div></div>
    
    const onEdit = (e) => {

        setDialogProps(prevValues => {
            return {
                ...prevValues,
                isOpen: true,
                title : "Edit User",
                children: <EditUser userLabel={authenticationStatus.label} />,
                style: { width: "600px" },
                useDialogBody : true,
            }
        })
    }

    const onReadUseTerms = () => {

        setDialogProps(prevValues => {
            return {
                ...prevValues,
                isOpen: true,
                title : "Terms of use",
                children: <TermsOfUse />,
                useDialogBody : false,
                style : {width : "800px"}
            }
        })
    }


    return (

        <div className="flex justify-space-between">
            <BaseDialog {...{...dialogProps}} onClose={() => setDialogProps(prevValues => {return{...prevValues,isOpen : false}})}/>
            {/* <div>{basePathName.toUpperCase()}</div> */}
            <div className="flex flex-column justify-center margin-left--little">
                <Link to="/index"><Header text={backendInfoIsSucces ? backendInfo.app_name : null} /></Link>
            </div>
            <div className="flex">
                <div className="flex flex-column justify-center">
                    <Code>role: {userRole}</Code>
                </div>
                <div className="bg--grey margin--little">
                    <Popover position={Position.BOTTOM_LEFT} content={<Menu>
                        {_.isObject(user) ? <MenuItem disabled={true} text={`${user.firstname} ${user.lastname}`} /> : null}
                        <MenuDivider />
                        <MenuItem text="Edit" icon="edit" onClick={onEdit}/>
                        <MenuItem text="Logout" icon="log-out" onClick={logout}/>
                    </Menu>}>
                        <BaseDashboardIcon width={30} height={30}>
                            <UserDashboardIcon text={initials} />
                        </BaseDashboardIcon>
                    </Popover>
                    
                </div>
                <div className="bg--grey margin--little">
                    <BasicMenu items={[
                        { text : "Terms of use", icon : "document", onClick : onReadUseTerms},
                        { text: "Report an issue", icon: "issue-new", onClick: () => openInNewTab(backendInfo.issue_url), intent  :"danger"},
                        { text: "GitHub", icon: "git-branch", onClick: () => openInNewTab(backendInfo.github_url) },
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