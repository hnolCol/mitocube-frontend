import { useState, useRef, useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Tooltip } from "@blueprintjs/core"
import _ from "lodash"
import { api } from "@/api"
import { isHexColorLight } from "@/services/checks/color"
import { titleFormat } from "@/services/format/string"

const OPEN_STATE = "state.maintenance.open"

const INVALIDATE_KEYS = [
    "getStatesOfAnInstrument",
    "getInstrumentsOverview",
    "getInstrumentStateDurations",
    "getFractionalInstrumentStateDurations",
    "getInstrumentStateDurationSummary",
    "getInstrumentPastSubmissions",
    "getSubmissionState",
]

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

export function InstrumentStateIndicator({ instrument_tag, allowUpdate = true }) {
    const [open, setOpen] = useState(false)
    const [eventStates, setEventStates] = useState({})
    const ref = useRef(null)
    const queryClient = useQueryClient()

    const { data: maintenance_events } = api.maintenance.core.useGetQueryMaintenanceEvents(
        { instrument_tag, limit: 1000 },
        { enabled: _.isString(instrument_tag) }
    )
    const { data: allStates, isSuccess: isSuccessStates } = api.instruments.core.useGetAllInstrumentStates()
    const { data: currentTags, isSuccess } = api.instruments.core.useGetStatesOfAnInstrument(
        { tag: instrument_tag, limit: 1 },
        { enabled: _.isString(instrument_tag) }
    )
    const { data: permissions, isSuccess: isSuccessPermissions } = api.instruments.permissions.useGetInstrumentPermissions()
    const { mutate: updateState } = api.instruments.core.usePostInstrumentState()

    const handleEventState = useCallback((me_tag, state) => {
        setEventStates(prev => (prev[me_tag] === state ? prev : { ...prev, [me_tag]: state }))
    }, [])

    useEffect(() => {
        if (!open) return
        const onClickOutside = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener("mousedown", onClickOutside)
        return () => document.removeEventListener("mousedown", onClickOutside)
    }, [open])

    if (!isSuccess || !isSuccessStates) return null

    const runningTag = allStates.find(s => s.text?.toLowerCase() === "running")?.tag
    const eventTags = _.isArray(maintenance_events) ? maintenance_events : []
    const hasOpenEvents = eventTags.some(t => eventStates[t] === OPEN_STATE)

    const currentTag = _.isArray(currentTags) ? currentTags[0] : null
    const current = allStates.find(s => s.tag === currentTag)
    const stateColor = current?.color || "#dddddd"
    const canUpdate = allowUpdate && isSuccessPermissions && permissions?.edit

    const handleStateChange = (newStateTag) => {
        if (!_.isString(newStateTag) || newStateTag === currentTag) return
        if (newStateTag === runningTag && hasOpenEvents) return

        updateState({ tag: instrument_tag, instrument_state_tag: newStateTag }, {
            onSuccess: () => {
                INVALIDATE_KEYS.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }))
                setOpen(false)
            },
        })
    }

    return <div className="flex">
        {eventTags.map(t => <EventStateProbe key={t} me_tag={t} onState={handleEventState} />)}

        <div ref={ref} className="flex flex-column center-items" style={{
            position: "relative",
            backgroundColor: stateColor,
            fontSize: "0.85rem",
            fontWeight: 600,
            padding: "0.25rem 0.75rem",
            borderRadius: 999,
            color: isHexColorLight(stateColor) ? "black" : "white",
        }}>
            <div className="flex center-items gap--medium-small">
                <div>{titleFormat(current?.text ?? "No state")}</div>
                {canUpdate ? (
                <div onClick={() => setOpen(o => !o)} className="flex center-items" style={{ cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
                ) : null}
            </div>

            {open ? (
                <div className="bg--white div--round container--shadow" style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 10, minWidth: "200px", padding: "0.25rem",
                    fontWeight: 500,
                }}>
                    {_.sortBy(allStates, "text").map(s => {
                        const isCurrent = s.tag === currentTag
                        const isDisabled = s.tag === runningTag && hasOpenEvents

                        return (
                            <Tooltip
                                key={s.tag}
                                content="Cannot set to running: open maintenance events exist"
                                position="right"
                                disabled={!isDisabled}
                            >
                                <div
                                    onClick={() => !isDisabled && handleStateChange(s.tag)}
                                    className="flex center-items div--round"
                                    style={{
                                        gap: "0.5rem",
                                        padding: "0.4rem 0.6rem",
                                        fontSize: "0.85rem",
                                        color: isCurrent ? "#8a9ba8" : isDisabled ? "#bfccd6" : "#182026",
                                        cursor: isCurrent ? "default" : isDisabled ? "not-allowed" : "pointer",
                                        textDecoration: isDisabled ? "line-through" : "none",
                                    }}
                                    onMouseEnter={e => !isCurrent && !isDisabled && (e.currentTarget.style.backgroundColor = "#f0f4f8")}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: s.color || "#ccc", opacity: isDisabled ? 0.4 : 1 }} />
                                    {s.text}
                                </div>
                            </Tooltip>
                        )
                    })}
                </div>
            ) : null}
        </div>
    </div>
}