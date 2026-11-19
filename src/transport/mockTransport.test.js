import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockTransport } from './mockTransport.js';

describe('MockTransport Unit Tests', () => {
  let channelName;
  let host;
  let attendee1;
  let attendee2;

  beforeEach(() => {
    // Unique channel per test to isolate BroadcastChannel messages
    channelName = 'test_channel_' + Math.random().toString(36).substring(2, 9);
  });

  afterEach(async () => {
    if (attendee1) await attendee1.disconnect();
    if (attendee2) await attendee2.disconnect();
    if (host) await host.disconnect();
  });

  it('maintains strict FIFO queue order (oldest raisedAt first)', async () => {
    host = new MockTransport({ channelName, id: 'host_node', broadcastDelay: 10 });
    const session = await host.createSession({ name: 'Keynote Q&A' });

    attendee1 = new MockTransport({ channelName, id: 'att_1', broadcastDelay: 10 });
    attendee2 = new MockTransport({ channelName, id: 'att_2', broadcastDelay: 10 });

    await attendee1.connect({ role: 'attendee', code: session.code, name: 'Alice' });
    await attendee2.connect({ role: 'attendee', code: session.code, name: 'Bob' });
    await new Promise(r => setTimeout(r, 60));

    // Attendee 1 raises hand first
    await attendee1.raiseHand();
    await new Promise(r => setTimeout(r, 40));

    // Attendee 2 raises hand second
    await attendee2.raiseHand();
    await new Promise(r => setTimeout(r, 60));

    expect(host.queue.length).toBe(2);
    expect(host.queue[0].id).toBe('att_1');
    expect(host.queue[0].name).toBe('Alice');
    expect(host.queue[1].id).toBe('att_2');
    expect(host.queue[1].name).toBe('Bob');
    expect(host.queue[0].raisedAt).toBeLessThanOrEqual(host.queue[1].raisedAt);
  });

  it('enforces one-speaker rule: granting next revokes the current speaker', async () => {
    host = new MockTransport({ channelName, id: 'host_node', broadcastDelay: 10 });
    const session = await host.createSession({ name: 'All-Hands' });

    attendee1 = new MockTransport({ channelName, id: 'att_1', broadcastDelay: 10 });
    attendee2 = new MockTransport({ channelName, id: 'att_2', broadcastDelay: 10 });

    await attendee1.connect({ role: 'attendee', code: session.code, name: 'Alice' });
    await attendee2.connect({ role: 'attendee', code: session.code, name: 'Bob' });
    await new Promise(r => setTimeout(r, 60));

    await attendee1.raiseHand();
    await attendee2.raiseHand();
    await new Promise(r => setTimeout(r, 60));

    // Grant floor to attendee 1
    await host.grant('att_1');
    await new Promise(r => setTimeout(r, 50));

    expect(host.floor).not.toBeNull();
    expect(host.floor.id).toBe('att_1');
    expect(host.floor.name).toBe('Alice');
    expect(host.queue.length).toBe(1);

    // Grant floor to attendee 2 (must revoke attendee 1)
    await host.grant('att_2');
    await new Promise(r => setTimeout(r, 50));

    expect(host.floor).not.toBeNull();
    expect(host.floor.id).toBe('att_2');
    expect(host.floor.name).toBe('Bob');
    expect(host.queue.length).toBe(0);
  });

  it('automatically removes attendee from queue and floor on disconnect', async () => {
    host = new MockTransport({ channelName, id: 'host_node', broadcastDelay: 10 });
    const session = await host.createSession({ name: 'Tech Talk' });

    attendee1 = new MockTransport({ channelName, id: 'att_1', broadcastDelay: 10 });
    attendee2 = new MockTransport({ channelName, id: 'att_2', broadcastDelay: 10 });

    await attendee1.connect({ role: 'attendee', code: session.code, name: 'Alice' });
    await attendee2.connect({ role: 'attendee', code: session.code, name: 'Bob' });
    await new Promise(r => setTimeout(r, 60));

    await attendee1.raiseHand();
    await attendee2.raiseHand();
    await new Promise(r => setTimeout(r, 60));

    // Grant attendee 1 to floor
    await host.grant('att_1');
    await new Promise(r => setTimeout(r, 50));

    expect(host.floor.id).toBe('att_1');
    expect(host.queue.length).toBe(1);

    // Attendee 2 (in queue) disconnects
    await attendee2.disconnect();
    await new Promise(r => setTimeout(r, 50));

    expect(host.queue.length).toBe(0);
    expect(host.floor.id).toBe('att_1');

    // Attendee 1 (on floor) disconnects
    await attendee1.disconnect();
    await new Promise(r => setTimeout(r, 50));

    expect(host.floor).toBeNull();
  });

  it('rejects connection with INVALID_CODE if code does not match host', async () => {
    host = new MockTransport({ channelName, id: 'host_node', broadcastDelay: 10 });
    await host.createSession({ name: 'Security Review' });

    attendee1 = new MockTransport({ channelName, id: 'att_invalid', broadcastDelay: 10 });

    let capturedError = null;
    attendee1.on('error', (err) => {
      capturedError = err;
    });

    await attendee1.connect({ role: 'attendee', code: 'ZZZZZZ', name: 'Intruder' });
    await new Promise(r => setTimeout(r, 80));

    expect(capturedError).not.toBeNull();
    expect(capturedError.code).toBe('INVALID_CODE');
  });

  it('tracks attendee selfState correctly across listening, hand_raised, and on_air', async () => {
    host = new MockTransport({ channelName, id: 'host_node', broadcastDelay: 10 });
    const session = await host.createSession({ name: 'Town Hall' });

    attendee1 = new MockTransport({ channelName, id: 'att_self_test', broadcastDelay: 10 });

    const states = [];
    attendee1.on('self', (st) => states.push(st));

    await attendee1.connect({ role: 'attendee', code: session.code, name: 'Sam' });
    await new Promise(r => setTimeout(r, 60));

    // Raise hand
    await attendee1.raiseHand();
    await new Promise(r => setTimeout(r, 60));

    // Host grants floor
    await host.grant('att_self_test');
    await new Promise(r => setTimeout(r, 60));

    // Host revokes floor
    await host.revoke('att_self_test');
    await new Promise(r => setTimeout(r, 60));

    expect(states).toContain('hand_raised');
    expect(states).toContain('on_air');
    expect(states).toContain('listening');
  });
});
