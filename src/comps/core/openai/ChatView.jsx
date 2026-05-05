import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm' 
import _ from "lodash";
import PropTypes
    from "prop-types";
import { useEffect, useRef } from "react";
function AssistantResponse({ message, highlight = false }) {
    return (
        <div className="padding--medium" style={{ marginTop: '20px', whiteSpace: 'pre-wrap', backgroundColor: "#e2dedede", width : "85%", borderLeft : highlight ? "4px solid #466688" : "none", overflowX : "scroll" }}>
            <Markdown remarkPlugins={[remarkGfm]}>
                {message}
            </Markdown>
        </div>
    );
}


OpenAIChatView.propTypes = {
    session_messages: PropTypes.arrayOf(
        PropTypes.shape({
            role: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
        })
    ).isRequired,
};  

export function OpenAIChatView({ session_messages, session_id }) {
    const containerRef = useRef(null);
    const lastAssistantMessageIndex = _.findLastIndex(session_messages, { role: 'assistant' });
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        // instantly scroll to bottom when messages change:
        el.scrollTop = el.scrollHeight;
        // for smooth scrolling use:
        // el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [session_messages]);

    return (
    <div ref={containerRef} style={{ height: "100%", overflowY: 'scroll'}}>
            {session_messages.map((msg, index) => {
                return (<div key={`${session_id}-${index}`} className="margin-bottom--medium">
                    {msg.role === 'user' && (
                        <div className="margin-right--medium flex" key={index} style={{ marginTop: '10px' , justifyContent: "flex-end" }}>
                            <div style={{backgroundColor: "#e0e0e0", padding: "8px", borderRadius: "8px"}}>
                                <strong>User:</strong> {msg.content}
                            </div>
                        </div>
                    )}
                    {msg.role === 'assistant' && (
                        <AssistantResponse key={index} message={msg.content} highlight={lastAssistantMessageIndex === index} />
                    )}
                </div>)
            }  )}
        </div>
    );
}
