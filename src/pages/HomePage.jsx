import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { isValidSessionCode } from '../lib/ids.js';

export function HomePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!isValidSessionCode(clean)) {
      setError('Please enter a valid 6-character room code.');
      return;
    }
    navigate(`/join/${clean}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 max-w-lg mx-auto bg-background text-foreground">
      {/* Header / Hero */}
      <div className="pt-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-accent flex items-center justify-center text-white mx-auto shadow-xl shadow-accent/25">
          <Mic size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            EventMic Web
          </h1>
          <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
            Turn any phone into a stage-ready wireless Q&amp;A microphone directly in the browser.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex items-center justify-center gap-3 pt-2 text-xs text-muted font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border">
            <Zap size={14} className="text-accent" />
            <span>Zero App Install</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border">
            <ShieldCheck size={14} className="text-success" />
            <span>Browser WebRTC</span>
          </div>
        </div>
      </div>

      {/* Main Choice: Join with Code or Host a Session */}
      <div className="space-y-6 my-10">
        {/* Card 1: Join with Code */}
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-1">
              Join with Room Code
            </h2>
            <p className="text-xs text-muted">
              Enter the 6-character code shown on the event screen.
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (error) setError('');
                }}
                maxLength={6}
                placeholder="e.g. 7K2M9X"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white font-mono font-black text-xl text-center tracking-widest uppercase placeholder-muted/40 focus:border-accent focus:outline-none"
              />
              {error && (
                <p role="alert" className="mt-1.5 text-xs text-live font-medium text-center">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 text-sm font-bold uppercase tracking-wider"
            >
              <span>Join Session</span>
              <ArrowRight size={18} />
            </Button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-muted/60 font-bold">
          <div className="flex-1 h-px bg-border" />
          <span>or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Card 2: Host a Session */}
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-xl space-y-3 text-center">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-1">
              Audio Engineer / Host
            </h2>
            <p className="text-xs text-muted">
              Create a room, control the floor, and monitor audio meters.
            </p>
          </div>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/host')}
            className="w-full gap-2 text-sm font-bold uppercase tracking-wider border-accent/40 text-accent hover:bg-accent/10"
          >
            <span>Host a Session</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted/60 pb-safe font-mono">
        EventMic Phase 1 • Pure In-Browser Audio Q&amp;A
      </footer>
    </div>
  );
}
