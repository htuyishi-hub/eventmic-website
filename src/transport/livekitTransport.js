import { Room, RoomEvent, DisconnectReason, AudioPresets, Track } from 'livekit-client';
import { getOrCreateAttendeeId } from '../lib/ids.js';
import { AudioMeter } from '../lib/audioMeter.js';

const HOST_STORAGE_KEY = 'eventmic_host_session';

/**
 * Pure mapping helper: computes queue, active floor, and attendee count from participant list/map.
 * @param {Map|Array|Object} remoteParticipants
 * @returns {{ attendeeCount: number, queue: Array<{ id: string, name: string, raisedAt: number }>, floor: { id: string, name: string, startedAt: number } | null }}
 */
export function computeQueueAndFloor(remoteParticipants) {
  const participants = remoteParticipants instanceof Map
    ? Array.from(remoteParticipants.values())
    : Array.isArray(remoteParticipants)
    ? remoteParticipants
    : Object.values(remoteParticipants || {});

  const attendees = participants.filter(p => p.identity?.startsWith('att-'));

  let floor = null;
  const speaker = attendees.find(p => p.attributes?.floor === 'granted');
  if (speaker) {
    floor = {
      id: speaker.identity,
      name: speaker.name || 'Attendee',
      startedAt: Number(speaker.attributes?.floorStartedAt) || Date.now()
    };
  }

  const queue = attendees
    .filter(p => {
      const hand = p.attributes?.hand;
      return hand && String(hand).trim() !== '' && p.attributes?.floor !== 'granted';
    })
    .map(p => ({
      id: p.identity,
      name: p.name || 'Attendee',
      raisedAt: Number(p.attributes.hand) || Date.now()
    }))
    .sort((a, b) => a.raisedAt - b.raisedAt);

  return {
    attendeeCount: attendees.length,
    queue,
    floor
  };
}

/**
 * Pure mapping helper: maps LiveKit ConnectionState to EventMic connection state.
 * @param {string} lkState
 * @returns {'connecting' | 'connected' | 'reconnecting' | 'disconnected'}
 */
export function mapConnectionState(lkState) {
  switch (lkState) {
    case 'connecting':
      return 'connecting';
    case 'connected':
      return 'connected';
    case 'reconnecting':
    case 'signalReconnecting':
      return 'reconnecting';
    case 'disconnected':
    default:
      return 'disconnected';
  }
}

/**
 * Real WebRTC transport implementation using LiveKit Cloud and backend API.
 * Adheres strictly to TransportInterface in types.js.
 */
export class LiveKitTransport {
  constructor(options = {}) {
    let rawBase = options.apiBase || import.meta.env?.VITE_API_BASE || '/api';
    rawBase = String(rawBase).trim().replace(/\/+$/, '');
    if (!rawBase.endsWith('/api') && !rawBase.includes('/api')) {
      rawBase = `${rawBase}/api`;
    }
    this.apiBase = rawBase;
    this.room = null;
    this.role = null; // 'host' | 'attendee'
    this.code = null;
    this.sessionName = null;
    this.myId = options.id || null;
    this.connectionState = 'disconnected';
    this.selfState = 'listening';
    this.outputDeviceId = '';
    this.audioElement = null;
    this.audioMeter = new AudioMeter();

    // Event listeners
    this.listeners = new Map();
  }

