import _ from "lodash"
import { useEffect } from "react"
import { api } from "@/api"

export function ResearchGroupView({ refetchTrigger, setEditUsersDialog }) {    

    const { data : research_group_tags, refetch } = api.researchgroups.useGetResearchGroups({}, { staleTime : Infinity })

    console.log(research_group_tags)

    useEffect(() => {
        if (refetchTrigger !== undefined) {
            refetch()
        }
    }, [refetchTrigger])


    return <div>
        {/* {isError ? <APIError error={error} /> : null}
        {isLoading || isFetching ? <Loading /> : null }
        {isSuccess && _.isArray(research_group_tags) ?
            research_group_tags.map(tag => <ResearchGroupItem tag={tag} setEditUsersDialog={setEditUsersDialog} />) : null } */}
    </div>

}