import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { InputGroup, Spinner, Popover, SpinnerSize } from "@blueprintjs/core"
import { api } from "@/api"
import useDebounce from "@/hooks/useDebounce"
import { ResearchGroupInput } from "@/comps/core/input/api/ResearchGroupInput"
import TooltipButton from "@/comps/core/base/buttons/TooltipButton"
import { Button } from "@blueprintjs/core"
import { CreatedAt } from "@/comps/core/metrics/CreatedAt"
import { ConditionApplicationsView } from "@/comps/core/base/condition_applications/ConditionApplicationView"
import { UserFullName } from "@/comps/core/input/api/UserInput"

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
    return <div className="explore-submission-row flex flex-column padding--little bg--lightgrey div--round">
        <div className="flex justify-between align-center">
            <div className="flex flex-column">
                <span className="font-size--small font-weight--bold">{submission.title}</span>
                <div className="font-size--smallest">
                    {ownerName ? <span>by {ownerName} </span> : null}
                    {_.isString(submission.research_group_text) ? <span>({submission.research_group_text})</span> : null}
                </div>
                {_.isNumber(submission.created_at) ?
                    <span className="font-size--smallest"><CreatedAt createdat={submission.created_at} /></span> : null}
            </div>
            <div className="flex align-center" style={{ marginLeft: "auto", paddingLeft: "1rem" }}>
                {requested ?
                    <span className="font-size--smallest padding--little">Pending approval</span> :
                    <TooltipButton
                        className="explore-submission-row__request"
                        intent="primary"
                        icon="social-media"
                        small={true}
                        content="Request collaboration"
                        onClick={() => setIsRequestOpen(true)} />}
            </div>
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
            <div className="margin-top--little flex flex-column">
                <ResearchGroupInput
                    selected_rg_tags={_.isString(selectedGroup) ? [selectedGroup] : []}
                    onSelect={(rg_tag) => setSelectedGroup(prev => prev === rg_tag ? null : rg_tag)}
                    placeholder={_.isString(selectedGroup) ? "For me / change research group" : "For me / select research group"} />
                {_.isString(selectedGroup) ?
                    <div className="flex align-center margin-top--little" style={{ alignSelf: "flex-start", gap: "0.25rem" }}>
                        <span className="font-size--smallest padding--little bg--lightgrey div--round">
                            <ResearchGroupInputTitle tag={selectedGroup} />
                        </span>
                        <Button small={true} minimal={true} icon="small-cross" onClick={() => setSelectedGroup(null)} />
                    </div> : null}
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

function ResearchGroupInputTitle({ tag }) {
    const { data: rg } = api.researchgroups.useGetResearchGroupByTag(
        { tag }, { enabled: _.isString(tag) }
    )
    return <span>{_.isObject(rg) && _.isString(rg.text) ? rg.text : tag}</span>
}

ExploreSearchTag.propTypes = {
    onRemove: PropTypes.func.isRequired,
    children: PropTypes.node
}

function ExploreSearchTag({ onRemove, children }) {
    return <div className="flex align-center padding--little bg--lightgrey div--round font-size--smallest" style={{ gap: "0.25rem" }}>
        {children}
        <button
            className="basic-button--small"
            style={{ padding: "0 0.25rem", fontWeight: "bold" }}
            onClick={onRemove}>×</button>
    </div>
}

ExploreTagSearch.propTypes = {
    searchString: PropTypes.string,
    setSearchString: PropTypes.func.isRequired,
    selected_ca_tags: PropTypes.arrayOf(PropTypes.string),
    selected_user_tags: PropTypes.arrayOf(PropTypes.string),
    onSelectConditionApplication: PropTypes.func.isRequired,
    onSelectUser: PropTypes.func.isRequired
}

/**
 * @description Tag-like search for the explore view. While typing, matching condition
 * applications and users are suggested. Selecting one adds it as a removable tag
 * which filters the explored submissions (backend support required, see README).
 * @returns {JSX.Element} The tag search input with suggestions and selected tags.
 */
