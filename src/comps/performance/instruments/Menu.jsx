
import _ from "lodash"
import { api } from "@/api"
import { useNavigate } from "react-router"
import { Attribute } from "../../core/base/attributes/Attribute"

/**
 * 
 * @param {Object} props 
 * @param {String} props.tag - The instrument tag 
 * @param {Boolean} props.isOpen - Is the detail section shown for the given instrument. 
 */
function Instrument({tag, isOpen = false}) {
    const redirect = useNavigate()
    const { data: instrument } = api.instruments.core.useGetInstrument({ tag })

    if (!_.isObject(instrument)) return null

    return (
        <button
            onClick={() => redirect(`/performance/instruments/${tag}`)}
            style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: isOpen ? "#e8f0fa" : "transparent",
                border: "none",
                borderLeft: `3px solid ${isOpen ? "#2b6cb0" : "transparent"}`,
                borderRadius: "0 4px 4px 0",
                padding: "0.3rem 0.6rem",
                marginBottom: 2,
                fontSize: "0.85rem",
                fontWeight: isOpen ? 600 : 400,
                color: isOpen ? "#182026" : "#394b59",
                cursor: "pointer",
            }}
            onMouseEnter={e => { if (!isOpen) e.currentTarget.style.backgroundColor = "#f0f4f8" }}
            onMouseLeave={e => { if (!isOpen) e.currentTarget.style.backgroundColor = "transparent" }}
        >
            {instrument.text}
        </button>
    )
}


function Instruments({instrument_type,open_instrument_tag}) {

    const { data: instruments } = api.instruments.core.useGetInstrumentsByType({ tag: instrument_type })
    return (
        <div>
            <div style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: "#182026",
                margin: "1rem 0 0.35rem",
            }}>
                <Attribute attribute_tag={instrument_type} />
            </div>
            {_.isArray(instruments) ? instruments.map(instrument =>
                <Instrument key={instrument.tag} tag={instrument.tag} isOpen={instrument.tag === open_instrument_tag} />
            ) : null}
        </div>
    )
}

export function InstrumentMenu({ open_instrument_tag }) {
    const { data: instrument_types } = api.instruments.core.useGetInstrumentTypes()
    return (
        <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 600 }}>Instruments</div>
            {_.isArray(instrument_types) ?
                instrument_types.map(instrumentType =>
                    <Instruments key={instrumentType.tag} instrument_type={instrumentType.tag} open_instrument_tag={open_instrument_tag} />
                ) : null}
        </div>
    )
}