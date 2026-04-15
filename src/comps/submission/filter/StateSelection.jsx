import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { isHexColorLight } from "../../../services/colors"
import { Divider } from "@blueprintjs/core"
import { api } from "@/api"

export function StateFilterButton({ tag, setSubmissionFilter, submissionFilter, onHoverStart }) {

    const { data: stateName } = api.states.useGetStateName({ tag })
    const { data: stateColor } = api.states.useGetStateColor({ tag })
    
    const stateFilterActive = _.has(submissionFilter, "states") && submissionFilter.states.size > 0
    const isStateFilter = stateFilterActive ? submissionFilter.states.has(tag) : false
    


    const handleClick = () => {
        let statesForFiltering = stateFilterActive ? submissionFilter.states : new Set()
        if (!stateFilterActive) {
            statesForFiltering.add(tag)
        }
        else if (isStateFilter) {
            statesForFiltering.delete(tag)
        }
        else {
            statesForFiltering.add(tag)
        }

        setSubmissionFilter(prevValues => { return { ...prevValues, states: statesForFiltering } })
    }

    return _.isString(stateColor) && _.isString(stateName) ? <motion.button
        onClick={handleClick}
        className="state__filter__button margin--very-little flex center-items justify-center"
        whileHover={{ color: "#000", backgroundColor: "#fafafa" }}
        transition={{ duration: 0.1 }}
        onHoverStart={_.isFunction(onHoverStart) ? () => onHoverStart(tag) : undefined}
        onHoverEnd={_.isFunction(onHoverStart) ? () => onHoverStart(undefined) : undefined}
        style={{
            backgroundColor: stateColor,
            opacity: !isStateFilter && stateFilterActive ? 0.3 : 1.0,
            color: isHexColorLight(stateColor) ? "#000" : "#fff"
        }}>
        <div>
            {stateName[0].toUpperCase()}
            {/* {_.isNumber(numberSubmissionWithTag)?` (${numberSubmissionWithTag})`:"" */}
        </div>

       
    </motion.button> : null

}



export function StateSelection({ setSubmissionFilter, submissionFilter}) {
    const [hoverState, setHoverState] = useState("")
   

    const { data: submissionStates } = api.submissions.states.useGetStates()
    

    return (
        <div className="margin-top--little">
            <h4>States</h4>
            <div className="flex flex--wrap">
            {_.isArray(submissionStates) && submissionStates.map(state_tag => {
                return <StateFilterButton
                    key={state_tag}
                    tag={state_tag}
                    onHoverStart={setHoverState}
                    {...{ submissionFilter, setSubmissionFilter}} />
            })}
                {/* <div className="flex center-items margin-left--little">
                    <div>{isSuccess && hoverState ? `${titleFormat(states.states_inv[hoverState])} ${_.has(data, hoverState) ? `(${data[hoverState].submission_count})` : ""}` : null}</div>
                </div> */}
            </div>
            
            <Divider />
            </div>
    )
}