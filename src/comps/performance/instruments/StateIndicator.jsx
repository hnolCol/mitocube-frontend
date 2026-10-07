import { useState, useRef, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import _ from "lodash"
import { api } from "@/api"
import { isHexColorLight } from "@/services/checks/color"
import { titleFormat } from "@/services/format/string"

const INVALIDATE_KEYS = [
    "getStatesOfAnInstrument",
    "getInstrumentsOverview",
    "getInstrumentStateDurations",
    "getFractionalInstrumentStateDurations",
    "getInstrumentStateDurationSummary",
    "getInstrumentPastSubmissions",
    "getSubmissionState",
]


export function InstrumentStateIndicator({ instrument_tag, allowUpdate = true, padding = "little" }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const queryClient = useQueryClient()

    const { data: allStates, isSuccess: isSuccessStates } = api.instruments.core.useGetAllInstrumentStates()
    const { data: currentTags, isSuccess } = api.instruments.core.useGetStatesOfAnInstrument(
        { tag: instrument_tag, limit: 1 },
        { enabled: _.isString(instrument_tag) }
    )
    const { data: permissions, isSuccess: isSuccessPermissions } = api.instruments.permissions.useGetInstrumentPermissions()
    const { mutate: updateState } = api.instruments.core.usePostInstrumentState()

    useEffect(() => {
        if (!open) return
        const onClickOutside = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener("mousedown", onClickOutside)
        return () => document.removeEventListener("mousedown", onClickOutside)
    }, [open])

    if (!isSuccess || !isSuccessStates) return null

    const currentTag = _.isArray(currentTags) ? currentTags[0] : null
    const current = allStates.find(s => s.tag === currentTag)
    const stateColor = current?.color ?? "#dddddd"
    const canUpdate = allowUpdate && isSuccessPermissions && permissions?.edit

    const handleStateChange = (newStateTag) => {
        if (!_.isString(newStateTag) || newStateTag === currentTag) return
        updateState({ tag: instrument_tag, instrument_state_tag: newStateTag }, {
            onSuccess: () => {
                INVALIDATE_KEYS.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }))
                setOpen(false)
            },
        })
    }

    return <div className="flex">
        <div ref={ref} className={`flex flex-column center-items div--round padding--${padding}`} style={{
            position: "relative",
            backgroundColor: stateColor,
            fontSize: "1.1rem",
            color: isHexColorLight(stateColor) ? "black" : "white",
        }}>
            <div className="flex center-items" style={{ gap: "0.4rem" }}>
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
                    position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 10, minWidth: "180px", padding: "0.25rem",
                }}>
                    {_.sortBy(allStates, "text").map(s => {
                        const isCurrent = s.tag === currentTag
                        return (
                            <div
                                key={s.tag}
                                onClick={() => handleStateChange(s.tag)}
                                className="div--round"
                                style={{
                                    padding: "0.4rem 0.6rem", fontSize: "0.9rem", textTransform: "uppercase",
                                    color: isCurrent ? "#bbb" : s.color,
                                    cursor: isCurrent ? "default" : "pointer",
                                }}
                                onMouseEnter={e => !isCurrent && (e.currentTarget.style.backgroundColor = "#f0f4f8")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                                {s.text}
                            </div>
                        )
                    })}
                </div>
            ) : null}
        </div>
    </div>
}


