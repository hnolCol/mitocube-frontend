

import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { motion } from "framer-motion";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";
import { Protein } from "../protein/Protein";
import { GenotypeText } from "../../../admin/genotypes/GentotypeText";
import { api } from "@/api";
import { Attribute } from "../attributes/Attribute";
import { AttributeAbbreviation } from "../attributes/AttributeAbbreviation";

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
export function ConditionApplicationItem({ attribute_tag, trait_tag, children, value, add_separator = false, show_attribute = false }) { 
   
    const { data: trait_text } = api.traits.queryTraits.useGetTraitText({ tag: trait_tag }, { enabled: _.isString(trait_tag), staleTime: Infinity });
    const { data: attribute } = api.attributes.queryAttributes.useGetAttribute({ tag: attribute_tag }, { enabled: _.isString(attribute_tag), staleTime: Infinity })
    const is_protein = _.isObject(attribute) && attribute.tag === "att_protein"
    const valid_value = _.isString(value) && value.length > 0 && (_.isObject(attribute) && attribute.allow_input)

    return (
        <div className={`flex ${show_attribute ? "flex-column" : ""}`} style={{ gap: "0.1rem" }}>
            <div className="flex center-items">
                {/* <div> */}
                    {show_attribute && _.isObject(attribute) ? <span><strong>{attribute.text}:</strong>&nbsp;</span> : null}
                    {value ? is_protein ? 
                        value.split("||").filter(Boolean).map((protein_tag, idx) => (
                            <span key={protein_tag} className="flex center-items">
                                {idx > 0 ? <span>,&nbsp;</span> : null}
                                <Protein minimal tag={protein_tag} />
                            </span>
                        )) 
                        : valid_value ? <div><AttributeAbbreviation attribute_tag={attribute_tag} />={value}</div> : null : null} {add_separator && valid_value ? <div>,</div> : null}
                    {is_protein || (_.isObject(attribute) && attribute.allow_input && !valid_value) ? null : <span style={{marginLeft : "0.1rem"}}>{trait_text}</span>} 
                    
                {/* </div> */}
                </div>
                
                {_.isArray(children) && children.length > 0 ? <div className="flex center-items" style={{ gap: "0.1rem"}}>
                {show_attribute ? null : <div>(</div>}
                <div className={"flex"} style={{ gap: "0.2rem", marginLeft : show_attribute ? "1.2rem" : "0.1rem" , flexWrap: "wrap" }}>
                    {children.map((child, idx) =>
                        <ConditionApplicationItem key={`${child.trait_tag}-${idx}`} {...child} add_separator={idx < children.length - 1} show_attribute={show_attribute} />)}
                </div>
                {show_attribute ? null : <div>)</div>}
                
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
    const { data : isGenotype, isSuccess } = api.genotypes.queryGenotypes.useGetGenotypeExists({tag}, { enabled: _.isString(tag) && tag.length > 0 })
    const { data: condition_applications } = api.condition_applications.useGetConditionApplication({ tag }, { enabled: !!tag && _.isString(tag) && isSuccess && !isGenotype })
    

    return (<motion.div>  
        {_.isArray(condition_applications) && !isGenotype ? condition_applications.map(ca => {
            return <div key={`${ca.trait_tag}-${ca.attribute_tag}-${ca.value}`} className="padding--little margin--small">
                
                <ConditionApplicationItem {...ca} add_separator={add_separator} show_attribute={show_attribute} />

            </div>
        }) : isGenotype ? <div className="padding--little margin--small"><GenotypeText tag={tag} /></div> : null}
    </motion.div>)
}   
