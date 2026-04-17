import _ from "lodash"
import { isHexColorLight } from "../../../../services/checks/color"
import { titleFormat } from "../../../../services/format/string"
import { StateSelectionMenu } from "./StateSelectionMenu"
import { api } from "@/api"
/**
 * @description Indicates the state of a submission. Each state has different color and an associated name. The state itself is a simple integer. 
 * @param {Object} props 
 * @param {String} props.submission_tag - The submission tag for which the state should be displayed 
 * @param {Boolean} props.allowUpdate - If true, the state can be updated using the menu. Changing the state of the submission is only possible if the user has the rights to do so. By default this will be admins and curators only on the backend. 
 * @param {String} props.padding - Padding CSS class name indicator 
 * @returns 
 */
export function StateIndicator({ submission_tag, allowUpdate = true, padding = "little" }) {

    const { data: state, isSuccess, refetch: refetchState } = api.submissions.states.useGetSubmissionState({ tag: submission_tag })
    const { mutate: updateState } = api.submissions.states.usePatchSubmissionState()
    const { data : stateName, isSuccess : isSuccessStateName} = api.states.useGetStateName({tag : state}, { enabled : _.isNumber(state) && isSuccess})
    const { data : stateColor, isSuccess : isSuccessStateColor} = api.states.useGetStateColor({tag : state}, { enabled : _.isNumber(state) && isSuccess})

    const { data: permissions, isSuccess: isSuccessPermissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag({ tag: submission_tag }, { enabled: _.isString(submission_tag) && submission_tag.length > 0 })
    
    const handleStateChange = (newState) => {
        if (!_.isNumber(newState) || !_.isString(submission_tag)) return
        updateState({ tag: submission_tag, state: newState }, {
            onSuccess: () => {
                refetchState()
            }
        })
    }


    if (!isSuccess || !isSuccessStateName || !isSuccessStateColor) return null 

    return <div className="flex">
        <div className={`flex flex-column center-items div--round padding--${padding}`} style={{
        backgroundColor: stateColor,
        fontSize : "1.1rem",
        color: isHexColorLight(stateColor) ? "black" : "white"
        }}><div className="flex"><div>{titleFormat(stateName)}</div>
            <div>{isSuccessPermissions && allowUpdate && permissions.state_change ? <StateSelectionMenu current_state_tag={state} onSelection={handleStateChange} /> : null }</div></div>
    </div></div>
}




/**
 * @description Indicates the state of a submission. Each state has different color and an associated name. The state itself is a simple integer. 
 * @param {Object} props 
 * @param {Number} props.state_tag - The state tag to be displayed
 * @param {String} props.padding - Padding CSS class name indicator
 * @returns 
 */
export function StaticStateIndicator({ state_tag, padding = "little" }) {

    const { data : stateName, isSuccess : isSuccessStateName} = api.states.useGetStateName({tag : state_tag}, { enabled : _.isNumber(state_tag) })
    const { data : stateColor, isSuccess : isSuccessStateColor} = api.states.useGetStateColor({tag : state_tag}, { enabled : _.isNumber(state_tag) })



    if (!isSuccessStateName || !isSuccessStateColor) return null 

    return <div className="flex">
        <div className={`flex flex-column center-items div--round padding--${padding}`} style={{
        backgroundColor: stateColor,
        fontSize : "1.1rem",
        color: isHexColorLight(stateColor) ? "black" : "white"
        }}>
            <div className="flex">
                <div>{titleFormat(stateName)}</div>
            </div>
    </div></div>
}