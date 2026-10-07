import _ from "lodash"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { api } from "@/api"
import { Card, Collapsible, PRIMARY_COLOR, useInstrumentOverview } from "./Components"

const PAGE_SIZE = 20
const PREVIEW_LIMIT = 5

function SubmissionStateBadge({ state_tag }) {
    const { data: name } = api.states.useGetStateName({ tag: state_tag })
    const { data: color } = api.states.useGetStateColor({ tag: state_tag })
    return (
        <div className="padding--tiny div--round" style={{ backgroundColor: color, color: "white", fontSize: "0.75rem" }}>
            {name}
        </div>
    )
}

export function SubmissionRow({ submission }) {
    const redirect = useNavigate()
    return (
        <div
            onClick={() => redirect(`/submissions/${submission.submission_tag}`)}
            className="flex justify-between center-items div--round"
            style={{ cursor: "pointer", fontSize: "0.85rem", padding: "0.5rem", gap: "1rem" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {submission.submission_title || submission.submission_tag}
            </span>
            <div className="flex center-items" style={{ gap: "0.75rem", flexShrink: 0 }}>
                <span style={{ fontSize: "0.8rem", color: "#888", whiteSpace: "nowrap" }}>{submission.sample_count} samples</span>
                {submission.submission_state != null ? (
                    <SubmissionStateBadge state_tag={submission.submission_state} />
                ) : (
                    <span style={{ fontSize: "0.8rem", color: "#bbb", whiteSpace: "nowrap" }}>No state</span>
                )}
            </div>
        </div>
    )
}

function SubmissionList({ submissions, children }) {
    return (
        <div className="flex flex-column" style={{ gap: "0.25rem" }}>
            {submissions.map(sub => <SubmissionRow key={sub.submission_tag} submission={sub} />)}
            {children}
        </div>
    )
}

/** Collapsible Measuring / Queued / Past sections for the overview card. */
export function InstrumentSubmissionSections({ instrument }) {
    const redirect = useNavigate()
    const { submissions_measuring: measuring, submissions_queued: queued, submissions_past: past } = instrument
    const pastTotal = instrument.submissions_past_total ?? past.length

    if (measuring.length + queued.length + pastTotal === 0) {
        return <div style={{ fontSize: "0.85rem", color: "#bbb" }}>No submissions yet</div>
    }

    return (
        <>
            {measuring.length ? (
                <Collapsible title={`MEASURING (${measuring.length})`} defaultOpen>
                    <SubmissionList submissions={measuring} />
                </Collapsible>
            ) : null}
            {queued.length ? (
                <Collapsible title={`QUEUED (${queued.length})`}>
                    <SubmissionList submissions={queued} />
                </Collapsible>
            ) : null}
            {past.length ? (
                <Collapsible title={`PAST (${pastTotal})`}>
                    <SubmissionList submissions={past.slice(0, PREVIEW_LIMIT)}>
                        {pastTotal > PREVIEW_LIMIT ? (
                            <div
                                onClick={() => redirect(`/performance/instruments/${instrument.tag}?tab=stats`)}
                                style={{ fontSize: "0.75rem", color: PRIMARY_COLOR, cursor: "pointer", padding: "0.25rem 0.5rem" }}
                            >
                                Show all {pastTotal} submissions
                            </div>
                        ) : null}
                    </SubmissionList>
                </Collapsible>
            ) : null}
        </>
    )
}

function PastSubmissionsInfiniteList({ instrument_tag }) {
    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const sentinelRef = useRef(null)
    const scrollRef = useRef(null)

    const { data, isSuccess, isFetching } = api.instruments.core.useGetInstrumentPastSubmissions(
        { tag: instrument_tag, offset, limit: PAGE_SIZE },
        { enabled: _.isString(instrument_tag) }
    )

    useEffect(() => {
        if (!isSuccess || !data) return
        setItems(prev => (offset === 0 ? data.items : [...prev, ...data.items]))
        setHasMore(offset + data.items.length < data.total)
    }, [data, isSuccess])

    useEffect(() => {
        const el = sentinelRef.current
        const root = scrollRef.current
        if (!el || !root) return
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isFetching) setOffset(prev => prev + PAGE_SIZE)
            },
            { root, rootMargin: "200px" }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasMore, isFetching])

    const footer = { padding: "0.5rem", textAlign: "center", fontSize: "0.75rem" }

    return (
        <Card label={`PAST SUBMISSIONS ${data?.total != null ? `(${data.total})` : ""}`} className="margin-top--medium">
            <div ref={scrollRef} style={{ maxHeight: "220px", overflowY: "auto" }}>
                <SubmissionList submissions={items}>
                    {hasMore ? (
                        <div ref={sentinelRef} style={{ ...footer, color: "#bbb" }}>{isFetching ? "Loading more…" : ""}</div>
                    ) : items.length ? (
                        <div style={{ ...footer, color: "#ccc" }}>No more submissions</div>
                    ) : null}
                </SubmissionList>
            </div>
        </Card>
    )
}

/** Measuring / Queued cards + infinite Past list for the instrument view. */
export function InstrumentSubmissionLists({ instrument_tag }) {
    const instrument = useInstrumentOverview(instrument_tag)
    const measuring = instrument?.submissions_measuring ?? []
    const queued = instrument?.submissions_queued ?? []

    return (
        <div>
            {measuring.length ? (
                <Card label={`MEASURING (${measuring.length})`}>
                    <SubmissionList submissions={measuring} />
                </Card>
            ) : null}
            {queued.length ? (
                <Card label={`QUEUED (${queued.length})`} className="margin-top--medium">
                    <SubmissionList submissions={queued} />
                </Card>
            ) : null}
            <PastSubmissionsInfiniteList instrument_tag={instrument_tag} />
        </div>
    )
}