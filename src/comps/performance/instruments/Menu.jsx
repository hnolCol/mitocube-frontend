
import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import { useNavigate } from "react-router"
import { InstrumentCosts } from "./Costs"

/**
 * 
 * @param {Object} props 
 * @param {String} props.tag - The instrument tag 
 * @param {Boolean} props.isOpen - Is the detail section shown for the given instrument. 
 */
function Instrument({tag, isOpen = false}) {
    const redirect = useNavigate()
    const {data : instrument} = hooks.instruments.useGetInstrument({tag})

    return (
        <div>{_.isObject(instrument) ?
            <button
                // key={index}
                // ref={(el) => (buttonRefs.current[index] = el)}
                className={`submission-tab-navigation-button div--round margin--tiny ${isOpen? "submission-tab-navigation-button--active": ""}`} //
                onClick={() => {
                    redirect(`/performance/instruments/${tag}`)
                }}>
                <div className="div--expand flex justify-end">
                    <div>{instrument.text}</div>
                </div>
            </button> : null}</div>
    )
}


function Instruments({instrument_type,open_instrument_tag}) {

    const { data: instruments } = hooks.instruments.useGetInstrumentsByType({ tag: instrument_type })
    return (<div>
        <h4>{instrument_type}</h4>
        {_.isArray(instruments) ? instruments.map(instrument_tag => <Instrument key={instrument_tag} tag={instrument_tag} isOpen={open_instrument_tag===instrument_tag} /> ):null}
    </div>)
}



export function InstrumentMenu({open_instrument_tag}) {
    const { data: instrument_types } = hooks.instruments.useGetInstrumentTypes()
    return <div>
    <h3>Instruments</h3>

            {_.isArray(instrument_types) ?
            instrument_types.map(t => <Instruments key={t} instrument_type={t} open_instrument_tag={open_instrument_tag} />) : null}
    </div>
}
