import { useGetResearchGroups } from "../../../hooks/queries/researchgroup.hooks"
import { Loading } from "../../core/base/states/Loading"
import { ResearchGroupItem } from "./ResearchGroupItem"
import APIError from "../../core/error/APIerror"
import _ from "lodash"
import { useEffect } from "react"

export function ResearchGroupView({ refetchTrigger, setEditUsersDialog }) {    

    const { data : research_group_tags, isLoading, isFetching, isSuccess, isError, error, refetch } = useGetResearchGroups()

    

    useEffect(() => {
        if (refetchTrigger !== undefined) {
            refetch()
        }
    }, [refetchTrigger])


    return <div>
        {isError ? <APIError error={error} /> : null}
        {isLoading || isFetching ? <Loading /> : null }
        {isSuccess && _.isArray(research_group_tags) ?
            research_group_tags.map(tag => <ResearchGroupItem tag={tag} setEditUsersDialog={setEditUsersDialog} />) : null }
    </div>

}