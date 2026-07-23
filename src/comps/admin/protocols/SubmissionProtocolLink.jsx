
import { api } from "@/api"
import { useState } from "react"
import { ProtocolItem } from "./ProtocolItem"
import _ from "lodash"

export function SubmissionProtocolLink({ submission_tag, selected_protocol_tags = [], onChange, onDone }) { 
    
    const [searchString, setSearchString] = useState({ search_string: "" })
    const { data: protocol_tags } = api.protocols.query.useGetProtocolsByQuery({ search_string: searchString.search_string, limit : 30 }, { enabled: _.isString(submission_tag) })
    

    const handleSelectProtocol = (protocol_tag) => {
        if (_.isFunction(onChange)) { 
            onChange(protocol_tag)
        }
    }

    return <div className="flex flex-column" style={{ overflowY: "scroll", width: "95%" }}>
        <span>Select protocol to link them to the submission.</span>
        <div style={{marginRight : "0.5rem"}}><input className="text-input padding--tiny margin--tiny" type="text" placeholder="Search protocols..." value={searchString.search_string} onChange={(e) => setSearchString({ search_string: e.target.value })} style={{ width: "100%" }} /></div>
        <div style={{height : "45vh", overflowY: "scroll"}}>
        {protocol_tags?.map(protocol_tag => { 
            return <ProtocolItem selectable={true}
                isSelected={selected_protocol_tags.includes(protocol_tag)}
                protocol_tag={protocol_tag}
                onSelect={() => handleSelectProtocol(protocol_tag)} />
        })}
        </div>
        <div className="flex center-items justify-end" style={{marginTop : "0.5rem"}}>
            <button className="dialog-button" onClick={onDone}>Done</button>
        </div>
    </div>
}