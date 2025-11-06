import { OpenAIChat } from "../core/openai/OpenAIChat";

/**
 * AI Page Component. Allows to interact with an AI Chat interface. 
 * @returns {JSX.Element}
 */
export function AIPage() {
    return (<div className="no-scroll div--expand" style={{ paddingBottom : "2rem"}   }>
        <div className="flex">
        <div style={{ margin: "2rem", width: "100%", paddingLeft: "2rem", paddingRight: "2rem"}}>
            <OpenAIChat />
        </div>
        </div>
    </div>)
}