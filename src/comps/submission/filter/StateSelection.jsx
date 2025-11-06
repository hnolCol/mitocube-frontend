import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { titleFormat } from "../../../services/format/string"
import { isHexColorLight } from "../../../services/colors"
import { Divider } from "@blueprintjs/core"
import { useGetSubmissionsCount } from "../../../hooks/queries/submission.hooks"

import hooks from "@mitocube/api-hooks"


export function StateSelection({ setSubmissionFilter, submissionFilter}) {
    const [hoverState, setHoverState] = useState("")

    const { data: submissionStates } = hooks.submissions.states.useGetStates()
    

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
            </div>
            <Divider />
            </div>
    )
}