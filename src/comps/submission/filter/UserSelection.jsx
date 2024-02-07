import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { groupListByProperty } from "../../../services/arrays/groupby"
import { getUserFullName, getUserInitials } from "../../../services/format/user"
import Loading from "../../core/base/loading"
import {motion} from "framer-motion"
import _ from "lodash"

export function SimpleUser({ user, handleClick, isSelected = false, count = 2 }) {
    return (
        <motion.div className="flex bg--grey center-items"
                    whileHover={{ color: "#000", backgroundColor: "#fafafa" }}>
                        <motion.button
                            //onClick={() => handleClick(attribute_value)}
                            className={`attribute__filter__button ${isSelected ?"attribute__filter_button--selected":""}`}
                            transition={{ duration: 0.1 }}>
                        {`${getUserFullName(user)} (${count})`}
                        </motion.button>
        </motion.div>
    )
}

export function UserSelection({ submissionFilter, setSubmissionFilter, labels }) {
    
    const { data, isLoading, isFetching, isSuccess, isError, error } = useGetPublicUserInfo()
    
    const groupedUsers = isSuccess && _.isArray(data) && data.length > 0 ? groupListByProperty(data,"research_group"): {}
    return (
        <div>
            <h4>Users</h4>
            {isError ? <p>Error</p> : isFetching && isLoading ? <Loading /> :
                <div style={{width : "13rem"}}>
                    {data.map(user => <SimpleUser {...{user}}/>)}

                </div>}

        </div>
    )
}