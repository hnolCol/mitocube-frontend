import { api } from "@/api"
import _ from "lodash" 
import { motion } from "framer-motion"
import PropTypes from "prop-types";
import { Code } from "@blueprintjs/core";
import { AttributeMinState } from "./AttributeMinState";
import { useNavigate } from "react-router";
import { useState } from "react";
import { TraitCount } from "./TraitCount";



AdminAttributeItem.propTypes = {
    tag: PropTypes.string.isRequired
};

/**
 * AdminAttributeItem component 
 * @param {Object} props 
 * @param {String} props.tag - attribute tag 
 * @returns {JSX.Element} The attribute item component  
 */
export function AdminAttributeItem({ tag }) {
    const redirect = useNavigate()
    const [mouseIsOver, setMouseIsOver] = useState(false)
    const { data: attribute, isSuccess } = api.attributes.queryAttributes.useGetAttribute({ tag }, { enabled: tag && tag.length > 0 });
    return (
        <motion.button
            className="items-center"
            onMouseEnter={(e) => setMouseIsOver(true)}
            onMouseLeave={(e) => setMouseIsOver(false)}
            style={{
                display: "grid",
                backgroundColor: "#fff",
                border: "none",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: "16px",
                width: "100%",
                textAlign: "left",
                padding: "2px",
            }}
            whileHover={{ backgroundColor: "#e0e0e0" }}
            transition={{ duration : 0.1}}
            onClick={() => redirect(`/admin/attributes/${tag}`)}
        >
            {_.isObject(attribute) && isSuccess && attribute.text && (
                <>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {attribute.text}
                    </span>
                    <div>{mouseIsOver ? <TraitCount tag={tag} text="Traits" /> : null}</div>
                    <div>
                        {mouseIsOver ? <AttributeMinState tag={tag} /> : null}
                    </div>
                    {/* <span>{attribute.attribute_group}</span> */}
                    <div>{mouseIsOver ? <div>allow input: <Code>{attribute.allow_input ? "TRUE" : "FALSE"}</Code></div>    : null}</div>
                    <div>{mouseIsOver ? <span>priority: {attribute.priority}</span> : null}</div>
                </>
            )}
        </motion.button>
    )
}