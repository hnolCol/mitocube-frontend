import { useState } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { motion } from "framer-motion"
import { useNavigate } from "react-router"
import { Dialog, DialogBody } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"

import { api } from "@/api"
import APIError from "@/comps/core/error/APIerror"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { CreatedAt } from "@/comps/core/metrics/CreatedAt"
import { StateHeader } from "../view/StateHeader"
import { UserFullName } from "@/comps/core/input/api/UserInput"

const CURATOR_ROLE = 2 // must match the backend user role encoding; curators and admins are >= 2
const DEFAULT_VISIBLE_PER_STATE = 5


StateTimelineSegment.propTypes = {
    state_tag: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    days: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
}


/**
 * @description One rectangle of the state timeline, colored by the state color with the
 * state name and duration as tooltip.
 * @returns {JSX.Element}
 */
function StateTimelineSegment({ state_tag, days, width, height }) {
    const { data: stateColor } = api.states.useGetStateColor({ tag: state_tag })
    const { data: stateName } = api.states.useGetStateName({ tag: state_tag })
    return (
        <rect
            width={width}
            height={height}
            fill={_.isString(stateColor) ? stateColor : "#cfcfcf"}
        >
            <title>{`${_.isString(stateName) ? stateName : state_tag}: ${_.round(days, 1)} days`}</title>
        </rect>
    )
}


StateTimelineBar.propTypes = {
    history: PropTypes.array,
    maxTotalDays: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
}


/**
 * @description The total lifespan of a submission in days based on its state history
 * (from the first state until now).
 * @returns {Number}
 */
function getTotalDays(history) {
    if (!_.isArray(history) || history.length === 0) return 0
    return Math.max((Date.now() - history[0].state_since) / 86400000, 0)
}


/**
 * @description A minimalistic timeline of the states a submission was in and for how long:
 * rectangles aligned next to each other, each colored by the state color. All timelines on
 * the board share the same time scale (maxTotalDays maps to the full width), so the strips
 * are comparable across submissions; the current state extends to now.
 * @returns {JSX.Element|null}
 */
export function StateTimelineBar({ history, maxTotalDays, width = 170, height = 10 }) {
    if (!_.isArray(history) || history.length === 0) return null
    const now = Date.now()
    const segments = history.map((entry, idx) => {
        const end = idx + 1 < history.length ? history[idx + 1].state_since : now
        return { state_tag: entry.state_tag, days: Math.max((end - entry.state_since) / 86400000, 0) }
    })
    const totalDays = _.sumBy(segments, "days")
    if (!_.isFinite(totalDays) || totalDays <= 0) return null
    const scale = _.isFinite(maxTotalDays) && maxTotalDays > 0 ? totalDays / maxTotalDays : 1
    const stripWidth = Math.min(scale, 1) * width
    let offset = 0
    return (
        <svg width={width} height={height} style={{ display: "block", borderRadius: 2, flexShrink: 0 }}>
            <rect width={width} height={height} fill="#f0f0f0" />
            {segments.map((segment, idx) => {
                const segmentWidth = (segment.days / totalDays) * stripWidth
                const x = offset
                offset += segmentWidth
                return (
                    <g key={`${segment.state_tag}-${idx}`} transform={`translate(${x}, 0)`}>
                        <StateTimelineSegment state_tag={segment.state_tag} days={segment.days} width={Math.max(segmentWidth, 0.5)} height={height} />
                    </g>
                )
            })}
        </svg>
    )
}


ProcedureChip.propTypes = {
    link: PropTypes.shape({
        procedure_tag: PropTypes.string,
        done: PropTypes.bool
    }).isRequired,
    canEdit: PropTypes.bool,
    onUnlink: PropTypes.func
}


/**
 * @description Chip showing an assigned modular procedure of a submission. Done procedures
 * show a checkmark; editable chips can be unlinked via the remove button.
 * @returns {JSX.Element}
 */
export function ProcedureChip({ link, canEdit = false, onUnlink }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: link.procedure_tag }, { enabled: _.isString(link.procedure_tag), staleTime: 300000 })
    return (
        <span className="submission-metric-view" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", minWidth: 0 }}>
            <span>{link.done ? "✔" : "▸"} {procedure?.title || link.procedure_tag}</span>
            {canEdit && !link.done ? (
                <button
                    className="submission__filter__button"
                    title="Unlink procedure"
                    onClick={onUnlink}
                    style={{ marginLeft: "0.25rem" }}
                >×</button>
            ) : null}
        </span>
    )
}


AssignProcedureDialog.propTypes = {
    submission_tag: PropTypes.string,
    assignedProcedureTags: PropTypes.array,
    onClose: PropTypes.func.isRequired
}


/**
 * @description Dialog to assign a published modular procedure to a submission.
 * @returns {JSX.Element}
 */
