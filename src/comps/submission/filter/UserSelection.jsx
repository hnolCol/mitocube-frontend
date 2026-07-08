
import { getUserFullName, getUserInitials } from "../../../services/format/user"

import {motion} from "framer-motion"
import _ from "lodash"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"


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

export function UserFilter({ submissionFilter, setSubmissionFilter, tags, authenticationStatus }) {
    if (!authenticationStatus?.isAuth) return null

    const currentUserTag = authenticationStatus.tag
    const isMySubmissions = _.isEqual(submissionFilter.user?.map(u => u.tag), [currentUserTag])   

    const toggleMySubmissions = () => {
        setSubmissionFilter(prevValues => {
            return isMySubmissions
                ? _.omit(prevValues, ["user", "user_role"])
                : { ...prevValues, user: [{ tag: currentUserTag }], user_role: "any" }
        })
    }

    return (
        <OptionButton isSelected={isMySubmissions} onClick={toggleMySubmissions}>
            My Submissions
        </OptionButton>
    )
}