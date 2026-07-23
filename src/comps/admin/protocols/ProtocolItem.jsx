import {api} from"@/api"
import { Checkbox } from "@/comps/core/base/states/Checkbox"
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette"
import _ from "lodash"
import { useState } from "react"
import remarkGfm from 'remark-gfm'
import Markdown from "react-markdown"


export function ProtocolItem({ protocol_tag, selectable = false, isSelected = false, onSelect }) {
    const [descriptionOpen, setDescriptionOpen] = useState(false)
    const { data: protocol } = api.protocols.query.useGetProtocolByTag({ tag: protocol_tag }, { enabled: _.isString(protocol_tag) })
    
    return <div className="margin--little padding--medium" style={{ border: "1px solid #ccc", borderRadius: "4px"}}>
        <div className="flex center-items">{selectable ? <Checkbox checked={isSelected} onChange={() => { onSelect(protocol_tag) }} label={protocol?.title || protocol_tag} /> : null}
            {!selectable ? <h4>{protocol?.title || protocol_tag}</h4> : null}
        </div>
        <div style={{ maxHeight: "23vh", overflowY: "hidden", width: "100%", marginTop: "0.5rem" }}>
        {descriptionOpen ?<div style={{height : "20vh",overflowY : "scroll"}}> <Markdown remarkPlugins={[remarkGfm]}>{protocol?.text || "No description available."}</Markdown> </div> : null}
        <button style={{ background: "none", border: "none", color: HIGHLIGHT_COLOR, cursor: "pointer", padding: 0 }} onClick={() => setDescriptionOpen(!descriptionOpen)}>{descriptionOpen ? "read less" : "read more"}</button> 

        </div>
    </div>
}