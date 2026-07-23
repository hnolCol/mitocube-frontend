import { api } from "@/api";
import _ from "lodash";

export function ProtocolMinimalItem({ protocol_tag, onClick }) {
    const { data: protocol } = api.protocols.query.useGetProtocolByTag({ tag: protocol_tag }, { enabled: _.isString(protocol_tag) })
    console.log(protocol, protocol_tag)
    return (
        <button className="flex flex-column padding--medium" style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            background: "#fff",
            width: "100%",
            textAlign: "left"
        }} onClick={onClick}>
            <h4>{protocol?.title || protocol_tag}</h4>
            {/* <p>{protocol?.text?.substring(0, 100) || "No description available."}...</p> */}
        </button>
    )
}