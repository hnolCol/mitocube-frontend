import PropTypes from "prop-types"
import _ from "lodash"
import { Callout, HTMLTable, Tag } from "@blueprintjs/core"
import { Link } from "react-router"
import { api } from "@/api"
import Loading from "../../core/base/loading"
import APIError from "../../core/error/APIerror"
import { UserFullName } from "../../core/input/api/UserInput"
import { ConsortiumText } from "@/comps/submission/view/ConsortiumText"
import { ResearchGroupText } from "../researchgroup/ResearchGroupText"

const CURATOR_ROLE = 2

function ReportHeader({ title, description, stats }) {
    return <div className="flex flex-column margin--medium" style={{ gap: "0.4rem" }}>
        <h3 style={{ marginBottom: 0 }}>{title}</h3>
        <span className="font-size--small" style={{ opacity: 0.75, maxWidth: "60rem" }}>{description}</span>
        <div className="flex margin--little" style={{ gap: "0.7rem", flexWrap: "wrap" }}>
            {_.map(stats, ({ value, label }) =>
                <div key={label} className="flex flex-column align-center div--round bg--lightgrey padding--little"
                    style={{ minWidth: "9rem", gap: "0.15rem" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.1 }}>{value}</span>
                    <span className="font-size--smallest" style={{ textAlign: "center", opacity: 0.8 }}>{label}</span>
                </div>)}
        </div>
    </div>
}

ReportHeader.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    stats: PropTypes.array
}

function ReportSection({ index, title, description, children }) {
    return <div className="margin--medium">
        <div className="flex align-baseline" style={{ gap: "0.5rem" }}>
            <Tag round={true} intent="primary">{index}</Tag>
            <h4 style={{ marginBottom: "0.2rem" }}>{title}</h4>
        </div>
        {_.isString(description) ? <div className="font-size--smallest margin--little" style={{ opacity: 0.7 }}>{description}</div> : null}
        {children}
    </div>
}

ReportSection.propTypes = {
    index: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.node
}

function ConsortiumName({ tag }) {
    return <strong className="font-weight--bold"><ConsortiumText tag={tag} /></strong>
}

ConsortiumName.propTypes = {
    tag: PropTypes.string
}

function TermsBadge({ agreed }) {
    return <Tag intent={agreed ? "success" : "warning"} round={true} minimal={true}>
        {agreed ? "agreed" : "not agreed"}
    </Tag>
}

TermsBadge.propTypes = {
    agreed: PropTypes.bool
}

function TableOrEmpty({ isEmpty, emptyText, children }) {
    if (isEmpty) {
        return <Callout intent="none" className="font-size--small">{emptyText}</Callout>
    }
    return <HTMLTable striped compact bordered style={{ width: "100%", tableLayout: "fixed" }}>{children}</HTMLTable>
}

TableOrEmpty.propTypes = {
    isEmpty: PropTypes.bool,
    emptyText: PropTypes.string,
    children: PropTypes.node
}

function SubmissionTitleCell({ tag }) {
    const { data: title, isSuccess } = api.submissions.title.useGetSubmissionTitle(
        { tag }, { enabled: _.isString(tag) && tag.length > 0, staleTime: 300000 })
    return <div className="flex flex-column" style={{ gap: "0.1rem" }}>
        <Link to={`/submissions/${tag}`}><strong>{isSuccess && _.isString(title) && title.length > 0 ? title : tag}</strong></Link>
        <span className="font-size--smallest" style={{ opacity: 0.6 }}>{tag}</span>
    </div>
}

SubmissionTitleCell.propTypes = {
    tag: PropTypes.string
}

function GroupNamesCell({ tags }) {
    if (_.isEmpty(tags)) return <span style={{ opacity: 0.5 }}>-</span>
    return <div className="flex" style={{ flexWrap: "wrap", gap: "0.3rem" }}>
        {_.map(tags, (tag) => <span key={tag} className="font-size--small"><ResearchGroupText research_group_tag={tag} /></span>)}
    </div>
}

