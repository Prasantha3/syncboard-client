import React from 'react';

export function OfflineBadge({ isOffline }) {
  if (!isOffline) return null;
  return (
    <div style={{ padding: '8px 16px', backgroundColor: '#e67e22', color: '#fff', borderRadius: '4px', marginBottom: '10px' }}>
      ⚠️ Offline Mode — Displaying cached local data from PouchDB
    </div>
  );
}

export function ConflictModal({ conflict, onResolve }) {
  if (!conflict) return null;

  return (
    <div className="modal-backdrop" style={{ background: 'rgba(0,0,0,0.7)', position: 'fixed', inset: 0, display: 'grid', placeItems: 'center' }}>
      <div style={{ background: '#1e1e1e', padding: '24px', borderRadius: '8px', maxWidth: '500px', color: '#fff' }}>
        <h3>⚠️ 409 Conflict Detected</h3>
        <p>This task was updated by another user while you were editing.</p>
        
        <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
          <div style={{ flex: 1, border: '1px solid #ff4d4f', padding: '12px', borderRadius: '4px' }}>
            <h4>Your Local Version</h4>
            <pre>{JSON.stringify(conflict.yourVersion, null, 2)}</pre>
          </div>
          
          <div style={{ flex: 1, border: '1px solid #52c41a', padding: '12px', borderRadius: '4px' }}>
            <h4>Server Version</h4>
            <pre>{JSON.stringify(conflict.current, null, 2)}</pre>
          </div>
        </div>

        <button onClick={() => onResolve(conflict.current)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Accept Server Version
        </button>
      </div>
    </div>
  );
}