import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext.jsx';
import { useTransport } from '../context/TransportContext.jsx';
import { isValidSessionCode, getOrCreateAttendeeId } from '../lib/ids.js';
import { JoinScreen } from '../components/attendee/JoinScreen.jsx';
import { ListeningScreen } from '../components/attendee/ListeningScreen.jsx';
import { HandRaisedScreen } from '../components/attendee/HandRaisedScreen.jsx';
import { OnAirScreen } from '../components/attendee/OnAirScreen.jsx';
import { EndedScreen } from '../components/attendee/EndedScreen.jsx';
import { ErrorScreen } from '../components/attendee/ErrorScreen.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';

const NAME_STORAGE_KEY = 'eventmic_attendee_name';

export function JoinPage() {
  const { code: rawCode } = useParams();
  const navigate = useNavigate();
  const code = (rawCode || '').trim().toUpperCase();

  const {
    session,
    queue,
    floor,
    selfState,
    error,
    connect,
    raiseHand,
    lowerHand,
    sendLevel,
    clearError
  } = useSession();

  const { connectionState } = useTransport();

  const [hasJoined, setHasJoined] = useState(false);
  const [attendeeName, setAttendeeName] = useState(() => {
    try {
      return localStorage.getItem(NAME_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [toastMessage, setToastMessage] = useState('');
  const [micDeniedError, setMicDeniedError] = useState(false);

  const prevSelfStateRef = useRef(selfState);
  const myId = getOrCreateAttendeeId();

  // Validate session code format
  const isCodeFormatValid = isValidSessionCode(code);

  // Initial connect when code is valid
  useEffect(() => {
    if (!isCodeFormatValid) return;

    connect({
      role: 'attendee',
      code,
      name: attendeeName || 'Attendee'
    });
  }, [code, isCodeFormatValid, connect]);

  // Detect when host revokes the attendee's turn
  useEffect(() => {
    if (prevSelfStateRef.current === 'on_air' && selfState !== 'on_air') {
      setToastMessage('The host ended your turn.');
    }
    prevSelfStateRef.current = selfState;
  }, [selfState]);

  // Handle user completing JoinScreen
  const handleJoinSubmit = async (enteredName) => {
    setAttendeeName(enteredName);
    setHasJoined(true);
    await connect({
      role: 'attendee',
      code,
      name: enteredName
    });
  };

  // Re-attempt connecting
  const handleRetry = () => {
    clearError();
    setMicDeniedError(false);
    connect({
      role: 'attendee',
      code,
      name: attendeeName || 'Attendee'
    });
  };

  // 1. Invalid Room Code
  if (!isCodeFormatValid) {
    return (
      <ErrorScreen
        variant="INVALID_CODE"
        onBack={() => navigate('/')}
      />
    );
  }

  // 2. Microphone Permission Denied
  if (micDeniedError) {
    return (
      <ErrorScreen
        variant="MIC_DENIED"
        onRetry={() => {
          setMicDeniedError(false);
          // Return to listening or raise hand
          lowerHand();
        }}
        onBack={() => navigate('/')}
      />
    );
  }

  // 3. Transport or Session Errors
  if (error) {
    return (
      <ErrorScreen
        variant={error.code || 'UNKNOWN'}
        message={error.message}
        onRetry={handleRetry}
        onBack={() => navigate('/')}
      />
    );
  }

  // 4. Session Ended Screen
  if (session?.status === 'ended') {
    return <EndedScreen session={session} />;
  }

  // 5. Initial Join Screen (Gather Display Name)
  if (!hasJoined) {
    return (
      <JoinScreen
        session={session}
        initialCode={code}
        onJoin={handleJoinSubmit}
      />
    );
  }

  // Calculate position in queue
  const queueIndex = queue.findIndex(item => item.id === myId);
  const queuePosition = queueIndex !== -1 ? queueIndex + 1 : 1;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Reconnecting Banner */}
      {connectionState === 'reconnecting' && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 px-4 py-2 bg-warning text-black text-xs font-bold shadow-md">
          <Spinner size="sm" className="border-t-black border-r-black/20" />
          <span>Reconnecting to host...</span>
        </div>
      )}

      {/* Screen Routing based on selfState */}
      {selfState === 'on_air' ? (
        <OnAirScreen
          session={session}
          onStopSpeaking={() => lowerHand()}
          onMicError={() => setMicDeniedError(true)}
          sendLevel={sendLevel}
        />
      ) : selfState === 'hand_raised' ? (
        <HandRaisedScreen
          session={session}
          queuePosition={queuePosition}
          onLowerHand={() => lowerHand()}
        />
      ) : (
        <ListeningScreen
          session={session}
          attendeeName={attendeeName}
          onRaiseHand={() => raiseHand()}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}
