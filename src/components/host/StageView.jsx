import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Radio, Volume2 } from 'lucide-react';
import { LevelMeter } from './LevelMeter.jsx';
import { Button } from '../ui/Button.jsx';
import { formatDuration } from '../../lib/time.js';

export function StageView({
  floor,
  level = 0,
  isMuted = false,
  onEndSpeaker,
  onToggleMute,
  queueLength = 0,
  onGrantNext,
  nextAttendeeName
}) {
  const [speakingSeconds, setSpeakingSeconds] = useState(0);

  useEffect(() => {
    if (!floor?.startedAt) {
      setSpeakingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - floor.startedAt) / 1000);
      setSpeakingSeconds(Math.max(0, elapsed));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [floor?.startedAt]);

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-xl p-5 sm:p-6 justify-between">
      {/* Top Stage Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${floor ? 'bg-live animate-pulse shadow-md shadow-live/50' : 'bg-muted/40'}`} />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Live Stage
          </h2>
        </div>

        {floor ? (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase ${
              isMuted ? 'bg-warning/20 border border-warning/40 text-warning' : 'bg-live/20 border border-live/40 text-live'
            }`}>
              <Radio size={14} className={isMuted ? '' : 'animate-pulse'} />
              <span>{isMuted ? 'Muted' : 'On-Air'}</span>
            </span>
            <span className="font-mono text-xs font-bold text-white bg-background border border-border px-2.5 py-1 rounded-full tabular-nums">
              {formatDuration(speakingSeconds)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted font-semibold">
            Stage Open
          </span>
        )}
      </div>

      {/* Center Stage Presentation Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
        {floor ? (
          <div className="w-full max-w-lg flex flex-col items-center space-y-6">
            {/* Big Mic Avatar */}
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-warning/15 border-2 border-warning/40 text-warning'
                : 'bg-live/15 border-2 border-live text-live shadow-2xl shadow-live/20 animate-pulse'
            }`}>
              {isMuted ? <MicOff size={42} /> : <Mic size={42} />}
            </div>

            {/* Speaker Name Lower-Third */}
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-muted font-bold">
                Current Speaker
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight break-words">
                {floor.name}
              </h1>
            </div>

            {/* Live Audio Level Meter */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs text-muted font-mono px-1">
                <span className="flex items-center gap-1.5">
                  <Volume2 size={14} />
                  <span>Mic Input</span>
                </span>
                <span>{isMuted ? 'MUTED' : `${Math.round(level * 100)}%`}</span>
              </div>
              <LevelMeter level={level} isMuted={isMuted} barCount={28} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3 text-muted max-w-xs">
            <div className="w-20 h-20 rounded-3xl bg-background border border-border flex items-center justify-center text-muted mb-2">
              <Mic size={36} className="opacity-40" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Nobody has the floor
            </h3>
            <p className="text-xs leading-relaxed">
              When you grant a participant the floor, their name, timer, and live microphone meter appear here.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Stage Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
        {/* Button 1: Grant Next */}
        <Button
          variant="primary"
          size="lg"
          disabled={queueLength === 0}
          onClick={onGrantNext}
          className="flex-col gap-0.5 sm:col-span-1"
        >
          <span className="text-sm font-extrabold uppercase tracking-wider">Grant Next (G)</span>
          <span className="text-[10px] font-normal opacity-80 truncate max-w-[180px]">
            {nextAttendeeName ? `Next: ${nextAttendeeName}` : 'Queue empty'}
          </span>
        </Button>

        {/* Button 2: End Speaker */}
        <Button
          variant="live"
          size="lg"
          disabled={!floor}
          onClick={onEndSpeaker}
          className="gap-2 sm:col-span-1 uppercase tracking-wider text-sm font-extrabold"
        >
          <PhoneOff size={18} />
          <span>End Floor (Esc)</span>
        </Button>

        {/* Button 3: Host Override Mute */}
        <Button
          variant={isMuted ? 'warning' : 'secondary'}
          size="lg"
          disabled={!floor}
          onClick={onToggleMute}
          className="gap-2 sm:col-span-1 uppercase tracking-wider text-sm font-extrabold"
        >
          {isMuted ? <Mic size={18} /> : <MicOff size={18} />}
          <span>{isMuted ? 'Unmute (M)' : 'Mute Host (M)'}</span>
        </Button>
      </div>
    </div>
  );
}
