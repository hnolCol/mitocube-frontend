import { Icon } from "@blueprintjs/core"
import { useGetPublicUserForSubmission } from "../../../hooks/queries/submission.hooks"
import { getUserFullName } from "../../../services/format/user"
import _ from "lodash"


/**
 * @description Displays the authors of a submission 
 * @param {Object} props 
 * @param {String} props.submission_tag The submission tag. 
 * @param {String} props.emailSubject - An email can be sent to the authors, this string will be the subject of the 
 * email. 
 *  * @returns 
 */
export function AuthorList({ submission_tag, emailSubject = "" }) {
    
    const { data: users, isLoading, isFetching } = useGetPublicUserForSubmission({ submission_tag })
    if (isLoading || isFetching || !_.isArray(users) || users.length === 0) return null 
    let affiliation = {}
    const n_users = users.length
    return (
        <div className="flex flex-column center-items">
            <div className="flex">
                
            {users
                .map((user, idx) => {
                    affiliation[user.research_group] ??= _.keys(affiliation).length + 1
                    const affiliationIdx = affiliation[user.research_group]
                return (
                    <div className="flex intent-margin-right--little div--round" key={`${user.tag}-${idx}`}>
                            <a
                                href={`mailto:${user.email}?subject=${emailSubject}`} //cc=${_.join(authors.filter(author => author.email !== authorProps.email).map(author => author.email), ", ")}
                                className="router-link">
                            <div className="flex" style={{color : "black"}}>
                                <strong>{getUserFullName(user)}</strong>
                                <div style={{position:"relative",top:"-0.3rem",fontSize:"70%"}}>{affiliationIdx}</div><div className="intent-margin-left--little"><Icon icon="envelope"/></div>
                            </div>
                        </a>
                        
                        {n_users > 1?
                            idx === n_users - 2 ? <div>, and</div> : idx !== n_users - 1?<div>,</div> : null : null}
                        </div>
                )
                })}</div>
            <div>{_.keys(affiliation).map(researchGroup => <div key={researchGroup} className="font-size--smallest">{`${affiliation[researchGroup]} ${researchGroup}`}</div>)}</div>
        </div>
    )
}
