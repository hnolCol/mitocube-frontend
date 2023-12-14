import { Button, Code, Popover, Tooltip, Menu, MenuItem } from "@blueprintjs/core";
import UserDashboardIcon from "../../svg/icons/dashboard/User";
import PropTypes from "prop-types"
import { BaseDashboardIcon } from "../../svg/icons/dashboard/IconBase";
import { motion } from "framer-motion"
import TooltipButton from "../buttons/TooltipButton";
import { getFormatDateFromTimestamp } from "../../../../services/date/format";
import moment from "moment";
import { TagWithTooltip } from "../tags/TagWithTooltip";
import _ from "lodash"


export function UserIconWithTooltip({ userLabel, usersByLabel, selected = false }) {
    if (!_.has(usersByLabel, userLabel)) return null 
    const { firstname, lastname, email, label, institute, research_group } = usersByLabel[userLabel][0]
    const text = firstname[0]+lastname[0]
    return (
        <Popover content={<Menu small={true}>
            <MenuItem text={`${firstname} ${lastname}`} icon="envelope" labelElement={<div style={{ width: "14rem", fontSize: "0.6rem", textAlign: "left" }}><div>{institute}</div><div>{research_group}</div></div>} />

        </Menu>} interactionKind="hover" position="top">
        <BaseDashboardIcon width={30} height={30}>
                <UserDashboardIcon {...{ text, fillColor : selected? "#b91e18" : undefined}} />   
            </BaseDashboardIcon>
        </Popover>
    )
}

export function UserIcon({text}) {
    return (
        <BaseDashboardIcon width={30} height={30}>
            <UserDashboardIcon {...{ text }} />   
        </BaseDashboardIcon>
    )
}


// export function UserIconWithTooltip({text}) {
//     return (
//         <Popover content={<div>User detials</div>} interactionKind="hover" position="top">
//         <button>
//         <BaseDashboardIcon width={30} height={30}>
//             <UserDashboardIcon {...{ text }} />   
//             </BaseDashboardIcon>
        
//             </button>
//             </Popover>
//     )
// }


User.propTypes = {
    id: PropTypes.any,
    firstname: PropTypes.string,
    lastname: PropTypes.string,
    email: PropTypes.string,
    created_on: PropTypes.number,
    role: PropTypes.number,
    label : PropTypes.string.isRequired
}


export function User({firstname,lastname,email, role, created_on, userRoles, blockUser, editUser, label, allow_login, userProps, deleteUser, ...rest}) {
    const [m, formatedTime] = getFormatDateFromTimestamp(created_on)
    return (
        <div className="bg--lightgrey margin--little center-items padding--little">
            <div className="flex flex-column bg--grey">
            <motion.div className="flex justify-space-between" style={{opacity : 0.85}} whileHover={{opacity:1}}>
            <div className="div--round flex center-items">
                <BaseDashboardIcon width={30} height={30}>
                        <UserDashboardIcon text={`${firstname[0]}${lastname[0]}`} />   
                </BaseDashboardIcon>
                        <div><span className="h0-span">{firstname} {lastname}</span></div>
                        <div className="intent-margin-left--little">{!allow_login ? <span className="h2-span">blocked </span>: null}</div>
            </div>
                <div>
                <Code>{userRoles[role]}</Code>
                <TooltipButton
                        content={<div>Edit user.</div>}
                        onClick = {() => editUser(userProps)}
                    icon="edit"
                    />
                <TooltipButton
                        content={<div>Send email to user.</div>}
                        onClick = {() => window.open(`mailto:${email}?subject=User Request`, "_blank")}
                    icon="envelope"
                    />
                <TooltipButton
                    content={<div>Block user.</div>}
                            icon="disable"
                            onClick = {() => blockUser(label)}
                    />
                <TooltipButton
                    content={<div>Delete user.</div>}
                            icon="cross"
                            onClick={() => deleteUser(label)}
                    />

                </div>
                
                </motion.div>
                <div>Created : {m.fromNow()}</div>
                <div className="flex flex--wrap center-items">
                    {Object.keys(rest).map(attrName => <TagWithTooltip key={attrName} tagText={rest[attrName]} tooltipText={attrName} />)}
                </div>
                </div>
            
            

        </div>
    )
}