function ExploreTagSearch({ searchString, setSearchString, selected_ca_tags, selected_user_tags, onSelectConditionApplication, onSelectUser }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const debouncedSearch = useDebounce(searchString, 300)
    const hasSearch = _.isString(searchString) && searchString.trim().length > 0
    const { data: ca_tags, isLoading: isCALoading } = api.condition_applications.useGetConditionApplicationByQuery(
        { search_string: debouncedSearch, limit: 10 },
        { enabled: hasSearch, retry: false }
    )
    const { data: user_tags, isLoading: isUserLoading } = api.users.queryByQuery.useGetUserByQuery(
        { search_string: debouncedSearch, limit: 10 },
        { enabled: hasSearch, retry: false }
    )
    const handleSelect = (tag, onSelect) => {
        onSelect(tag)
        setSearchString("")
        setIsDropdownOpen(false)
    }
    return <div className="flex flex-column">
        <Popover
            fill={true}
            isOpen={hasSearch && isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            placement="bottom-start"
            minimal={true}
            enforceFocus={false}
            content={<div style={{ minWidth: "400px", maxHeight: "50vh", overflowY: "auto", padding: "0.25rem" }}>
                {(isCALoading || isUserLoading) && (!_.isArray(ca_tags) || !_.isArray(user_tags)) ?
                    <div className="flex center-items padding--little"><Spinner size={20} /></div> : null}
                {_.isArray(ca_tags) && ca_tags.length > 0 ?
                    <div className="flex flex-column">
                        <span className="font-size--smallest font-weight--bold padding--little">Condition Applications</span>
                        {ca_tags.map(ca_tag => <button
                            key={ca_tag}
                            className="basic-button--small"
                            style={{ textAlign: "left" }}
                            onClick={() => handleSelect(ca_tag, onSelectConditionApplication)}>
                            <ConditionApplicationsView tag={ca_tag} show_attribute={true} />
                        </button>)}
                    </div> : null}
                {_.isArray(user_tags) && user_tags.length > 0 ?
                    <div className="flex flex-column">
                        <span className="font-size--smallest font-weight--bold padding--little">Users</span>
                        {user_tags.map(user_tag => <button
                            key={user_tag}
                            className="basic-button--small"
                            style={{ textAlign: "left" }}
                            onClick={() => handleSelect(user_tag, onSelectUser)}>
                            <UserFullName tag={user_tag} />
                        </button>)}
                    </div> : null}
                {(_.isArray(ca_tags) && ca_tags.length === 0) && (_.isArray(user_tags) && user_tags.length === 0) ?
                    <div className="padding--little font-size--smallest">No matching condition applications or users.</div> : null}
            </div>}>
            <InputGroup
                fill={true}
                leftIcon="search"
                placeholder="Search submissions by title, condition or user.."
                value={searchString}
                onChange={e => { setSearchString(e.target.value); setIsDropdownOpen(true) }}
                onFocus={() => setIsDropdownOpen(true)} />
        </Popover>
        {((_.isArray(selected_ca_tags) && selected_ca_tags.length > 0) || (_.isArray(selected_user_tags) && selected_user_tags.length > 0)) ?
            <div className="flex flex-wrap margin-top--little" style={{ gap: "0.25rem" }}>
                {_.isArray(selected_ca_tags) ? selected_ca_tags.map(ca_tag =>
                    <ExploreSearchTag key={ca_tag} onRemove={() => onSelectConditionApplication(ca_tag)}>
                        <ConditionApplicationsView tag={ca_tag} show_attribute={true} />
                    </ExploreSearchTag>) : null}
                {_.isArray(selected_user_tags) ? selected_user_tags.map(user_tag =>
                    <ExploreSearchTag key={user_tag} onRemove={() => onSelectUser(user_tag)}>
                        <UserFullName tag={user_tag} />
                    </ExploreSearchTag>) : null}
            </div> : null}
    </div>
}

SubmissionExplore.propTypes = {
    user_tag: PropTypes.string
}

/**
 * @description Explore view that lists submissions outside the user's submission scope
 * by title and optionally by condition application / user tags (backend explore
 * endpoint, returns only minimal, non-sensitive metadata) and allows to request
 * collaboration (messaging about a submission requires access and is available
 * in the submission overview).
 * @param {Object} props
 * @param {String} [props.user_tag] Tag of the current user
 * @returns {JSX.Element} The submission explore view.
 */
export function SubmissionExplore({ user_tag }) {
    const [searchString, setSearchString] = useState("")
    const [selectedCATags, setSelectedCATags] = useState([])
    const [selectedUserTags, setSelectedUserTags] = useState([])
    const debouncedSearch = useDebounce(searchString, 300)
    const { data: submissions, isLoading, isFetching, isError } = api.collaborations.useGetSubmissionExplore(
        {
            search_string: debouncedSearch,
            limit: 40,
            ca_tags: selectedCATags,
            user_tags: selectedUserTags
        },
        { enabled: true, staleTime: 500, retry: false }
    )
    const handleSelectConditionApplication = (ca_tag) => {
        setSelectedCATags(prev => prev.includes(ca_tag) ? prev.filter(tag => tag !== ca_tag) : [...prev, ca_tag])
    }
    const handleSelectUser = (user_tag) => {
        setSelectedUserTags(prev => prev.includes(user_tag) ? prev.filter(tag => tag !== user_tag) : [...prev, user_tag])
    }
    return <div className="flex flex-column center-items padding--medium">
        <h3>Explore submissions</h3>
        <p className="font-size--small" style={{ maxWidth: "60vw", textAlign: "center" }}>
            Discover submissions outside your submission scope by title, condition applications or users.
            You can view their minimal metadata here and ask the owner for collaboration. Sensitive data
            (samples, quantifications, metatexts) is not shown and access is only granted after the owner
            approved your collaboration request.
        </p>
        <div style={{ maxWidth: "1100px", width: "70vw" }} className="margin-top--little">
            <ExploreTagSearch
                searchString={searchString}
                setSearchString={setSearchString}
                selected_ca_tags={selectedCATags}
                selected_user_tags={selectedUserTags}
                onSelectConditionApplication={handleSelectConditionApplication}
                onSelectUser={handleSelectUser} />
            <div className="margin-top--little">
                {isLoading || isFetching ? <div className="flex center-items padding--medium"><Spinner size={20} /></div> :
                    isError ? <div className="padding--little font-size--small">Failed to load submissions.</div> :
                        !_.isArray(submissions) || submissions.length === 0 ?
                            <div className="padding--little font-size--small">No submissions found.</div> :
                            <div className="flex flex-column" style={{ gap: "0.25rem" }}>
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
