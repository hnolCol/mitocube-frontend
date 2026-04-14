import PropTypes from "prop-types"
import _ from "lodash"
import { isHexColorLight } from "../../../services/colors"
import { titleFormat } from "../../../services/format/string"

import { api } from "@/api"
StateHeader.propTypes = {
    tag: PropTypes.number.isRequired
}

/**
 * 
 * @param {Object} props 
 * @param {String} props.tag The tag of the state to be displayed
 * @description Displays the header for a submission state. It shows the name of the state and
 * applies the appropriate color based on the state.
 * The state is fetched using the hooks from the API.
 * It is used in the submission view to indicate the current state of the submission. 
 * @returns 
 */

export function StateHeader({ tag }) {
    const { data: stateName } = api.states.useGetStateName({ tag })
    const { data: stateColor } = api.states.useGetStateColor({ tag })
    if (!_.isString(stateName) || !_.isString(stateColor)) return null
    return <div className="submission__state__header"
        style={{
            backgroundColor: stateColor,
            color: isHexColorLight(stateColor) ? "black" : "white"
        }}>
        {titleFormat(stateName)}
    </div>
}