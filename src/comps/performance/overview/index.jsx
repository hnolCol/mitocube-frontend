import _ from "lodash"
import { api } from "@/api"
import { useNavigate } from "react-router"

function SubmissionStateBadge({ state_tag }) {
    const { data: stateName } = api.states.useGetStateName({ tag: state_tag })
    const { data: stateColor } = api.states.useGetStateColor({ tag: state_tag })

    return (
        <div
            className="padding--tiny div--round"
            style={{ backgroundColor: stateColor, color: "white", fontSize: "0.75rem" }}
        >
            {stateName}
        </div>
    )
}

function SubmissionRow({ submission }) {
    const redirect = useNavigate()
    const hasState = submission.submission_state !== null && submission.submission_state !== undefined

    return (
        <div
            onClick={() => redirect(`/submissions/${submission.submission_tag}`)}
            className="flex justify-between center-items div--round"
            style={{
                cursor: "pointer",
                fontSize: "0.85rem",
                padding: "0.5rem 0.5rem",
                gap: "1rem",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {submission.submission_title || submission.submission_tag}
            </span>
            <div className="flex center-items" style={{ gap: "0.75rem", flexShrink: 0 }}>
                <span style={{ fontSize: "0.8rem", color: "#888", whiteSpace: "nowrap" }}>
                    {submission.sample_count} samples
                </span>
                {hasState ? (
                    <SubmissionStateBadge state_tag={submission.submission_state} />
                ) : (
                    <span style={{ fontSize: "0.8rem", color: "#bbb", whiteSpace: "nowrap" }}>No state</span>
                )}
            </div>
        </div>
    )
}

function InstrumentOverviewCard({ instrument }) {
    const redirect = useNavigate()

    return (
        <div className="flex bg--white div--round padding--medium margin--tiny">
            <div style={{ minWidth: "220px" }}>
                <div style={{ cursor: "pointer" }} onClick={() => redirect(`/performance/instruments/${instrument.tag}`)}>
                    <strong style={{ fontSize: "1rem" }}>{instrument.text}</strong>
                </div>

                <div className="margin-top--little" style={{ fontSize: "0.9rem" }}>
                    Total Samples: <strong>{instrument.sample_count}</strong>
                </div>

                {instrument.state_text ? (
                    <div className="margin-top--little" style={{ fontSize: "0.9rem" }}>
                        Current State :{" "}
                        <span
                            className="padding--tiny div--round"
                            style={{ backgroundColor: instrument.state_color, color: "white", fontSize: "0.8rem" }}
                        >
                            {instrument.state_text}
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="div--expand margin-left--medium" style={{ borderLeft: "1px solid #eee", paddingLeft: "1.5rem" }}>
                <strong style={{ fontSize: "0.75rem", color: "#888" }}>SUBMISSIONS</strong>
                {instrument.submissions?.length > 0 ? (
                    <div className="flex flex-column" style={{ marginTop: "0.5rem", gap: "0.25rem" }}>
                        {instrument.submissions.map(sub => (
                            <SubmissionRow key={sub.submission_tag} submission={sub} />
                        ))}
                    </div>
                ) : (
                    <div className="margin-top--little" style={{ fontSize: "0.85rem", color: "#bbb" }}>
                        No submissions yet
                    </div>
                )}
            </div>
        </div>
    )
}

function PerformanceOverview() {
    const { data: instruments, isSuccess, isLoading } = api.instruments.core.useGetInstrumentsOverview()
    const instrumentsWithState = _.isArray(instruments) ? instruments.filter(i => i.state_text) : []

    return (
        <div>
            <h3>Instruments</h3>
            {isLoading ? <div>Loading...</div> : null}
            <div className="flex flex-column">
                {isSuccess
                    ? instrumentsWithState.map(instrument => (
                          <InstrumentOverviewCard key={instrument.tag} instrument={instrument} />
                      ))
                    : null}
            </div>
        </div>
    )
}

export default PerformanceOverview