import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { titleFormat } from "../../../services/format/string"
import { isHexColorLight } from "../../../services/colors"
import { Divider } from "@blueprintjs/core"
import { useGetSubmissionsCount } from "../../../hooks/queries/submission.hooks"


export function StateFilterButton({ states, stateName, setSubmissionFilter, submissionFilter, onHoverStart  }) {
    const state = states.states[stateName]
    
    const stateFilterActive = _.has(submissionFilter, "states") && submissionFilter.states.size > 0

    const isStateFilter = stateFilterActive ? submissionFilter.states.has(state) : false    
    
    const handleClick = () => {
        let statesForFiltering = stateFilterActive ? submissionFilter.states : new Set()
        if (!stateFilterActive) {
            statesForFiltering.add(state)
        }
        else if (isStateFilter) {
            statesForFiltering.delete(state)
        }
        else {
            statesForFiltering.add(state)
        }

        setSubmissionFilter(prevValues => {return {...prevValues,states : statesForFiltering}})
    }

    return <motion.button
        onClick={handleClick}
        className="state__filter__button margin--very-little flex center-items justify-center"
        whileHover={{color: "#000",backgroundColor:"#fafafa"}}
        transition={{ duration: 0.1 }}
        onHoverStart={_.isFunction(onHoverStart) ? () => onHoverStart(state) : undefined}
        onHoverEnd={_.isFunction(onHoverStart) ? () => onHoverStart(undefined) : undefined}
        style={{
            backgroundColor: states.colors[stateName],
            opacity : !isStateFilter && stateFilterActive ? 0.3 : 1.0,
            color: isHexColorLight(states.colors[stateName]) ? "#000" : "#fff"
        }}>
        <div>
                {stateName[0].toUpperCase()} 
                {/* {_.isNumber(numberSubmissionWithTag)?` (${numberSubmissionWithTag})`:"" */}
        </div>
        {/* <motion.div style={{opacity : 0, width : "0rem"}} onAnimationComplete={() => {
            setIsAnimationPlaying(false)
            }} animate={divAnimationControls}>
                <div className="flex center-items" style={{ height: "100%" }}>
                    <div><Icon icon={isStateFilter ? "filter-remove" : "filter-keep"}/>
                    </div>
                </div>
        </motion.div> */}
       
    </motion.button>

}



export function StateSelection({states, setSubmissionFilter, submissionFilter}) {
    const [hoverState, setHoverState] = useState("")
    const { data, isLoading, isFetching, isSuccess } = useGetSubmissionsCount({group:"state"})

    return (
        <div className="intent-margin-top--little">
            <h4>States</h4>
            <div className="flex flex--wrap">
            {Object.keys(states.states).map(stateName => {
                return <StateFilterButton
                        key={stateName}
                        onHoverStart={setHoverState}
                        {...{ submissionFilter, setSubmissionFilter, stateName, states }} />
            })}
                <div className="flex center-items intent-margin-left--little">
                    <div>{isSuccess && hoverState ? `${titleFormat(states.states_inv[hoverState])} ${_.has(data, hoverState) ? `(${data[hoverState].submission_count})` : ""}` : null}</div>
                </div>
            </div>
            
            <Divider />
            </div>
    )
}