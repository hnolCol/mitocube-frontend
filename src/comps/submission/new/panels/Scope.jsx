import _ from "lodash"
import TextInput from "../../../core/input/Text"
import TextFieldInput from "../../../core/input/TextArea"
import useDebounce from "../../../../hooks/useDebounce"
import { useState } from "react"
import { api } from "@/api";
import { SubmissionLink } from "../../../core/links/Submission"
import { Button } from "@blueprintjs/core"

const RESEARCH_AIM_TAG = "metatext:research_aim"

export function ScopePanel({submission, setSubmission, setComponentKey}) {
    const [submissionTitle, setSubmissionTitle] = useState()
    const debouncedTitle = useDebounce(submissionTitle,20)
    const [linkSearch, setLinkSearch] = useState("")
    const debouncedLinkSearch = useDebounce(linkSearch, 20)

    const { data: submission_tags } = api.submissions.query.useGetSubmissionByQuery({ search_string: debouncedTitle, limit: 10, group_by_state : false },
        {enabled: debouncedTitle.length > 0, staleTime: 300000, placeholderData: (prev) => prev || []})
    // submissions in the user's scope that can be linked (the search endpoint is scoped to the current user)
    const { data: linkable_submission_tags } = api.submissions.query.useGetSubmissionByQuery({ search_string: debouncedLinkSearch, limit: 10, group_by_state : false },
        {enabled: debouncedLinkSearch.length > 0, staleTime: 300000, placeholderData: (prev) => prev || []})
    const { data: metatext } = api.submissions.metatexts.useGetSubmissionMetatext({})
    
    
    const handleTitleChange = (key, title) => {
        setSubmission(prevValues => { return { ...prevValues, title } })
        setSubmissionTitle(title)
    }

    const handleResearchAimChange = (key, text) => {
        setSubmission(prevValues => { return { ...prevValues, metatext: { ...prevValues.metatext, [key]: text } } })
    }

    const handleLinkSearchChange = (key, value) => {
        setLinkSearch(value)
    }

    const linkableTags = _.isArray(linkable_submission_tags) ? linkable_submission_tags.filter(tag => _.isString(tag) && tag !== submission.tag) : []

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

            <h3>Research Aim</h3>
            <p>Describe the aim of this study. This is a required field.</p>
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
            {_.isString(submission.linked_submission_tag) && submission.linked_submission_tag.length > 0 ?
                <div className="flex center-items" style={{ gap: "0.5rem" }}>
                    <span>Linked submission:</span>
                    <SubmissionLink tag={submission.linked_submission_tag} />
                    <Button icon="cross" small={true} minimal={true} title="Remove linked submission"
                        onClick={() => setSubmission(prevValues => { return { ...prevValues, linked_submission_tag: null } })} />
                </div> :
                <div>
                    <TextInput
                        placeholder="Search submissions to link.."
                        hint=""
                        value={linkSearch}
                        callbackKey="linked_submission_search"
                        onChange={handleLinkSearchChange} />
                    <div className="font-size--small" style={{ minHeight: "3rem" }}>
                        {debouncedLinkSearch.length > 0 && linkableTags.length > 0 ? <div>
                            <div>Link one of these submissions (only submissions in your scope are shown):</div>
                            {linkableTags.map(tag =>
                                <div key={tag} style={{ cursor: "pointer" }} onClick={() => setSubmission(prevValues => { return { ...prevValues, linked_submission_tag: tag } })}>
                                    <SubmissionLink tag={tag} search_string={debouncedLinkSearch} />
                                </div>)}
                        </div> : null}
                    </div>
                </div>}
            </div>
}
