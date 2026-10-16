import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Spinner, Tag } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { SubmissionLink } from "@/comps/core/links/Submission"
import { ResearchGroupInput } from "@/comps/core/input/api/ResearchGroupInput"
import TooltipButton from "@/comps/core/base/buttons/TooltipButton"

const ACCESS_GROUPS = [
    {
        key: "own_group",
        title: "A) Own research group",
        description: "Submissions from members of your research group.",
        intent: "success",
        icon: "home"
    },
    {
        key: "scope",
        title: "B) Scope (accessible)",
        description: "Submissions you have access to, e.g. shared via consortium or as collaborator.",
        intent: "primary",
        icon: "eye-open"
    },
    {
        key: "no_access",
        title: "C) No access / out of scope",
        description: "Submissions you do not have access to. You can request a collaboration.",
        intent: "warning",
        icon: "lock"
    }
]

SimilarSubmissionItem.propTypes = {
    similar: PropTypes.object.isRequired,
    user_tag: PropTypes.string
}

/**
 * @description A single similar submission row. Shows the matched genotypes, condition
 * applications and traits and, for submissions without access, offers to request a
 * collaboration (optionally for one of the user's research groups).
 * @param {Object} props
 * @param {Object} props.similar A similar submission as returned by the similar submissions endpoint
 * @param {String} [props.user_tag] Tag of the current user
 * @returns {JSX.Element} The similar submission row.
 */
function SimilarSubmissionItem({ similar, user_tag }) {
    const [isRequestOpen, setIsRequestOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [requested, setRequested] = useState(false)
    const queryClient = useQueryClient()
    const { mutate, isPending, isError, error } = api.collaborations.usePostCollaborationRequest({
        onSuccess: () => {
            setRequested(true)
            setIsRequestOpen(false)
            queryClient.invalidateQueries({ queryKey: ["getSimilarSubmissions"] })
        }
    })
    const { data: userResearchGroups } = api.researchgroups.useGetResearchGroupsOfUser(
        { user_tag }, { enabled: _.isString(user_tag) && similar.access === "no_access", staleTime: 300000 }
    )
    const { data: permissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: similar.submission_tag },
        { enabled: similar.access === "no_access", staleTime: 60000, retry: false }
    )
    if (permissions?.view === true) return null
    const matched = _.isObject(similar.matched) ? similar.matched : {}
    const handleSendRequest = () => {
        mutate({
            submission_tag: similar.submission_tag,
            message: message.length > 0 ? message : undefined,
            requested_for_group_tag: _.isString(selectedGroup) ? selectedGroup : undefined
        })
    }
    return <div className="flex flex-column padding--little bg--lightgrey div--round">
        <div className="flex justify-between align-center">
            <SubmissionLink tag={similar.submission_tag} />
            <div className="flex align-center" style={{ gap: "0.5rem" }}>
                <Tag minimal={true} round={true}>{`${(similar.score * 100).toFixed(0)} % match`}</Tag>
                {similar.access === "no_access" ?
                    requested ?
                        <span className="font-size--smallest padding--little">Pending approval</span> :
                        <TooltipButton
                            intent="primary"
                            icon="social-media"
                            small={true}
                            content="Request collaboration"
                            onClick={() => setIsRequestOpen(prev => !prev)} />
                    : null}
            </div>
        </div>
        {_.isArray(matched.genotypes) && matched.genotypes.length > 0 ?
            <div className="font-size--smallest">Genotypes: {matched.genotypes.join(", ")}</div> : null}
        {_.isArray(matched.condition_applications) && matched.condition_applications.length > 0 ?
            <div className="font-size--smallest">Condition applications: {matched.condition_applications.join(", ")}</div> : null}
        {_.isArray(matched.traits) && matched.traits.length > 0 ?
            <div className="font-size--smallest">Traits: {matched.traits.join(", ")}</div> : null}
        {isRequestOpen ?
            <div className="flex flex-column margin-top--little padding--little bg--white div--round">
                <span className="font-size--small">Request collaboration for this submission</span>
                {_.isArray(userResearchGroups) && userResearchGroups.length > 0 ?
                    <div className="margin-top--little">
                        <ResearchGroupInput
                            selected_rg_tags={_.isString(selectedGroup) ? [selectedGroup] : []}
                            onSelect={(rg_tag) => setSelectedGroup(prev => prev === rg_tag ? null : rg_tag)}
                            placeholder={_.isString(selectedGroup) ? "For me / change research group" : "For me / select research group"} />
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
                    <Button small={true} text="Cancel" onClick={() => setIsRequestOpen(false)} />
                    <Button small={true} intent="primary" className="margin-left--little" text="Send request" loading={isPending} onClick={handleSendRequest} />
                </div>
            </div>
            : null}
    </div>
}

SimilarSubmissions.propTypes = {
    submission_tag: PropTypes.string.isRequired,
    limit: PropTypes.number,
    user_tag: PropTypes.string
}

/**
 * @description Lists the submissions that are most similar to the given submission,
 * grouped by the access of the current user: A) own research group, B) scope
 * (accessible) and C) no access / out of scope, where a collaboration can be
 * requested.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {Number} [props.limit=5] Maximum number of similar submissions to show
 * @param {String} [props.user_tag] Tag of the current user
 * @returns {JSX.Element|null} The similar submissions container or null while loading.
 */
export function SimilarSubmissions({ submission_tag, limit = 5, user_tag }) {
    const { data, isLoading } = api.submissions.similar.useGetSimilarSubmissions(
        { tag: submission_tag, limit },
        { enabled: _.isString(submission_tag) && submission_tag.length > 0, staleTime: 60000 }
    )
    if (isLoading) return <div className="flex center-items padding--medium"><Spinner size={20} /></div>
    const similar = _.isArray(data?.similar) ? data.similar : []
    if (similar.length === 0) return null
    return <div className="flex flex-column" style={{ gap: "0.75rem" }}>
        {ACCESS_GROUPS.map(group => {
            const items = similar.filter(s => s.access === group.key || (group.key === "scope" && s.access === null))
            if (items.length === 0) return null
            return <div key={group.key} className="flex flex-column" style={{ gap: "0.25rem" }}>
                <div className="flex align-center" style={{ gap: "0.5rem" }}>
                    <TooltipButton
                        icon={group.icon}
                        intent={group.intent}
                        minimal={true}
                        small={true}
                        content={group.description} />
                    <span className="font-weight--bold">{group.title}</span>
                </div>
                <div className="flex flex-column" style={{ gap: "0.25rem" }}>
                    {items.map(s => <SimilarSubmissionItem key={s.submission_tag} similar={s} user_tag={user_tag} />)}
                </div>
            </div>
        })}
    </div>
}

export default SimilarSubmissions
