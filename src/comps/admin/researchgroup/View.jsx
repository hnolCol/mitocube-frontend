import _ from "lodash"
import { useEffect } from "react"
import { api } from "@/api"
import { ResearchGroupContainer } from "./ResearchGroupContainer"

export function ResearchGroupView({ refetchTrigger, setEditUsersDialog }) {    

    const { data : research_group_tags, refetch } = api.researchgroups.useGetResearchGroups({}, { staleTime : Infinity })

    console.log(research_group_tags)

    useEffect(() => {
        if (refetchTrigger !== undefined) {
            refetch()
        }
    }, [refetchTrigger])


    return <div>

        <ResearchGroupContainer tags={research_group_tags} updateResearchGroupList={refetch} setEditUsersDialog={setEditUsersDialog} />
        {/* {isError ? <APIError error={error} /> : null}
        {isLoading || isFetching ? <Loading /> : null }
        {isSuccess && _.isArray(research_group_tags) ?
            research_group_tags.map(tag => <ResearchGroupItem tag={tag} setEditUsersDialog={setEditUsersDialog} />) : null } */}
    </div>

}