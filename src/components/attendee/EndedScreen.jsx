import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function EndedScreen({ session }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 max-w-md mx-auto bg-background text-foreground text-center">
      <div className="w-full p-8 bg-surface border border-border rounded-3xl shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-muted/15 border border-border flex items-center justify-center text-muted mx-auto">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">
            Session Ended
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            This session has ended. Thank you for participating.
          </p>
        </div>

        {session?.name && (
          <div className="pt-4 border-t border-border text-xs text-muted font-mono">
            {session.name}
          </div>
        )}
      </div>
    </div>
  );
}
