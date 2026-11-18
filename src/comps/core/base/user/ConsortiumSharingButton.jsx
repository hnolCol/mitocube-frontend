import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { Button, Callout, Dialog, DialogBody, DialogFooter, Spinner, Switch, Tab, Tabs, Tag } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { ConsortiumText } from "@/comps/submission/view/ConsortiumText"
import { SubmissionLink } from "@/comps/core/links/Submission"
import { ResearchGroupTitle } from "@/comps/core/input/api/ResearchGroupInput"
import { UserFullName } from "@/comps/core/input/api/UserInput"

const PI_ROLE_THRESHOLD = 2

ConsortiumSharingTermsExplanation.propTypes = { isMemberWarning: PropTypes.bool }

/**
 * @description Short explanation of what agreeing and disagreeing to the consortium share
 * terms means for the members of the research group.
 * @param {Object} props
 * @param {Boolean} [props.isMemberWarning=false] True to phrase the explanation for members
 * whose PI has not agreed yet.
 * @returns {JSX.Element} The terms explanation callout.
 */
export function ConsortiumSharingTermsExplanation({ isMemberWarning = false }) {
    return <Callout intent={isMemberWarning ? "warning" : "primary"} title="What agreeing means">
        <div className="font-size--small">
            <b>Agreeing</b> lets the members of your research group request to share submissions
            with the consortium and see the submissions other groups shared with it. Each share
            request of a member still requires your approval as head (PI) before the submission
            becomes accessible to the consortium. Shares that you make yourself as PI are
            effective immediately.
            <br />
            <b>Disagreeing (revoking)</b> removes both abilities immediately and revokes all
            shares of your groups submissions with the consortium: pending share requests are
            stopped and approved shares are removed, so the consortium no longer has access to
            any submission of your group.
        </div>
    </Callout>
}

PendingTermsRow.propTypes = {
    pending: PropTypes.object.isRequired,
    onInvalidate: PropTypes.func
}

/**
 * @description One pending consortium terms agreement row: the consortium and the research
 * group the current user leads (as head/PI), with a button to agree to the consortium terms.
 * @param {Object} props
 * @param {Object} props.pending The pending terms agreement ({ consortium_tag, group_tag })
 * @param {Function} props.onInvalidate Callback to invalidate the terms queries
 * @returns {JSX.Element} The pending terms agreement row.
 */
function PendingTermsRow({ pending, onInvalidate }) {
    const { mutate: agree, isPending } = api.consortiumTerms.useAgreeConsortiumTerms({ onSuccess: onInvalidate })
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <div className="flex align-center" style={{ gap: "0.5rem" }}>
            <ConsortiumText tag={pending.consortium_tag} />
            <span className="font-size--smallest">for</span>
            <ResearchGroupTitle tag={pending.group_tag} />
        </div>
        <Button
            small={true}
            intent="primary"
            text="Agree to terms"
            disabled={isPending}
            onClick={() => agree({ consortium_tag: pending.consortium_tag, group_tag: pending.group_tag })} />
    </div>
}

AgreedTermsRow.propTypes = {
    consortium_tag: PropTypes.string.isRequired,
    group_tag: PropTypes.string.isRequired,
    user_tag: PropTypes.string,
    onInvalidate: PropTypes.func
}

/**
 * @description One agreed consortium terms row. The head (PI) of the group can disagree
 * (revoke the agreement); rows are only rendered for groups the current user heads.
 * @param {Object} props
 * @param {String} props.consortium_tag Consortium tag
 * @param {String} props.group_tag Research group tag
 * @param {String} props.user_tag Tag of the current user
 * @param {Function} props.onInvalidate Callback to invalidate the terms queries
 * @returns {JSX.Element|null} The agreed terms row.
 */
