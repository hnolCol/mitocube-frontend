import _ from "lodash"
import { motion, useAnimation } from "framer-motion"
import { useState } from "react"
import { titleFormat } from "../../../services/format/string"
import { isHexColorLight } from "../../../services/colors"
import { Icon } from "@blueprintjs/core"

export function StateFilterButton({ states, stateName, setSubmissionFilter, submissionFilter ,numberSubmissionWithTag = undefined }) {
    const state = states.states[stateName]
    
    const stateFilterActive = _.has(submissionFilter, "states") && submissionFilter.states.size > 0

    const isStateFilter = stateFilterActive ? submissionFilter.states.has(state) : false    
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
	const divAnimationControls = useAnimation();
	const divAnimationVariants = {
	    init: {
            opacity: 0,
            width : "0rem"
            
	    },
	    anim: {
            opacity: 0.8,
            width: "1.3rem",
            
		transition: {
            type: "linear"
	      },
	    }
    }
    
    const handleClick = () => {
        let statesForFiltering = stateFilterActive? submissionFilter.states: new Set()
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
        className = "submssion__filter__button margin--very-little"
        style={{
            backgroundColor: states.colors[stateName],
            opacity : !isStateFilter && stateFilterActive ? 0.3 : 1.0,
            color: isHexColorLight(states.colors[stateName]) ? "black" : "white"
        }}
       // whileHover={{ opacity: 1.0 }}
        onHoverStart={() => {
            if (!isAnimationPlaying) {
                setIsAnimationPlaying(true)
                divAnimationControls.start(divAnimationVariants.anim)}
        }}
        onHoverEnd={() => {
            divAnimationControls.start(divAnimationVariants.init)
        }}
        >
        <div className="flex justify-space-between">
        <div className="padding--little">
            {titleFormat(stateName)}{_.isNumber(numberSubmissionWithTag)?` (${numberSubmissionWithTag})`:""}
        </div>
        <motion.div style={{opacity : 0, width : "0rem"}} onAnimationComplete={() => {
            setIsAnimationPlaying(false)
            }} animate={divAnimationControls}>
                <div className="flex center-items" style={{ height: "100%" }}>
                    <div><Icon icon={isStateFilter ? "filter-remove" : "filter-keep"}/>
                    </div>
                </div>
        </motion.div>
        </div>
    </motion.button>

}



export function StateSelection({states, setSubmissionFilter, submissionFilter, submissionsByState}) {

    return (
        <div className="flex flex-column">
            <h3>States</h3>
            {Object.keys(states.states).map(stateName => {
                const state = states.states[stateName]
                const numSubmssionsInState = _.has(submissionsByState,state)?submissionsByState[state].length:0
                return <StateFilterButton
                numberSubmissionWithTag={numSubmssionsInState}
                key={stateName}
                {...{ submissionFilter, setSubmissionFilter, stateName, states }} />})}
        </div>
    )
}