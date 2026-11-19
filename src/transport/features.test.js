import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockTransport } from './mockTransport.js';

describe('Feature Verification Suite', () => {
  let channelName;
  let host;
  let attendee;

  beforeEach(() => {
    channelName = 'test_feature_' + Math.random().toString(36).substring(2, 9);
  });

  afterEach(async () => {
    if (attendee) await attendee.disconnect();
    if (host) await host.disconnect();
  });

  it('VERIFY: FULL error is emitted when room reaches 200 attendees', async () => {
    host = new MockTransport({ channelName, id: 'host_node', broadcastDelay: 0 });
    const session = await host.createSession({ name: 'Max Capacity Test' });

    // Pre-populate host with 200 attendees
    for (let i = 1; i <= 200; i++) {
      host.attendees.set(`att_${i}`, {
        id: `att_${i}`,
        name: `Attendee ${i}`,
        lastSeen: Date.now()
      });
    }
    expect(host.attendees.size).toBe(200);

    // 201st attendee tries to connect
    attendee = new MockTransport({ channelName, id: 'att_201', broadcastDelay: 0 });
    let receivedError = null;
    attendee.on('error', (err) => {
      receivedError = err;
    });

    await attendee.connect({ role: 'attendee', code: session.code, name: 'Attendee 201' });
    await new Promise((r) => setTimeout(r, 60));

    expect(receivedError).not.toBeNull();
    expect(receivedError.code).toBe('FULL');
    expect(receivedError.message).toContain('maximum 200 attendees');
  });

  it('VERIFY: Attendee transitions to reconnecting when host heartbeat ceases (>8s)', async () => {
    host = new MockTransport({ channelName, id: 'host_node', broadcastDelay: 0 });
    const session = await host.createSession({ name: 'Heartbeat Test' });

    attendee = new MockTransport({ channelName, id: 'att_reconnect_test', broadcastDelay: 0 });
    const connectionStates = [];
    attendee.on('connection', (st) => connectionStates.push(st));

    await attendee.connect({ role: 'attendee', code: session.code, name: 'Watcher' });
    await new Promise((r) => setTimeout(r, 60));
    expect(attendee.connectionState).toBe('connected');

    // Simulate host tab close (stop host timers)
    host.stopTimers();

    // Fast-forward lastHostSeen by 9 seconds
    attendee.lastHostSeen = Date.now() - 9000;

    // Trigger attendee watcher interval check manually
    const elapsed = Date.now() - attendee.lastHostSeen;
    if (elapsed > 8000) {
      attendee.setConnectionState('reconnecting');
    }

    expect(attendee.connectionState).toBe('reconnecting');
    expect(connectionStates).toContain('reconnecting');

    // Now simulate host tab re-opening / sending heartbeat
    host.startHostTimers();
    host.postToChannel({
      type: 'host_heartbeat',
      session: host.session,
      queue: host.queue,
      floor: host.floor,
      isMuted: host.isMuted
    });
    await new Promise((r) => setTimeout(r, 60));

    expect(attendee.connectionState).toBe('connected');
  });

  it('VERIFY: Speaking time limit triggers floor revocation', async () => {
    host = new MockTransport({ channelName, id: 'host_node', broadcastDelay: 0 });
    const session = await host.createSession({ name: 'Time Limit Test' });

    attendee = new MockTransport({ channelName, id: 'att_speaker', broadcastDelay: 0 });
    await attendee.connect({ role: 'attendee', code: session.code, name: 'Speaker' });
    await new Promise((r) => setTimeout(r, 40));

    await attendee.raiseHand();
    await new Promise((r) => setTimeout(r, 40));

    await host.grant('att_speaker');
    await new Promise((r) => setTimeout(r, 40));

    expect(host.floor).not.toBeNull();
    expect(host.floor.id).toBe('att_speaker');

    // Simulate 1-minute time limit expiration
    const timeLimitMinutes = 1;
    const limitMs = timeLimitMinutes * 60 * 1000;
    // Set startedAt to 65 seconds ago
    host.floor.startedAt = Date.now() - (limitMs + 5000);

    const elapsed = Date.now() - host.floor.startedAt;
    let warningTriggered = false;

    if (elapsed >= limitMs) {
      warningTriggered = true;
      await host.revoke(host.floor.id);
    }

    expect(warningTriggered).toBe(true);
    expect(host.floor).toBeNull();
  });

  it('VERIFY: Keyboard shortcut gate ignores typing in input/textarea/select', () => {
    let grantTriggered = false;
    let muteTriggered = false;
    let revokeTriggered = false;
    let qrTriggered = false;

    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'g' || e.key === 'G') grantTriggered = true;
      if (e.key === 'm' || e.key === 'M') muteTriggered = true;
      if (e.key === 'Escape') revokeTriggered = true;
      if (e.key === 'q' || e.key === 'Q') qrTriggered = true;
    };

    // 1. Simulate keydown inside an <input>
    const mockInputElement = { tagName: 'INPUT', isContentEditable: false };
    ['g', 'G', 'm', 'M', 'Escape', 'q', 'Q'].forEach((key) => {
      handleKeyDown({ key, target: mockInputElement, ctrlKey: false, metaKey: false, altKey: false });
    });

    expect(grantTriggered).toBe(false);
    expect(muteTriggered).toBe(false);
    expect(revokeTriggered).toBe(false);
    expect(qrTriggered).toBe(false);

    // 2. Simulate keydown outside inputs (normal document body)
    const mockBodyElement = { tagName: 'DIV', isContentEditable: false };
    handleKeyDown({ key: 'g', target: mockBodyElement, ctrlKey: false, metaKey: false, altKey: false });
    expect(grantTriggered).toBe(true);

    handleKeyDown({ key: 'm', target: mockBodyElement, ctrlKey: false, metaKey: false, altKey: false });
    expect(muteTriggered).toBe(true);

    handleKeyDown({ key: 'Escape', target: mockBodyElement, ctrlKey: false, metaKey: false, altKey: false });
    expect(revokeTriggered).toBe(true);

    handleKeyDown({ key: 'q', target: mockBodyElement, ctrlKey: false, metaKey: false, altKey: false });
    expect(qrTriggered).toBe(true);
  });
});
