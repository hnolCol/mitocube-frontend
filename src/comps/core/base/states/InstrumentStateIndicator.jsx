import _ from "lodash"
import { isHexColorLight } from "../../../../services/checks/color"
import { titleFormat } from "../../../../services/format/string"
import hooks from "@mitocube/api-hooks"
import { StateSelectionMenu } from "./StateSelectionMenu"

/**
 * @description Indicates the state of a submission. Each state has different color and an associated name. The state itself is a simple integer. 
 * @param {Object} props 
 * @param {String} props.submission_tag - The submission tag for which the state should be displayed 
 * @param {Boolean} props.allowUpdate - If true, the state can be updated using the menu. Changing the state of the submission is only possible if the user has the rights to do so. By default this will be admins and curators only on the backend. 
 * @param {String} props.padding - Padding CSS class name indicator 
 * @returns 
 */
export function InstrumentStateIndicator({ instrument_tag, allowUpdate = true, padding = "little" }) {


    const { data: instrument_states, isSuccess } = hooks.instruments.useGetStatesOfAnInstrument({ tag: instrument_tag, limit: 1 })
    const { data: instrument_state, isSuccess: isSuccessInstrumentState } = hooks.instruments.states.useGetInstrumentState({ tag: instrument_states[0].tag }, { enabled: isSuccess && instrument_states.length > 0 && _.isString(instrument_states[0].tag) })
    const { data: permissions, isSuccess: isSuccessPermissions } = hooks.instruments.permissions.useGetInstrumentPermissions({ tag: instrument_tag }, { enabled: _.isString(instrument_tag) && instrument_tag.length > 0 })
    // const { data: state, isSuccess, refetch: refetchState } = hooks.submissions.states.useGetSubmissionState({ tag: submission_tag })
    // const { mutate: updateState } = hooks.submissions.states.usePatchSubmissionState()
    // const { data : stateName, isSuccess : isSuccessStateName} = hooks.states.useGetStateName({tag : state}, { enabled : _.isNumber(state) && isSuccess})
    // const { data : stateColor, isSuccess : isSuccessStateColor} = hooks.states.useGetStateColor({tag : state}, { enabled : _.isNumber(state) && isSuccess})

    // const { data: permissions, isSuccess: isSuccessPermissions } = hooks.submissions.permissions.useGetSubmissionPermissionsByTag({ tag: submission_tag }, { enabled: _.isString(submission_tag) && submission_tag.length > 0 })
    
    const handleStateChange = (newState) => {
        if (!_.isNumber(newState) || !_.isString(submission_tag)) return
        updateState({ tag: submission_tag, state: newState }, {
            onSuccess: () => {
                refetchState()
            }
        })
    }

    if (!isSuccess || !isSuccessInstrumentState ) return null 

    return <div className="flex">
        <div className={`flex flex-column center-items div--round padding--${padding}`} style={{
        backgroundColor: instrument_state.color,
        fontSize : "1.1rem",
        color: isHexColorLight(instrument_state.color) ? "black" : "white"
        }}><div className="flex"><div>{titleFormat(stateName)}</div>
            <div>{isSuccessPermissions && allowUpdate && permissions.state_change ? <StateSelectionMenu current_state_tag={state} onSelection={handleStateChange} /> : null }</div></div>
    </div></div>
}



//    const { data: instrument_state, isSuccess } = hooks.instruments.states.useGetInstrumentState({ tag }, { enabled: !!tag, stateTime: "Infinity" })
//     return <div>
//         {isSuccess ?
//             <Tooltip content={instrument_state.description} position="top" >
//             <div style={{ backgroundColor: instrument_state.color, padding: "0.5rem", borderRadius: "0.25rem" }} >
//                 {instrument_state.text }
//                 </div >
//             </Tooltip> :
//             null
//         }