import { generateSessionCode, getOrCreateAttendeeId } from '../lib/ids.js';

const HOST_STORAGE_KEY = 'eventmic_host_session';
const DEFAULT_CHANNEL = 'eventmic';
const HEARTBEAT_INTERVAL_MS = 3000;
const HEARTBEAT_TIMEOUT_MS = 8000;
const DISCONNECT_TIMEOUT_MS = 30000;
const MAX_ATTENDEES = 200;

export class MockTransport {
  constructor(options = {}) {
    this.channelName = options.channelName || DEFAULT_CHANNEL;
    this.channel = null;
    this.role = null; // 'host' | 'attendee'
    this.code = null;
    this.name = null;
    this.myId = options.id || getOrCreateAttendeeId();
    this.broadcastDelay = options.broadcastDelay !== undefined ? options.broadcastDelay : null;

    // Event listeners: Map<eventName, Set<Function>>
    this.listeners = new Map();

    // State
    this.connectionState = 'disconnected';
    this.session = null;
    this.queue = [];
    this.floor = null;
    this.isMuted = false;
    this.selfState = 'listening';

    // Host-specific state
    this.attendees = new Map(); // id -> { id, name, lastSeen }
    this.heartbeatTimer = null;
    this.cleanerTimer = null;

    // Attendee-specific state
    this.lastHostSeen = 0;
    this.hostWatchTimer = null;
    this.attendeeHeartbeatTimer = null;
  }