  /**
   * Subscribe to transport event.
   * @param {string} event
   * @param {Function} handler
   * @returns {() => void}
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => {
      const set = this.listeners.get(event);
      if (set) set.delete(handler);
    };
  }

  /**
   * Emit event to all registered listeners.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(fn => {
        try { fn(data); } catch (e) { console.error(`Error in listener for ${event}:`, e); }
      });
    }
  }

  get canPlaybackAudio() {
    return this.room ? this.room.canPlaybackAudio : true;
  }

  async startAudio() {
    if (this.room) {
      await this.room.startAudio();
    }
  }

  async setOutputDevice(deviceId) {
    this.outputDeviceId = deviceId;
    if (this.audioElement && typeof this.audioElement.setSinkId === 'function') {
      try {
        await this.audioElement.setSinkId(deviceId);
      } catch (err) {
        console.warn('[LiveKitTransport] Failed to set sinkId on audio element:', err);
      }
    }
  }

  _getOrCreateAudioElement() {
    if (!this.audioElement && typeof document !== 'undefined') {
      this.audioElement = document.createElement('audio');
      this.audioElement.autoplay = true;
      this.audioElement.className = 'hidden';
      this.audioElement.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.audioElement);
    }
    return this.audioElement;
  }

  _getHostPasscode() {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('eventmic_host_passcode') || '1234';
    }
    return '1234';
  }

  /**
   * Creates a new live event session on the server (Host only).
   * @param {{ name: string }} params
   * @returns {Promise<import('./types.js').SessionInfo>}
   */
  async createSession({ name }) {
    const passcode = this._getHostPasscode();
    const res = await fetch(`${this.apiBase}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-host-passcode': passcode
      },
      body: JSON.stringify({ name })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.emit('error', {
        code: err.code || 'UNKNOWN',
        message: err.error || 'Failed to create session'
      });
      throw new Error(err.error || 'Failed to create session');
    }

    const data = await res.json();
    const sessionInfo = {
      code: data.code,
      name: data.name,
      status: 'live',
      createdAt: data.createdAt
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HOST_STORAGE_KEY, JSON.stringify(sessionInfo));
    }

    this.code = data.code;
    this.sessionName = data.name;
    this.emit('session', sessionInfo);
    return sessionInfo;
  }

  /**
   * Ends current live event session on server and cleans up (Host only).
   */
  async endSession() {
    if (!this.code) return;
    const passcode = this._getHostPasscode();

    try {
      await fetch(`${this.apiBase}/sessions/${this.code}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-host-passcode': passcode
        }
      });
    } catch {}

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(HOST_STORAGE_KEY);
    }

    await this.disconnect();

    this.emit('session', {
      code: this.code,
      name: this.sessionName || 'Session',
      status: 'ended',
      createdAt: Date.now()
    });
  }

  /**
   * Connects to LiveKit Room as host or attendee.
   * @param {{ role: 'host' | 'attendee', code: string, name?: string }} params
   */
  async connect({ role, code, name }) {
    this.role = role;
    this.code = code.toUpperCase();
    this.sessionName = name || '';

    this.connectionState = 'connecting';
    this.emit('connection', 'connecting');

    let tokenReqBody = {
      role,
      code: this.code,
      name: name || (role === 'host' ? 'Host' : 'Attendee')
    };

    const headers = { 'Content-Type': 'application/json' };

    if (role === 'host') {
      headers['x-host-passcode'] = this._getHostPasscode();
    } else {
      this.myId = getOrCreateAttendeeId();
      tokenReqBody.identity = this.myId;
    }

    let tokenRes;
    try {
      tokenRes = await fetch(`${this.apiBase}/token`, {
        method: 'POST',
        headers,
        body: JSON.stringify(tokenReqBody)
      });
    } catch {
      this.connectionState = 'disconnected';
      this.emit('connection', 'disconnected');
      this.emit('error', { code: 'UNKNOWN', message: 'Network connection failed' });
      throw new Error('Network connection failed');
    }

    if (!tokenRes.ok) {
      this.connectionState = 'disconnected';
      this.emit('connection', 'disconnected');

      const err = await tokenRes.json().catch(() => ({}));
      let errCode = 'UNKNOWN';
      if (tokenRes.status === 404) errCode = 'INVALID_CODE';
      else if (tokenRes.status === 410) errCode = 'SESSION_ENDED';
      else if (tokenRes.status === 409) errCode = 'FULL';
      else if (tokenRes.status === 401) errCode = 'UNAUTHORIZED';

      const errorPayload = {
        code: err.code || errCode,
        message: err.error || 'Failed to acquire session token'
      };
      this.emit('error', errorPayload);
      throw new Error(errorPayload.message);
    }

    const { token, url } = await tokenRes.json();

    // Initialize Room with speech-optimized options
    this.room = new Room({
      adaptiveStream: false,
      dynacast: false,
      audioCaptureDefaults: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1
      },
      publishDefaults: {
        audioPreset: AudioPresets.speech,
        dtx: true,
        red: false
      }
    });

    this._setupRoomEvents();

    try {
      await this.room.connect(url, token);
      this.connectionState = 'connected';
      this.emit('connection', 'connected');

      // Sync initial session info
      const sRes = await fetch(`${this.apiBase}/sessions/${this.code}`).catch(() => null);
      if (sRes && sRes.ok) {
        const sData = await sRes.json();
        this.sessionName = sData.name;
        this.emit('session', {
          code: sData.code,
          name: sData.name,
          status: sData.status,
          createdAt: Date.now()
        });
      }

      if (this.role === 'host') {
        this._getOrCreateAudioElement();
        this._syncHostState();
      } else {
        this.selfState = 'listening';
        this.emit('self', 'listening');
      }
    } catch (err) {
      this.connectionState = 'disconnected';
      this.emit('connection', 'disconnected');
      this.emit('error', { code: 'UNKNOWN', message: err.message || 'Room connection failed' });
      throw err;
    }
  }

  _setupRoomEvents() {
    if (!this.room) return;

    // Connection state changes
    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      const mapped = mapConnectionState(state);
      this.connectionState = mapped;
      this.emit('connection', mapped);
    });

    // Room disconnected
    this.room.on(RoomEvent.Disconnected, (reason) => {
      this.connectionState = 'disconnected';
      this.emit('connection', 'disconnected');
      if (reason === DisconnectReason.ROOM_DELETED) {
        this.emit('session', {
          code: this.code,
          name: this.sessionName || 'Session',
          status: 'ended',
          createdAt: Date.now()
        });
      }
    });

    // Audio playback policy changes
    this.room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      this.emit('audio_playback_status', this.room.canPlaybackAudio);
    });

    if (this.role === 'host') {
      // Re-emit queue, floor, attendee count
      const handleParticipantsChange = () => this._syncHostState();
      this.room.on(RoomEvent.ParticipantConnected, handleParticipantsChange);
      this.room.on(RoomEvent.ParticipantDisconnected, handleParticipantsChange);
      this.room.on(RoomEvent.ParticipantAttributesChanged, handleParticipantsChange);

      // Track subscription (Active speaker audio)
      this.room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio || track.kind === 'audio') {
          const el = this._getOrCreateAudioElement();
          if (el) {
            track.attach(el);
            if (this.outputDeviceId && typeof el.setSinkId === 'function') {
              el.setSinkId(this.outputDeviceId).catch(() => {});
            }
          }

          if (track.mediaStreamTrack) {
            const stream = new MediaStream([track.mediaStreamTrack]);
            this.audioMeter.start(stream, (lvl) => {
              this.emit('level', lvl);
            }, 66);
          }
        }
      });

      this.room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Audio || track.kind === 'audio') {
          track.detach();
          this.audioMeter.stop();
          this.emit('level', 0);
        }
      });
    }

    if (this.role === 'attendee') {
      // Check permissions and floor assignments
      this.room.on(RoomEvent.ParticipantPermissionsChanged, (p) => {
        if (p === this.room.localParticipant) {
          this._checkAttendeeFloor();
        }
      });

      this.room.on(RoomEvent.ParticipantAttributesChanged, (attrs, p) => {
        if (p === this.room.localParticipant) {
          this._checkAttendeeFloor();
        } else {
          this._syncAttendeeQueue();
        }
      });

      // Receive broadcast queue from host
      this.room.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
        if (topic === 'queue') {
          try {
            const decoded = new TextDecoder().decode(payload);
            const data = JSON.parse(decoded);
            if (data.type === 'queue' && Array.isArray(data.queue)) {
              this.emit('queue', data.queue);
            }
          } catch {}
        }
      });
    }
  }

  _syncHostState() {
    if (!this.room || this.role !== 'host') return;

    const { attendeeCount, queue, floor } = computeQueueAndFloor(this.room.remoteParticipants);
    this.emit('attendees', { count: attendeeCount });
    this.emit('queue', queue);
    this.emit('floor', floor);

    // Broadcast queue to attendees
    if (this.room.localParticipant?.permissions?.canPublishData) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ type: 'queue', queue }));
        this.room.localParticipant.publishData(payload, { topic: 'queue', reliable: true }).catch(() => {});
      } catch {}
    }
  }

  _syncAttendeeQueue() {
    if (!this.room || this.role !== 'attendee') return;

    const participants = Array.from(this.room.remoteParticipants.values());
    if (this.room.localParticipant) {
      participants.push(this.room.localParticipant);
    }

    const queue = participants
      .filter(p => {
        const hand = p.attributes?.hand;
        return hand && String(hand).trim() !== '' && p.attributes?.floor !== 'granted';
      })
      .map(p => ({
        id: p.identity,
        name: p.name || 'Attendee',
        raisedAt: Number(p.attributes.hand) || Date.now()
      }))
      .sort((a, b) => a.raisedAt - b.raisedAt);

    if (queue.length > 0) {
      this.emit('queue', queue);
    }
  }

  async _checkAttendeeFloor() {
    if (!this.room?.localParticipant) return;
    const local = this.room.localParticipant;
    const canPublish = Boolean(local.permissions?.canPublish || local.attributes?.floor === 'granted');

    if (canPublish) {
      if (this.selfState !== 'on_air') {
        this.selfState = 'on_air';
        this.emit('self', 'on_air');

        try {
          await local.setMicrophoneEnabled(true);
        } catch (err) {
          console.warn('[LiveKitTransport] Microphone enable failed:', err);
          this.emit('error', { code: 'MIC_DENIED', message: 'Microphone permission denied' });
        }
      }
    } else {
      if (this.selfState === 'on_air') {
        try {
          await local.setMicrophoneEnabled(false);
        } catch {}
      }

      if (local.attributes?.hand && String(local.attributes.hand).trim() !== '') {
        this.selfState = 'hand_raised';
        this.emit('self', 'hand_raised');
      } else {
        this.selfState = 'listening';
        this.emit('self', 'listening');
      }
    }
  }

  /**
   * Disconnects from the LiveKit room and cleans up resources.
   */
  async disconnect() {
    this.audioMeter.stop();

    if (this.audioElement) {
      this.audioElement.srcObject = null;
    }

    if (this.room) {
      if (this.room.localParticipant) {
        try {
          await this.room.localParticipant.setMicrophoneEnabled(false);
        } catch {}
      }
      try {
        await this.room.disconnect();
      } catch {}
      this.room = null;
    }

    this.connectionState = 'disconnected';
    this.emit('connection', 'disconnected');
  }

  /**
   * Raises hand (Attendee only).
   */
  async raiseHand() {
    if (this.room?.localParticipant) {
      await this.room.localParticipant.setAttributes({ hand: String(Date.now()) });
      this.selfState = 'hand_raised';
      this.emit('self', 'hand_raised');
    }
  }

  /**
   * Lowers hand (Attendee only).
   */
  async lowerHand() {
    if (this.room?.localParticipant) {
      await this.room.localParticipant.setAttributes({ hand: '' });
      this.selfState = 'listening';
      this.emit('self', 'listening');
    }
  }

  /**
   * Grants floor to attendee (Host only).
   * @param {string} attendeeId
   */
  async grant(attendeeId) {
    const passcode = this._getHostPasscode();
    const res = await fetch(`${this.apiBase}/floor/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-host-passcode': passcode
      },
      body: JSON.stringify({ code: this.code, identity: attendeeId })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to grant floor');
    }
  }

  /**
   * Revokes floor from attendee (Host only).
   * @param {string} attendeeId
   */
  async revoke(attendeeId) {
    const passcode = this._getHostPasscode();
    const res = await fetch(`${this.apiBase}/floor/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-host-passcode': passcode
      },
      body: JSON.stringify({ code: this.code, identity: attendeeId })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to revoke floor');
    }
  }

  /**
   * Server-side and local mute for active speaker (Host only).
   * @param {boolean} muted
   */
  async muteSpeaker(muted) {
    if (this.audioElement) {
      this.audioElement.muted = Boolean(muted);
    }

    if (!this.room) return;
    const { floor } = computeQueueAndFloor(this.room.remoteParticipants);
    if (!floor) return;

    const passcode = this._getHostPasscode();
    try {
      await fetch(`${this.apiBase}/floor/mute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-host-passcode': passcode
        },
        body: JSON.stringify({ code: this.code, identity: floor.id, muted: Boolean(muted) })
      });
    } catch (err) {
      console.warn('[LiveKitTransport] Failed to mute speaker on server:', err);
    }
  }

  /**
   * Send audio level (~10x/sec while on air).
   * @param {number} level
   */
  async sendLevel(level) {
    // In LiveKit, real WebRTC audio is published; sendLevel is kept for TransportInterface parity
    return Promise.resolve();
  }
}
