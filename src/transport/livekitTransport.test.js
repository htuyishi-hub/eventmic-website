import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LiveKitTransport,
  computeQueueAndFloor,
  mapConnectionState
} from './livekitTransport.js';

describe('LiveKitTransport Mapping & Logic', () => {
  describe('computeQueueAndFloor', () => {
    it('handles empty participants', () => {
      const res = computeQueueAndFloor(new Map());
      expect(res.attendeeCount).toBe(0);
      expect(res.queue).toEqual([]);
      expect(res.floor).toBeNull();
    });

    it('builds sorted FIFO queue from attributes.hand and counts attendees', () => {
      const participants = new Map([
        ['host-1', { identity: 'host-1', name: 'Host Admin', attributes: {} }],
        ['att-bob', { identity: 'att-bob', name: 'Bob', attributes: { hand: '1700000020000' } }],
        ['att-alice', { identity: 'att-alice', name: 'Alice', attributes: { hand: '1700000010000' } }],
        ['att-charlie', { identity: 'att-charlie', name: 'Charlie', attributes: { hand: '' } }]
      ]);

      const res = computeQueueAndFloor(participants);
      expect(res.attendeeCount).toBe(3); // Alice, Bob, Charlie (host excluded)
      expect(res.queue).toHaveLength(2);
      expect(res.queue[0].id).toBe('att-alice'); // older timestamp first
      expect(res.queue[1].id).toBe('att-bob');
      expect(res.floor).toBeNull();
    });

    it('extracts active floor speaker and excludes them from the queue', () => {
      const participants = new Map([
        ['att-speaker', { identity: 'att-speaker', name: 'Dave', attributes: { floor: 'granted', floorStartedAt: '1700000050000' } }],
        ['att-next', { identity: 'att-next', name: 'Eve', attributes: { hand: '1700000060000' } }]
      ]);

      const res = computeQueueAndFloor(participants);
      expect(res.floor).toEqual({
        id: 'att-speaker',
        name: 'Dave',
        startedAt: 1700000050000
      });
      expect(res.queue).toHaveLength(1);
      expect(res.queue[0].id).toBe('att-next');
    });
  });

  describe('mapConnectionState', () => {
    it('maps all LiveKit connection states accurately', () => {
      expect(mapConnectionState('connecting')).toBe('connecting');
      expect(mapConnectionState('connected')).toBe('connected');
      expect(mapConnectionState('reconnecting')).toBe('reconnecting');
      expect(mapConnectionState('signalReconnecting')).toBe('reconnecting');
      expect(mapConnectionState('disconnected')).toBe('disconnected');
      expect(mapConnectionState('unknown')).toBe('disconnected');
    });
  });

  describe('LiveKitTransport Methods & Lifecycle', () => {
    let transport;

    beforeEach(() => {
      vi.restoreAllMocks();
      transport = new LiveKitTransport({ apiBase: '/api' });
    });

    it('createSession calls server API with passcode and emits session event', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: '8K3N7P',
          name: 'Realtime LiveKit Session',
          createdAt: 1700000000000
        })
      });

      const sessionHandler = vi.fn();
      transport.on('session', sessionHandler);

      const session = await transport.createSession({ name: 'Realtime LiveKit Session' });
      expect(session.code).toBe('8K3N7P');
      expect(session.name).toBe('Realtime LiveKit Session');
      expect(sessionHandler).toHaveBeenCalledWith({
        code: '8K3N7P',
        name: 'Realtime LiveKit Session',
        status: 'live',
        createdAt: 1700000000000
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/sessions', expect.objectContaining({
        method: 'POST'
      }));
    });

    it('connect maps HTTP error codes to TransportError events', async () => {
      // Test 404 -> INVALID_CODE
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ code: 'INVALID_CODE', error: 'Session not found' })
      });

      const errorHandler = vi.fn();
      transport.on('error', errorHandler);

      await expect(transport.connect({ role: 'attendee', code: 'XXXXXX', name: 'Test' })).rejects.toThrow();
      expect(errorHandler).toHaveBeenCalledWith({
        code: 'INVALID_CODE',
        message: 'Session not found'
      });

      // Test 409 -> FULL
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ code: 'FULL', error: 'Session is full' })
      });

      await expect(transport.connect({ role: 'attendee', code: 'FULL01', name: 'Test' })).rejects.toThrow();
      expect(errorHandler).toHaveBeenCalledWith({
        code: 'FULL',
        message: 'Session is full'
      });
    });

    it('raiseHand and lowerHand update local attributes and emit self state', async () => {
      const setAttributesMock = vi.fn().mockResolvedValue({});
      transport.room = {
        localParticipant: {
          setAttributes: setAttributesMock
        }
      };

      const selfHandler = vi.fn();
      transport.on('self', selfHandler);

      await transport.raiseHand();
      expect(setAttributesMock).toHaveBeenCalledWith(expect.objectContaining({
        hand: expect.any(String)
      }));
      expect(selfHandler).toHaveBeenCalledWith('hand_raised');

      await transport.lowerHand();
      expect(setAttributesMock).toHaveBeenCalledWith({ hand: '' });
      expect(selfHandler).toHaveBeenCalledWith('listening');
    });

    it('grant and revoke call floor API endpoints with host passcode', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true })
      });

      transport.code = '7M4K9Q';
      await transport.grant('att-alice');
      expect(global.fetch).toHaveBeenCalledWith('/api/floor/grant', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ code: '7M4K9Q', identity: 'att-alice' })
      }));

      await transport.revoke('att-alice');
      expect(global.fetch).toHaveBeenCalledWith('/api/floor/revoke', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ code: '7M4K9Q', identity: 'att-alice' })
      }));
    });

    it('muteSpeaker calls /api/floor/mute and sets local audio muted', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true })
      });

      const fakeAudioEl = { muted: false };
      transport.audioElement = fakeAudioEl;
      transport.code = '7M4K9Q';
      transport.room = {
        remoteParticipants: new Map([
          ['att-speaker', { identity: 'att-speaker', name: 'Sam', attributes: { floor: 'granted' } }]
        ])
      };

      await transport.muteSpeaker(true);
      expect(fakeAudioEl.muted).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/floor/mute', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ code: '7M4K9Q', identity: 'att-speaker', muted: true })
      }));
    });
  });
});
