import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { StateIndicator } from "../../core/base/states/SubmssionState"
import PropTypes from "prop-types";

export function AttributeMinState({ tag }) {
   
    const { data: min_state, isSuccess } = hooks.attributes.useGetAttributeMinState({ tag }, { enabled: tag && tag.length > 0 });
    const { data: state_color } = hooks.states.useGetStateColor({ tag: min_state }, { enabled: _.isNumber(min_state) && isSuccess , staleTime : Infinity});
    
    return (
        <div>{isSuccess && min_state && _.isNumber(min_state) ? <div style={{borderLeft : `4px solid ${state_color}`}}><span>State</span></div> : null}</div>
    )
}