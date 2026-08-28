import React from 'react';

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
      padding: '1rem',
      borderRadius: '6px',
      margin: '1rem auto',
      maxWidth: '600px',
      textAlign: 'center',
      border: '1px solid #FCA5A5'
    }}>
      <p style={{ margin: 0, fontWeight: 'bold' }}>⚠️ Error: {message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          style={{ marginTop: '0.5rem', padding: '0.25rem 0.75rem', cursor: 'pointer' }}
        >
          Retry Loading
        </button>
      )}
    </div>
  );
}