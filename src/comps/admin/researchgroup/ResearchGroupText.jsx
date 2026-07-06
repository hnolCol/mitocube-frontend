
import _ from "lodash"
import { api } from "@/api";


export function ResearchGroupText({ research_group_tag }) {
    const { data: research_group, isSuccess, isLoading, isFetching } = api.researchgroups.useGetResearchGroupByTag({ tag: research_group_tag }, { enabled: _.isString(research_group_tag), staleTime: Infinity })
   
    return <span>{isSuccess ? research_group.text : null}</span>
}

export function ResearchGroupTextByUser({ user_tags }) {
    
    const { data: research_group_tags, isSuccess, isLoading, isFetching } = api.researchgroups.useGetResearchGroupsByQuery( { user_tags : _.join(user_tags, ";") }, { enabled: _.isArray(user_tags), staleTime: Infinity })
   
   
    return <div>{isSuccess ? _.map(research_group_tags, tag => <ResearchGroupText key={tag} research_group_tag={tag} />) : null}</div>
}