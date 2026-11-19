import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Settings, LogOut, Users } from 'lucide-react';
import { ConnectionBadge } from './ConnectionBadge.jsx';
import { Button } from '../ui/Button.jsx';
import { formatDuration } from '../../lib/time.js';

export function SessionBar({
  session,
  attendeeCount = 0,
  connectionState,
  onOpenQr,
  onOpenSettings,
  onEndSessionClick
}) {
  const [copied, setCopied] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    if (!session?.createdAt) return;

    const update = () => {
      const elapsed = Math.floor((Date.now() - session.createdAt) / 1000);
      setSessionDuration(Math.max(0, elapsed));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [session?.createdAt]);

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${session?.code}`
    : `/join/${session?.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-surface border-b border-border flex items-center justify-between gap-4 flex-shrink-0">
      {/* Left: App Logo & Session Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md shadow-accent/30">
          EM
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black uppercase tracking-wider text-white truncate max-w-[200px] sm:max-w-xs">
              {session?.name || 'Live Session'}
            </h1>
            <ConnectionBadge state={connectionState} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted font-mono">
            <span>Session: {session?.code}</span>
            <span>•</span>
            <span className="tabular-nums">{formatDuration(sessionDuration)}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Attendees, Settings, End */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Attendees Count */}
        <div
          title={`${attendeeCount} Connected Attendees`}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-semibold text-muted font-mono"
        >
          <Users size={14} className="text-accent" />
          <span>{attendeeCount}</span>
        </div>

        {/* Copy Link Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyLink}
          className="gap-1.5 text-xs py-1.5 hidden sm:inline-flex"
        >
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy Link'}</span>
        </Button>

        {/* Show QR Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenQr}
          className="gap-1.5 text-xs py-1.5"
          title="Open Room QR (Q)"
        >
          <QrCode size={14} className="text-accent" />
          <span className="hidden sm:inline">Show QR (Q)</span>
        </Button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Audio & Stage Settings"
          aria-label="Settings"
          className="p-2 rounded-xl bg-background border border-border text-muted hover:text-white hover:border-accent transition-colors"
        >
          <Settings size={18} />
        </button>

        {/* End Session Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onEndSessionClick}
          className="gap-1.5 text-xs py-1.5 text-live hover:text-white hover:bg-live hover:border-live"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">End Session</span>
        </Button>
      </div>
    </header>
  );
}
