
import hooks from "@mitocube/api-hooks"
import { Comment } from "./Comment"
export function SubmissionComments({ submission_tag }) {
    
    const {data : comments, isLoading, isSuccess } = hooks.submissions.useGetSubmissionComments({tag : submission_tag})
    return (
        <div className="padding--little margin-top--little">
            {isSuccess ? 
                comments.map(comment => <Comment comment={comment}/>)
            : null }
        </div>
    )
}