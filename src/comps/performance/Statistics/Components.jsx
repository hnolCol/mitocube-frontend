import _ from "lodash"
import { useState } from "react"
import { api } from "@/api"
import viz from "@mitocube/viz"

export const PRIMARY_COLOR = "#558ba4"
export const RUNNING_STATE_TAG = "state.instrument.running"


export function useInstrumentOverview(instrument_tag) {
    const { data } = api.instruments.core.useGetInstrumentsOverview()
    return _.isArray(data) ? data.find(i => i.tag === instrument_tag) : null
}

export function useStateHistory(instrument_tag) {
    const { data: durations, isSuccess: dOk } = api.instruments.core.useGetInstrumentStateDurations({ tag: instrument_tag })
    const { data: states, isSuccess: sOk } = api.instruments.core.useGetAllInstrumentStates()
    return { durations, states, ready: dOk && sOk && _.isArray(durations) && _.isArray(states) }
}



export function Card({ label, children, className = "", style }) {
    return (
        <div className={`bg--white div--round padding--medium ${className}`} style={style}>
            {label ? <viz.text.SectionLabel>{label}</viz.text.SectionLabel> : null}
            <div className={label ? "margin-top--little" : undefined}>{children}</div>
        </div>
    )
}

export function BigNumber({ value, label, color, size = "1.3rem", stacked = false }) {
    if (stacked) {
        return (
            <div>
                <div style={{ fontSize: size, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: "0.75rem", color: "#888" }}>{label}</div>
            </div>
        )
    }
    return (
        <div style={{ fontSize: size, fontWeight: 700, color }}>
            {value}
            <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#888", marginLeft: "0.4rem" }}>{label}</span>
        </div>
    )
}

export function Collapsible({ title, defaultOpen = false, children }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="margin-top--little">
            <div className="flex center-items" style={{ gap: "0.4rem", cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
                <viz.text.SectionLabel>{title}</viz.text.SectionLabel>
                <span style={{ fontSize: "0.75rem", color: "#bbb" }}>{open ? "▼" : "▶"}</span>
            </div>
            {open ? <div style={{ marginTop: "0.25rem" }}>{children}</div> : null}
        </div>
    )
}