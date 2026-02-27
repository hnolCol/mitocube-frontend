import React from 'react';

export function TagLike({ children, onRemove }) {

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#e1e5e9',
            border: '1px solid #c1c7cd',
            borderRadius: '8px',
            padding: '4px 8px',
            fontSize: '14px',
            color: '#495057',
            margin: '2px'
        }}>
            <span style={{ marginRight: onRemove ? '4px' : '0' }}>{children}</span>
            {onRemove && (
                <button 
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#6c757d',
                        cursor: 'pointer',
                        fontSize: '16px',
                        lineHeight: '1',
                        padding: '0',
                        marginLeft: '4px'
                    }}
                    onClick={onRemove}
                    aria-label="Remove tag"
                >
                    ×
                </button>
            )}
        </div>
    );
};
