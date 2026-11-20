import React from 'react';

/**
 * DM logo mark — the supplied waveform symbol, rebuilt as vector.
 * "DM" is NOT part of the mark; it is plain text placed after it (see DMLogo).
 *
 * recording=true animates each line independently like a live voice recording.
 * Respects prefers-reduced-motion (animation is disabled).
 */
const BARS = [
  // [x, y1, y2, animation duration (s), delay (s), min scale]
  { k: 'a', x: 337, y1: 260, y2: 390, d: 0.9, s: 0.0, m: 0.3 },
  { k: 'b', x: 462, y1: 90, y2: 285, d: 0.7, s: 0.15, m: 0.25 },
  { k: 'c', x: 462, y1: 420, y2: 490, d: 1.1, s: 0.35, m: 0.4 },
  { k: 'd', x: 505, y1: 220, y2: 380, d: 0.8, s: 0.05, m: 0.3 },
  { k: 'e', x: 547, y1: 155, y2: 240, d: 1.0, s: 0.25, m: 0.35 },
  { k: 'f', x: 590, y1: 292, y2: 318, d: 0.6, s: 0.1, m: 0.5 },
  { k: 'g', x: 632, y1: 258, y2: 278, d: 0.85, s: 0.3, m: 0.5 },
  { k: 'h', x: 678, y1: 277, y2: 293, d: 0.75, s: 0.2, m: 0.6 },
];

const CSS = `
.dm-bar{transform-box:fill-box;transform-origin:center}
.dm-rec .dm-bar{animation:dm-bounce var(--d) ease-in-out var(--s) infinite alternate}
.dm-rec .dm-loop{transform-box:fill-box;transform-origin:center;animation:dm-bounce 1.3s ease-in-out 0s infinite alternate;--m:.85}
@keyframes dm-bounce{from{transform:scaleY(var(--m,.3))}to{transform:scaleY(1.12)}}
@media (prefers-reduced-motion:reduce){.dm-rec .dm-bar,.dm-rec .dm-loop{animation:none}}
`;

export function DMMark({ recording = false, size = 32, color = 'currentColor', className = '', title = 'DM' }) {
  return (
    <svg
      viewBox="310 60 435 450"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="20"
      strokeLinecap="round"
      className={`${recording ? 'dm-rec' : ''} ${className}`}
      role="img"
      aria-label={title}
    >
      <style>{CSS}</style>
      {/* d-shaped loop: stadium outline + stem */}
      <g className="dm-bar dm-loop" style={{ '--m': 0.85 }}>
        <rect x="390" y="145" width="30" height="280" rx="15" />
        <line x1="420" y1="105" x2="420" y2="200" />
      </g>
      {BARS.filter((b) => b.k !== 'h').map((b) => (
        <line
          key={b.k}
          className="dm-bar"
          x1={b.x}
          y1={b.y1}
          x2={b.x}
          y2={b.y2}
          style={{ '--d': `${b.d}s`, '--s': `${b.s}s`, '--m': b.m }}
        />
      ))}
      <line className="dm-bar" x1="678" y1="277" x2="678" y2="293" style={{ '--d': '0.75s', '--s': '0.2s', '--m': 0.6 }} />
      <circle cx="722" cy="286" r="11" fill={color} stroke="none" />
    </svg>
  );
}

/** Mark followed by the plain text "DM". */
export function DMLogo({ recording = false, size = 32, showText = true, color = 'currentColor', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`} style={{ color }}>
      <DMMark recording={recording} size={size} color={color} />
      {showText && (
        <span style={{ fontWeight: 800, fontSize: size * 0.62, letterSpacing: '0.04em', lineHeight: 1 }}>DM</span>
      )}
    </span>
  );
}

export default DMLogo;