function AgreedTermsRow({ consortium_tag, group_tag, user_tag, onInvalidate }) {
    const { data: heads, isLoading } = api.researchgroups.useGetResearchGroupHeads(
        { tag: group_tag }, { staleTime: 300000, retry: false }
    )
    const { mutate: revoke, isPending } = api.consortiumTerms.useRevokeConsortiumTerms({ onSuccess: onInvalidate })
    const isHead = _.isArray(heads) && _.isString(user_tag) && heads.includes(user_tag)
    if (!isLoading && !isHead) return null
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <div className="flex align-center" style={{ gap: "0.5rem" }}>
            <ConsortiumText tag={consortium_tag} />
            <span className="font-size--smallest">for</span>
            <ResearchGroupTitle tag={group_tag} />
        </div>
        {isLoading ? <Spinner size={16} />
            : <Button
                small={true}
                intent="danger"
                text="Disagree (revoke)"
                disabled={isPending}
                onClick={() => revoke({ consortium_tag, group_tag })} />}
    </div>
}

AgreedTermsSection.propTypes = {
    consortium_tag: PropTypes.string.isRequired,
    user_tag: PropTypes.string,
    my_group_tags: PropTypes.array,
    onInvalidate: PropTypes.func
}

/**
 * @description The agreed consortium terms of one consortium of the current user, scoped to
 * the research groups the current user heads (is PI of). Other groups agreements are neither
 * shown nor counted; nothing is rendered if none of the users groups agreed.
 * @param {Object} props
 * @param {String} props.consortium_tag Consortium tag
 * @param {String} props.user_tag Tag of the current user
 * @param {Array} [props.my_group_tags] Tags of the research groups the current user heads
 * @param {Function} props.onInvalidate Callback to invalidate the terms queries
 * @returns {JSX.Element|null} The agreed terms section for one consortium.
 */
function AgreedTermsSection({ consortium_tag, user_tag, my_group_tags, onInvalidate }) {
    const { data: group_tags, isLoading, isSuccess } = api.consortiumTerms.useGetConsortiumTermsGroups(
        { tag: consortium_tag }, { enabled: _.isString(consortium_tag), staleTime: 60000 }
    )
    const agreedGroups = isSuccess && _.isArray(group_tags) ? group_tags : []
    const myGroups = _.isArray(my_group_tags) ? my_group_tags : []
    const visibleGroupTags = agreedGroups.filter(group_tag => myGroups.includes(group_tag))
    if (!isLoading && visibleGroupTags.length === 0) return null
    return <div className="margin--little">
        <div className="font-weight--bold font-size--small margin-bottom--little"><ConsortiumText tag={consortium_tag} /></div>
        {isLoading ? <Spinner size={20} /> :
            visibleGroupTags.map(group_tag => <AgreedTermsRow
                key={group_tag}
                consortium_tag={consortium_tag}
                group_tag={group_tag}
                user_tag={user_tag}
                onInvalidate={onInvalidate} />)}
    </div>
}

/**
 * @description The consortium share terms tab: a short explanation of what agreeing and
 * disagreeing results in, the pending terms agreements the current user (as head/PI) can
 * agree to, and the agreed terms of the users own groups per consortium.
 * @param {Object} props
 * @param {String} props.user_tag Tag of the current user
 * @returns {JSX.Element} The terms tab.
 */
function ConsortiumTermsTab({ user_tag }) {
    const queryClient = useQueryClient()
    const { data: pendingTerms, isLoading } = api.consortiumTerms.useGetPendingConsortiumTerms(
        {}, { staleTime: 60000, retry: false }
    )
    const { data: userConsortiums } = api.consortiums.useGetUserConsortiums({}, { staleTime: 300000, retry: false })
    const { data: myHeadedGroupTags } = api.researchgroups.useGetMyHeadedGroups(
        {}, { staleTime: 300000, retry: false }
    )

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumTerms"] })
        queryClient.invalidateQueries({ queryKey: ["getUserConsortiumsWithPendingTerms"] })
        queryClient.invalidateQueries({ queryKey: ["getConsortiumTermsGroups"] })
        queryClient.invalidateQueries({ queryKey: ["getMySharedSubmissionsOverview"] })
    }

    const pending = _.isArray(pendingTerms) ? pendingTerms : []
    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []
    const pendingConsortiumTags = new Set(pending.map(entry => _.isString(entry) ? entry : entry.consortium_tag))
    const agreedVisible = consortiumTags.some(consortium_tag => !pendingConsortiumTags.has(consortium_tag))
    return <div className="flex flex-column">
        <ConsortiumSharingTermsExplanation />
        {isLoading ? <Spinner size={20} /> : pending.length > 0 ? <>
            <h5 className="margin-top--little">Pending agreements</h5>
            {pending.map((pendingTermsEntry, idx) => <PendingTermsRow
                key={`${pendingTermsEntry.consortium_tag}-${pendingTermsEntry.group_tag}-${idx}`}
                pending={pendingTermsEntry}
                onInvalidate={invalidate} />)}
        </> : <p className="font-size--small margin-top--little">No pending consortium terms agreements for your research groups.</p>}
        {agreedVisible ? <h5 className="margin-top--little">Agreed terms</h5> : null}
        {consortiumTags.map(consortium_tag => <AgreedTermsSection
            key={consortium_tag}
            consortium_tag={consortium_tag}
            user_tag={user_tag}
            my_group_tags={myHeadedGroupTags}
            onInvalidate={invalidate} />)}
    </div>
}

