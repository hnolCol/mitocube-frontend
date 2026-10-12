import _ from "lodash";
import { api } from "@/api";
import Numeric from "@/comps/core/metrics/Numeric";

/**
 * @description Displays the total number of users of a consortium (members of its research groups).
 * @param {Object} props
 * @param {String} props.tag Consortium tag
 * @returns {JSX.Element} The users count metric.
 */
export function ConsortiumUsersCount({ tag }) {
    const { data: usersCount, isSuccess, isLoading, isFetching } = api.consortiums.useGetConsortiumUsers({ tag }, { enabled: _.isString(tag) && tag.length > 0 })
    return <div>
        <Numeric metric={_.isArray(usersCount) ? usersCount.length : usersCount} label="Users" roundPrecision={0}/>
    </div>
}