GroupNamesCell.propTypes = {
    tags: PropTypes.array
}

function ConsortiumNamesCell({ tags, intent, agreedMap = null }) {
    if (_.isEmpty(tags)) return <span style={{ opacity: 0.5 }}>-</span>
    return <div className="flex" style={{ flexWrap: "wrap", gap: "0.3rem" }}>
        {_.map(tags, (tag) => (
            <Tag key={tag} intent={intent} round={true} minimal={true}>
                {agreedMap ? <span className="flex align-center" style={{ gap: "0.3rem" }}>
                    <ConsortiumText tag={tag} />
                    {!agreedMap[tag] ? <span className="font-size--smallest">(terms not agreed)</span> : null}
                </span> : <ConsortiumText tag={tag} />}
            </Tag>
        ))}
    </div>
}

ConsortiumNamesCell.propTypes = {
    tags: PropTypes.array,
    intent: PropTypes.string,
    agreedMap: PropTypes.object
}

function useSharingOverview(authenticationStatus) {
    const userRole = _.get(authenticationStatus, "role", 0)
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const { data, isLoading, isError, error } =
        api.researchgroups.useGetSharingOverview({}, { enabled: isCurator, staleTime: 50000, retry: false })
    return { isCurator, data, isLoading, isError, error }
}

/**
 * @description Admin page with a report of all consortium shares: which research groups are
 * members of which consortium, the terms agreement state of each membership, and one entry per
 * submission shared with a consortium (approved and pending). Only visible to curators and
 * admins (role >= 2); the backend enforces curator rights as well.
 * @param {Object} props
 * @param {Object} props.authenticationStatus Authentication status of the current user
 * @returns {JSX.Element|null} The consortium sharing admin view.
 */