export function AssignProcedureDialog({ submission_tag, assignedProcedureTags = [], onClose }) {
    const queryClient = useQueryClient()
    const [selectedTag, setSelectedTag] = useState(null)
    const { data: procedure_tags } = api.modularProcedures.query.useGetModularProceduresByQuery(
        { status: "PUBLISHED", latest_only: true }, { staleTime: 300000 })
    const { mutate: linkProcedure, isPending, isError, error } = api.modularProcedures.modify.useLinkModularProcedureToSubmission()
    const options = (_.isArray(procedure_tags) ? procedure_tags : []).filter(tag => !assignedProcedureTags.includes(tag))
    return (
        <Dialog title="Assign modular procedure" isOpen={_.isString(submission_tag)} onClose={onClose}>
            <DialogBody>
                {isError ? <APIError error={error} /> : null}
                <select
                    className="search-input"
                    value={selectedTag || ""}
                    disabled={isPending || options.length === 0}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                >
                    <option value="">{options.length === 0 ? "No published procedures available" : "Select procedure…"}</option>
                    {options.map(tag => <ProcedureOption key={tag} procedure_tag={tag} />)}
                </select>
                <div className="flex center-items gap--default margin-top--little">
                    <button
                        className="basic-button"
                        disabled={!_.isString(selectedTag) || isPending}
                        onClick={() => linkProcedure({ tag: selectedTag, submission_tag }, {
                            onSuccess: () => {
                                queryClient.invalidateQueries({ queryKey: ["getCurrentStateDurations"] })
                                onClose()
                            }
                        })}
                    >Assign</button>
                    <button className="basic-button" onClick={onClose} disabled={isPending}>Cancel</button>
                </div>
            </DialogBody>
        </Dialog>
    )
}


ProcedureOption.propTypes = {
    procedure_tag: PropTypes.string.isRequired
}


/**
 * @description Select option resolving a modular procedure tag to its title and version.
 * @returns {JSX.Element}
 */
function ProcedureOption({ procedure_tag }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 300000 })
    return <option value={procedure_tag}>{procedure?.title || procedure_tag}{_.isFinite(_.toNumber(procedure?.version)) ? ` (v${procedure.version})` : ""}</option>
}


PlusIconButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
}


/**
 * @description A minimal SVG "+" button used to assign a modular procedure to a submission.
 * @returns {JSX.Element}
 */
function PlusIconButton({ onClick, title = "Assign modular procedure" }) {
    return (
        <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            title={title}
            aria-label={title}
            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0.1rem", lineHeight: 0 }}
        >
            <svg width={14} height={14} viewBox="0 0 14 14">
                <line x1={7} y1={2.5} x2={7} y2={11.5} stroke="#666" strokeWidth={1.5} strokeLinecap="round" />
                <line x1={2.5} y1={7} x2={11.5} y2={7} stroke="#666" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
        </motion.button>
    )
}


OrganizeSubmissionCard.propTypes = {
    row: PropTypes.object.isRequired,
    maxTotalDays: PropTypes.number,
    isCurator: PropTypes.bool
}


/**
 * @description A single submission card in a state column, drawn as one cohesive component:
 * the creation date and title on the first line, and one uniformly sized line with the
 * user name, sample count, assigned modular procedure chips, the state timeline and the
 * "+" assign button. Clicking the card opens the submission.
 * @returns {JSX.Element}
 */
export function OrganizeSubmissionCard({ row, maxTotalDays, isCurator = false }) {
    const queryClient = useQueryClient()
    const redirect = useNavigate()
    const [isAssignDialogOpen, setAssignDialogOpen] = useState(false)
    const { mutate: unlinkProcedure } = api.modularProcedures.modify.useUnlinkModularProcedureFromSubmission()
    const { data: title } = api.submissions.title.useGetSubmissionTitle(
        { tag: row.submission_tag }, { enabled: _.isString(row.submission_tag), staleTime: 300000 })
    const { data: created_at } = api.submissions.core.useGetSubmissionCreatedAt(
        { tag: row.submission_tag }, { enabled: _.isString(row.submission_tag), staleTime: 300000 })
    const procedures = _.isArray(row.procedures) ? _.orderBy(row.procedures, ["position"], ["asc"]) : []
    return (
        <div className="submission__item__container" style={{ cursor: "pointer" }} onClick={() => redirect(`/submissions/${row.submission_tag}`)}>
            <div className="flex center-items gap--little">
                {_.isNumber(created_at) ? <CreatedAt createdat={created_at} addFromNow={false} /> : null}
                <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {_.isString(title) && title.trim().length > 0 ? title : row.submission_tag}
                </span>
            </div>
            <div className="flex center-items gap--little" style={{ flexWrap: "wrap", color: "#555" }}>
                <UserFullName tag={row.user_tag} />
                <span>·</span>
                <span>{row.sample_count} sample{row.sample_count === 1 ? "" : "s"}</span>
                {procedures.map((link) => (
                    <ProcedureChip
                        key={link.procedure_tag}
                        link={link}
                        canEdit={isCurator}
                        onUnlink={() => unlinkProcedure({ tag: link.procedure_tag, submission_tag: row.submission_tag }, {
                            onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getCurrentStateDurations"] })
                        })}
                    />
                ))}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <StateTimelineBar history={row.history} maxTotalDays={maxTotalDays} />
                    {isCurator ? (
                        <div onClick={(e) => { e.stopPropagation(); setAssignDialogOpen(true) }} style={{ display: "inline-flex" }}>
                            <PlusIconButton onClick={() => setAssignDialogOpen(true)} />
                        </div>
                    ) : null}
                </div>
            </div>
            {isAssignDialogOpen ? (
                <AssignProcedureDialog
                    submission_tag={row.submission_tag}
                    assignedProcedureTags={procedures.map(link => link.procedure_tag)}
                    onClose={() => setAssignDialogOpen(false)}
                />
            ) : null}
        </div>
    )
}


