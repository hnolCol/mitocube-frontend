import _ from "lodash"
import { api } from "@/api"
import { useParams } from "react-router"

function ResearchGroupLabel({ tag }) {
    const { data: rg } = api.researchgroups.useGetResearchGroupByTag(
        { tag },
        { enabled: _.isString(tag) && tag.length > 0 }
    )
    return <span>{rg?.text || tag}</span>
}

export function UserView() {
    const { tag } = useParams()

    const { data: researchGroupTags = [] } = api.researchgroups.useGetResearchGroupsByQuery({ user_tags: tag }, { enabled: _.isString(tag) && tag.length > 0 })
    const { data: user, isLoading, isError, error } = api.users.core.useGetPublicUserByTag({ tag }, { enabled: _.isString(tag) && tag.length > 0 })

    if (isLoading) return <div>Loading user...</div>
    if (isError) return <div>Error loading user: {error.message}</div>
    return (
        <div className="user-view">
            <h2>User Details</h2>
            <p><strong>Tag:</strong> {user.tag}</p>
            <p><strong>First Name:</strong> {user.firstname}</p>
            <p><strong>Last Name:</strong> {user.lastname}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Research Group:</strong> {researchGroupTags.length > 0
                ? researchGroupTags.map((rgTag) => <ResearchGroupLabel key={rgTag} tag={rgTag} />)
                : "None"}
            </p>
        </div>
    )
}