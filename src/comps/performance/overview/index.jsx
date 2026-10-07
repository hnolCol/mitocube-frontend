import _ from "lodash"
import { useNavigate } from "react-router"
import { api } from "@/api"
import { BigNumber, PRIMARY_COLOR } from "../Statistics/Components"
import { InstrumentStateDurationChart } from "../Statistics/StateCharts"
import { InstrumentSamplesTrendChart } from "../Statistics/QuantificationCharts"
import { InstrumentSubmissionSections } from "../Statistics/Submissions"

function InstrumentOverviewCard({ instrument }) {
    const redirect = useNavigate()
    const pastTotal = instrument.submissions_past_total ?? instrument.submissions_past.length
    const totalSubmissions = instrument.submissions_measuring.length + instrument.submissions_queued.length + pastTotal

    return (
        <div
            className="flex flex-column bg--white div--round padding--medium margin--tiny container--shadow"
            style={{ maxWidth: "min(90vw, 340px)", minWidth: "min(90vw, 340px)", height: "580px", boxSizing: "border-box", overflow: "hidden" }}
        >
            <strong style={{ fontSize: "1rem", cursor: "pointer" }} onClick={() => redirect(`/performance/instruments/${instrument.tag}`)}>
                {instrument.text}
            </strong>

            {instrument.state_text ? (
                <div className="margin-top--little">
                    <span className="padding--tiny div--round" style={{ backgroundColor: instrument.state_color, color: "white", fontSize: "0.75rem" }}>
                        {instrument.state_text}
                    </span>
                </div>
            ) : null}

            <div className="flex margin-top--medium" style={{ gap: "1.5rem" }}>
                <BigNumber stacked size="1.4rem" value={instrument.sample_count} label="Samples" />
                <BigNumber stacked size="1.4rem" value={totalSubmissions} label="Submissions" color={PRIMARY_COLOR} />
            </div>

            <InstrumentStateDurationChart instrument_tag={instrument.tag} />
            <InstrumentSamplesTrendChart instrument_tag={instrument.tag} />

            <div
                className="margin-top--medium"
                style={{ borderTop: "1px solid #eee", paddingTop: "1rem", flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
            >
                <InstrumentSubmissionSections instrument={instrument} />
            </div>
        </div>
    )
}

export default function PerformanceOverview() {
    const { data: instruments, isSuccess, isLoading } = api.instruments.core.useGetInstrumentsOverview()
    const withState = _.isArray(instruments) ? instruments.filter(i => i.state_text) : []

    return (
        <div>
            <h3>Instruments</h3>
            {isLoading ? <div>Loading...</div> : null}
            <div className="flex flex--wrap align-start" style={{ gap: "1rem", marginTop: "1rem", paddingBottom: "1rem" }}>
                {isSuccess ? withState.map(instrument => <InstrumentOverviewCard key={instrument.tag} instrument={instrument} />) : null}
            </div>
        </div>
    )
}
