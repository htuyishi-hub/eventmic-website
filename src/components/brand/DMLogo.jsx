import React from 'react';

/**
 * Main DM Logo Mark — Horizontal acoustic pyramid/drop (10 rounded pill rows).
 * - build: animates lines in one-by-one to build the shape once (opening splash).
 * - loop: continuously builds the shape one-by-one while waiting/loading.
 * - "DM" is plain text placed after the mark (see DMLogo).
 */
const ROWS = [
  // Bottom-to-top stagger index (0 = bottom base, 9 = top dot)
  { type: 'rect', x: 74, y: 179, w: 52, h: 14, i: 0 },
  { type: 'rect', x: 51, y: 161, w: 98, h: 14, i: 1 },
  { type: 'rect', x: 36, y: 143, w: 128, h: 14, i: 2 },
  // Split row (widest)
  { type: 'rect', x: 24, y: 125, w: 86, h: 14, i: 3 },
  { type: 'rect', x: 136, y: 125, w: 40, h: 14, i: 3 },
  { type: 'rect', x: 56, y: 107, w: 88, h: 14, i: 4 },
  { type: 'rect', x: 70, y: 89, w: 60, h: 14, i: 5 },
  { type: 'rect', x: 79, y: 71, w: 42, h: 14, i: 6 },
  { type: 'rect', x: 87, y: 53, w: 26, h: 14, i: 7 },
  { type: 'circle', cx: 100, cy: 42, r: 7, i: 8 },
  { type: 'circle', cx: 100, cy: 24, r: 7, i: 9 },
];

const MARK_CSS = `
.dm-row{transform-box:fill-box;transform-origin:center}
.dm-build .dm-row{opacity:0;transform:scaleX(.25);animation:dm-in .28s cubic-bezier(.22,1,.36,1) calc(var(--i) * 65ms) forwards}
.dm-loop .dm-row{opacity:0;transform:scaleX(.25);animation:dm-cycle 1.6s ease-in-out calc(var(--i) * 70ms) infinite}
@keyframes dm-in{to{opacity:1;transform:scaleX(1)}}
@keyframes dm-cycle{0%{opacity:0;transform:scaleX(.25)}20%,65%{opacity:1;transform:scaleX(1)}85%,100%{opacity:0;transform:scaleX(.25)}}
@media (prefers-reduced-motion:reduce){.dm-build .dm-row,.dm-loop .dm-row{animation:none;opacity:1;transform:none}}
`;

export function DMMark({
  size = 32,
  color = 'currentColor',
  build = false,
  loop = false,
  className = '',
  title = 'DM'
}) {
  const modeClass = loop ? 'dm-loop' : build ? 'dm-build' : '';
  return (
    <svg
      viewBox="16 12 168 186"
      width={size}
      height={size}
      fill={color}
      className={`${modeClass} ${className}`}
      role="img"
      aria-label={title}
    >
      <style>{MARK_CSS}</style>
      {ROWS.map((r, idx) =>
        r.type === 'circle' ? (
          <circle
            key={idx}
            className="dm-row"
            cx={r.cx}
            cy={r.cy}
            r={r.r}
            style={{ '--i': r.i }}
          />
        ) : (
          <rect
            key={idx}
            className="dm-row"
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx={r.h / 2}
            style={{ '--i': r.i }}
          />
        )
      )}
    </svg>
  );
}

/**
 * Animated speaker/on-air background waveform mark (kept for live speaker rings).
 */
const WAVE_BARS = [
  { k: 'a', x: 337, y1: 260, y2: 390, d: 0.9, s: 0.0, m: 0.3 },
  { k: 'b', x: 462, y1: 90, y2: 285, d: 0.7, s: 0.15, m: 0.25 },
  { k: 'c', x: 462, y1: 420, y2: 490, d: 1.1, s: 0.35, m: 0.4 },
  { k: 'd', x: 505, y1: 220, y2: 380, d: 0.8, s: 0.05, m: 0.3 },
  { k: 'e', x: 547, y1: 155, y2: 240, d: 1.0, s: 0.25, m: 0.35 },
  { k: 'f', x: 590, y1: 292, y2: 318, d: 0.6, s: 0.1, m: 0.5 },
  { k: 'g', x: 632, y1: 258, y2: 278, d: 0.85, s: 0.3, m: 0.5 },
  { k: 'h', x: 678, y1: 277, y2: 293, d: 0.75, s: 0.2, m: 0.6 },
];

const WAVE_CSS = `
.dm-wbar{transform-box:fill-box;transform-origin:center}
.dm-wrec .dm-wbar{animation:dm-wb var(--d) ease-in-out var(--s) infinite alternate}
.dm-wrec .dm-wloop{transform-box:fill-box;transform-origin:center;animation:dm-wb 1.3s ease-in-out 0s infinite alternate;--m:.85}
@keyframes dm-wb{from{transform:scaleY(var(--m,.3))}to{transform:scaleY(1.12)}}
@media (prefers-reduced-motion:reduce){.dm-wrec .dm-wbar,.dm-wrec .dm-wloop{animation:none}}
`;

export function DMRecordingWave({ recording = false, size = 32, color = 'currentColor', className = '', title = 'DM Audio' }) {
  return (
    <svg
      viewBox="310 60 435 450"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="20"
      strokeLinecap="round"
      className={`${recording ? 'dm-wrec' : ''} ${className}`}
      role="img"
      aria-label={title}
    >
      <style>{WAVE_CSS}</style>
      <g className="dm-wbar dm-wloop" style={{ '--m': 0.85 }}>
        <rect x="390" y="145" width="30" height="280" rx="15" />
        <line x1="420" y1="105" x2="420" y2="200" />
      </g>
      {WAVE_BARS.map((b) => (
        <line
          key={b.k}
          className="dm-wbar"
          x1={b.x}
          y1={b.y1}
          x2={b.x}
          y2={b.y2}
          style={{ '--d': `${b.d}s`, '--s': `${b.s}s`, '--m': b.m }}
        />
      ))}
      <circle cx="722" cy="286" r="11" fill={color} stroke="none" />
    </svg>
  );
}

/** Main mark followed by plain text "DM". */
export function DMLogo({
  size = 32,
  showText = true,
  build = false,
  loop = false,
  color = 'currentColor',
  className = ''
}) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`} style={{ color }}>
      <DMMark size={size} color={color} build={build} loop={loop} />
      {showText && (
        <span style={{ fontWeight: 800, fontSize: size * 0.62, letterSpacing: '0.04em', lineHeight: 1 }}>DM</span>
      )}
    </span>
  );
}

export default DMLogo;
