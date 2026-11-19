import React from 'react';
import { Hand, Radio, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function ListeningScreen({ session, attendeeName, onRaiseHand }) {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6 max-w-md mx-auto bg-background text-foreground">
      {/* Top Status */}
      <div className="pt-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>You're Connected</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">
            {session?.name || 'Live Q&A'}
          </h1>
          <p className="text-xs text-muted font-mono">
            Attendee: <strong className="text-white">{attendeeName}</strong>
          </p>
        </div>

        {/* Listening Card */}
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-xl flex flex-col items-center space-y-4 my-6">
          <div className="w-20 h-20 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Radio size={36} className="animate-pulse" />
          </div>

          <div className="space-y-1 text-center">
            <h3 className="text-base font-bold text-white">
              Stage Audio Reinforced
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Listen to the live presentation. When you want to ask a question, tap Raise Hand below to join the democratic queue.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="space-y-3 pb-safe">
        <Button
          size="huge"
          variant="primary"
          onClick={onRaiseHand}
          className="w-full gap-3 text-lg font-black uppercase tracking-wider"
        >
          <Hand size={24} />
          <span>Raise Hand</span>
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted text-center">
          <ShieldCheck size={14} className="text-accent flex-shrink-0" />
          <span>Your microphone stays off until the host gives you the floor.</span>
        </div>
      </div>
    </div>
  );
}
