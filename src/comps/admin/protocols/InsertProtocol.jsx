import { OptionButton } from "@/comps/core/base/buttons/OptionButton";
import { Callout } from "@blueprintjs/core";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'

const VIEW_MODES = [{tag : "text", label : "Text"}, {tag : "preview", label : "Preview"}]

const INIT_PROTOCOL = {title : "", text : "", pubmed_id : "", doi : "", url : ""}
export function InsertProtocol({isPending, onSubmit, onCancel}) {

    const [protocol, setProtocol] = useState(INIT_PROTOCOL)
    const [markdownView, setMarkdownView] = useState("text")

    return <div>
        <h3>Insert Protocol</h3>
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

        <div className="flex center-items justify-end" style={{gap : "1rem", marginTop : "1rem"}}>
            <button disabled={isPending} className="basic-button basic-button--highlighted" onClick={() => onSubmit(protocol)}>{isPending ? "Submitting..." : "Submit"}</button>
            <button disabled={isPending} className="basic-button" onClick={() => setProtocol(INIT_PROTOCOL)}>Reset</button>
            <button disabled={isPending} className="basic-button" onClick={() => { onCancel(); }}>Cancel</button>
        </div>
    </div>
}