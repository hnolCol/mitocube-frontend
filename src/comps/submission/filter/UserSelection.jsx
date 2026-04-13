
import { getUserFullName, getUserInitials } from "../../../services/format/user"

import {motion} from "framer-motion"
import _ from "lodash"


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
    
    return <div></div>
}