export function ConsortiumSharingOverview({ authenticationStatus }) {
    const { isCurator, data, isLoading, isError, error } = useSharingOverview(authenticationStatus)

    if (!isCurator) {
        return <Callout intent="warning" title="Restricted area">
            The sharing report is only available to curators and admins.
        </Callout>
    }
    if (isLoading) return <Loading />
    if (isError) return <APIError error={error} />

    const consortiums = _.get(data, "consortium_groups", [])
    const memberships = _.sumBy(consortiums, (row) => _.size(row.groups))
    const agreedGroups = _.sumBy(consortiums, (row) => _.countBy(row.groups, "terms_agreed").true || 0)
    const submissions = _.filter(_.get(data, "submissions", []),
        (row) => !_.isEmpty(row.consortium_tags) || !_.isEmpty(row.pending_consortium_tags))
    const approvedShares = _.sumBy(submissions, (row) => _.size(row.consortium_tags))
    const pendingShares = _.sumBy(submissions, (row) => _.size(row.pending_consortium_tags))
    const termsAgreedByConsortium = _.fromPairs(_.map(consortiums, ({ consortium_tag, groups }) =>
        [consortium_tag, _.every(groups, { terms_agreed: true })]))

    return <div className="div--expand padding--medium" style={{ overflowY: "auto" }}>
        <ReportHeader
            title="Consortium Sharing Report"
            description="Overview of all consortium memberships across the platform: which research groups are part of which consortium, whether they agreed to the consortium terms, and which submissions are shared with which consortiums."
            stats={[
                { value: consortiums.length, label: "consortiums" },
                { value: memberships, label: "group memberships" },
                { value: agreedGroups, label: "groups with agreed terms" },
                { value: approvedShares, label: "approved shares" },
                { value: pendingShares, label: "pending share requests" }
            ]} />
        <ReportSection index={1} title="Consortium memberships & terms agreement"
            description="One row per research group membership. The terms badge shows whether the groups head (PI) agreed to the consortium terms; shares of groups that revoke their agreement are automatically removed.">
            <TableOrEmpty isEmpty={memberships === 0}
                emptyText="No research group is a member of a consortium.">
                <thead>
                    <tr>
                        <th style={{ width: "35%" }}>Consortium</th>
                        <th style={{ width: "40%" }}>Research group</th>
                        <th>Terms</th>
                    </tr>
                </thead>
                <tbody>
                    {_.map(consortiums, ({ consortium_tag, groups }) =>
                        _.isEmpty(groups) ?
                            <tr key={consortium_tag}>
                                <td><ConsortiumName tag={consortium_tag} /></td>
                                <td colSpan={2}><span style={{ opacity: 0.5 }}>No member research group</span></td>
                            </tr> :
                            _.map(groups, ({ group_tag, terms_agreed }, idx) =>
                                <tr key={`${consortium_tag}-${group_tag}`}>
                                    <td><ConsortiumName tag={consortium_tag} /></td>
                                    <td><span className="font-size--small"><ResearchGroupText research_group_tag={group_tag} /></span></td>
                                    <td><TermsBadge agreed={terms_agreed} /></td>
                                </tr>))}
                </tbody>
            </TableOrEmpty>
        </ReportSection>
        <ReportSection index={2} title="Submissions shared with consortiums"
            description="One row per submission with at least one approved or pending consortium share. Group membership plus terms agreement of the owner group grants the consortium members access to the submission.">
            <TableOrEmpty isEmpty={_.isEmpty(submissions)}
                emptyText="No submission is shared with a consortium.">
                <thead>
                    <tr>
                        <th style={{ width: "28%" }}>Submission</th>
                        <th style={{ width: "16%" }}>Owner</th>
                        <th style={{ width: "20%" }}>Research groups</th>
                        <th style={{ width: "18%" }}>Approved shares</th>
                        <th>Pending requests</th>
                    </tr>
                </thead>
                <tbody>
                    {_.map(submissions, (row) =>
                        <tr key={row.submission_tag}>
                            <td><SubmissionTitleCell tag={row.submission_tag} /></td>
                            <td><UserFullName tag={row.owner_tag} /></td>
                            <td><GroupNamesCell tags={row.owner_group_tags} /></td>
                            <td><ConsortiumNamesCell tags={row.consortium_tags} intent="primary"
                                agreedMap={termsAgreedByConsortium} /></td>
                            <td><ConsortiumNamesCell tags={row.pending_consortium_tags} intent="warning" /></td>
                        </tr>)}
                </tbody>
            </TableOrEmpty>
        </ReportSection>
    </div>
}

ConsortiumSharingOverview.propTypes = {
    authenticationStatus: PropTypes.shape({ role: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) })
}

/**
 * @description Admin page with a report of all explore view shares: one entry per submission
 * that someone shared with another user (approved collaborator access) or for which a
 * collaboration request is pending, plus the research groups whose head (PI) disabled the
 * explore visibility. Only visible to curators and admins (role >= 2); the backend enforces
 * curator rights as well.
 * @param {Object} props
 * @param {Object} props.authenticationStatus Authentication status of the current user
 * @returns {JSX.Element|null} The collaboration sharing admin view.
 */
