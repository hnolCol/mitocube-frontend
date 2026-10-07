import _ from "lodash"
import { useState } from "react"
import { useParams, useSearchParams } from "react-router"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"
import { Loading } from "../../core/base/states/Loading"
import { OptionButton } from "../../core/base/buttons/OptionButton"
import { InstrumentMenu } from "./Menu"
import { InstrumentCosts } from "./Costs"
import { InstrumentStateIndicator } from "./StateIndicator"
import { InsertMaintenanceEvent } from "../maintenance/InsertMaintenanceEvent"
import { MaintenanceView } from "../maintenance/MaintenanceView"
import { InstrumentStateDurationChart, InstrumentStateHeatmap, UtilizationStat } from "../Statistics/StateCharts"
import { InstrumentQuantificationChart, TotalVsQuantifiedStat } from "../Statistics/QuantificationCharts"
import { InstrumentSubmissionLists } from "../Statistics/Submissions"

function MaintenanceTab({ instrument_tag }) {
    const [maintenanceRefetch, setMaintenanceRefetch] = useState(null)
    return (
        <>
            <InstrumentCosts tag={instrument_tag} />
            <InsertMaintenanceEvent instrument_tag={instrument_tag} refetch={maintenanceRefetch} />
            <div className="margin-top--medium">
                <MaintenanceView instrument_tag={instrument_tag} setRefetchInstrumentStateTrigger={_.noop} onRefetchReady={setMaintenanceRefetch} />
            </div>
        </>
    )
}

function StatsTab({ instrument_tag }) {
    return (
        <div className="flex" style={{ gap: "1rem" }}>
            <div className="flex flex-column" style={{ width: "260px", flexShrink: 0, gap: "0.75rem" }}>
                <div className="bg--white div--round padding--little" style={{ flex: 1 }}>
                    <InstrumentStateDurationChart instrument_tag={instrument_tag} />
                </div>
                <div style={{ flex: 1 }}><UtilizationStat instrument_tag={instrument_tag} /></div>
                <div style={{ flex: 1 }}><TotalVsQuantifiedStat instrument_tag={instrument_tag} /></div>
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
        <div>
            {isError ? <APIError error={error} /> : null}
            <div className="flex">
                <InstrumentMenu open_instrument_tag={instrument_tag} />

                <div className="margin-left--medium">
                    {isLoading ? <Loading /> : null}
                    {isSuccess && _.isObject(instrument) ? (
                        <>
                            <div className="flex center-items" style={{ gap: "0.75rem" }}>
                                <h4>{instrument.text}</h4>
                                <InstrumentStateIndicator instrument_tag={instrument_tag} />
                            </div>
                            <div className="font-size--small">{instrument.description}</div>
                        </>
                    ) : null}

                    <div className="margin-top--medium">
                        <div className="flex" style={{ gap: "0.5rem" }}>
                            <OptionButton isSelected={activeTab === "maintenance"} onClick={() => setSearchParams({ tab: "maintenance" })}>
                                Maintenance
                            </OptionButton>
                            <OptionButton isSelected={activeTab === "stats"} onClick={() => setSearchParams({ tab: "stats" })}>
                                Statistics
                            </OptionButton>
                        </div>

                        <div className="margin-top--medium">
                            {activeTab === "maintenance" ? <MaintenanceTab instrument_tag={instrument_tag} /> : <StatsTab instrument_tag={instrument_tag} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}