/**
 * @description The general sharing report tab for heads (PIs): a description of what sharing
 * controls they have, then two sections, Consortiums and Collaboration, each listing only the
 * submissions that are actually shared. The Consortiums section shows the submissions shared
 * with a consortium (pending shares wait for your approval), the Collaboration section shows
 * the submissions shared with users via approved collaboration requests from the explore view.
 * @returns {JSX.Element} The sharing report tab.
 */
function SharedSubmissionsReportTab() {
    const { data: overview, isLoading, isError } = api.researchgroups.useGetMySharedSubmissionsOverview(
        {}, { staleTime: 30000, retry: false }
    )
    if (isLoading) return <div className="flex center-items padding--medium"><Spinner size={20} /></div>
    if (isError || !_.isArray(overview)) return <p className="font-size--small">The sharing report could not be loaded.</p>
    if (overview.length === 0) return <p className="font-size--small">Your groups have no submissions yet.</p>
    const entries = overview.filter(entry => _.isObject(entry) && _.isString(entry.submission_tag))
    const consortiumEntries = entries.filter(entry =>
        (_.isArray(entry.consortium_tags) && entry.consortium_tags.length > 0)
        || (_.isArray(entry.pending_consortium_tags) && entry.pending_consortium_tags.length > 0))
    const collaborationEntries = entries.filter(entry =>
        _.isArray(entry.collaborator_tags) && entry.collaborator_tags.length > 0)
    return <div className="flex flex-column">
        <Callout intent="primary" icon="info-sign" className="margin--little">
            <p className="font-size--small margin--none">
                This report shows every submission of you and your group members that
                is currently shared outside the group. As long as you have agreed to a consortiums
                share terms, your members can request shares to it and you approve each request
                before it becomes visible. Disagreeing to the terms revokes all consortium shares
                of your groups submissions at once.
            </p>
        </Callout>
        <div className="font-weight--bold font-size--small margin-top--little">Consortiums</div>
        <p className="font-size--smallest margin--none">
            Submissions shared with a consortium. 
        </p>
        {consortiumEntries.length === 0
            ? <p className="font-size--small">No submissions are shared with a consortium.</p>
            : consortiumEntries.map(entry => <SharedSubmissionRow
                key={entry.submission_tag}
                entry={entry}
                variant="consortium" />)}
        <div className="font-weight--bold font-size--small margin-top--little">Collaboration</div>
        <p className="font-size--smallest margin--none">
            Submissions shared with individual users via approved collaboration requests from the
            explore view. These are not affected by consortium share terms.
        </p>
        {collaborationEntries.length === 0
            ? <p className="font-size--small">No submissions are shared with users via collaboration.</p>
            : collaborationEntries.map(entry => <SharedSubmissionRow
                key={entry.submission_tag}
                entry={entry}
                variant="collaboration" />)}
    </div>
}

SharedSubmissionRow.propTypes = {
    entry: PropTypes.object.isRequired,
    variant: PropTypes.oneOf(["consortium", "collaboration"]).isRequired
}

