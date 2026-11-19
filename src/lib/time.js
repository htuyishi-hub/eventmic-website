/**
 * Formats elapsed seconds into mm:ss or hh:mm:ss string.
 * @param {number} totalSeconds 
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Formats wait time since raisedAt timestamp (in ms).
 * @param {number} raisedAt 
 * @param {number} [now]
 * @returns {string}
 */
export function formatWait(raisedAt, now = Date.now()) {
  if (!raisedAt) return '0s in queue';
  const diffSec = Math.max(0, Math.floor((now - raisedAt) / 1000));
  if (diffSec < 60) {
    return `${diffSec}s in queue`;
  }
  const mins = Math.floor(diffSec / 60);
  const remSec = diffSec % 60;
  if (mins < 60) {
    return `${mins}m ${remSec}s in queue`;
  }
  return `${Math.floor(mins / 60)}h ${mins % 60}m in queue`;
}
