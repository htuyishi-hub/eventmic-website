import React, { useState, useEffect } from 'react';
import { DMMark } from './DMLogo.jsx';

/**
 * Opening splash screen: builds the DM logo line-by-line on initial site open
 * before revealing the destination page.
 */
export function DMBootSplash({ durationMs = 1050 }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.location.pathname.startsWith('/dev/')) return false;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    return true;
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;
    const t1 = setTimeout(() => setFading(true), durationMs - 220);
    const t2 = setTimeout(() => setVisible(false), durationMs);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible, durationMs]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] bg-background text-foreground flex flex-col items-center justify-center gap-4 transition-opacity duration-200 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <DMMark size={112} build />
      <span className="text-lg font-black tracking-[0.2em] text-foreground">DM</span>
    </div>
  );
}

export default DMBootSplash;
