
import _ from "lodash"
import { api } from "@/api"
import { useNavigate } from "react-router"
import { InstrumentCosts } from "./Costs"
import { Trait } from "../../core/base/traits/Trait"
import { Attribute } from "../../core/base/attributes/Attribute"

/**
 * 
 * @param {Object} props 
 * @param {String} props.tag - The instrument tag 
 * @param {Boolean} props.isOpen - Is the detail section shown for the given instrument. 
 */
function Instrument({tag, isOpen = false}) {
    const redirect = useNavigate()
    const {data : instrument} = api.instruments.core.useGetInstrument({tag})

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

    const { data: instruments } = api.instruments.core.useGetInstrumentsByType({ tag: instrument_type })
    return (<div>
        <h4><Attribute attribute_tag={instrument_type} /></h4>
        
        {_.isArray(instruments) ? instruments.map(instrument => <Instrument key={instrument.tag} tag={instrument.tag} /> ):null}
    </div>)
}



export function InstrumentMenu({open_instrument_tag}) {
    const { data: instrument_types } = api.instruments.core.useGetInstrumentTypes()
    return <div>
    <h3>Instruments</h3>

            {_.isArray(instrument_types) ?
            instrument_types.map(instrumentType => <Instruments key={instrumentType.tag} instrument_type={instrumentType.tag} />) : null}
    </div>
}
