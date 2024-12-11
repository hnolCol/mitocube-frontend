import _ from "lodash"
import { useGetSubmissionStates } from "../../../../hooks/queries/submission.hooks"
import { isHexColorLight } from "../../../../services/checks/color"
import { titleFormat } from "../../../../services/format/string"


export function StateIndicator({ state, padding = "little" }) {
    
    const { data: submissionStates, isLoading: submissionStatesLoading } = useGetSubmissionStates()
    if (submissionStatesLoading) return null 
    if (!_.has(submissionStates.states_inv,state)) return null 
    const stateName = submissionStates.states_inv[state]
    const stateColor = submissionStates.colors_inv[state]

    return <div className="flex"><div className={`flex flex-column center-items div--round padding--${padding}`}style={{
        backgroundColor: stateColor,
        fontSize : "1.1rem",
        color: isHexColorLight(stateColor) ? "black" : "white"
    }}>{titleFormat(stateName)}
    </div></div>
}