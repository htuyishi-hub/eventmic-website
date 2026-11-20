import React, { useState } from 'react';
import { Play, RefreshCw, Trash2 } from 'lucide-react';
import { DMLogo } from '../brand/DMLogo.jsx';
import { Button } from '../ui/Button.jsx';

const HOST_STORAGE_KEY = 'eventmic_host_session';

export function CreateSession({ onStartSession, onResumeSession }) {
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if a saved live session exists
  let savedSession = null;
  try {
    const raw = localStorage.getItem(HOST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.session?.status === 'live') {
        savedSession = parsed.session;
      } else if (parsed?.status === 'live' || (parsed?.code && parsed?.name)) {
        savedSession = parsed;
      }
    }
  } catch {}

  const handleStartNew = async (e) => {
    e.preventDefault();
    const trimmed = sessionName.trim();
    if (trimmed.length < 3 || trimmed.length > 60) {
      setError('Session name must be between 3 and 60 characters.');
      return;
    }

    try {
      setLoading(true);
      await onStartSession({ name: trimmed });
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    try {
      localStorage.removeItem(HOST_STORAGE_KEY);
    } catch {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-5">
          <DMLogo size={32} />
        </div>

        <h1 className="text-2xl font-black text-center text-white uppercase tracking-wider mb-2">
          Host Control Center
        </h1>
        <p className="text-sm text-center text-muted mb-8">
          Launch a live Q&amp;A microphone room for your audience.
        </p>

        {savedSession && (
          <div className="mb-8 p-5 bg-background border border-accent/40 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-accent">
                Active Session Found
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface border border-border text-white">
                {savedSession.code}
              </span>
            </div>
            <p className="text-base font-bold text-white mb-4">
              {savedSession.name}
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1 gap-2"
                onClick={() => onResumeSession(savedSession)}
              >
                <RefreshCw size={16} />
                <span>Resume Session</span>
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="gap-2 text-live hover:text-red-400"
                onClick={handleDiscard}
              >
                <Trash2 size={16} />
                <span>Discard</span>
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleStartNew} className="space-y-4">
          <div>
            <label htmlFor="session-name-input" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              New Session Title
            </label>
            <input
              id="session-name-input"
              type="text"
              value={sessionName}
              onChange={(e) => {
                setSessionName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Keynote Q&A or All-Hands Town Hall"
              maxLength={60}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white placeholder-muted/60 text-sm focus:border-accent focus:outline-none transition-colors"
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
            className="w-full gap-2"
          >
            <Play size={18} />
            <span>Start Session</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
