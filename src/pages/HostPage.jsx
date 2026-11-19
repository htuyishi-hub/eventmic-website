import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import { PasscodeGate } from '../components/host/PasscodeGate.jsx';
import { CreateSession } from '../components/host/CreateSession.jsx';
import { Dashboard } from '../components/host/Dashboard.jsx';
import { SessionSummary } from '../components/host/SessionSummary.jsx';

const PASSCODE_STORAGE_KEY = 'eventmic_host_unlocked';

export function HostPage() {
  const { session, createSession, connect } = useSession();

  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(PASSCODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [endedStats, setEndedStats] = useState(null);

  const handleStartSession = async ({ name }) => {
    setEndedStats(null);
    await createSession({ name });
  };

  const handleResumeSession = async (savedSession) => {
    setEndedStats(null);
    await connect({
      role: 'host',
      code: savedSession.code,
      name: savedSession.name
    });
  };

  const handleStartNewAfterSummary = () => {
    setEndedStats(null);
    window.location.reload();
  };

  // 1. Passcode Gate Check
  if (!isUnlocked) {
    return <PasscodeGate onUnlocked={() => setIsUnlocked(true)} />;
  }

  // 2. Session Summary after End Session
  if (endedStats) {
    return (
      <SessionSummary
        session={session}
        stats={endedStats}
        onStartNewSession={handleStartNewAfterSummary}
      />
    );
  }

  // 3. Create Session Screen (if no live session)
  if (!session || session.status !== 'live') {
    return (
      <CreateSession
        onStartSession={handleStartSession}
        onResumeSession={handleResumeSession}
      />
    );
  }

  // 4. Live Host Dashboard
  return (
    <Dashboard
      onSessionEndedWithStats={(stats) => setEndedStats(stats)}
    />
  );
}
