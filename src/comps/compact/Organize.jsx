import _ from "lodash";
import { useState } from "react";
import { Link } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { getUserFullName } from "@/services/format/user";
import { isHexColorLight } from "@/services/checks/color";
import { titleFormat } from "@/services/format/string";

const CURATOR_ROLE = 2 // must match the backend user role encoding; curators and admins are >= 2

/**
 * @description Label resolving a user tag to the full name.
 * @param {Object} props
 * @param {String} props.user_tag User tag
 * @returns {JSX.Element} The user name.
 */
function UserLabel({ user_tag }) {
    const { data: user, isSuccess } = api.users.core.useGetPublicUserByTag({ tag: user_tag }, { enabled: _.isString(user_tag) });
    return <span>{isSuccess && _.isObject(user) ? getUserFullName(user) : user_tag}</span>;
}

/**
 * @description Colored pill showing a submission state name.
 * @param {Object} props
 * @param {Number} props.state_tag State tag
 * @returns {JSX.Element|null} The state pill.
 */
function StatePill({ state_tag }) {
    const { data: stateName } = api.states.useGetStateName({ tag: state_tag }, { enabled: _.isFinite(_.toNumber(state_tag)) });
    const { data: stateColor } = api.states.useGetStateColor({ tag: state_tag }, { enabled: _.isFinite(_.toNumber(state_tag)) });
    if (!_.isString(stateName) || !_.isString(stateColor)) return null;
    return (
        <span className="compact__state" style={{ backgroundColor: stateColor, color: isHexColorLight(stateColor) ? "black" : "white" }}>
            {titleFormat(stateName)}
        </span>
    );
}

/**
 * @description Minimal duration bar: a plain div scaled to the duration relative to the
 * longest duration, colored by the state color, with the number of days as text.
 * @param {Object} props
 * @param {Array} props.history The state history of the submission
 * ({ state_tag, state_since }, oldest first)
 * @returns {JSX.Element} The state timeline row.
 */
function StateTimelineSegment({ state_tag, days, percent }) {
    const { data: stateColor } = api.states.useGetStateColor({ tag: state_tag });
    const { data: stateName } = api.states.useGetStateName({ tag: state_tag });
    return (
        <div
            style={{ width: `${percent}%`, height: "100%", backgroundColor: _.isString(stateColor) ? stateColor : "#cfcfcf" }}
            title={`${_.isString(stateName) ? stateName : state_tag}: ${_.round(days, 1)} days`}
        />
    );
}

/**
 * @description Minimalistic timeline of the states a submission was in and for how long:
 * rectangles aligned next to each other, colored by state, widths scaled by the time
 * spent in that state (the current state extends to now).
 * @param {Object} props
 * @param {Array} props.history The state history of the submission
 * ({ state_tag, state_since }, oldest first)
 * @returns {JSX.Element|null} The state timeline row.
 */
function getTotalDays(history) {
    if (!_.isArray(history) || history.length === 0) return 0;
    return Math.max((Date.now() - history[0].state_since) / 86400000, 0);
}

