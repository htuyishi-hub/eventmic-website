import React from 'react';
import { AlertTriangle, MicOff, WifiOff, Users, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function ErrorScreen({
  variant = 'UNKNOWN', // 'INVALID_CODE' | 'SESSION_ENDED' | 'FULL' | 'MIC_DENIED' | 'CONNECTION_LOST' | 'UNKNOWN'
  message,
  onRetry,
  onBack
}) {
  const configs = {
    INVALID_CODE: {
      icon: AlertTriangle,
      title: 'Invalid Room Code',
      description: message || 'We could not find an active session with this code. Please double-check the 6-character code or scan the room QR code again.',
      canRetry: false
    },
    SESSION_ENDED: {
      icon: AlertTriangle,
      title: 'Session Ended',
      description: message || 'This live event session has already concluded. Thank you for attending.',
      canRetry: false
    },
    FULL: {
      icon: Users,
      title: 'Session is Full',
      description: message || 'This session has reached its maximum capacity of 200 participants.',
      canRetry: true
    },
    MIC_DENIED: {
      icon: MicOff,
      title: 'Microphone Access Blocked',
      description: 'Your browser denied microphone permission. To speak, please allow microphone access in your browser settings (look for the lock or tune icon in the address bar) and tap Try Again.',
      canRetry: true
    },
    CONNECTION_LOST: {
      icon: WifiOff,
      title: 'Connection Lost',
      description: 'Lost communication with the host. Retrying connection automatically...',
      canRetry: true
    },
    UNKNOWN: {
      icon: AlertTriangle,
      title: 'Connection Issue',
      description: message || 'An unexpected error occurred while communicating with the host.',
      canRetry: true
    }
  };

  const current = configs[variant] || configs.UNKNOWN;
  const Icon = current.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 max-w-md mx-auto bg-background text-foreground text-center">
      <div className="w-full p-8 bg-surface border border-border rounded-3xl shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-live/15 border border-live/30 flex items-center justify-center text-live mx-auto">
          <Icon size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {current.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            {current.description}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {current.canRetry && onRetry && (
            <Button
              variant="primary"
              size="lg"
              onClick={onRetry}
              className="w-full gap-2 text-sm font-bold uppercase tracking-wider"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </Button>
          )}

          {onBack && (
            <Button
              variant="secondary"
              size="lg"
              onClick={onBack}
              className="w-full gap-2 text-sm font-semibold"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
