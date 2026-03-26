

import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { motion } from "framer-motion";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";
import { Protein } from "../protein/Protein";

/**
 * @description Component to display individual condition application item.
 * @param {Object} props 
 * @param {String} props.tag 
 * @param {String} props.attribute_tag 
 * @param {String} props.trait_tag 
 * @param {Array} props.children Children condition application items.
 * @param {String} props.value The value associated with the trait.
 * @param {boolean} props.add_separator If a separator should be added after the trait.
 * @param {boolean} props.show_attribute If the attribute should be displayed
 * @returns 
 */
export function ConditionApplicationItem({ tag, attribute_tag, trait_tag, children, value, add_separator = false, show_attribute = false }) { 
   
    const { data: trait_text } = hooks.traits.useGetTraitText({ tag: trait_tag }, { enabled: _.isString(trait_tag), staleTime: Infinity });
    const { data: attribute } = hooks.attributes.useGetAttribute({ tag: attribute_tag }, { enabled: _.isString(attribute_tag), staleTime: Infinity })
    const is_protein = _.isObject(attribute) && attribute.tag=== "att_protein"
    return (
        <div className="flex" style={{ gap: "0.1rem" }}>
            <div className="flex center-items">
                {/* <div> */}
                    {show_attribute && _.isObject(attribute) ? <span><strong>{attribute.text}:</strong>&nbsp;</span> : null}
                        {value ? is_protein ? <Protein minimal tag={value}/> : <div>{value}</div> : null} 
                    {is_protein ? null : trait_text} 
                    {add_separator ? <div>,</div> : null}
                {/* </div> */}
                </div>
                
                {_.isArray(children) && children.length > 0 ? <div className="flex center-items" style={{ gap: "0.1rem" }}>
                    <div>(</div>
                    {children.map((child, idx) =>
                        <ConditionApplicationItem key={`${child.trait_tag}-${tag}-${idx}`} {...child} add_separator={idx < children.length - 1} show_attribute={show_attribute} />)}
                <div>)</div>
                </div>
                    : null}
                
        </div>
    )
}


/**
 * @description Component to display condition applications based on the provided tag.
 * @param {Object} props 
 * @param {String} props.tag - The tag of the condition application to be displayed. 
 * @returns 
 */
export function ConditionApplicationsView({ tag, show_attribute = false, add_separator = false }) { 
    const {data: condition_applications} = hooks.condition_applications.useGetConditionApplication({ tag }, { enabled: !!tag && _.isString(tag) })
    return (<motion.div>  
        {_.isArray(condition_applications) ? condition_applications.map(ca => {
            return <div key={ca.tag} className="padding--little margin--small">

                <ConditionApplicationItem {...ca} add_separator={add_separator} show_attribute={show_attribute} />

            </div>
        }) : null}
    </motion.div>)
}   
