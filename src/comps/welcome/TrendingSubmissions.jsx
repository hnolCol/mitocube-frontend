
import { api } from "@/api";
import { MinimalSubmissionItem } from "../submission/view/SubmissionItem";

export function TrendingSubmissions({ limit = 20 }) {
    const { data : trendingSubmissionTags, isLoading  } = api.submissions.query.useGetTrendingSubmissions({ limit }, { staleTime: 60000 }); 

    return   <div className="bg--lightgrey padding--medium flex flex-column"
         style = {{
            width: "max(33vw, 500px)",
                height: "max(50vh,300px)",
            overflowY: "scroll"}}>
        <h3>Trending Submissions</h3>

        {isLoading ? <div>Loading...</div> : trendingSubmissionTags.length === 0 ? <div>No trending submissions found.</div> : (
            <div>
                {trendingSubmissionTags.map((submission_tag) => (
                    <MinimalSubmissionItem key={submission_tag} tag={submission_tag} redirectOnClick={true} showCreatedAt={false} />
                ))}
            </div>
        )}
        
        <div>
            


    </div>
            
    </div>
} 