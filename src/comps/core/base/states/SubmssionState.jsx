import _ from "lodash"
import { useGetSubmissionStates } from "../../../../hooks/queries/submission.hooks"
import { isHexColorLight } from "../../../../services/checks/color"
import { titleFormat } from "../../../../services/format/string"
import hooks from "@mitocube/api-hooks"


export function StateIndicator({ submission_tag, padding = "little" }) {
    
    const { data : state, isSuccess} = hooks.submissions.useGetSubmissionState({tag : submission_tag})
    const { data : stateName, isSuccess : isSuccessStateName} = hooks.states.useGetStateName({state}, { enabled : _.isNumber(state) && isSuccess})
    const { data : stateColor, isSuccess : isSuccessStateColor} = hooks.states.useGetStateColor({state}, { enabled : _.isNumber(state) && isSuccess})
   

    if (!isSuccess || !isSuccessStateName || !isSuccessStateColor) return null 

    return <div className="flex"><div className={`flex flex-column center-items div--round padding--${padding}`}style={{
        backgroundColor: stateColor,
        fontSize : "1.1rem",
        color: isHexColorLight(stateColor) ? "black" : "white"
    }}>{titleFormat(stateName)}
    </div></div>
}