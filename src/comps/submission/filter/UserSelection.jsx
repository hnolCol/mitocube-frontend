import { useGetSubmissionsCount } from "../../../hooks/queries/submission.hooks"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { groupListByProperty } from "../../../services/arrays/groupby"
import { getUserFullName, getUserInitials } from "../../../services/format/user"
import Loading from "../../core/base/loading"
import {motion} from "framer-motion"
import _ from "lodash"
import { ExpandableButton } from "./AttributeSelection"
import { useState } from "react"
import { addItemToArrayOrRemoveItIfPresent, isItemInArrayDeepComp } from "../../../services/arrays/transforms"
import { Divider } from "@blueprintjs/core"

export function SimpleUser({ user, handleClick, isSelected = false, count = 2}) {
    return (
        <motion.div
            className="flex bg--grey center-items"
            style={{marginLeft : "1.6rem"}}
            whileHover={{ color: "#000", backgroundColor: "#fafafa" }}>
            <motion.button
                disabled = {count === 0}
                onClick={(e) => handleClick(e,user)}
                className={`attribute__filter__button ${isSelected ?"attribute__filter_button--selected":""}`}
                transition={{ duration: 0.1 }}>
                        {`${getUserFullName(user)} (${count})`}
            </motion.button>
        </motion.div>
    )
}

export function UserFilter({ submissionFilter, setSubmissionFilter, tags }) {
    const [openGroups, setOpenGroup] = useState({})
    const { data: allSubmissionUserCounts, isLoading: asIsLoading, isFetching: asIsFetching, isSuccess: asIsSuccess } = useGetSubmissionsCount({ group: "user" }, { staleTime: 600000 })
    const { data : submissionCounts, isLoading : submissionUserIsLoading, isFetching : submissionUserIsFetching, isSuccess : submissionUserIsSuccess } = useGetSubmissionsCount({ group: "user", tags : _.join(tags,";") }, {enabled : tags.length > 0})
    const { data, isLoading, isFetching, isSuccess, isError, error } = useGetPublicUserInfo()
    //console.log(allSubmissionUserCounts)
    // console.log(submissionCounts)
    //console.log(data)
    const groupedUsers = isSuccess && _.isArray(data) && data.length > 0 ? groupListByProperty(data, "research_group") : {}
    const researchGroups = _.keys(groupedUsers)
    //console.log(researchGroups)

    const handleUserClick = (e, user) => {
            e.stopPropagation()
            setSubmissionFilter(prevValues => {
                return {
                    ...prevValues, "user": addItemToArrayOrRemoveItIfPresent({
                        array: prevValues.user,
                        item: user
                    })
                }
            })
        }

    const handleOpenGroup = (research_group) => {
        setOpenGroup(prevValues => {
            return {
                ...prevValues, [research_group]: _.has(prevValues, research_group) ?
                    { ...prevValues[research_group], isOpen: !prevValues[research_group].isOpen } :
                    { isOpen: true }
            }
        })
    }


    return (
        <div className="intent-margin-top--little">
            <h4>Users</h4>
            {isError ? <p>Error</p> : isFetching && isLoading ? <Loading /> :
                <div style={{ width: "100%" }}>
                    {researchGroups
                        .map(research_group => {
                            let isOpen = _.has(openGroups, research_group) && openGroups[research_group].isOpen
                            const userInSubmissionCounts = groupedUsers[research_group].filter(user => _.has(allSubmissionUserCounts, user.tag))
                            const countsForResearchGroup = _.sum(userInSubmissionCounts.map(user => _.isObject(submissionCounts) ? _.has(submissionCounts,user.tag) ? submissionCounts[user.tag].count : 0 : allSubmissionUserCounts[user.tag].count))
                            
                            if (userInSubmissionCounts.length === 0) return null 
                            const userInFilter = _.isArray(submissionFilter["user"]) && submissionFilter["user"].length > 0
                            const isAnyUserSelected = userInFilter && _.some(userInSubmissionCounts.map(user => isItemInArrayDeepComp({array : submissionFilter["user"], item : user})))
                            return (
                                <div key={research_group}>
                                    <ExpandableButton
                                        text={research_group}
                                        count={countsForResearchGroup}
                                        isOpen={isOpen}
                                        handleClick={() => handleOpenGroup(research_group)}
                                        handleOpen={() => handleOpenGroup(research_group)}/>
                                    {isOpen || isAnyUserSelected ?
                                        userInSubmissionCounts
                                            .map(user => <SimpleUser key={user.tag} {...{
                                                user,
                                                isSelected : userInFilter && isItemInArrayDeepComp({array : submissionFilter["user"], item : user}),
                                                handleClick : handleUserClick,
                                                count: _.isObject(submissionCounts) ?  _.has(submissionCounts,user.tag) ? submissionCounts[user.tag].count : 0 : allSubmissionUserCounts[user.tag].count}}/>
                                            ) : null}
                                <Divider />
                                </div>)
                        })}
                </div>}

        </div>
    )
}