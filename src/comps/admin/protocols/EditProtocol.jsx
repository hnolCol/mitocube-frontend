import { OptionButton } from "@/comps/core/base/buttons/OptionButton";
import { Callout } from "@blueprintjs/core";
import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { api } from "@/api"; 
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import _ from "lodash"; 

const VIEW_MODES = [{tag : "text", label : "Text"}, {tag : "preview", label : "Preview"}]
const INIT_PROTOCOL = { title: "", text: "", pubmed_id: "", doi: "", url: "" }


export function EditProtocol({protocol_tag, onUpdateSuccess, onClose, refetchTrigger}) {


    const { data: protocolData,  isSuccess, refetch : refetchProtocol } = api.protocols.query.useGetProtocolByTag({ tag: protocol_tag }, { enabled: _.isString(protocol_tag) })
    const { mutate : updateProtocol, isPending, isError, error } = api.protocols.modify.useUpdateProtocol()
    
    useEffect(() => {
        if (isSuccess) {
            setProtocol(protocolData)
        }
    }, [isSuccess, protocol_tag])
    
    useEffect(() => { if (_.isNumber(refetchTrigger)) refetchProtocol() }, [refetchTrigger])

    const handleUpdateProtocol = (updatedProtocol) => {
        updateProtocol({ tag: protocol_tag, ...updatedProtocol }, {
            onSuccess: () => {
                console.log("Protocol updated successfully");
                if (onUpdateSuccess) {
                    onUpdateSuccess();
                    onClose(); // Close the dialog after successful update
                }
            },
            onError: (error) => {
                console.error("Error updating protocol:", error);
            },
        });
    }
    const [protocol, setProtocol] = useState({})
    const [markdownView, setMarkdownView] = useState("text")

    return <div>
        <h3>Edit Protocol</h3>
        <input className="text-input" type="text" placeholder="Title" value={protocol.title} onChange={(e) => setProtocol({ ...protocol, title: e.target.value })} />
        {/* <span>Use markdown style to describe the protocol</span> */}
        <Callout intent="primary" title="Tip">Paste a paper/thesis section to a LLM and ask for a markdown summary.</Callout>
        <div className="flex margin--medium" style={{gap : "1rem"}}>
            {VIEW_MODES.map(option => <OptionButton key={option.tag} isSelected={markdownView === option.tag} onClick={() => setMarkdownView(option.tag)}>{option.label}</OptionButton>)}
            </div>
        <div style={{height : "500px", overflowY : "hidden", border : "1px solid #ccc", padding : "8px"}}>
        {markdownView === "text" && <textarea className="text-input padding--medium" style={{width: "100%", height: "100%"}} placeholder="Enter protocol using markdown style." value={protocol.text} onChange={(e) => setProtocol({ ...protocol, text: e.target.value })} />}
            {markdownView === "preview" &&<div style={{width: "100%", height: "100%", overflowY : "scroll"}} ><Markdown remarkPlugins={[remarkGfm]}>{protocol.text}</Markdown></div>}
        </div>
        <input className="text-input" type="text" placeholder="PubMed ID" value={protocol.pubmed_id} onChange={(e) => setProtocol({ ...protocol, pubmed_id: e.target.value })} />
        <input className="text-input" type="text" placeholder="DOI" value={protocol.doi} onChange={(e) => setProtocol({ ...protocol, doi: e.target.value })} />
        <input className="text-input" type="text" placeholder="URL" value={protocol.url} onChange={(e) => setProtocol({ ...protocol, url: e.target.value })} />
        {isError ? <div>
            <APIAxiosError error={error} />
        </div> : null}
        <div className="flex center-items justify-end" style={{gap : "1rem", marginTop : "1rem"}}>
            <button disabled={isPending} className="basic-button basic-button--highlighted" onClick={() => handleUpdateProtocol(protocol)}>{isPending ? "Updating..." : "Update"}</button>
            <button disabled={isPending} className="basic-button" onClick={() => setProtocol(INIT_PROTOCOL)}>Reset</button>
            <button disabled={isPending} className="basic-button" onClick={() => { onClose(); }}>Cancel</button>
        </div>
    </div>
}