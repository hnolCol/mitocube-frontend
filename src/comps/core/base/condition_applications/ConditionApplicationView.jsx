

import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { motion } from "framer-motion";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";


export function ConditionApplicationItem({tag, attribute_tag, trait_tag, children, value, add_separator = false}) { 

    const { data: trait_text } = hooks.traits.useGetTraitText({ tag: trait_tag }, { enabled: !!trait_tag })
    return (<div className="flex" style={{ gap: "0.1rem" }}>
        <div className="flex center-items">
                {value ? <div>{value}</div> : null} 
            {trait_text}
            {add_separator ? <div>,</div> : null}
        </div>
        
        {_.isArray(children) && children.length > 0 ? <div className="flex" style={{ gap: "0.1rem" }}>
            <div>(</div>
            {children.map((child, idx) =>
                <ConditionApplicationItem key={child.trait_tag} {...child} add_separator={idx < children.length - 1} />)}
         <div>)</div>
        </div>
            : null}
        
    </div>)
}


/**
 * 
 * @param {Object} props 
 * @param {String} props.tag - The tag of the condition application to be displayed. 
 * @returns 
 */
export function ConditionApplicationsView({ tag }) { 
    const {data: condition_applications} = hooks.condition_applications.useGetConditionApplication({ tag }, { enabled: !!tag })

    return (<motion.div whileHover={{color:HIGHLIGHT_COLOR}} style={{ backgroundColor: "#efefef", color : "#000000"}}>
        {_.isArray(condition_applications) ? condition_applications.map(ca => {
            return <div key={ca.tag}>

                <ConditionApplicationItem {...ca} />

            </div>
        }) : null}
    </motion.div>)
}   
