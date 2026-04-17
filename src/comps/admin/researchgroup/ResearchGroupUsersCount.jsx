import { api } from "@/api";
import Numeric from "@/comps/core/metrics/Numeric";
import _ from "lodash";

export function ResearchGroupUsersCount({ tag }) { 

    const { data: usersCount, isSuccess, isLoading, isFetching } = api.researchgroups.useGetResearchGroupUsersCount({tag }, { enabled : _.isString(tag) && tag.length > 0 })


    return <div>
        <Numeric metric={usersCount} label="Users" roundPrecision={0}/>
    </div>

}