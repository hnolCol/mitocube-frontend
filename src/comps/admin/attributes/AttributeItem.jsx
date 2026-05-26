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
        <motion.div
            onMouseEnter={() => setMouseIsOver(true)}
            onMouseLeave={() => setMouseIsOver(false)}
            style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: "16px",
                alignItems: "center",
                width: "100%",
                padding: "8px 12px",
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: "#fff",
                cursor: "pointer",
            }}
            whileHover={{ backgroundColor: "#f5f5f5" }}
            transition={{ duration: 0.1 }}
            onClick={() => redirect(`/admin/attributes/${tag}`)}
        >
            {_.isObject(attribute) && isSuccess && (
                <>
                    <span style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                    }}>
                        {attribute.text}
                    </span>
                    <div>{mouseIsOver ? <TraitCount tag={tag} text="Traits" /> : null}</div> 
                    <div>{mouseIsOver ? <AttributeMinState tag={tag} /> : null}</div>
                    <div>{mouseIsOver ? <div>allow input: <Code>{attribute.allow_input ? "TRUE" : "FALSE"}</Code></div> : null}</div>
                    <div>{mouseIsOver ? <span>priority: {attribute.priority}</span> : null}</div>
                </>
            )}
        </motion.div>
    )
}