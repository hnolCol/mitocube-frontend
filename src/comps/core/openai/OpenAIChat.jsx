import React, { useState } from 'react';
import hooks from "@mitocube/api-hooks"


export function OpenAIChat() {
    const [prompt, setPrompt] = useState('');


    const { data, error, isLoading, refetch } = hooks.openai.useGetCypherQuery({ prompt }, {enabled: false});
    console.log("OpenAI Response:", data, error, isLoading);

    const handleInputChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleSend = () => {
        if (prompt.trim()) {
            refetch();
            setPrompt('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <input
                type="text"
                value={prompt}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your prompt..."
                style={{ flex: 1, padding: '8px' }}
            />
            <button onClick={handleSend} disabled={!prompt.trim()}>
                Send
            </button>
        </div>
    );
};