/**
 * @description One sharing report row: the submission with its owner and, depending on the
 * section, the consortiums it is shared with or the collaborating users.
 * @param {Object} props
 * @param {Object} props.entry The report entry of one submission
 * @param {String} props.variant Whether the row is shown in the consortiums or collaboration section
 * @returns {JSX.Element} The sharing report row.
 */
function SharedSubmissionRow({ entry, variant }) {
    const sharedConsortiumTags = _.isArray(entry.consortium_tags) ? entry.consortium_tags : []
    const pendingConsortiumTags = _.isArray(entry.pending_consortium_tags) ? entry.pending_consortium_tags : []
    const collaboratorTags = _.isArray(entry.collaborator_tags) ? entry.collaborator_tags : []
    return <div className="flex flex-column margin--little padding--little bg--lightgrey div--round">
        <div className="flex justify-between align-center">
            <SubmissionLink tag={entry.submission_tag} />
            {_.isString(entry.owner_tag)
                ? <span className="font-size--smallest">by <UserFullName tag={entry.owner_tag} /></span>
                : null}
        </div>
        {variant === "consortium"
            ? <div className="flex align-center flex-wrap" style={{ gap: "0.3rem", marginTop: "0.3rem" }}>
                {sharedConsortiumTags.map(tag => <Tag key={tag} minimal={true} round={true} intent="success">
                    <ConsortiumText tag={tag} />
                </Tag>)}
                {pendingConsortiumTags.map(tag => <Tag key={tag} minimal={true} round={true} intent="warning">
                    <ConsortiumText tag={tag} /> (pending)
                </Tag>)}
            </div>
            : <div className="flex align-center flex-wrap" style={{ gap: "0.3rem", marginTop: "0.3rem" }}>
                {collaboratorTags.map(tag => <Tag key={tag} minimal={true} round={true}>
                    <UserFullName tag={tag} />
                </Tag>)}
            </div>}
    </div>
}

ExploreGroupRow.propTypes = {
    group_tag: PropTypes.string.isRequired,
    user_tag: PropTypes.string,
    onInvalidate: PropTypes.func
}

/**
 * @description One explore visibility row for a research group. The head (PI) of the group
 * gets a switch to disable/enable the explore visibility; members see the current status
 * set by their PI.
 * @param {Object} props
 * @param {String} props.group_tag Research group tag
 * @param {String} props.user_tag Tag of the current user
 * @param {Function} props.onInvalidate Callback to invalidate the explore queries
 * @returns {JSX.Element|null} The explore visibility row.
 */
function ExploreGroupRow({ group_tag, user_tag, onInvalidate }) {
    const { data: heads, isLoading } = api.researchgroups.useGetResearchGroupHeads(
        { tag: group_tag }, { staleTime: 300000, retry: false }
    )
    const { data: exploreDisabled, isLoading: disabledIsLoading } = api.researchgroups.useGetResearchGroupExploreDisabled(
        { tag: group_tag }, { staleTime: 60000, retry: false }
    )
    const { mutate: setDisabled, isPending } = api.researchgroups.useSetResearchGroupExploreDisabled({ onSuccess: onInvalidate })
    if (isLoading || disabledIsLoading) return <div className="margin--little padding--little bg--lightgrey div--round"><Spinner size={16} /></div>
    const isHead = _.isArray(heads) && _.isString(user_tag) && heads.includes(user_tag)
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <ResearchGroupTitle tag={group_tag} />
        {isHead
            ? <Switch
                innerLabelChecked="Disabled"
                innerLabel="Enabled"
                checked={exploreDisabled === true}
                disabled={isPending}
                onChange={() => setDisabled({ tag: group_tag, disabled: !(exploreDisabled === true) })} />
            : <Tag minimal={true} round={true} intent={exploreDisabled ? "danger" : "success"}>
                {exploreDisabled ? "Disabled by PI" : "Enabled by PI"}
            </Tag>}
    </div>
}

/**
 * @description The explore tab: lets heads (PIs) disable the explore visibility of their
 * research groups submissions. If disabled, users outside of the group do not see the groups
 * submissions in the explore view anymore and the members of the group lose access to the
 * explore tab.
 * @param {Object} props
 * @param {String} props.user_tag Tag of the current user
 * @returns {JSX.Element} The explore tab.
 */
