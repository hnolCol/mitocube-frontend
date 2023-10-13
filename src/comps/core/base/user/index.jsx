import { Button, Code, Tooltip } from "@blueprintjs/core";
import UserDashboardIcon from "../../svg/icons/dashboard/User";
import PropTypes from "prop-types"
import { BaseDashboardIcon } from "../../svg/icons/dashboard/IconBase";
import { motion } from "framer-motion"
import TooltipButton from "../buttons/TooltipButton";
import { getFormatDateFromTimestamp } from "../../../../services/date/format";
import moment from "moment";
import { TableLikeItem } from "../tags/TableLikeItem";

User.propTypes = {
    id: PropTypes.any,
    firstname: PropTypes.string,
    lastname: PropTypes.string,
    email: PropTypes.string,
    created_on: PropTypes.number,
    role : PropTypes.number
}




function Affiliation({}) {
    

    return (
        <p>


        </p>
    )
}

export function User({firstname,lastname,email, role, created_on, userRoles, ...rest}) {
    const [ m, formatedTime ] = getFormatDateFromTimestamp(created_on)
    return (
        <div className="bg--lightgrey margin--little center-items padding--little">
            <div className="flex flex-column bg--grey">
            <motion.div className="flex justify-space-between" style={{opacity : 0.85}} whileHover={{opacity:1}}>
            <div className="div--round flex center-items">
                <BaseDashboardIcon width={30} height={30}>
                        <UserDashboardIcon text={`${firstname[0]}${lastname[0]}`} />   
                </BaseDashboardIcon>
                        <div><span className="h0-span">{firstname} {lastname}</span></div>
                        
            </div>
                <div>
                <Code>{userRoles[role]}</Code>
                <TooltipButton
                        content={<div>Edit user.</div>}
                        onClick = {() => console.log("edit user")}
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
                    />
                <TooltipButton
                    content={<div>Delete user.</div>}
                    icon="cross"
                    />

                </div>
                
                </motion.div>
                <div>Created : {m.fromNow()}</div>
                <div className="flex flex--wrap center-items">
                    {Object.keys(rest).map(attrName => <Tooltip key={attrName} content={<div style={{textTransform:"capitalize"}}>{attrName.replaceAll("_"," ")}</div>} minimal={false} compact={true}  inheritDarkTheme={false} hoverOpenDelay={400} position="top">
                        <motion.div className="padding--little cursor--default div--round intent-margin-right--little"
                        whileHover={{backgroundColor : "#466688", color:"#ffffff"}}>
                            {rest[attrName]}</motion.div>
                    </Tooltip>)}
                </div>
                </div>
            
            

        </div>
    )
}