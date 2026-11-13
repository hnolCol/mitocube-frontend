import { useMemo } from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import { scaleLinear } from "@visx/scale"
import { AxisBottom } from "@visx/axis"

import { api } from "@/api"
import APIError from "@/comps/core/error/APIerror"
import { SVG } from "@/comps/core/charts/SVGHeader"
import { StateHeader } from "../view/StateHeader"
import { MinimalSubmissionItem } from "../view/SubmissionItem"
import { UserFullName } from "@/comps/core/input/api/UserInput"


StateDurationBar.propTypes = {
    duration_days: PropTypes.number.isRequired,
    state_tag: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    maxDuration: PropTypes.number.isRequired
}


/**
 * @description A minimal horizontal bar showing how long a submission has been in its current state.
 * The x-axis is the duration in days, the bar is colored by the state color.
 * @returns {JSX.Element|null}
 */
export function StateDurationBar({ duration_days, state_tag, maxDuration, width = 170, height = 12 }) {
    const { data: stateColor } = api.states.useGetStateColor({ tag: state_tag })
    const xScale = useMemo(() => scaleLinear({
        domain: [0, Math.max(maxDuration, 1)],
        range: [0, width],
        nice: true
    }), [maxDuration, width])
    if (!_.isNumber(duration_days)) return null
    return (
        <SVG width={width + 10} height={height + 22}>
            <rect x={0} y={0} width={Math.max(xScale(duration_days), 1)} height={height} fill={_.isString(stateColor) ? stateColor : "#cfcfcf"} />
            <AxisBottom
                scale={xScale}
                top={height}
                numTicks={3}
                tickStroke="#9a9a9a"
                stroke="#9a9a9a"
                label="days"
                labelFontSize={8}
                tickFontSize={8}
            />
        </SVG>
    )
}


OrganizeSubmissionRow.propTypes = {
    row: PropTypes.object.isRequired,
    maxDuration: PropTypes.number.isRequired
}


/**
 * @description A single row in the Organize view: the submission item, the name of the user,
 * the number of samples and the duration bar of the current state.
 * @returns {JSX.Element}
 */
export function OrganizeSubmissionRow({ row, maxDuration }) {
    return (
        <div className="submission__item__container">
            <div className="flex center-items gap--default">
                <div className="width--expand"><MinimalSubmissionItem tag={row.submission_tag} state_tag={row.state_tag} /></div>
                <div className="submission-metric-view" style={{ minWidth: "8rem" }}>
                    <h4>User</h4>
                    <UserFullName tag={row.user_tag} />
                </div>
                <div className="submission-metric-view" style={{ minWidth: "4rem" }}>
                    <h4>Samples</h4>
                    <div>{row.sample_count}</div>
                </div>
                <StateDurationBar duration_days={row.duration_days} state_tag={row.state_tag} maxDuration={maxDuration} />
            </div>
        </div>
    )
}


OrganizeStateSection.propTypes = {
    state_tag: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rows: PropTypes.array.isRequired,
    maxDuration: PropTypes.number.isRequired
}


/**
 * @description A vertical section for one state: the state header with the total number of
 * samples in that state, followed by the submissions currently in that state.
 * @returns {JSX.Element}
 */
export function OrganizeStateSection({ state_tag, rows, maxDuration }) {
    const sortedRows = _.orderBy(rows, ["duration_days"], ["desc"])
    const sampleCount = _.sumBy(sortedRows, "sample_count")
    return (
        <div className="submission__state_container">
            <div className="submission__header__container">
                <StateHeader tag={state_tag} />
                <div className="flex center-items gap--default">
                    <div className="submission-metric-view">
                        <h4>Submissions</h4>
                        <div>{sortedRows.length}</div>
                    </div>
                    <div className="submission-metric-view">
                        <h4>Samples</h4>
                        <div>{sampleCount}</div>
                    </div>
                </div>
            </div>
            {sortedRows.map((row) => <OrganizeSubmissionRow key={row.submission_tag} row={row} maxDuration={maxDuration} />)}
        </div>
    )
}


/**
 * @description The Organize Submission view. Shows the submissions the facility has to work on,
 * i.e. the submissions that are neither paused, canceled, done, active nor published.
 * The states are arranged vertically, each with its submissions, the user name, the number of
 * samples and a minimal bar plot of the duration in the current state.
 * @returns {JSX.Element}
 */
export function OrganizeSubmissions() {
    const { data, isLoading, isFetching, isError, error } = api.stats.submissionDurations.useGetCurrentStateDurations({}, { staleTime: 0 })
    if (isError) return <APIError error={error} />
    if (isLoading || isFetching) return <div className="submission__items__container">Loading...</div>
    const rows = _.isArray(data) ? data : []
    const maxDuration = _.maxBy(rows, "duration_days")?.duration_days || 0
    const rowsByState = _.groupBy(rows, "state_tag")
    const stateTags = _.sortBy(_.keys(rowsByState), _.toNumber)
    return (
        <div className="submission__items__container">
            <div className="submission__header__container">
                <h3>Organize Submissions ({rows.length})</h3>
            </div>
            {rows.length === 0 ? <div>No open submissions. All done!</div> : null}
            {stateTags.map((state_tag) => <OrganizeStateSection key={state_tag} state_tag={state_tag} rows={rowsByState[state_tag]} maxDuration={maxDuration} />)}
        </div>
    )
}
