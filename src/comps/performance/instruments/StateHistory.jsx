

import _ from "lodash"
import { api } from "@/api"
import { Tooltip } from "@blueprintjs/core"
import { useEffect } from "react"


export function InstrumentState({ tag }) {
    const { data: instrument_state, isSuccess, refetch } =  api.instruments.core.useGetInstrumentState({ tag }, { enabled: !!tag, stateTime: 6000 })
    

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
    const { data : state, isLoading, isFetching, isSuccess } =  api.instruments.core.useGetInstrumentState({tag : instrument_state_item.state_tag}, {enabled : _.isString(instrument_state_item.state_tag)})
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
    
    const { data : state_history, isLoading, isFetching, isSuccess } =  api.instruments.core.useGetInstrumentStateDurations({ tag, limit : 20})
   
    return (
        <div>
            {/* {isSuccess && _.isArray(state_history)  ? state_history.map((state_item, index) => {
                return (<StateHistoryItem key={`${index}-state-item`}  instrument_state_item={state_item} />)
            }
            ) : null} */}
        </div>
    )
}