import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, InputGroup, Spinner } from "@blueprintjs/core"
import moment from "moment"
import { api } from "@/api"
import useDebounce from "@/hooks/useDebounce"
import { ResearchGroupInput } from "@/comps/core/input/api/ResearchGroupInput"

ExploreSubmissionRow.propTypes = {
    submission: PropTypes.object.isRequired,
    user_tag: PropTypes.string
}

/**
 * @description One discovered submission row in the explore view. Shows the minimal
 * metadata returned by the explore endpoint and offers to request collaboration
 * (optionally for one of the user's research groups). Messaging about a
 * submission requires submission access and is therefore not offered here (see
 * the submission overview messages button).
 * @param {Object} props
 * @param {Object} props.submission Submission explore data
 * @param {String} [props.user_tag] Tag of the current user
 * @returns {JSX.Element} The explore submission row.
 */
function ExploreSubmissionRow({ submission, user_tag }) {
    const [isRequestOpen, setIsRequestOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [requested, setRequested] = useState(submission.has_open_collaboration_request === true)
    const { mutate, isPending, isError, error } = api.collaborations.usePostCollaborationRequest({
        onSuccess: () => { setRequested(true); setIsRequestOpen(false) }
    })
    const { data: userResearchGroups } = api.researchgroups.useGetResearchGroupsOfUser(
        { user_tag }, { enabled: _.isString(user_tag), staleTime: 300000 }
    )
    const ownerName = _.isString(submission.owner_firstname) || _.isString(submission.owner_lastname) ?
        `${_.isString(submission.owner_firstname) ? submission.owner_firstname : ""} ${_.isString(submission.owner_lastname) ? submission.owner_lastname : ""}`.trim() :
        submission.owner_tag
    const handleSendRequest = () => {
        mutate({
            submission_tag: submission.tag,
            message: message.length > 0 ? message : undefined,
            requested_for_group_tag: _.isString(selectedGroup) ? selectedGroup : undefined
        })
    }
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <div className="flex flex-column">
            <span className="font-size--small font-weight--bold">{submission.title}</span>
            <div className="font-size--smallest">
                {ownerName ? <span>by {ownerName} </span> : null}
                {_.isString(submission.research_group_text) ? <span>({submission.research_group_text})</span> : null}
            </div>
            {_.isNumber(submission.created_at) ?
                <span className="font-size--smallest">{moment.unix(submission.created_at / 1000).format("YYYY-MM-DD")}</span> : null}
        </div>
        <div className="flex">
            <Button
                small={true}
                intent={requested ? "warning" : "primary"}
                text={requested ? "Pending approval" : "Request collaboration"}
                disabled={requested}
                onClick={() => setIsRequestOpen(true)} />
        </div>
        {isRequestOpen ? <CollaborationRequestForm
            submission={submission}
            userResearchGroups={userResearchGroups}
            message={message}
            setMessage={setMessage}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            isPending={isPending}
            isError={isError}
            error={error}
            onSubmit={handleSendRequest}
            onCancel={() => setIsRequestOpen(false)} /> : null}
    </div>
}

CollaborationRequestForm.propTypes = {
    submission: PropTypes.object.isRequired,
    userResearchGroups: PropTypes.array,
    message: PropTypes.string,
    setMessage: PropTypes.func,
    selectedGroup: PropTypes.string,
    setSelectedGroup: PropTypes.func,
    isPending: PropTypes.bool,
    isError: PropTypes.bool,
    error: PropTypes.object,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

/**
 * @description Inline form to create a collaboration request for a discovered submission.
 * The request can optionally be created for one of the user's research groups, in which
 * case all group members become collaborators on approval.
 * @returns {JSX.Element} The collaboration request form.
 */
function CollaborationRequestForm({ submission, userResearchGroups, message, setMessage, selectedGroup, setSelectedGroup, isPending, isError, error, onSubmit, onCancel }) {
    return <div className="flex flex-column margin-top--little padding--little bg--white div--round" style={{ width: "100%" }}>
        <span className="font-size--small">Request collaboration for "{submission.title}"</span>
        {_.isArray(userResearchGroups) && userResearchGroups.length > 0 ?
            <div className="margin-top--little">
                <ResearchGroupInput
                    selected_rg_tags={_.isString(selectedGroup) ? [selectedGroup] : []}
                    onSelect={(rg_tag) => setSelectedGroup(prev => prev === rg_tag ? null : rg_tag)}
                    placeholder="For me / select research group" />
            </div> : null}
        <textarea
            className="textarea margin-top--little"
            style={{ width: "100%", minHeight: "3rem" }}
            placeholder="Optional message to the submission owner.."
            value={message}
            onChange={e => setMessage(e.target.value)} />
        {isError ?
            <div className="font-size--small">{`An error occurred: ${error?.response?.data?.detail || error?.message || "unknown error"}`}</div> : null}
        <div className="flex justify-end margin-top--little">
            <Button small={true} text="Cancel" onClick={onCancel} />
            <Button small={true} intent="primary" className="margin-left--little" text="Send request" loading={isPending} onClick={onSubmit} />
        </div>
    </div>
}

SubmissionExplore.propTypes = {
    user_tag: PropTypes.string
}

/**
 * @description Explore view that lists submissions outside the user's submission scope
 * by title (backend explore endpoint, returns only minimal, non-sensitive metadata)
 * and allows to request collaboration (messaging about a submission requires
 * access and is available in the submission overview).
 * @param {Object} props
 * @param {String} [props.user_tag] Tag of the current user
 * @returns {JSX.Element} The submission explore view.
 */
export function SubmissionExplore({ user_tag }) {
    const [searchString, setSearchString] = useState("")
    const debouncedSearch = useDebounce(searchString, 300)
    const { data: submissions, isLoading, isFetching, isError } = api.collaborations.useGetSubmissionExplore(
        { search_string: debouncedSearch, limit: 40 },
        { enabled: true, staleTime: 500, retry: false }
    )
    return <div className="flex flex-column center-items padding--medium">
        <h3>Explore submissions</h3>
        <p className="font-size--small" style={{ maxWidth: "60vw", textAlign: "center" }}>
            Discover submissions outside your submission scope by title. You can view their minimal metadata here
            and ask the owner for collaboration. Sensitive data (samples, quantifications, metatexts) is not shown
            and access is only granted after the owner approved your collaboration request.
        </p>
        <div style={{ maxWidth: "800px", width: "50vw" }} className="margin-top--little">
            <InputGroup
                fill={true}
                leftIcon="search"
                placeholder="Search submissions by title.."
                value={searchString}
                onChange={e => setSearchString(e.target.value)} />
            <div className="margin-top--little">
                {isLoading || isFetching ? <div className="flex center-items padding--medium"><Spinner size={20} /></div> :
                    isError ? <div className="padding--little font-size--small">Failed to load submissions.</div> :
                        !_.isArray(submissions) || submissions.length === 0 ?
                            <div className="padding--little font-size--small">No submissions found.</div> :
                            <div className="flex flex-column">
                                {submissions.map(submission => <ExploreSubmissionRow
                                    key={submission.tag}
                                    submission={submission}
                                    user_tag={user_tag} />)}
                            </div>}
            </div>
        </div>
    </div>
}

export default SubmissionExplore
