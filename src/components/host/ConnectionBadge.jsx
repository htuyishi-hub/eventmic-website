import React from 'react';

export function ConnectionBadge({ state }) {
  const configs = {
    connected: {
      color: 'bg-success',
      text: 'Live'
    },
    connecting: {
      color: 'bg-accent animate-pulse',
      text: 'Connecting'
    },
    reconnecting: {
      color: 'bg-warning animate-pulse',
      text: 'Reconnecting'
    },
    disconnected: {
      color: 'bg-live',
      text: 'Offline'
    }
  };

  const current = configs[state] || configs.disconnected;

  return (
    <div
      role="status"
      aria-label={`Connection status: ${current.text}`}
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-background border border-border text-xs font-semibold text-muted"
    >
      <span className={`w-2 h-2 rounded-full ${current.color}`} />
      <span className="capitalize">{current.text}</span>
    </div>
  );
}
