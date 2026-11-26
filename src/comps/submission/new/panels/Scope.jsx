import _ from "lodash"
import TextInput from "../../../core/input/Text"
import TextFieldInput from "../../../core/input/TextArea"
import useDebounce from "../../../../hooks/useDebounce"
import { useState } from "react"
import { api } from "@/api";
import { SubmissionLink } from "../../../core/links/Submission"
import { SubmissionInput } from "@/comps/core/input/api/SubmissionInput"
import { addStringToArrayOrRemove } from "@/services/arrays/transforms"
import { TinyXButton } from "@/comps/modularprocedures/Shared"

const RESEARCH_AIM_TAG = "metatext:research_aim"

export function ScopePanel({ submission, setSubmission, setComponentKey }) {
    const [submissionTitle, setSubmissionTitle] = useState()
    const debouncedTitle = useDebounce(submissionTitle,20)

    const { data: submission_tags } = api.submissions.query.useGetSubmissionByQuery({ search_string: debouncedTitle, limit: 10, group_by_state : false },
        {enabled: debouncedTitle.length > 0, staleTime: 300000, placeholderData: (prev) => prev || []})
    const { data: metatext } = api.submissions.metatexts.useGetSubmissionMetatext({})
    
    
    const handleTitleChange = (key, title) => {
        setSubmission(prevValues => { return { ...prevValues, title } })
        setSubmissionTitle(title)
    }

    const handleResearchAimChange = (key, text) => {
        setSubmission(prevValues => { return { ...prevValues, metatext: { ...prevValues.metatext, [key]: text } } })
    }

    return <div>

        <h3>Study</h3>

        <p>Select or create a study that describes the overall aim of the submission assay.</p>

        <h3>Submission Title & Research Aim</h3>
            <TextInput
                placeholder="Set the title of your submission.."
                hint=""
                value={_.isString(submission["title"]) ? submission["title"] : ""}
                callbackKey="title"
                onChange={handleTitleChange} />

            <TextFieldInput
                callbackKey={RESEARCH_AIM_TAG}
                value={_.isObject(submission.metatext) && _.isString(submission.metatext[RESEARCH_AIM_TAG]) ? submission.metatext[RESEARCH_AIM_TAG] : ""}
                placeholder={_.get(metatext, ["placeholders", RESEARCH_AIM_TAG], "Describe the research aim of this submission...")}
                minLength={_.toInteger(_.get(metatext, ["min_text_length", RESEARCH_AIM_TAG], 100))}
                isRequired={true}
                hint="Research aim"
                onChange={handleResearchAimChange} />
            
            <h3>Linked Submission</h3>
            <p>Optionally link another submission from your scope, e.g. if this submission repeats an experiment.</p>
            {_.isArray(submission.linked_submission_tags) && submission.linked_submission_tags.length > 0 ?
                <div className="flex center-items" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span>Linked submission:</span>
                <div className="flex font-size--small">
                    {submission.linked_submission_tags && submission.linked_submission_tags.length > 0 ?
                        submission.linked_submission_tags.map(tag => <div key={tag} className="flex bg--lightgrey margin-left--little"><SubmissionLink tag={tag} /> <TinyXButton onClick={() => setSubmission(prevValues => { return { ...prevValues, linked_submission_tags: prevValues.linked_submission_tags.filter(t => t !== tag) } })} /></div>) : null}
                </div>
                </div> : null}
            {/* SubmissionInput queries /submissions/q, which is scoped to the current user */}
        <SubmissionInput
                selected_submission_tags={_.isString(submission.linked_submission_tags) && submission.linked_submission_tags.length > 0 ? [submission.linked_submission_tags] : []}
                onSelect={(tag) => setSubmission(prevValues => { return { ...prevValues, linked_submission_tags: addStringToArrayOrRemove({array : prevValues.linked_submission_tags, string: tag }) } })}
        />
         <div className="font-size--small flex flex-column" style={{ minHeight: "3rem", marginTop : "1rem", gap : "0.2rem" }}>
            {/* display other submissions that match the search string (e.g. the title.) Maybe create a full text search for this. */}
            {_.isArray(submission_tags) && debouncedTitle.length > 0 && submission_tags.length > 0 ? <div>
                <div>Submissions matching your search..</div>
                {submission_tags.length > 0 ?
                    submission_tags.map(submission_tag => <SubmissionLink key={submission_tag} tag={submission_tag} search_string={debouncedTitle} />) : null}
            </div> : null}
            </div>
            </div>
}
