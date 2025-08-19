import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import { InstrumentState } from "./StateHistory"
import { func } from "prop-types"


export function StateTime({ state_tag, instrument_tag, timestamp_min, timestamp_max }) {
    
    const { data: state_durations, isLoading, isSuccess, isError, error } = hooks.instruments.states.useGetSpecificInstrumentStateDurations({ tag: instrument_tag, state_tag, timestamp_min, timestamp_max }, { enabled: !!state_tag && !!instrument_tag, stateTime: 200000 })
    console.log(state_durations, "state_durations")
    return (<div>
        
    </div>)
}



export function InstrumentStates({ instrument_tag }) {
    console.log("instrument states", instrument_tag)
    const { data: instrument_states, isSuccess } = hooks.instruments.states.useGetInstrumentStateByQuery() //fetch all instrument states
    console.log(instrument_states, "instrument_states")
    return <div>
            <StateTime state_tag="state.instrument.running" instrument_tag={instrument_tag} />    
    </div>
} 