function ConsortiumExploreTab({ user_tag }) {
    const queryClient = useQueryClient()
    const { data: group_tags, isLoading } = api.researchgroups.useGetResearchGroupsOfUser(
        { user_tag }, { enabled: _.isString(user_tag), staleTime: 300000, retry: false }
    )
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getMyExploreDisabled"] })
        queryClient.invalidateQueries({ queryKey: ["getResearchGroupExploreDisabled"] })
        queryClient.invalidateQueries({ queryKey: ["getPendingCollaborationRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getSubmissionCollaborationRequests"] })
        queryClient.invalidateQueries({ queryKey: ["getMySharedSubmissionsOverview"] })
    }
    if (isLoading) return <div className="flex center-items padding--medium"><Spinner size={20} /></div>
    const groups = _.isArray(group_tags) ? group_tags : []
    return <div className="flex flex-column">
        <Callout intent="primary" title="What disabling explore means">
            <div className="font-size--small">
                If you disable explore for your research group, users outside of your group will not
                see the submissions of your group in the explore view anymore, and the members of
                your group lose access to the explore tab (they see an "Explore disabled by PI"
                message instead). All collaboration access granted to your groups submissions via
                explore collaboration requests is revoked (similar to disagreeing to consortium share
                terms revoking the consortium shares).
            </div>
        </Callout>
        {groups.length === 0 ? <p className="font-size--small">You are not a member of any research group.</p> :
            groups.map(group_tag => <ExploreGroupRow
                key={group_tag}
                group_tag={group_tag}
                user_tag={user_tag}
                onInvalidate={invalidate} />)}
    </div>
}

ConsortiumSharingButton.propTypes = {
    user_tag: PropTypes.string,
    user_role: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

/**
 * @description Combined PI button for the topbar. Opens a dialog with the sharing controls of
 * the current user: the consortium share terms (with a short explanation of what agreeing and
 * disagreeing results in), a general sharing report (where each submission of the users groups
 * is shared: consortiums and collaborating users), and the explore visibility setting of the
 * research groups the user heads. Replaces the former separate consortium terms button.
 * @param {Object} props
 * @param {String} props.user_tag Tag of the current user
 * @param {Number|String} [props.user_role] Role of the current user
 * @returns {JSX.Element|null} The sharing button with dialog.
 */
export function ConsortiumSharingButton({ user_tag, user_role }) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("terms")
    const { data: userConsortiums, isLoading: consortiumsIsLoading } = api.consortiums.useGetUserConsortiums(
        {}, { staleTime: 300000, retry: false }
    )
    const { data: pendingTerms, isLoading: termsIsLoading } = api.consortiumTerms.useGetPendingConsortiumTerms(
        {}, { staleTime: 60000, retry: false }
    )
    const { data: isHead, isLoading: headIsLoading } = api.researchgroups.useGetMyIsHead(
        {}, { staleTime: 300000, retry: false }
    )
    const isPlOrAbove = isHead === true || (_.isFinite(_.toNumber(user_role)) && _.toNumber(user_role) >= PI_ROLE_THRESHOLD)
    if (consortiumsIsLoading || termsIsLoading || headIsLoading) return null
    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []
    const pending = _.isArray(pendingTerms) ? pendingTerms : []
    const hasPendingTerms = pending.length > 0
    if (!isPlOrAbove) return null
    if (consortiumTags.length === 0 && !hasPendingTerms && isHead !== true) return null

    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                intent={hasPendingTerms ? "warning" : "none"}
                icon="share"
                text="Share"
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Sharing"
            onClose={() => setIsOpen(false)}
            style={{ width: "60vw", minWidth: "600px" }}>
            <DialogBody>
                <Tabs
                    activeTabId={activeTab}
                    onChange={setActiveTab}
                    renderActiveTabPanelOnly={false}>
                    <Tab id="terms" title="Share terms" panel={<ConsortiumTermsTab user_tag={user_tag} />} />
                    <Tab id="report" title="Sharing report" panel={<SharedSubmissionsReportTab />} />
                    <Tab id="explore" title="Explore visibility" panel={<ConsortiumExploreTab user_tag={user_tag} />} />
                </Tabs>
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}