OrganizeStateColumn.propTypes = {
    state_tag: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rows: PropTypes.array.isRequired,
    maxTotalDays: PropTypes.number,
    isCurator: PropTypes.bool
}


/**
 * @description One state column of the organize board: the state header with the total number
 * of submissions and samples in that state, followed by the submissions currently in that
 * state (longest waiting first). Only the top submissions are shown by default; the
 * remaining ones can be expanded.
 * @returns {JSX.Element}
 */
export function OrganizeStateColumn({ state_tag, rows, maxTotalDays, isCurator = false }) {
    const [showAll, setShowAll] = useState(false)
    const sortedRows = _.orderBy(rows, ["duration_days"], ["desc"])
    const visibleRows = showAll ? sortedRows : sortedRows.slice(0, DEFAULT_VISIBLE_PER_STATE)
    const hiddenCount = sortedRows.length - visibleRows.length
    const sampleCount = _.sumBy(sortedRows, "sample_count")
    return (
        <div className="submission__state_container" style={{ minWidth: "22rem", maxWidth: "26rem", maxHeight: "80vh", overflowY: "auto" }}>
            <div className="submission__header__container">
                <StateHeader tag={state_tag} />
                <div className="flex center-items gap--default">
                    <div className="submission-metric-view">
                        <h4>Submissions</h4>
                        <div>{visibleRows.length}/{sortedRows.length}</div>
                    </div>
                    <div className="submission-metric-view">
                        <h4>Samples</h4>
                        <div>{sampleCount}</div>
                    </div>
                </div>
            </div>
            {visibleRows.map((row) => <OrganizeSubmissionCard key={row.submission_tag} row={row} maxTotalDays={maxTotalDays} isCurator={isCurator} />)}
            {sortedRows.length > DEFAULT_VISIBLE_PER_STATE ? (
                <button className="basic-button basic-button--small" onClick={() => setShowAll(prev => !prev)}>
                    {showAll ? `Show top ${DEFAULT_VISIBLE_PER_STATE}` : `Show all (${hiddenCount} more)`}
                </button>
            ) : null}
        </div>
    )
}


/**
 * @description The Organize Submission view. Shows the submissions the facility has to work on,
 * i.e. the submissions that are neither paused, canceled, done, active nor published.
 * The states are arranged as columns, each listing its submissions (top 5 by default,
 * longest waiting first) with the assigned modular procedures, the user name, the number
 * of samples and a minimal bar plot of the duration in the current state.
 * Curators can assign and unlink modular procedures directly.
 * @returns {JSX.Element}
 */
export function OrganizeSubmissions({ userRole }) {
    const [unassignedOnly, setUnassignedOnly] = useState(false)
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE
    const { data, isLoading, isFetching, isError, error } = api.stats.submissionDurations.useGetCurrentStateDurations({}, { staleTime: 0 })
    if (isError) return <APIError error={error} />
    if (isLoading || isFetching) return <div className="submission__items__container">Loading...</div>
    const allRows = _.isArray(data) ? data : []
    const rows = unassignedOnly ? allRows.filter(row => !_.isArray(row.procedures) || row.procedures.length === 0) : allRows
    const maxTotalDays = _.max(_.map(rows, row => getTotalDays(row.history))) || 0
    const rowsByState = _.groupBy(rows, "state_tag")
    const stateTags = _.sortBy(_.keys(rowsByState), _.toNumber)
    return (
        <div className="submission__items__container">
            <div className="submission__header__container">
                <h3>Organize Submissions ({rows.length}{unassignedOnly && rows.length !== allRows.length ? `/${allRows.length}` : ""})</h3>
                <OptionButton isSelected={unassignedOnly} onClick={() => setUnassignedOnly(prev => !prev)}>
                    <span>Unassigned only</span>
                </OptionButton>
            </div>
            {rows.length === 0 ? <div>{unassignedOnly ? "No unassigned submissions. All planned!" : "No open submissions. All done!"}</div> : null}
            <div className="flex gap--default" style={{ alignItems: "flex-start", overflowX: "auto" }}>
                {stateTags.map((state_tag) => (
                    <OrganizeStateColumn key={state_tag} state_tag={state_tag} rows={rowsByState[state_tag]} maxTotalDays={maxTotalDays} isCurator={isCurator} />
                ))}
            </div>
        </div>
    )
}
