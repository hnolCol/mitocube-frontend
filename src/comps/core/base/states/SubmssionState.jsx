import _ from "lodash"
import { isHexColorLight } from "../../../../services/checks/color"
import { titleFormat } from "../../../../services/format/string"
import hooks from "@mitocube/api-hooks"


/**
 * @description Indicates the state of a submission. Each state has different color and an associated name. The state itself is a simple integer. 
 * @param {Object} props 
 * @param {String} props.submission_tag - The submission tag for which the state should be displayed 
 * @param {String} props.padding - Padding CSS class name indicator 
 * @returns 
 */
export function StateIndicator({ submission_tag, padding = "little" }) {
    
    const { data : state, isSuccess} = hooks.submissions.states.useGetSubmissionState({tag : submission_tag})
    const { data : stateName, isSuccess : isSuccessStateName} = hooks.states.useGetStateName({tag : state}, { enabled : _.isNumber(state) && isSuccess})
    const { data : stateColor, isSuccess : isSuccessStateColor} = hooks.states.useGetStateColor({tag : state}, { enabled : _.isNumber(state) && isSuccess})
   

    if (!isSuccess || !isSuccessStateName || !isSuccessStateColor) return null 

    return <div className="flex"><div className={`flex flex-column center-items div--round padding--${padding}`}style={{
        backgroundColor: stateColor,
        fontSize : "1.1rem",
        color: isHexColorLight(stateColor) ? "black" : "white"
    }}>{titleFormat(stateName)}
    </div></div>
}