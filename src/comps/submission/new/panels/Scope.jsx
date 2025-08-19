import _ from "lodash"
import TextInput from "../../../core/input/Text"
import useDebounce from "../../../../hooks/useDebounce"
import { useState } from "react"
import hooks from "@mitocube/api-hooks"
import { SubmissionLink } from "../../../core/links/Submission"

export function ScopePanel({submission, setSubmission, setComponentKey}) {
    const [submissionTitle, setSubmissionTitle] = useState()
    const debouncedTitle = useDebounce(submissionTitle,20)

    const { data: submission_tags } = hooks.submissions.query.useGetSubmissionByQuery({ search_string: debouncedTitle, limit: 10, group_by_state : false },
        {enabled: debouncedTitle.length > 0, staleTime: 300000, placeholderData: (prev) => prev || []})
    const handleTitleChange = (key, title) => {
        setSubmission(prevValues => { return { ...prevValues, title } })
        setSubmissionTitle(title)
    }

    return <div>

        <h3>Study</h3>

        <p>Select or create a study that describes the overall aim of the submission assay.</p>

        <h3>Submission Title</h3>
            <TextInput
                placeholder="Set the title of your submission.."
                hint=""
                value={_.isString(submission["title"]) ? submission["title"] : ""}
                callbackKey="title"
                onChange={handleTitleChange} />
        <div className="font-size--small" style={{ height: "3rem" }}>
            {/* display other submissions that match the search string (e.g. the title.) Maybe create a full text search for this. */}
            {_.isArray(submission_tags) && debouncedTitle.length > 0 && submission_tags.length > 0 ? <div>
                <div>Submissions matching your search..</div>
                {submission_tags.length > 0 ?
                    submission_tags.map(submission_tag => <SubmissionLink key={submission_tag} tag={submission_tag} search_string={debouncedTitle} />) : null}
            </div> : null}
            </div>
            </div>
}