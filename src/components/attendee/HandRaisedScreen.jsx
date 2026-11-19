import React from 'react';
import { Hand, Clock } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function HandRaisedScreen({
  session,
  queuePosition = 1,
  onLowerHand
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6 max-w-md mx-auto bg-background text-foreground">
      {/* Top Status */}
      <div className="pt-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span>Hand Raised</span>
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight">
          {session?.name || 'Live Q&A'}
        </h1>

        {/* Central Queue Card with Position Number */}
        <div className="p-8 bg-surface border-2 border-accent/60 rounded-3xl shadow-2xl flex flex-col items-center space-y-4 my-6">
          <div className="w-24 h-24 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-accent animate-pulse">
            <Hand size={44} />
          </div>

          <div className="space-y-2 text-center">
            <span className="text-xs uppercase tracking-widest text-muted font-bold">
              Queue Position
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              #{queuePosition}
            </div>
            <p className="text-sm font-semibold text-accent">
              You are #{queuePosition} in line
            </p>
          </div>

          <p className="text-xs text-muted text-center max-w-xs pt-2">
            The host will grant your floor when it is your turn. Please keep your device unlocked.
          </p>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="space-y-3 pb-safe">
        <Button
          size="huge"
          variant="secondary"
          onClick={onLowerHand}
          className="w-full gap-2 text-base font-bold uppercase tracking-wider text-muted hover:text-white"
        >
          <span>Lower Hand</span>
        </Button>
      </div>
    </div>
  );
}
