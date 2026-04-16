

import { api } from "@/api"; 
import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import _ from "lodash"
import { CreatedAt } from "../../core/metrics/CreatedAt"


export function UserItem({ tag, redirectOnClick = true, onClick }) {
    const redirect = useNavigate()
    const {data : user, isLoading, isError, error} = api.users.modify.useGetPublicUserByTag({tag}, {enabled: tag && tag.length > 0})
    const { data: isUserActive } = api.users.active.useGetUserIsActive({ tag }, { enabled: _.isString(tag) && tag.length > 0 })
    
    if (isLoading) return <div>Loading user...</div>
    if (isError) return <div>Error loading user: {error.message}</div>

    return (
        <motion.button
            disabled={!isUserActive}
            style={{ backgroundColor: "#fff", border: "none" }}
            whileHover={{ backgroundColor: "#e0e0e0" }}
            onClick={(e) => {
                onClick ? onClick(e) : null
                // Redirect to the submission view
                redirectOnClick ? redirect(`/admin/users/${tag}`) : null
                e.stopPropagation()
            }} className="submission__item__container bg--white">
            
            <div className="flex justify-space-between">
                
                <div className="flex"> 
                    {_.isNumber(user.created_at) ?
                        <CreatedAt createdat={user.created_at} addFromNow={false} /> : null}
                    
                    <span className="padding-left--little">| {`${user.firstname} ${user.lastname}`} </span>
                    </div>
                    <div>
                        
                    </div>
                </div>
        </motion.button>
    )

}