  /**
   * Subscribe to transport event. Returns an unsubscribe function.
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
      if (set) {
        set.delete(handler);
      }
    };
  }

  /**
   * Internal emitter to notify subscribers.
   */
  emit(event, data) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[MockTransport] Handler error on '${event}':`, err);
        }
      });
    }
  }

  setConnectionState(state) {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.emit('connection', state);
    }
  }

  /**
   * Helper to execute function with artificial network delay (50-150ms).
   */
  delayedDispatch(fn, customDelay) {
    let delay = customDelay;
    if (this.broadcastDelay !== null) {
      delay = this.broadcastDelay;
    } else if (delay === undefined) {
      delay = Math.floor(Math.random() * 100) + 50;
    }
    setTimeout(fn, delay);
  }

  /**
   * Initializes BroadcastChannel.
   */
  ensureChannel() {
    if (!this.channel) {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = (event) => this.handleMessage(event.data);
    }
  }

  /**
   * Host only: creates a new session.
   * @param {{ name: string }} params 
   * @returns {Promise<import('./types.js').SessionInfo>}
   */
  async createSession({ name }) {
    this.role = 'host';
    this.ensureChannel();

    const code = generateSessionCode();
    const session = {
      code,
      name: name.trim(),
      status: 'live',
      createdAt: Date.now()
    };

    this.session = session;
    this.code = code;
    this.queue = [];
    this.floor = null;
    this.attendees.clear();
    this.isMuted = false;

    this.saveHostSession();
    this.setConnectionState('connected');
    this.startHostTimers();

    this.broadcastState();
    this.emit('session', session);
    this.emit('queue', this.queue);
    this.emit('floor', this.floor);
    this.emit('attendees', { count: 0 });

    return session;
  }

  /**
   * Host only: restores a previously saved host session if valid.
   */
  restoreHostSession() {
    try {
      const saved = localStorage.getItem(HOST_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.session && parsed.session.status === 'live') {
        return parsed;
      }
    } catch {}
    return null;
  }

  /**
   * Connect to an existing session as host or attendee.
   * @param {{ role: 'host' | 'attendee', code: string, name?: string }} params 
   */
  async connect({ role, code, name }) {
    this.role = role;
    this.code = code ? code.trim().toUpperCase() : '';
    this.name = name ? name.trim() : '';
    this.ensureChannel();

    this.setConnectionState('connecting');

    if (role === 'host') {
      const saved = this.restoreHostSession();
      if (saved && saved.session.code === this.code) {
        this.session = saved.session;
        this.queue = saved.queue || [];
        this.floor = saved.floor || null;
      } else {
        this.session = {
          code: this.code,
          name: this.name || 'Live Q&A Session',
          status: 'live',
          createdAt: Date.now()
        };
        this.queue = [];
        this.floor = null;
      }
      this.saveHostSession();
      this.setConnectionState('connected');
      this.startHostTimers();
      this.broadcastState();
      this.emit('session', this.session);
      this.emit('queue', this.queue);
      this.emit('floor', this.floor);
      this.emit('attendees', { count: this.attendees.size });
      return;
    }

    // Attendee connection: send hello to host and await validation
    this.lastHostSeen = Date.now();
    this.startAttendeeWatchers();

    this.delayedDispatch(() => {
      this.postToChannel({
        type: 'attendee_hello',
        code: this.code,
        id: this.myId,
        name: this.name
      });
    }, 50);
  }

  /**
   * Disconnects current transport.
   */
  async disconnect() {
    if (this.role === 'attendee' && this.code) {
      this.postToChannel({
        type: 'attendee_bye',
        code: this.code,
        id: this.myId
      });
    }

    this.stopTimers();
    if (this.channel) {
      try { this.channel.close(); } catch {}
      this.channel = null;
    }

    this.setConnectionState('disconnected');
  }

  /**
   * Host only: ends the current session.
   */
  async endSession() {
    if (this.role !== 'host' || !this.session) return;

    this.session.status = 'ended';
    this.floor = null;
    this.queue = [];
    this.saveHostSession();

    this.postToChannel({
      type: 'session_ended',
      code: this.code,
      session: this.session
    });

    this.emit('session', this.session);
    this.emit('floor', null);
    this.emit('queue', []);
    this.stopTimers();
  }

  /**
   * Attendee only: raises hand.
   */
  async raiseHand() {
    if (this.role !== 'attendee' || !this.code) return;
    this.postToChannel({
      type: 'attendee_raise',
      code: this.code,
      id: this.myId,
      name: this.name
    });
  }

  /**
   * Attendee only: lowers hand or stops speaking.
   */
  async lowerHand() {
    if (this.role !== 'attendee' || !this.code) return;
    this.postToChannel({
      type: 'attendee_lower',
      code: this.code,
      id: this.myId
    });
  }

  /**
   * Host only: grants floor to attendeeId (revokes current speaker first).
   * @param {string} attendeeId 
   */
  async grant(attendeeId) {
    if (this.role !== 'host') return;
    if (!attendeeId) return;

    // Find attendee in queue
    const queuedIdx = this.queue.findIndex(item => item.id === attendeeId);
    let targetAttendee = null;

    if (queuedIdx !== -1) {
      targetAttendee = this.queue[queuedIdx];
      this.queue.splice(queuedIdx, 1);
    } else if (this.attendees.has(attendeeId)) {
      targetAttendee = this.attendees.get(attendeeId);
    }

    if (!targetAttendee) return; // Granting nobody is a no-op

    // Enforce one speaker rule: revoke current speaker first
    this.floor = {
      id: targetAttendee.id,
      name: targetAttendee.name,
      startedAt: Date.now()
    };

    this.saveHostSession();
    this.broadcastState();
    this.emit('floor', this.floor);
    this.emit('queue', [...this.queue]);
  }

  /**
   * Host only: revokes floor from attendee.
   * @param {string} [attendeeId] 
   */
  async revoke(attendeeId) {
    if (this.role !== 'host') return;
    if (!this.floor) return;

    if (!attendeeId || this.floor.id === attendeeId) {
      this.floor = null;
      this.saveHostSession();
      this.broadcastState();
      this.emit('floor', null);
    }
  }

  /**
   * Host only: mutes or unmutes speaker.
   * @param {boolean} muted 
   */
  async muteSpeaker(muted) {
    if (this.role !== 'host') return;
    this.isMuted = !!muted;
    this.postToChannel({
      type: 'speaker_muted',
      code: this.code,
      muted: this.isMuted
    });
  }

  /**
   * Attendee only: sends real mic audio level (0..1) while on air.
   * @param {number} level 
   */
  async sendLevel(level) {
    if (this.role !== 'attendee' || !this.code) return;
    const clamped = Math.min(1, Math.max(0, level));
    this.postToChannel({
      type: 'attendee_level',
      code: this.code,
      id: this.myId,
      level: clamped
    });
  }

  // -------------------------------------------------------------
  // Internal Messaging & State Management
  // -------------------------------------------------------------

  postToChannel(msg) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.error('[MockTransport] Failed to post message:', err);
      }
    }
  }

  handleMessage(msg) {
    if (!msg || typeof msg !== 'object') return;

    if (this.role === 'host') {
      this.handleHostMessage(msg);
    } else if (this.role === 'attendee') {
      this.handleAttendeeMessage(msg);
    }
  }

  handleHostMessage(msg) {
    // Ignore messages for other session codes
    if (msg.code && this.session && msg.code !== this.session.code) {
      if (msg.type === 'attendee_hello') {
        this.postToChannel({
          type: 'host_error',
          targetId: msg.id,
          code: 'INVALID_CODE',
          message: `Session code ${msg.code} does not exist.`
        });
      }
      return;
    }

    const now = Date.now();

    switch (msg.type) {
      case 'attendee_hello': {
        if (!this.session || this.session.status === 'ended') {
          this.postToChannel({
            type: 'host_error',
            targetId: msg.id,
            code: 'SESSION_ENDED',
            message: 'This session has already ended.'
          });
          return;
        }

        if (this.attendees.size >= MAX_ATTENDEES && !this.attendees.has(msg.id)) {
          this.postToChannel({
            type: 'host_error',
            targetId: msg.id,
            code: 'FULL',
            message: 'Session is full (maximum 200 attendees reached).'
          });
          return;
        }

        this.attendees.set(msg.id, {
          id: msg.id,
          name: msg.name || 'Anonymous',
          lastSeen: now
        });

        this.emit('attendees', { count: this.attendees.size });

        // Immediate targeted sync
        this.delayedDispatch(() => {
          this.postToChannel({
            type: 'host_sync_target',
            targetId: msg.id,
            session: this.session,
            queue: this.queue,
            floor: this.floor,
            isMuted: this.isMuted
          });
        });
        break;
      }

      case 'attendee_heartbeat': {
        if (this.attendees.has(msg.id)) {
          const item = this.attendees.get(msg.id);
          item.lastSeen = now;
        }
        break;
      }

      case 'attendee_bye': {
        this.removeAttendee(msg.id);
        break;
      }

      case 'attendee_raise': {
        if (this.session && this.session.status === 'live') {
          const alreadyQueued = this.queue.some(item => item.id === msg.id);
          const isCurrentSpeaker = this.floor && this.floor.id === msg.id;

          if (!alreadyQueued && !isCurrentSpeaker) {
            this.queue.push({
              id: msg.id,
              name: msg.name || (this.attendees.get(msg.id)?.name || 'Attendee'),
              raisedAt: now
            });
            // Sorted oldest first
            this.queue.sort((a, b) => a.raisedAt - b.raisedAt);
            this.saveHostSession();
            this.broadcastState();
            this.emit('queue', [...this.queue]);
          }
        }
        break;
      }

      case 'attendee_lower': {
        const initialLen = this.queue.length;
        this.queue = this.queue.filter(item => item.id !== msg.id);

        let floorChanged = false;
        if (this.floor && this.floor.id === msg.id) {
          this.floor = null;
          floorChanged = true;
        }

        if (this.queue.length !== initialLen || floorChanged) {
          this.saveHostSession();
          this.broadcastState();
          if (this.queue.length !== initialLen) this.emit('queue', [...this.queue]);
          if (floorChanged) this.emit('floor', null);
        }
        break;
      }

      case 'attendee_level': {
        // Only accept audio level from current active speaker
        if (this.floor && this.floor.id === msg.id) {
          this.emit('level', this.isMuted ? 0 : msg.level);
        }
        break;
      }
    }
  }

  handleAttendeeMessage(msg) {
    switch (msg.type) {
      case 'host_error': {
        if (msg.targetId === this.myId) {
          this.emit('error', { code: msg.code, message: msg.message });
          this.setConnectionState('disconnected');
        }
        break;
      }

      case 'host_sync_target': {
        if (msg.targetId === this.myId) {
          this.lastHostSeen = Date.now();
          this.setConnectionState('connected');
          this.session = msg.session;
          this.queue = msg.queue || [];
          this.floor = msg.floor || null;
          this.isMuted = !!msg.isMuted;
          this.emit('session', this.session);
          this.emit('queue', this.queue);
          this.emit('floor', this.floor);
          this.updateSelfState();
        }
        break;
      }

      case 'host_state':
      case 'host_heartbeat': {
        if (msg.session && msg.session.code === this.code) {
          this.lastHostSeen = Date.now();
          if (this.connectionState !== 'connected') {
            this.setConnectionState('connected');
          }

          this.session = msg.session;
          this.queue = msg.queue || [];
          this.floor = msg.floor || null;
          this.isMuted = !!msg.isMuted;

          this.emit('session', this.session);
          this.emit('queue', this.queue);
          this.emit('floor', this.floor);
          this.updateSelfState();
        }
        break;
      }

      case 'session_ended': {
        if (msg.code === this.code) {
          this.session = msg.session;
          this.floor = null;
          this.queue = [];
          this.emit('session', this.session);
          this.emit('floor', null);
          this.emit('queue', []);
          this.updateSelfState();
        }
        break;
      }
    }
  }

  updateSelfState() {
    let nextState = 'listening';
    if (this.floor && this.floor.id === this.myId) {
      nextState = 'on_air';
    } else if (this.queue.some(item => item.id === this.myId)) {
      nextState = 'hand_raised';
    }

    if (this.selfState !== nextState) {
      this.selfState = nextState;
      this.emit('self', nextState);
    }
  }

  removeAttendee(id) {
    this.attendees.delete(id);
    this.emit('attendees', { count: this.attendees.size });

    const qLen = this.queue.length;
    this.queue = this.queue.filter(item => item.id !== id);

    let floorChanged = false;
    if (this.floor && this.floor.id === id) {
      this.floor = null;
      floorChanged = true;
    }

    if (this.queue.length !== qLen || floorChanged) {
      this.saveHostSession();
      this.broadcastState();
      if (this.queue.length !== qLen) this.emit('queue', [...this.queue]);
      if (floorChanged) this.emit('floor', null);
    }
  }

  broadcastState() {
    this.delayedDispatch(() => {
      this.postToChannel({
        type: 'host_state',
        session: this.session,
        queue: this.queue,
        floor: this.floor,
        isMuted: this.isMuted,
        attendeeCount: this.attendees.size
      });
    });
  }

  startHostTimers() {
    this.stopTimers();

    // Host heartbeat every 3 seconds
    this.heartbeatTimer = setInterval(() => {
      this.postToChannel({
        type: 'host_heartbeat',
        session: this.session,
        queue: this.queue,
        floor: this.floor,
        isMuted: this.isMuted,
        attendeeCount: this.attendees.size
      });
    }, HEARTBEAT_INTERVAL_MS);

    // Cleaner for dead attendees (missed 8s heartbeat)
    this.cleanerTimer = setInterval(() => {
      const now = Date.now();
      let changed = false;

      this.attendees.forEach((item, id) => {
        if (now - item.lastSeen > HEARTBEAT_TIMEOUT_MS) {
          this.attendees.delete(id);
          changed = true;
          // Also remove from queue or floor if needed
          this.queue = this.queue.filter(q => q.id !== id);
          if (this.floor && this.floor.id === id) {
            this.floor = null;
          }
        }
      });

      if (changed) {
        this.saveHostSession();
        this.broadcastState();
        this.emit('attendees', { count: this.attendees.size });
        this.emit('queue', [...this.queue]);
        this.emit('floor', this.floor);
      }
    }, 2000);
  }

  startAttendeeWatchers() {
    this.stopTimers();

    // Attendee sends heartbeat every 3 seconds
    this.attendeeHeartbeatTimer = setInterval(() => {
      this.postToChannel({
        type: 'attendee_heartbeat',
        code: this.code,
        id: this.myId
      });
    }, HEARTBEAT_INTERVAL_MS);

    // Attendee watches for missing host heartbeat
    this.hostWatchTimer = setInterval(() => {
      const elapsed = Date.now() - this.lastHostSeen;

      if (elapsed > DISCONNECT_TIMEOUT_MS) {
        this.setConnectionState('disconnected');
      } else if (elapsed > HEARTBEAT_TIMEOUT_MS) {
        this.setConnectionState('reconnecting');
      }
    }, 2000);
  }

  stopTimers() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.cleanerTimer) clearInterval(this.cleanerTimer);
    if (this.attendeeHeartbeatTimer) clearInterval(this.attendeeHeartbeatTimer);
    if (this.hostWatchTimer) clearInterval(this.hostWatchTimer);

    this.heartbeatTimer = null;
    this.cleanerTimer = null;
    this.attendeeHeartbeatTimer = null;
    this.hostWatchTimer = null;
  }

  saveHostSession() {
    if (!this.session) return;
    try {
      localStorage.setItem(
        HOST_STORAGE_KEY,
        JSON.stringify({
          session: this.session,
          queue: this.queue,
          floor: this.floor
        })
      );
    } catch {}
  }

  async setOutputDevice(deviceId) {
    this.outputDeviceId = deviceId;
  }

  get canPlaybackAudio() {
    return true;
  }

  async startAudio() {
    return Promise.resolve();
  }
}
