

import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import { Tooltip } from "@blueprintjs/core"


export function InstrumentState({ tag }) {
    const { data: instrument_state, isSuccess } = hooks.instruments.states.useGetInstrumentState({ tag }, { enabled: !!tag, stateTime: "Infinity" })
    return <div>
        {isSuccess ?
            <Tooltip content={instrument_state.description} position="top" >
            <div style={{ backgroundColor: instrument_state.color, padding: "0.5rem", borderRadius: "0.25rem" }} >
                {instrument_state.text }
                </div >
            </Tooltip> :
            null
        }
    </div>
}


/**
 * 
 * @param {Object} props 
 * @param {import("@mitocube/api-hooks/src/hooks/instruments/types").InstrumentStateHistory}  props.instrument_state_item
 */
export function StateHistoryItem({ instrument_state_item }) {
    const { data : state, isLoading, isFetching, isSuccess } = hooks.instruments.states.useGetInstrumentState({tag : instrument_state_item.state_tag}, {enabled : _.isString(instrument_state_item.state_tag)})
    return (
    <div>
        {isSuccess && _.isObject(state) ? <div className="flex">
                <InstrumentState {...state} />
                <div>{instrument_state_item.duration}</div>
            </div> : null
        }
            
    </div>)
}

export function InstrumentStateHistory({ tag }) {
    
    const { data : state_history, isLoading, isFetching, isSuccess } = hooks.instruments.states.useGetInstrumentStateDurations({ tag, limit : 20})
   
    return (
        <div>
            {/* {isSuccess && _.isArray(state_history)  ? state_history.map((state_item, index) => {
                return (<StateHistoryItem key={`${index}-state-item`}  instrument_state_item={state_item} />)
            }
            ) : null} */}
        </div>
    )
}