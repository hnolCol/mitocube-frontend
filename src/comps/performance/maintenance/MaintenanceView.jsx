import _ from "lodash"
import { api } from "@/api"
import { Loading } from "../../core/base/states/Loading"
import { InstrumentState } from "../instruments/StateHistory"
import { CreatedAt } from "../../core/metrics/CreatedAt"
import { SymptomInput } from "../../core/input/api/SymptomInput"
import PropTypes from "prop-types"
import { useState, useEffect, useCallback } from "react"
import { MaintenanceProcedures } from "./MaintenanceProcedures"
import { MaintenanceSpareParts } from "./MaintenanceSpareParts"
import { MaintenanceEventState } from "./MaintenanceStates"
import { OptionButton } from "../../core/base/buttons/OptionButton"
import { Trait } from "../../core/base/traits/Trait"
import { Symptom } from "./Symptom"
import { MaintenanceEventCosts } from "./MaintenanceEventCost"
import { MaintenanceExternalServices } from "./MaintenanceExternalService"

const OPEN_STATE = "state.maintenance.open"
const RESOLVED_STATE = "state.maintenance.resolved"

const labelStyle = {
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "#5c7080",
}

function SectionHeader({ children, action }) {
    return (
        <div className="flex center-items" style={{ gap: "0.25rem", marginBottom: "0.25rem" }}>
            <span style={labelStyle}>{children}</span>
            {action}
        </div>
    )
}

MaintenanceEventItem.propTypes = {
    maintenance_event_tag: PropTypes.string.isRequired,
    instrument_tag: PropTypes.string,
    showInstrument: PropTypes.bool,
    setRefetchInstrumentStateTrigger: PropTypes.func,
    accentColor: PropTypes.string,
    isOpen: PropTypes.bool
}

/**
 * Displays a single maintenance event: instrument state, description,
 * symptoms, procedures, spare parts, external services and event state.
 */
