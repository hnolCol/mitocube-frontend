import { api } from "@/api";
import _ from "lodash";
import { motion } from "framer-motion";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";

export function ProtocolMinimalItem({ protocol_tag, onClick }) {
    const { data: protocol } = api.protocols.query.useGetProtocolByTag({ tag: protocol_tag }, { enabled: _.isString(protocol_tag) })
    console.log(protocol, protocol_tag)
    return (
        <motion.button className="flex flex-column padding--medium"
            style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                background: "#fff",
                width: "100%",
                textAlign: "left",
                color : "#000",
            }}
            whileHover={{ color: HIGHLIGHT_COLOR, backgroundColor: "#f9fafb" }}
            onClick={onClick}>
            
            <h4>{protocol?.title || protocol_tag}</h4>
            {/* <p>{protocol?.text?.substring(0, 100) || "No description available."}...</p> */}
            
        </motion.button>
    )
}