function StateTimelineBar({ history, maxTotalDays }) {
    if (!_.isArray(history) || history.length === 0) return null;
    const now = Date.now();
    const segments = history.map((entry, idx) => {
        const end = idx + 1 < history.length ? history[idx + 1].state_since : now;
        return { state_tag: entry.state_tag, days: Math.max((end - entry.state_since) / 86400000, 0) };
    });
    const totalDays = _.sumBy(segments, "days");
    if (!_.isFinite(totalDays) || totalDays <= 0) return null;
    // all timelines on the board share the same time scale, so the strips are comparable
    const scale = _.isFinite(maxTotalDays) && maxTotalDays > 0 ? totalDays / maxTotalDays : 1;
    const stripPercent = Math.min(scale, 1) * 100;
    return (
        <div className="compact__row">
            <div style={{ flex: 1, height: "8px", display: "flex", borderRadius: "999px", overflow: "hidden", backgroundColor: "#e1e5ea" }}>
                <div style={{ width: `${stripPercent}%`, height: "100%", display: "flex" }}>
                    {segments.map((segment, idx) => (
                        <StateTimelineSegment
                            key={`${segment.state_tag}-${idx}`}
                            state_tag={segment.state_tag}
                            days={segment.days}
                            percent={(segment.days / totalDays) * 100}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * @description Label resolving a modular procedure tag to its title.
 * @param {Object} props
 * @param {String} props.procedure_tag Modular procedure tag
 * @returns {JSX.Element} The procedure label.
 */
function ProcedureLabel({ procedure_tag }) {
    const { data: procedure } = api.modularProcedures.query.useGetModularProcedureByTag(
        { tag: procedure_tag }, { enabled: _.isString(procedure_tag), staleTime: 300000 }
    );
    return <span>{_.isObject(procedure) && _.isString(procedure.title) ? procedure.title : procedure_tag}</span>;
}

/**
 * @description Row of chips showing the modular procedures assigned to a submission,
 * with an unlink button per open procedure for curators.
 * @param {Object} props
 * @param {Object} props.row Submission row with its assigned procedures
 * @param {Boolean} props.isCurator Whether procedure links can be modified
 * @returns {JSX.Element|null} The procedures row.
 */
function SubmissionProcedures({ row, isCurator }) {
    const queryClient = useQueryClient();
    const { mutate: unlinkProcedure } = api.modularProcedures.modify.useUnlinkModularProcedureFromSubmission();
    const procedures = _.isArray(row.procedures) ? _.orderBy(row.procedures, ["position"], ["asc"]) : [];
    if (procedures.length === 0) return null;
    return (
        <div className="compact__row">
            <span className="compact__label">Procedures</span>
            {procedures.map(link => (
                <span key={link.procedure_tag} className="compact__chip">
                    {link.done ? "\u2714 " : ""}<ProcedureLabel procedure_tag={link.procedure_tag} />
                    {isCurator && !link.done ? (
                        <button
                            className="compact__chip__remove"
                            title="Unlink procedure"
                            onClick={() => unlinkProcedure(
                                { tag: link.procedure_tag, submission_tag: row.submission_tag },
                                { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getCurrentStateDurations"] }) }
                            )}
                        >×</button>
                    ) : null}
                </span>
            ))}
        </div>
    );
}

/**
 * @description Select to assign a published modular procedure to a submission.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @param {Array} props.assignedProcedureTags Already assigned procedure tags
 * @returns {JSX.Element|null} The assign row.
 */
function AssignProcedureSelect({ submission_tag, assignedProcedureTags }) {
    const queryClient = useQueryClient();
    const { data: procedure_tags } = api.modularProcedures.query.useGetModularProceduresByQuery(
        { status: "PUBLISHED", latest_only: true }, { staleTime: 300000 }
    );
    const { mutate: linkProcedure, isPending } = api.modularProcedures.modify.useLinkModularProcedureToSubmission();
    const options = (_.isArray(procedure_tags) ? procedure_tags : []).filter(tag => !assignedProcedureTags.includes(tag));
    if (options.length === 0) return null;
    return (
        <div className="compact__row">
            <select
                className="compact__select"
                value=""
                disabled={isPending}
                onChange={e => {
                    if (e.target.value) linkProcedure(
                        { tag: e.target.value, submission_tag },
                        { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getCurrentStateDurations"] }) }
                    );
                }}
            >
                <option value="">Assign procedure…</option>
                {options.map(tag => <option key={tag} value={tag}><ProcedureLabel procedure_tag={tag} /></option>)}
            </select>
        </div>
    );
}

/**
 * @description One open submission card in the compact organize view: title link, tag,
 * creator, sample count, assigned procedures and the duration bar of the current state.
 * @param {Object} props
 * @param {Object} props.row { submission_tag, state_tag, duration_days, sample_count, user_tag, procedures }
 * @param {Boolean} [props.isCurator] Whether procedure links can be modified
 * @returns {JSX.Element} The submission card.
 */
function OrganizeSubmissionCard({ row, maxTotalDays, isCurator = false }) {
    const { data: title } = api.submissions.title.useGetSubmissionTitle(
        { tag: row.submission_tag }, { enabled: _.isString(row.submission_tag), staleTime: 300000 }
    );
    const procedures = _.isArray(row.procedures) ? row.procedures : [];
    return (
        <div className="compact__card">
            <p className="compact__card__title">
                <Link to={`/submissions/${row.submission_tag}`} style={{ color: "#182026" }}>
                    {_.isString(title) && title.trim().length > 0 ? title : row.submission_tag}
                </Link>
            </p>
            <span className="compact__tag">{row.submission_tag}</span>
            <div className="compact__row">
                <span className="compact__label">User</span>
                <UserLabel user_tag={row.user_tag} />
            </div>
            <div className="compact__row">
                <span className="compact__label">Samples</span>
                <span>{row.sample_count}</span>
            </div>
            <SubmissionProcedures row={row} isCurator={isCurator} />
            {isCurator ? <AssignProcedureSelect submission_tag={row.submission_tag} assignedProcedureTags={procedures.map(link => link.procedure_tag)} /> : null}
            <StateTimelineBar history={row.history} maxTotalDays={maxTotalDays} />
        </div>
    );
}

/**
 * @description One state section in the compact organize view: the state pill with the
 * number of submissions and samples in that state, followed by the submission cards
 * (longest waiting first).
 * @param {Object} props
 * @param {Number} props.state_tag State tag
 * @param {Array} props.rows Submission rows in that state
 * @returns {JSX.Element} The state section.
 */
function OrganizeStateSection({ state_tag, rows, maxTotalDays, isCurator = false }) {
    const sortedRows = _.orderBy(rows, ["duration_days"], ["desc"]);
    const sampleCount = _.sumBy(sortedRows, "sample_count");
    return (
        <div style={{ marginBottom: "1rem" }}>
            <div className="compact__row" style={{ marginBottom: "0.4rem" }}>
                <StatePill state_tag={state_tag} />
                <span className="compact__hint">
                    {sortedRows.length} submission{sortedRows.length === 1 ? "" : "s"} · {sampleCount} sample{sampleCount === 1 ? "" : "s"}
                </span>
            </div>
            {sortedRows.map(row => <OrganizeSubmissionCard key={row.submission_tag} row={row} maxTotalDays={maxTotalDays} isCurator={isCurator} />)}
        </div>
    );
}

/**
 * @description Compact organize view: the submissions the facility has to work on
 * (neither paused, canceled, done, active nor published), grouped vertically by state,
 * with user name, sample count and a scaled duration bar per submission.
 * @returns {JSX.Element} The organize tab.
 */
export function CompactOrganize({ userRole }) {
    const isCurator = _.isFinite(_.toNumber(userRole)) && _.toNumber(userRole) >= CURATOR_ROLE;
    const { data, isLoading, isFetching, isError, error } = api.stats.submissionDurations.useGetCurrentStateDurations({}, { staleTime: 0 });
    if (isLoading) return <div className="compact__hint">Loading…</div>;
    if (!isLoading && isFetching) return <div className="compact__hint">Updating…</div>;
    if (isError) return <div className="compact__hint" style={{ color: "#cd4246" }}>{error?.message || "Failed to load open submissions."}</div>;
    const rows = _.isArray(data) ? data : [];
    const maxTotalDays = _.max(_.map(rows, row => getTotalDays(row.history))) || 0;
    const rowsByState = _.groupBy(rows, "state_tag");
    const stateTags = _.sortBy(_.keys(rowsByState), _.toNumber);
    return (
        <div>
            <div className="compact__hint" style={{ margin: "0.4rem 0 0.75rem" }}>
                Open submissions by state — longest waiting first.
            </div>
            {rows.length === 0 ? <div className="compact__hint">No open submissions. All done!</div> : null}
            {stateTags.map(state_tag => (
                <OrganizeStateSection key={state_tag} state_tag={state_tag} rows={rowsByState[state_tag]} maxTotalDays={maxTotalDays} isCurator={isCurator} />
            ))}
        </div>
    );
}
