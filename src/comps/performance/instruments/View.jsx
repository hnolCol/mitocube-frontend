import _ from "lodash"
import { useParams, useSearchParams } from "react-router"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"
import { Loading } from "../../core/base/states/Loading"
import { InstrumentMenu } from "./Menu"
import { InstrumentCosts } from "./Costs"
import { InstrumentStateIndicator } from "./StateIndicator"
import { InsertMaintenanceEvent } from "../maintenance/InsertMaintenanceEvent"
import { MaintenanceView } from "../maintenance/MaintenanceView"
import { InstrumentStateDurationChart, InstrumentStateHeatmap, UtilizationStat } from "../Statistics/StateCharts"
import { InstrumentQuantificationChart, TotalVsQuantifiedStat } from "../Statistics/QuantificationCharts"
import { InstrumentSubmissionLists } from "../Statistics/Submissions"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"

const labelStyle = {
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "#5c7080",
}

const TABS = [
    { id: "maintenance", label: "Maintenance" },
    { id: "stats", label: "Statistics" },
]

function HeaderStat({ label, value }) {
    return (
        <div>
            <div style={labelStyle}>{label}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#182026", marginTop: 2 }}>{value}</div>
        </div>
    )
}

function SamplesStat({ instrument_tag }) {
    const { data, isSuccess } = api.instruments.count.useGetInstrumentSamplesCount(
        { tag: instrument_tag },
        { enabled: _.isString(instrument_tag), staleTime: 300000 }
    )
    return <HeaderStat label="Samples" value={isSuccess ? data : "–"} />
}

function Tabs({ selected, onChange }) {
    return (
        <div className="flex" style={{ gap: "1.25rem", borderBottom: "1px solid #e1e5ea", margin: "1rem 0 0.25rem" }}>
            {TABS.map(tab => {
                const active = tab.id === selected
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        style={{
                            background: "none",
                            border: "none",
                            borderBottom: `2px solid ${active ? "#2b6cb0" : "transparent"}`,
                            marginBottom: -1,
                            padding: "0.35rem 0.1rem",
                            fontSize: "0.875rem",
                            fontWeight: active ? 600 : 500,
                            color: active ? "#182026" : "#5c7080",
                            cursor: "pointer",
                        }}
                    >
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}

function StatsTab({ instrument_tag }) {
    return (
        <div className="flex gap--medium">
            <div className="flex flex-column" style={{ width: "260px", flexShrink: 0, gap: "0.75rem" }}>
                <div className="bg--white div--round padding--little width--expand">
                    <InstrumentStateDurationChart instrument_tag={instrument_tag} />
                </div>
                <div className="width--expand"><UtilizationStat instrument_tag={instrument_tag} /></div>
                <div className="width--expand"><TotalVsQuantifiedStat instrument_tag={instrument_tag} /></div>
            </div>

            <div className="flex flex-column" style={{ flex: 1, minWidth: 0, gap: "0.75rem" }}>
                <InstrumentStateHeatmap instrument_tag={instrument_tag} />
                <div className="bg--white div--round padding--little">
                    <InstrumentQuantificationChart instrument_tag={instrument_tag} />
                </div>
            </div>

            <div style={{ width: "260px", flexShrink: 0 }}>
                <InstrumentSubmissionLists instrument_tag={instrument_tag} />
            </div>
        </div>
    )
}

/** Details view for a specific instrument. */
export function InstrumentView() {
    const { instrument_tag } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get("tab") === "stats" ? "stats" : "maintenance"

    const { data: instrument, isSuccess, error, isError, isLoading } = api.instruments.core.useGetInstrument(
        { tag: instrument_tag },
        { enabled: _.isString(instrument_tag) }
    )

    return (
        <div className="flex" style={{ gap: "1.25rem", alignItems: "flex-start", zoom: 0.9 }}>
            <div style={{ width: 220, flexShrink: 0 }}>
                <InstrumentMenu open_instrument_tag={instrument_tag} />
            </div>

            <div style={{ flex: 1, minWidth: 0, maxWidth: 1100 }}>
                {isError ? <APIError error={error} /> : null}
                {isLoading ? <Loading /> : null}

                {isSuccess && _.isObject(instrument) ? (
                    <div className="bg--white div--round" style={{
                        padding: "0.75rem 1rem",
                        border: "1px solid #e1e5ea",
                        boxShadow: "0 1px 2px rgba(16, 22, 26, 0.06)",
                    }}>
                        <div className="flex center-items" style={{ justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                            <div className="flex center-items" style={{ gap: "0.75rem" }}>
                                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>{instrument.text}</h2>
                                <InstrumentStateIndicator instrument_tag={instrument_tag} />
                            </div>
                            <div className="font-size--small">{instrument.description}</div>
                        </div>
                    </div>
                ) : null}

                <div className="flex" style={{ gap: "2rem", marginTop: "0.75rem" }}>
                    <InstrumentCosts tag={instrument_tag} />
                    <SamplesStat instrument_tag={instrument_tag} />
                </div>
                    

                <div className="flex" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
                    <Tabs selected={activeTab} onChange={tab => setSearchParams({ tab })} />
                    {activeTab === "maintenance" && _.isString(instrument_tag)
                        ? <InsertMaintenanceEvent instrument_tag={instrument_tag} />
                        : null}
                </div>

                {activeTab === "maintenance"
                    ? <MaintenanceView instrument_tag={instrument_tag} setRefetchInstrumentStateTrigger={_.noop} />
                    : <div style={{ marginTop: "0.75rem" }}><StatsTab instrument_tag={instrument_tag} /></div>}
            </div>
        </div>
    )
}