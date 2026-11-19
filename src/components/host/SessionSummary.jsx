import React from 'react';
import { Award, Clock, Users, Mic, Plus } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { formatDuration } from '../../lib/time.js';

export function SessionSummary({
  session,
  stats = { durationSeconds: 0, speakersCount: 0, totalHandsRaised: 0 },
  onStartNewSession
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-success/20 border border-success/40 flex items-center justify-center text-success mx-auto shadow-inner">
          <Award size={36} />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-muted">
            Session Complete
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {session?.name || 'Live Q&A Session'}
          </h1>
          <p className="text-xs font-mono text-accent mt-1">
            Session Code: {session?.code}
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-background border border-border">
            <Clock size={18} className="text-accent mx-auto mb-1.5" />
            <div className="text-xl font-black text-white font-mono tabular-nums">
              {formatDuration(stats.durationSeconds)}
            </div>
            <div className="text-[11px] text-muted uppercase font-bold tracking-wider mt-1">
              Duration
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border">
            <Mic size={18} className="text-live mx-auto mb-1.5" />
            <div className="text-xl font-black text-white font-mono tabular-nums">
              {stats.speakersCount}
            </div>
            <div className="text-[11px] text-muted uppercase font-bold tracking-wider mt-1">
              Speakers
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border">
            <Users size={18} className="text-warning mx-auto mb-1.5" />
            <div className="text-xl font-black text-white font-mono tabular-nums">
              {stats.totalHandsRaised}
            </div>
            <div className="text-[11px] text-muted uppercase font-bold tracking-wider mt-1">
              Hands Raised
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="huge"
          onClick={onStartNewSession}
          className="gap-2 w-full mt-4"
        >
          <Plus size={18} />
          <span>Start New Session</span>
        </Button>
      </div>
    </div>
  );
}
