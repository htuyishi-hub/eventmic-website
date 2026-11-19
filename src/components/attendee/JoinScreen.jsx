import React, { useState } from 'react';
import { Mic, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

const NAME_STORAGE_KEY = 'eventmic_attendee_name';

export function JoinScreen({ session, onJoin, initialCode }) {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setError('Please enter a name between 2 and 30 characters.');
      return;
    }

    try {
      localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    } catch {}

    setLoading(true);
    try {
      await onJoin(trimmed);
    } catch (err) {
      setError(err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 max-w-md mx-auto bg-background text-foreground">
      {/* Top Session Context */}
      <div className="pt-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mx-auto shadow-xl shadow-accent/10">
          <Mic size={32} />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
            Room Code: {session?.code || initialCode}
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {session?.name || 'Live EventMic Session'}
          </h1>
        </div>

        <p className="text-xs text-muted leading-relaxed px-4">
          Enter your name to join the room. You can raise your hand to speak when the Q&amp;A starts.
        </p>
      </div>

      {/* Form with thumb-reachable button at bottom */}
      <form onSubmit={handleSubmit} className="space-y-4 pb-safe">
        <div>
          <label htmlFor="attendee-name" className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
            Your Display Name
          </label>
          <input
            id="attendee-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Alex Rivera"
            autoFocus
            maxLength={30}
            className="w-full px-4 py-3.5 bg-surface border border-border rounded-xl text-white placeholder-muted/60 text-base focus:border-accent focus:outline-none transition-colors"
          />
          {error && (
            <p role="alert" className="mt-2 text-xs text-live font-medium">
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="huge"
          loading={loading}
          className="w-full gap-2 text-base font-black uppercase tracking-wider"
        >
          <span>Join Room</span>
          <ArrowRight size={20} />
        </Button>
      </form>
    </div>
  );
}
