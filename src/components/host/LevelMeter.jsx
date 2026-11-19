import React from 'react';

/**
 * Audio Level Meter driven by real levels (0..1) or muted state.
 */
export function LevelMeter({ level = 0, isMuted = false, barCount = 20, className = '' }) {
  const bars = Array.from({ length: barCount }, (_, i) => (i + 1) / barCount);

  return (
    <div
      role="meter"
      aria-label={isMuted ? 'Microphone audio muted' : 'Live microphone audio level'}
      aria-valuenow={isMuted ? 0 : Math.round(level * 100)}
      aria-valuemin="0"
      aria-valuemax="100"
      className={`flex items-end gap-1 h-12 px-3 py-2 bg-background border border-border rounded-xl ${className}`}
    >
      {bars.map((threshold, index) => {
        const isActive = !isMuted && level >= threshold;

        // Color gradient from green to warning to live red
        let barColor = 'bg-border';
        if (isMuted) {
          barColor = 'bg-muted/40';
        } else if (isActive) {
          if (threshold > 0.85) barColor = 'bg-live shadow-sm shadow-live/50';
          else if (threshold > 0.65) barColor = 'bg-warning shadow-sm shadow-warning/50';
          else barColor = 'bg-success shadow-sm shadow-success/50';
        }

        // Height variation for aesthetic equalizer wave or uniform height
        const heightPercent = isMuted ? 20 : isActive ? Math.max(25, Math.min(100, (level / threshold) * 100)) : 15;

        return (
          <div
            key={index}
            style={{ height: `${heightPercent}%` }}
            className={`flex-1 rounded-sm transition-all duration-75 ${barColor}`}
          />
        );
      })}
    </div>
  );
}
