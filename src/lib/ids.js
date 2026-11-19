/**
 * Set of unambiguous alphanumeric characters (excluding 0, O, 1, I).
 */
export const UNAMBIGUOUS_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a random 6-character uppercase session code.
 * @returns {string}
 */
export function generateSessionCode() {
  let result = '';
  const len = UNAMBIGUOUS_CHARS.length;
  for (let i = 0; i < 6; i++) {
    result += UNAMBIGUOUS_CHARS.charAt(Math.floor(Math.random() * len));
  }
  return result;
}

/**
 * Validates whether a code matches the 6-character unambiguous format.
 * @param {string} code 
 * @returns {boolean}
 */
export function isValidSessionCode(code) {
  if (!code || typeof code !== 'string') return false;
  const upper = code.trim().toUpperCase();
  if (upper.length !== 6) return false;
  for (let i = 0; i < 6; i++) {
    if (!UNAMBIGUOUS_CHARS.includes(upper[i])) return false;
  }
  return true;
}

/**
 * Generates or retrieves a persistent attendee ID for the current browser session.
 * @returns {string}
 */
export function getOrCreateAttendeeId() {
  const STORAGE_KEY = 'eventmic_attendee_id';
  try {
    let id = sessionStorage.getItem(STORAGE_KEY);
    if (!id || !/^att-[a-z0-9]{6,16}$/.test(id)) {
      id = 'att-' + Math.random().toString(36).substring(2, 12);
      sessionStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'att-' + Math.random().toString(36).substring(2, 12);
  }
}
