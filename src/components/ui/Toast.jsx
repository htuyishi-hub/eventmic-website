import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export function Toast({
  message,
  type = 'info', // 'info' | 'success' | 'warning' | 'error'
  onClose,
  duration = 4000
}) {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-accent flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-live flex-shrink-0" />
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl shadow-2xl text-foreground text-sm font-medium animate-bounce-subtle"
    >
      {icons[type] || icons.info}
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss toast"
          className="ml-2 text-muted hover:text-white p-1 rounded-md"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
