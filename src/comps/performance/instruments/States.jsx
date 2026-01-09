import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import { InstrumentState } from "./StateHistory"



export function StateTime({ state_tag, instrument_tag, timestamp_min, timestamp_max }) {
    
    const { data: state_durations, isLoading, isSuccess, isError, error } = hooks.instruments.states.useGetSpecificInstrumentStateDurations({ tag: instrument_tag, state_tag, timestamp_min, timestamp_max }, { enabled: !!state_tag && !!instrument_tag, stateTime: 200000 })
    return (<div>
        
    </div>)
}



export function InstrumentStates({ instrument_tag }) {

    const { data: instrument_states, isSuccess } = hooks.instruments.states.useGetInstrumentStateByQuery() //fetch all instrument states

    return <div>
            {/* <InstrumentState tag={instrument_tag} /> */}
            <StateTime state_tag="state.instrument.running" instrument_tag={instrument_tag} />    
        </div>
} 



export function CurrentInstrumentState({ instrument_tag }) {
    
    const { data: instrument_state, isSuccess } = hooks.instruments.useGetStatesOfAnInstrument({ tag: instrument_tag, limit : 1 }, { enabled: _.isString(instrument_tag) })
    console.log(instrument_state)
    return <div>
       
        {isSuccess && instrument_state.length > 0 ? <InstrumentState tag={instrument_state[0].tag} /> : <div>No state found.</div>}
    </div>
}