export function CollaborationSharingOverview({ authenticationStatus }) {
    const { isCurator, data, isLoading, isError, error } = useSharingOverview(authenticationStatus)

    if (!isCurator) {
        return <Callout intent="warning" title="Restricted area">
            The sharing report is only available to curators and admins.
        </Callout>
    }
    if (isLoading) return <Loading />
    if (isError) return <APIError error={error} />

    const submissions = _.filter(_.get(data, "submissions", []),
        (row) => !_.isEmpty(row.collaborator_tags) || !_.isEmpty(row.pending_collaboration_requests))
    const exploreDisabledGroups = _.get(data, "explore_disabled_groups", [])
    const collaborations = _.sumBy(submissions, (row) => _.size(row.collaborator_tags))
    const pendingRequests = _.sumBy(submissions, (row) => _.size(row.pending_collaboration_requests))

    return <div className="div--expand padding--medium" style={{ overflowY: "auto" }}>
        <ReportHeader
            title="Explore View Sharing Report"
            description="Overview of all explore view shares: who shared a submission with whom, the pending collaboration requests, and the research groups whose head (PI) disabled the explore visibility of their submissions."
            stats={[
                { value: collaborations, label: "explore view collaborations" },
                { value: pendingRequests, label: "pending collaboration requests" },
                { value: exploreDisabledGroups.length, label: "groups with disabled explore visibility" }
            ]} />
        <ReportSection index={1} title="Explored submissions shared with users"
            description="One row per submission with approved explore view collaborator access or a pending collaboration request. Collaborators can access the submission in the explore view.">
            <TableOrEmpty isEmpty={_.isEmpty(submissions)}
                emptyText="No submission is shared via the explore view.">
                <thead>
                    <tr>
                        <th style={{ width: "28%" }}>Submission</th>
                        <th style={{ width: "16%" }}>Owner</th>
                        <th style={{ width: "20%" }}>Research groups</th>
                        <th style={{ width: "18%" }}>Shared with</th>
                        <th>Pending requests</th>
                    </tr>
                </thead>
                <tbody>
                    {_.map(submissions, (row) =>
                        <tr key={row.submission_tag}>
                            <td><SubmissionTitleCell tag={row.submission_tag} /></td>
                            <td><UserFullName tag={row.owner_tag} /></td>
                            <td><GroupNamesCell tags={row.owner_group_tags} /></td>
                            <td>
                                {_.isEmpty(row.collaborator_tags) ? <span style={{ opacity: 0.5 }}>-</span> :
                                    <div className="flex" style={{ flexWrap: "wrap", gap: "0.3rem" }}>
                                        {_.map(row.collaborator_tags, (tag) =>
                                            <Tag key={tag} intent="primary" round={true} minimal={true}><UserFullName tag={tag} /></Tag>)}
                                    </div>}
                            </td>
                            <td>
                                {_.isEmpty(row.pending_collaboration_requests) ? <span style={{ opacity: 0.5 }}>-</span> :
                                    _.map(row.pending_collaboration_requests, (request, idx) =>
                                        <div key={idx} className="font-size--small" style={{ marginTop: idx > 0 ? "0.2rem" : 0 }}>
                                            {_.isString(request.requested_for_group_tag) ?
                                                <span className="flex align-center" style={{ gap: "0.3rem" }}>
                                                    <Tag intent="warning" round={true} minimal={true}>group</Tag>
                                                    <ResearchGroupText research_group_tag={request.requested_for_group_tag} />
                                                </span> :
                                                <UserFullName tag={request.requested_for_user_tag || request.requested_by} />}
                                            {" "}request by <UserFullName tag={request.requested_by} />
                                        </div>)}
                            </td>
                        </tr>)}
                </tbody>
            </TableOrEmpty>
        </ReportSection>
        <ReportSection index={2} title="Research groups with disabled explore visibility"
            description="Heads (PIs) can disable the explore visibility of their groups submissions. Submissions of these groups are hidden from the explore view and all collaboration access is revoked.">
            <TableOrEmpty isEmpty={_.isEmpty(exploreDisabledGroups)}
                emptyText="All research groups have the explore visibility enabled.">
                <thead>
                    <tr>
                        <th style={{ width: "35%" }}>Research group</th>
                        <th>Explore visibility</th>
                    </tr>
                </thead>
                <tbody>
                    {_.map(exploreDisabledGroups, (group_tag) =>
                        <tr key={group_tag}>
                            <td><span className="font-size--small"><ResearchGroupText research_group_tag={group_tag} /></span></td>
                            <td><Tag intent="danger" round={true} minimal={true}>disabled</Tag></td>
                        </tr>)}
                </tbody>
            </TableOrEmpty>
        </ReportSection>
    </div>
}

CollaborationSharingOverview.propTypes = {
    authenticationStatus: PropTypes.shape({ role: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) })
}