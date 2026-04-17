
import { api } from "@/api";
import { Comment } from "./Comment"

export function SubmissionComments({ submission_tag }) {
    
    const {data : comments, isLoading, isSuccess } = api.submissions.comments.useGetSubmissionComments({tag : submission_tag})
    return (
        <div className="padding--little margin-top--little">
            {isSuccess ? 
                comments.map(comment => <Comment comment={comment}/>)
            : null }
        </div>
    )
}