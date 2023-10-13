import { useGetUsers } from "../../hooks/queries/user.hooks"
import _ from "lodash"
import { User } from "../core/base/user"
import Loading from "../core/base/loading"
import APIError from "../core/error/APIerror"
import { getFormatDateFromTimestamp } from "../../services/date/format"
import { useMemo, useState } from "react"
import TextInput from "../core/input/Text"
import { objectHasKey } from "../../services/objects/checks"
import { object } from "prop-types"
import { filterArrayBySearchString } from "../../services/arrays/filter"


function AdminUsers({ authenticationStatus }) {
    const [query, setQuery] = useState()
    const {
        data,
        isError,
        error,
        isSuccess,
        isLoading,
        isFetching } = useGetUsers({ tokenString: authenticationStatus.token })
    
    
    //console.log(getFormatDateFromTimestamp(data.users.created_on))

    const userMatchingQuery = useMemo(() => {
        if (!_.isObject(data) || !objectHasKey({object : data, keyName : "users"})) return []
        if (query === "") return data.users
        else {
            return filterArrayBySearchString({array : data.users, searchString : query, searchColumns : ["firstname","lastname","institute","research_group","email"]})
        }
    },[query, isLoading, isSuccess])
    
    return (
        <div>
            
            <TextInput placeholder="Search user" callbackKey={"query"}  onChange={(callbackKey,value) => setQuery(value)}/>
            {isLoading || isFetching ?
                <Loading /> :
            isError ? <APIError error={error} /> : 
            isSuccess ? 
                        _.isArray(userMatchingQuery) ? userMatchingQuery.map(user => <User key={user.label} {...user} userRoles={data.roles}/>) : null : null}

        </div>
    )
}

export default AdminUsers