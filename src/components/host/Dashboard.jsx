import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext.jsx';
import { useTransport } from '../../context/TransportContext.jsx';
import { SessionBar } from './SessionBar.jsx';
import { QueueList } from './QueueList.jsx';
import { StageView } from './StageView.jsx';
import { RoomQrModal } from './RoomQrModal.jsx';
import { EndSessionConfirm } from './EndSessionConfirm.jsx';
import { SettingsDrawer } from './SettingsDrawer.jsx';
import { Toast } from '../ui/Toast.jsx';
import { Button } from '../ui/Button.jsx';

export function Dashboard({ onSessionEndedWithStats }) {
  const {
    session,
    queue,
    floor,
    level,
    attendeeCount,
    isMuted,
    grant,
    revoke,
    muteSpeaker,
    endSession
  } = useSession();

  const { connectionState, transport } = useTransport();

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [canAudioPlay, setCanAudioPlay] = useState(
    transport?.canPlaybackAudio !== undefined ? transport.canPlaybackAudio : true
  );

  useEffect(() => {
    if (!transport) return;
    if (typeof transport.canPlaybackAudio === 'boolean') {
      setCanAudioPlay(transport.canPlaybackAudio);
    }
    const unsub = transport.on?.('audio_playback_status', (canPlay) => {
      setCanAudioPlay(canPlay);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [transport]);

  // Statistics tracking
  const statsRef = useRef({
    startTime: session?.createdAt || Date.now(),
    speakersSet: new Set(),
    totalHandsRaised: 0,
    seenAttendeeIds: new Set()
  });

  // Track unique speakers and hands raised
  useEffect(() => {
    if (floor?.id) {
      statsRef.current.speakersSet.add(floor.id);
    }
  }, [floor?.id]);

  useEffect(() => {
    queue.forEach(item => {
      if (!statsRef.current.seenAttendeeIds.has(item.id)) {
        statsRef.current.seenAttendeeIds.add(item.id);
        statsRef.current.totalHandsRaised++;
      }
    });
  }, [queue]);

  // Speaking time limit auto-revoke
  useEffect(() => {
    if (!timeLimitMinutes || !floor?.startedAt) return;

    const limitMs = timeLimitMinutes * 60 * 1000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - floor.startedAt;
      if (elapsed >= limitMs) {
        setToastMessage(`Time limit (${timeLimitMinutes}m) reached. ${floor.name} revoked.`);
        revoke(floor.id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimitMinutes, floor, revoke]);

  // Keyboard shortcuts: G = grant next, M = mute toggle, Esc = end speaker, Q = open QR
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcuts while typing in an input or textarea
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'g' || e.key === 'G') {
        if (queue.length > 0) {
          e.preventDefault();
          grant(queue[0].id);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        if (floor) {
          e.preventDefault();
          muteSpeaker(!isMuted);
        }
      } else if (e.key === 'Escape') {
        if (isQrOpen) {
          setIsQrOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isEndConfirmOpen) {
          setIsEndConfirmOpen(false);
        } else if (floor) {
          revoke(floor.id);
        }
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setIsQrOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queue, floor, isMuted, isQrOpen, isSettingsOpen, isEndConfirmOpen, grant, revoke, muteSpeaker]);

  const handleGrantNext = () => {
    if (queue.length > 0) {
      grant(queue[0].id);
    }
  };

  const handleEndSessionConfirmed = async () => {
    setIsEndConfirmOpen(false);
    const durationSeconds = Math.max(1, Math.floor((Date.now() - statsRef.current.startTime) / 1000));
    await endSession();
    onSessionEndedWithStats({
      durationSeconds,
      speakersCount: statsRef.current.speakersSet.size,
      totalHandsRaised: statsRef.current.totalHandsRaised
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* 1. Header Bar */}
      <SessionBar
        session={session}
        attendeeCount={attendeeCount}
        connectionState={connectionState}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onEndSessionClick={() => setIsEndConfirmOpen(true)}
      />

      {/* Start Audio button: shown only while room.canPlaybackAudio is false */}
      {!canAudioPlay && (
        <div className="bg-warning text-black px-4 py-2 flex items-center justify-between text-xs font-bold shadow-md flex-shrink-0">
          <span>Audio output requires user gesture in this browser.</span>
          <Button
            variant="primary"
            size="sm"
            onClick={async () => {
              if (transport?.startAudio) {
                await transport.startAudio();
                if (typeof transport.canPlaybackAudio === 'boolean') {
                  setCanAudioPlay(transport.canPlaybackAudio);
                }
              }
            }}
            className="bg-black text-white hover:bg-neutral-800 text-xs py-1 px-3"
          >
            Start Audio
          </Button>
        </div>
      )}

      {/* 2. Main Two-Column View (Strictly no scroll on 1366x768) */}
      <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-5">
        {/* Left Column: Queue List (4 of 12 cols) */}
        <section className="md:col-span-5 lg:col-span-4 h-full min-h-0">
          <QueueList
            queue={queue}
            onGrant={(id) => grant(id)}
            onDrop={(id) => revoke(id)}
            onOpenQr={() => setIsQrOpen(true)}
          />
        </section>

        {/* Right Column: Stage View (8 of 12 cols) */}
        <section className="md:col-span-7 lg:col-span-8 h-full min-h-0">
          <StageView
            floor={floor}
            level={level}
            isMuted={isMuted}
            onEndSpeaker={() => revoke(floor?.id)}
            onToggleMute={() => muteSpeaker(!isMuted)}
            queueLength={queue.length}
            onGrantNext={handleGrantNext}
            nextAttendeeName={queue[0]?.name}
          />
        </section>
      </main>

      {/* 3. Footer Shortcuts Hint */}
      <footer className="h-7 px-6 bg-surface/80 border-t border-border flex items-center justify-between text-[11px] text-muted flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-bold uppercase tracking-wider text-[10px]">Shortcuts:</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px] text-white">G</kbd> Grant Next</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px] text-white">M</kbd> Mute Toggle</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px] text-white">Esc</kbd> End Floor</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono text-[10px] text-white">Q</kbd> QR Code</span>
        </div>
        <div className="hidden sm:block font-mono text-[10px]">
          EventMic Web Console
        </div>
      </footer>

      {/* Modals & Drawers */}
      <RoomQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        code={session?.code}
        sessionName={session?.name}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        timeLimitMinutes={timeLimitMinutes}
        onTimeLimitChange={setTimeLimitMinutes}
      />

      <EndSessionConfirm
        isOpen={isEndConfirmOpen}
        onClose={() => setIsEndConfirmOpen(false)}
        onConfirm={handleEndSessionConfirmed}
        sessionName={session?.name}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="warning"
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}
