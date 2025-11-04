
import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { motion } from "framer-motion";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";




/**
 * 
 * @param {Object} props 
 * @param {String} props.tag - The tag of the condition application to be displayed. 
 * @returns 
 */
export function getConditionApplicationText({ condition_applications }) { 
    // const {data: condition_applications} = hooks.condition_applications.useGetConditionApplication({ tag }, { enabled: !!tag })

    const text = _.isArray(condition_applications) ? condition_applications.map(ca => {
        return getConditionApplicationItemText ({ ...ca})
    }) : null

    return _.join(text, " ")
}   
