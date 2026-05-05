import { useEffect, useState } from 'react';
import { api } from '@/api';
import _ from 'lodash';
import { OpenAIWarning } from './OpenAIWarning';
import { OpenAIChatView } from './ChatView';
import { HIGHLIGHT_COLOR } from '../colors/colorPalette';

export function OpenAIChat() {
    const [prompt, setPrompt] = useState({ prompt: '', session_id: undefined, response: '', session_messages: [] });
    const { data : ai_response, isLoading, refetch, isError, error, isSuccess } = api.openai.cyper.useGetCypherQuery({ prompt: prompt.prompt, session_id: prompt.session_id },
        {
            enabled: false,
        });
    useEffect(() => {
        if (isSuccess) {
            setPrompt(prevValues => {
                return {
                    ...prevValues,
                    session_id: ai_response.session_id,
                    response: ai_response.response,
                    session_messages: ai_response.session_messages
                }
            })
        }
    }, [isSuccess]);
    const handleInputChange = (e) => {
        setPrompt(prevValues => { return { ...prevValues, prompt: e.target.value } });
    };

    const handleSend = () => {
        if (prompt.prompt.trim()) {
            refetch()
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const buttonDisabled = !prompt.prompt.trim();

    return (
        <div
            style={{
                display: 'grid',
                // vertical layout: top = controls (auto height), bottom = chat view (takes remaining space)
                gridTemplateRows: 'auto 1fr',
                gap: '5px',
                width: '100%',
                marginTop: '15px',
                alignItems: 'start',
                height: '90vh',
                // backgroundColor: 'yellow'
            }}
        >
            {/* Top: Input + controls */}
            <div style={{gridRow: '1', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #e0e0e0'}}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={prompt.prompt}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your prompt..."
                        style={{
                            flex: 1,
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(0,0,0,0.08)',
                            background: 'rgba(255,255,255,0.97)',
                            boxShadow: 'inset 0 1px 2px rgba(16,24,40,0.03)',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={buttonDisabled}
                        aria-label="Send prompt"
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            color: buttonDisabled ? '#00000030' : '#fff',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: buttonDisabled ? '#e0e0e0' : HIGHLIGHT_COLOR,
                            boxShadow: buttonDisabled ? 'none' : '0 8px 24px rgba(79,70,229,0.18)',
                            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
                            transition: 'transform .12s ease, box-shadow .12s ease, opacity .12s ease',
                            opacity: buttonDisabled ? 0.7 : 1,
                            minWidth: 88
                        }}
                        onMouseDown={(e) => {
                            if (!buttonDisabled) e.currentTarget.style.transform = 'translateY(1px)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ display: 'block' }}
                        >
                            <path d="M22 2L11 13" stroke={buttonDisabled ? '#9aa0b4' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={buttonDisabled ? '#9aa0b4' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        <span>Send</span>
                    </button>
                </div>

                <div className='flex flex-column' style={{ gap: 4, flexWrap: 'wrap' }}>
                    {isLoading ? <div className='font-size--smallest'><span>Waiting for response..</span></div> : null}
                    <OpenAIWarning />
                    {isError ? <div>Error: {error.message}</div> : null}
                </div>
            </div>

            {/* Bottom: Chat view - takes remaining space */}
            <div style={{ gridRow: '2', overflow: 'hidden', paddingBottom : "20px", height : "100%" }}>
                    {_.isObject(prompt) && _.isArray(prompt.session_messages) ? (
                        <OpenAIChatView
                            session_messages={prompt.session_messages}
                            session_id={prompt.session_id}
                        />
                    ) : null}
                </div>
        </div>
    )
}