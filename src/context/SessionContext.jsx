import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { useTransport } from './TransportContext.jsx';

const SessionContext = createContext(null);

const initialState = {
  session: null,
  queue: [],
  floor: null,
  level: 0,
  attendeeCount: 0,
  selfState: 'listening', // 'listening' | 'hand_raised' | 'on_air'
  error: null,
  isMuted: false,
};

function sessionReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'SET_FLOOR':
      return { ...state, floor: action.payload };
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'SET_ATTENDEES':
      return { ...state, attendeeCount: action.payload.count };
    case 'SET_SELF':
      return { ...state, selfState: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function SessionProvider({ children }) {
  const { transport } = useTransport();
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  useEffect(() => {
    if (!transport) return;

    const unsubs = [
      transport.on('session', (session) => dispatch({ type: 'SET_SESSION', payload: session })),
      transport.on('queue', (queue) => dispatch({ type: 'SET_QUEUE', payload: queue })),
      transport.on('floor', (floor) => dispatch({ type: 'SET_FLOOR', payload: floor })),
      transport.on('level', (level) => dispatch({ type: 'SET_LEVEL', payload: level })),
      transport.on('attendees', (data) => dispatch({ type: 'SET_ATTENDEES', payload: data })),
      transport.on('self', (selfState) => dispatch({ type: 'SET_SELF', payload: selfState })),
      transport.on('error', (err) => dispatch({ type: 'SET_ERROR', payload: err })),
    ];

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [transport]);

  const createSession = useCallback(async ({ name }) => {
    dispatch({ type: 'CLEAR_ERROR' });
    return transport.createSession({ name });
  }, [transport]);

  const endSession = useCallback(async () => {
    return transport.endSession();
  }, [transport]);

  const connect = useCallback(async ({ role, code, name }) => {
    dispatch({ type: 'CLEAR_ERROR' });
    return transport.connect({ role, code, name });
  }, [transport]);

  const disconnect = useCallback(async () => {
    return transport.disconnect();
  }, [transport]);

  const raiseHand = useCallback(async () => {
    return transport.raiseHand();
  }, [transport]);

  const lowerHand = useCallback(async () => {
    return transport.lowerHand();
  }, [transport]);

  const grant = useCallback(async (attendeeId) => {
    return transport.grant(attendeeId);
  }, [transport]);

  const revoke = useCallback(async (attendeeId) => {
    return transport.revoke(attendeeId);
  }, [transport]);

  const muteSpeaker = useCallback(async (muted) => {
    dispatch({ type: 'SET_MUTED', payload: muted });
    return transport.muteSpeaker(muted);
  }, [transport]);

  const sendLevel = useCallback(async (level) => {
    return transport.sendLevel(level);
  }, [transport]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    createSession,
    endSession,
    connect,
    disconnect,
    raiseHand,
    lowerHand,
    grant,
    revoke,
    muteSpeaker,
    sendLevel,
    clearError
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
