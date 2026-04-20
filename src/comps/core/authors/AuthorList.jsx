
import { getUserFullName } from "../../../services/format/user"
import _ from "lodash"

import { api } from "@/api"; 


export function Author({ user_tag }) { 

    const { data: user } = api.users.core.useGetPublicUserByTag({ tag: user_tag }, { enabled: !!user_tag, staleTime: 1000 * 60 * 5 }) //5 minutes
    return (<div>
        {user ? getUserFullName(user) : "Loading..."}
    </div>)
}


/**
 * @description Displays the authors of a submission 
 * @param {Object} props 
 * @param {String} props.submission_tag The submission tag. 
 * @param {String} props.emailSubject - An email can be sent to the authors, this string will be the subject of the 
 * email. 
 *  * @returns 
 */
export function AuthorList({ submission_tag, emailSubject = "" }) {
    

    const { data: users, isLoading, isFetching } = api.submissions.users.useGetSubmissionUsers({ tag: submission_tag })
    const n_users = _.isArray(users) ? users.length : 0
    return (
        <div className="flex flex-column center-items">
            <div className="flex">
                
            {_.isArray(users) ? users
                .map((user_tag, idx) => {
                return (
                    <div className="flex margin-right--little div--round" key={`${user_tag}-${idx}`}>
                            <a
                                // href={`mailto:${user.email}?subject=${emailSubject}`} //cc=${_.join(authors.filter(author => author.email !== authorProps.email).map(author => author.email), ", ")}
                                className="router-link">
                            <div className="flex" style={{color : "black"}}>
                                <strong>{<Author user_tag={user_tag} />}</strong>
                                {/* <div style={{position:"relative",top:"-0.3rem",fontSize:"70%"}}>{affiliationIdx}</div><div className="margin-left--little"><Icon icon="envelope"/></div> */}
                            </div>
                        </a>
                        
                        {n_users > 1?
                            idx === n_users - 2 ? <div>, and</div> : idx !== n_users - 1?<div>,</div> : null : null}
                        </div>
                )
                }) : null}</div>
            {/* <div>{_.keys(affiliation).map(researchGroup => <div key={researchGroup} className="font-size--smallest">{`${affiliation[researchGroup]} ${researchGroup}`}</div>)}</div> */}
        </div>
    )
}
