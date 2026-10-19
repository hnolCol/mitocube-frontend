import _ from "lodash"
import { useState } from "react"
import { api } from "@/api"

/**
 * Submission state funnel: how many submissions currently sit in each state.
 * Data rows: [{ state_tag, value }]. Uses the state color/name endpoints so
 * the funnel matches the state filter buttons.
 */
export function StateFunnelSection({ statisticsFilter }) {

    const { data, isLoading, isSuccess, isError, error } = api.stats.submissions.useGetSubmissionStateCounts(
        { user_tags: statisticsFilter.user_tags, genotype_tags: statisticsFilter.genotype_tags, ca_tags: statisticsFilter.ca_tags, include_sample_ca: statisticsFilter.include_sample_ca },
        { retry: false }
    )

    const rows = _.isArray(data) ? data : []
    const total = _.sumBy(rows, "value")
    const max = _.max([_.maxBy(rows, "value")?.value, 1])

    return <div className="bg--white div--round padding--medium margin-top--medium">
        <h4 style={{ margin: 0 }}>Submissions per State</h4>
        <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            Number of submissions currently in each state. Large bars in intermediate states indicate where submissions get stuck.
        </p>
        {isError ? <div style={{ color: "#a82a2a" }}>Failed to load statistics. {_.get(error, "message", "")}</div> : null}
        {isLoading ? <div>Loading...</div> : null}
        {isSuccess && rows.length === 0 ? <div>No data available yet.</div> : null}
        {isSuccess && rows.length > 0 ? <div>
            {rows.map(row => <StateFunnelRow key={row.state_tag} tag={row.state_tag} value={row.value} max={max} total={total} />)}
        </div> : null}
    </div>
}

function StateFunnelRow({ tag, value, max, total }) {

    const { data: stateName } = api.states.useGetStateName({ tag })
    const { data: stateColor } = api.states.useGetStateColor({ tag })
    const [hovered, setHovered] = useState(false)

    const share = total > 0 ? (value / total * 100) : 0

    return <div
        className="flex center-items"
        style={{ gap: "0.5rem", marginBottom: "0.4rem" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
    >
        <span style={{ width: "9rem", flexShrink: 0, fontSize: "0.85rem", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {_.isString(stateName) ? stateName : tag}
        </span>
        <div style={{ flex: "1 1 0%", minWidth: 0, display: "flex", alignItems: "center" }}>
            <div
                style={{
                    height: "1.4rem",
                    width: `${(value / max) * 100}%`,
                    minWidth: "2px",
                    backgroundColor: _.isString(stateColor) ? stateColor : "#999",
                    opacity: hovered ? 0.8 : 1,
                    borderRadius: "0 3px 3px 0",
                    transition: "opacity 0.1s"
                }}
            />
        </div>
        <span style={{ flexShrink: 0, fontSize: "0.85rem", color: "#555" }}>
            {value} ({share.toFixed(1)}%)
        </span>
    </div>
}
