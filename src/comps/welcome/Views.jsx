import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { MinimalSubmissionItem } from "../submission/view/SubmissionItem";
import { api } from "@/api";

export function LastViewed({user_tag, type, limit}) {
    const { data: userSubmissionViews, isLoading, isError } = api.users.views.useGetUserViews({tag : user_tag, type, limit }, {staleTime: 60000 });
    return (
        <div className="bg--lightgrey padding--medium"
         style = {{
            width: "max(33vw, 500px)",
            minHeight: "max(20vh,300px)"}}>
            <h3>Last Viewed {type[0].toUpperCase()}{type.slice(1)}</h3>
            {isLoading ? <div>Loading...</div> : isError ? <div>Error loading views.</div> : _.isArray(userSubmissionViews) && userSubmissionViews.length === 0 ? <div>No views found.</div> : (
                <div>
                    {userSubmissionViews.map((submission_tag) => (
                        <MinimalSubmissionItem key={submission_tag} tag={submission_tag} redirectOnClick={true} showCreatedAt={false} />
                    ))}
                </div>
            )}
        </div>
    )
}