export function MaintenanceEventItem({ maintenance_event_tag, instrument_tag, showInstrument = false, setRefetchInstrumentStateTrigger, accentColor, isOpen = false }) {
    const { data: maintenance_event, isLoading, isError, error, refetch } = api.maintenance.core.useGetMaintenanceEventByTag({ tag: maintenance_event_tag })
    const { data: currentInstrumentTags } = api.instruments.core.useGetStatesOfAnInstrument(
        { tag: instrument_tag, limit: 1 },
        { enabled: isOpen && _.isString(instrument_tag) }
    )
    const { refetch: refetchCosts } = api.maintenance.core.useGetMaintenanceEventCosts({ maintenance_event_tag })
    const { mutate: addSymptom } = api.maintenance.core.usePostSymptomToMaintenanceEvent()
    const { mutate: deleteSymptom } = api.maintenance.core.useDeleteSymptomToMaintenanceEvent()

    const handleSymptomSelect = (symptom_tag) => {
        if (_.includes(maintenance_event.symptom_tags, symptom_tag)) {
            deleteSymptom({ maintenance_event_tag, symptom_tag }, {
                onSuccess: () => refetch(),
                onError: (error) => console.error("Error removing symptom from maintenance event", error)
            })
        } else {
            addSymptom({ maintenance_event_tag, symptom_tag }, {
                onSuccess: () => refetch()
            })
        }
    }

    if (isLoading) return <Loading />
    if (isError) {
                console.error("Error loading maintenance event", maintenance_event_tag, error)
                return (
                    <div className="div--round" style={{ padding: "0.75rem 1rem", marginBottom: "0.6rem", border: "1px solid #f5c2c0", backgroundColor: "#fdf1f0", fontSize: "0.85rem" }}>
                        Error loading maintenance event <code>{maintenance_event_tag}</code>
                        <div style={{ color: "#a82a2a", marginTop: 4 }}>
                            {error?.response?.data?.detail ?? error?.message ?? String(error)}
                        </div>
                    </div>
                )
            }

    const instrumentStateTag = isOpen && _.isArray(currentInstrumentTags) && currentInstrumentTags[0]
        ? currentInstrumentTags[0]
        : maintenance_event.instrument_state_tag

    return <div className="bg--white div--round" style={{
        marginBottom: "0.6rem",
        padding: "0.75rem 1rem",
        fontSize: "0.9rem",
        border: "1px solid #e1e5ea",
        borderLeft: accentColor ? `4px solid ${accentColor}` : "1px solid #e1e5ea",
        boxShadow: "0 1px 2px rgba(16, 22, 26, 0.06)",
    }}>
        <div className="flex" style={{ gap: "1.25rem" }}>
            {/* Left: meta */}
            <div className="flex flex-column" style={{ width: 180, flexShrink: 0, gap: "0.6rem" }}>
                {showInstrument ? <div style={{ fontWeight: 600 }}><Trait trait_tag={maintenance_event.instrument_tag} /></div> : null}
                <div>
                    <div style={labelStyle}>Created</div>
                    <CreatedAt createdat={maintenance_event.created_at} />
                </div>
                <div>
                    <div style={{ ...labelStyle, marginBottom: "0.25rem" }}>Instrument state</div>
                    <InstrumentState tag={instrumentStateTag} />
                </div>
                <MaintenanceEventCosts maintenance_event_tag={maintenance_event_tag} />
            </div>

            {/* Right: details */}
            <div className="flex flex-column" style={{ flex: 1, minWidth: 0, gap: "0.6rem" }}>
                <div>
                    <div style={labelStyle}>Description</div>
                    <div style={{ marginTop: "0.2rem" }}>
                        {maintenance_event.description || <span style={{ color: "#8a9ba8" }}>No description</span>}
                    </div>
                </div>

                <div className="flex flex-column">
                    <SectionHeader action={<SymptomInput selectedItems={maintenance_event.symptom_tags} onItemSelect={handleSymptomSelect} />}>
                        Symptoms
                    </SectionHeader>
                    <div className="flex" style={{ flexWrap: "wrap" }}>
                        {_.isArray(maintenance_event.symptom_tags) && maintenance_event.symptom_tags.length > 0 ?
                            maintenance_event.symptom_tags.map((symptom_tag, index) =>
                                <Symptom key={`${symptom_tag}-${index}`} tag={symptom_tag} />
                            ) : null}
                    </div>
                </div>

                <MaintenanceProcedures maintenance_event={maintenance_event} refetch={refetch} />
                <MaintenanceSpareParts maintenance_event={maintenance_event} refetch={refetch} refetchCosts={refetchCosts} />
                <MaintenanceExternalServices maintenance_event={maintenance_event} refetch={refetch} refetchCosts={refetchCosts} />

                <div className="flex center-items" style={{ gap: "0.5rem", borderTop: "1px solid #e1e5ea", paddingTop: "0.5rem" }}>
                    <span style={labelStyle}>Event status</span>
                    <MaintenanceEventState
                        instrument_tag={instrument_tag}
                        maintenance_event_tag={maintenance_event_tag}
                        onEventChange={() => _.isFunction(setRefetchInstrumentStateTrigger) && setRefetchInstrumentStateTrigger(Math.random())}
                    />
                </div>
            </div>
        </div>
    </div>
}

/** Calls the state hook for one event and reports the result upward. Renders nothing. */
function EventStateProbe({ me_tag, onState }) {
    const { data } = api.maintenance.core.useGetMaintenanceEventState(
        { maintenance_event_tag: me_tag },
        { enabled: !!me_tag }
    )
    const tag = data?.tag ?? data
    useEffect(() => { onState(me_tag, tag) }, [me_tag, tag, onState])
    return null
}

MaintenanceView.propTypes = {
    instrument_tag: PropTypes.string.isRequired,
    setRefetchInstrumentStateTrigger: PropTypes.func,
    onRefetchReady: PropTypes.func
}

/**
 * Displays the maintenance events for an instrument, open events first, resolved below.
 */
