import React, { useState, useEffect, useRef } from 'react';
import { Radio, Square } from 'lucide-react';
import { DMMark } from '../brand/DMLogo.jsx';
import { Button } from '../ui/Button.jsx';
import { LevelMeter } from '../host/LevelMeter.jsx';
import { AudioMeter } from '../../lib/audioMeter.js';
import { formatDuration } from '../../lib/time.js';

export function OnAirScreen({
  session,
  onStopSpeaking,
  onMicError,
  sendLevel
}) {
  const [level, setLevel] = useState(0);
  const [speakingSeconds, setSpeakingSeconds] = useState(0);

  const streamRef = useRef(null);
  const audioMeterRef = useRef(null);
  const wakeLockRef = useRef(null);

  // 1. Microphone capture and level sampling
  useEffect(() => {
    let isCancelled = false;

    async function initMic() {
      try {
        console.log('[OnAir] In mock mode: Web Audio level meter active, no audio leaves the device.');

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1
          }
        });

        if (isCancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        // Start AudioMeter
        const meter = new AudioMeter();
        audioMeterRef.current = meter;

        meter.start(stream, (lvl) => {
          setLevel(lvl);
          if (sendLevel) {
            sendLevel(lvl);
          }
        });
      } catch (err) {
        console.error('[OnAir] Microphone permission denied or unavailable:', err);
        if (onMicError) {
          onMicError(err);
        }
      }
    }

    initMic();

    // 2. Request Screen Wake Lock while on air
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((lock) => {
        wakeLockRef.current = lock;
      }).catch(() => {});
    }

    // 3. Speaking duration timer
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setSpeakingSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      isCancelled = true;
      clearInterval(timerInterval);

      // Clean up audio meter
      if (audioMeterRef.current) {
        audioMeterRef.current.stop();
        audioMeterRef.current = null;
      }

      // Stop mic tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      // Release wake lock
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [sendLevel, onMicError]);

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 max-w-md mx-auto bg-background text-foreground">
      {/* Top Status */}
      <div className="pt-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-live/20 border border-live text-live text-xs font-black uppercase tracking-widest shadow-lg shadow-live/25 animate-pulse">
          <Radio size={16} />
          <span>You're Live</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {session?.name || 'Live Stage'}
          </h1>
          <div className="text-3xl font-black font-mono text-white tracking-wider tabular-nums">
            {formatDuration(speakingSeconds)}
          </div>
        </div>

        {/* Big Pulsing Mic Avatar */}
        <div className="p-8 bg-surface border-2 border-live rounded-3xl shadow-2xl flex flex-col items-center space-y-6 my-6 shadow-live/20">
          <div className="w-32 h-32 rounded-full bg-background border-2 border-red-600 ring-4 ring-red-600/20 flex items-center justify-center text-foreground">
            <DMMark size={72} recording />
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-muted font-mono px-1">
              <span>Mic Live Input</span>
              <span>{Math.round(level * 100)}%</span>
            </div>
            <LevelMeter level={level} isMuted={false} barCount={24} />
          </div>

          <p className="text-xs text-muted text-center max-w-xs">
            Speak clearly into your phone's microphone. The entire venue is listening.
          </p>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="space-y-3 pb-safe">
        <Button
          size="huge"
          variant="live"
          onClick={onStopSpeaking}
          className="w-full gap-2 text-base font-black uppercase tracking-wider"
        >
          <Square size={20} className="fill-current" />
          <span>Stop Speaking</span>
        </Button>
      </div>
    </div>
  );
}
