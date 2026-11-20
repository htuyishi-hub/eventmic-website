import { MockTransport } from './mockTransport.js';
import { LiveKitTransport } from './livekitTransport.js';

/**
 * Creates and returns the active transport instance based on VITE_TRANSPORT environment variable.
 * @param {object} [options]
 * @returns {import('./types.js').TransportInterface}
 */
export function createTransport(options = {}) {
  const type = (import.meta.env?.VITE_TRANSPORT || 'livekit').toLowerCase();

  if (type === 'livekit') {
    return new LiveKitTransport(options);
  }

  return new MockTransport(options);
}
