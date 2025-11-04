import { OpenAIChat } from "../core/openai/OpenAIChat";


export function AIPage() {
    return (<div className="no-scroll div--expand" style={{ paddingBottom : "2rem"}   }>
        <div className="flex">
        <div style={{ margin: "2rem", width: "100%", paddingLeft: "2rem", paddingRight: "2rem"}}>
            <OpenAIChat />
        </div>
        </div>
    </div>)
}