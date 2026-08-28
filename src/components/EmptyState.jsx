import React from 'react';

export default function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
      <h3 style={{ margin: 0 }}>No Tasks Found</h3>
      <p style={{ marginTop: '0.5rem' }}>{message || 'No tasks match current filters or search terms.'}</p>
    </div>
  );
}