export function MaintenanceView({ instrument_tag, setRefetchInstrumentStateTrigger, onRefetchReady }) {
    const [displayRange, setDisplayRange] = useState({ limit: 10, timestamp_min: undefined, timestamp_max: undefined })
    const [eventStates, setEventStates] = useState({})

    const { data: maintenance_event_tags, isLoading, refetch } = api.maintenance.core.useGetQueryMaintenanceEvents(
        { instrument_tag, ...displayRange },
        { enabled: _.isString(instrument_tag) && instrument_tag.length > 0 }
    )
    const { data: maintenance_total_counts } = api.maintenance.core.useGetMaintenanceEventCount({ instrument_tag })
    const { data: maintenance_counts } = api.maintenance.core.useGetMaintenanceEventCount({ instrument_tag, ...displayRange })

    useEffect(() => {
        if (_.isFunction(onRefetchReady)) onRefetchReady(() => refetch)
    }, [])

    const handleEventState = useCallback((me_tag, state) => {
        setEventStates(prev => (prev[me_tag] === state ? prev : { ...prev, [me_tag]: state }))
    }, [])

    const tags = _.isArray(maintenance_event_tags) ? maintenance_event_tags : []
    const openEvents = tags.filter(t => eventStates[t] === OPEN_STATE)
    const resolvedEvents = tags.filter(t => eventStates[t] === RESOLVED_STATE)

    const renderEvents = (events, title, color) => {
        if (events.length === 0) return null
        return (
            <div style={{ marginTop: "1rem" }}>
                <div className="flex center-items" style={{
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    paddingBottom: "0.3rem",
                    borderBottom: "1px solid #e1e5ea",
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color }} />
                    <span style={{ ...labelStyle, fontSize: "0.75rem" }}>{title}</span>
                    <span style={{
                        fontSize: "0.7rem",
                        padding: "0 0.4rem",
                        borderRadius: "999px",
                        backgroundColor: "#e1e5ea",
                        color: "#394b59",
                    }}>{events.length}</span>
                </div>
                {events.map(me_tag => (
                    <MaintenanceEventItem
                        key={me_tag}
                        maintenance_event_tag={me_tag}
                        instrument_tag={instrument_tag}
                        setRefetchInstrumentStateTrigger={setRefetchInstrumentStateTrigger}
                        accentColor={color}
                        isOpen={eventStates[me_tag] === OPEN_STATE}
                    />
                ))}
            </div>
        )
    }

    return (
        <div>
            {tags.map(t => <EventStateProbe key={t} me_tag={t} onState={handleEventState} />)}

            {/* Toolbar */}
            <div className="flex center-items" style={{
                justifyContent: "space-between",
                padding: "0.35rem 0.75rem",
                marginTop: "0.6rem",
                backgroundColor: "#f5f8fa",
                border: "1px solid #e1e5ea",
                borderRadius: 4,
            }}>
                <div style={{ fontSize: "0.8rem", color: "#5c7080" }}>
                    Showing <strong style={{ color: "#182026" }}>{maintenance_counts ?? "–"}</strong> of {maintenance_total_counts ?? "–"} events
                </div>
                <div className="flex center-items" style={{ gap: "0.3rem", fontSize: "0.85rem" }}>
                    <span style={labelStyle}>Show</span>
                    {[10, 20, 50, 100].map(limit => (
                        <OptionButton
                            isSelected={limit === displayRange.limit}
                            key={limit}
                            onClick={() => setDisplayRange(prev => ({ ...prev, limit }))}
                        >
                            {limit}
                        </OptionButton>
                    ))}
                </div>
            </div>

            {isLoading ? <Loading /> : tags.length === 0 ? (
                <div style={{
                    marginTop: "1.25rem",
                    padding: "1.5rem",
                    textAlign: "center",
                    color: "#8a9ba8",
                    fontSize: "0.9rem",
                    border: "1px dashed #ced9e0",
                    borderRadius: 4,
                }}>
                    No maintenance events for this instrument yet.
                </div>
            ) : (
                <div>
                    {renderEvents(openEvents, "Open", "#d9822b")}
                    {renderEvents(resolvedEvents, "Resolved", "#0f9960")}
                </div>
            )}
        </div>
    )
}