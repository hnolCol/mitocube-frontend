import { titleFormat } from "./format/string"


export function getStateName({submissionStates,state}) {
    return titleFormat(submissionStates.states_inv[state])
}