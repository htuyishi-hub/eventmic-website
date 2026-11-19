import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createTransport } from '../transport/index.js';

const TransportContext = createContext(null);

export function TransportProvider({ children, transportInstance }) {
  const transport = useMemo(() => transportInstance || createTransport(), [transportInstance]);
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    const unsub = transport.on('connection', (state) => {
      setConnectionState(state);
    });
    return () => {
      unsub();
      transport.disconnect().catch(() => {});
    };
  }, [transport]);

  const value = useMemo(() => ({
    transport,
    connectionState
  }), [transport, connectionState]);

  return (
    <TransportContext.Provider value={value}>
      {children}
    </TransportContext.Provider>
  );
}

export function useTransport() {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within a TransportProvider');
  }
  return context;
}
