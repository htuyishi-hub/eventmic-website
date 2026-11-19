# EventMic Web (Phase 1 & Phase 2: LiveKit Real Audio)

**EventMic** turns attendees' smartphones into wireless stage Q&A microphones entirely in the browser. Zero native apps, zero friction.

- **Phase 1**: In-browser `BroadcastChannel` mock transport for local offline multi-tab testing.
- **Phase 2**: Real-time WebRTC audio streaming powered by **LiveKit Cloud** and `eventmic-server`. Attendees' smartphone microphones are captured, transmitted over WebRTC with speech-optimized Opus audio, and played directly through the host's mixing console or sound system.

---

## Architecture Overview

```
                      ┌──────────────────────┐
                      │    LiveKit Cloud     │
                      │ (SFU Media Server)   │
                      └───────▲──────┬───────┘
          Attendee Mic Track  │      │ Speaker Track Subscribed
        (Opus speech 24kbps)  │      │ + Live Audio Level
                              │      ▼
      ┌─────────────────────────┐  ┌─────────────────────────┐
      │   Phone (Attendee)      │  │   Laptop (Host Console) │
      │  /join/:code            │  │  /host                  │
      │                         │  │                         │
      │  • Web Audio Mic        │  │  • StageView Meter      │
      │  • Raise/Lower Intent   │  │  • Floor Grant / Revoke │
      │  • In-Line Queue Pos    │  │  • Audio Output Routing │
      └───────────┬─────────────┘  └───────────▲─────────────┘
                  │                            │
                  ▼                            │
         ┌─────────────────────────────────────┴─────────────┐
         │       eventmic-server (Node.js + Express)         │
         │  • LiveKit Token Issuer (RoomAdmin / Attendee)    │
         │  • Floor Permission & Track Mute Controller       │
         │  • In-Memory Session Store & 200 Cap              │
         └───────────────────────────────────────────────────┘
```

The application strictly decouples signaling and audio behind the `TransportInterface` (`src/transport/types.js`), allowing instant switching between `mock` and `livekit` via `VITE_TRANSPORT`.

---

## Prerequisites & LiveKit Cloud Setup

1. **Create a Free LiveKit Cloud Account**:
   - Sign up at [cloud.livekit.io](https://cloud.livekit.io).
   - Create a project (e.g., `eventmic-prod`).
   - Go to **Project Settings &rarr; Keys** to generate an **API Key** and **API Secret**.
   - Copy your WebSocket URL (`wss://<your-project>.livekit.cloud`).

2. **Configure Server Environment (`eventmic-server/.env`)**:
   ```bash
   cd ../eventmic-server
   cp .env.example .env
   ```
   Fill in your credentials:
   ```env
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your-api-key
   LIVEKIT_API_SECRET=your-api-secret
   HOST_PASSCODE=1234
   PORT=3001
   ```
   > [!WARNING]
   > Never commit `.env` or expose the API secret to frontend client bundles.

3. **Configure Web Client (`eventmic-web/.env`)**:
   ```bash
   cd ../eventmic-web
   cp .env.example .env
   ```
   Default settings:
   ```env
   VITE_TRANSPORT=livekit
   VITE_API_BASE=/api
   VITE_HOST_PASSCODE=1234
   ```

---

## Running the Application

### 1. Combined Development Mode (`dev:all`)

Runs both the Express API backend (`port 3001`) and the Vite dev server (`port 5173`) concurrently:

```bash
cd eventmic-web
npm run dev:all
```

Vite proxies `/api/*` requests to `http://localhost:3001`, so a single host or tunnel URL serves both the web frontend and API.

### 2. HTTPS Tunnel for Real Smartphone Testing

Mobile browsers (iOS Safari, Android Chrome) strictly require **HTTPS** to allow microphone access (`getUserMedia`). When testing with real phones, expose the Vite port (`5173`) using a secure tunnel:

**Using Cloudflare Tunnel (Recommended):**
```bash
cloudflared tunnel --url http://localhost:5173
```

**Using Ngrok:**
```bash
ngrok http 5173
```

1. Open the provided `https://...` tunnel URL on your laptop at `/host` (e.g. `https://random-name.trycloudflare.com/host`).
2. Unlock the console using passcode `1234` and start a session.
3. The on-screen QR code and **Copy Link** button dynamically use `window.location.origin`, pointing directly to the HTTPS tunnel URL.
4. Scan the QR code with your smartphone to join as an attendee.

---

## Latency Testing (Clap Test)

EventMic achieves ultra-low speech latency over LiveKit's SFU WebRTC pipeline. To measure real-world acoustic latency:

1. Bring the attendee phone and the host laptop (with speakers active) into the same room.
2. Grant the phone the floor.
3. Perform a loud, sharp **clap** near the phone's microphone.
4. Record both the original physical clap and the laptop speaker's playback on a third device (or audio editor like Audacity).
5. Measure the delta between the two waveform transients:
   - Typical local Wi-Fi / 5G latency: **60 ms – 140 ms**.

---

## 11-Step Manual Test Protocol

Follow this protocol to verify the complete Phase 2 real-audio workflow:

1. **Environment Setup**:
   Fill `eventmic-server/.env` with your LiveKit credentials. In `eventmic-web`, run:
   ```bash
   npm run dev:all
   ```
2. **Host Launch & Audio Unlock**:
   Start a Cloudflare or Ngrok HTTPS tunnel to `http://localhost:5173`. Open the HTTPS tunnel URL on your laptop at `/host`. Enter passcode `1234`, click **Unlock Console**, enter a session name (e.g., `All-Hands Q&A`), and click **Start session**. If prompted, click **Start audio** to permit audio output.
3. **Attendee Mobile Join**:
   Scan the host's on-screen QR code with a real smartphone. Enter a name (e.g., `Sarah`) and tap **Join Room**. The phone confirms: *"You're connected"*.
4. **Raise Hand**:
   Tap **Raise Hand** on the phone. Verify the host console's **Up Next** queue updates immediately showing Sarah with a live wait timer. The phone displays: *"You are #1 in line"*.
5. **Grant Floor & Real Audio**:
   On the host console, click **Grant Next (G)**. The phone automatically transitions to the red **You're Live** screen and prompts for microphone access. Allow microphone permission and speak into the phone: verify audio plays through the laptop speakers in real time and the host's **StageView** level meter pulses in sync.
6. **Mute & Floor Revocation**:
   On the host console, press **M** (or tap **Mute Speaker**): verify the laptop audio mutes instantly. Click **End Speaker** (or press **Esc**): verify the phone returns to the listening screen with a notification.
7. **One-Speaker Rule & Preemption**:
   Join a second phone or browser tab (e.g., `Alex`). Raise hands on both. Grant Sarah. While Sarah is speaking live, grant Alex. Verify Sarah's microphone cuts immediately, returning her to the listening screen, while Alex becomes the sole active on-air speaker.
8. **Screen Lock Behavior**:
   While live on-air, lock the phone's screen. Due to mobile operating system power management, background tabs may pause WebRTC tracks. When unlocked, the tab automatically resumes without dropping the session.
9. **Network Interruption (Wi-Fi Dropout)**:
   While connected as an attendee, toggle airplane mode on the phone for 10 seconds, then re-enable connectivity. Observe the top yellow warning banner: *"Reconnecting to host..."*. LiveKit automatically re-establishes the ICE connection and returns to *"connected"*.
10. **End Session**:
    On the host console, click **End Session** and confirm. Verify all connected attendee phones immediately transition to the **Session Ended** screen. The host console displays the **SessionSummary** with duration, speaker count, and total hands raised.
11. **Measure Latency (Clap Test)**:
    Perform the clap test described above and verify latency is under 150 ms.

---

## Known Limitations and Deviations

1. **Browser Autoplay & Audio Output**:
   - Modern browsers (Chrome, Safari) block unprompted Web Audio playback without a prior user gesture. If the host opens the dashboard without interacting with the page, audio output may be suspended until the host clicks the prominent **Start Audio** button.
2. **Mobile Background Audio & Screen Lock**:
   - Web browsers on mobile devices (iOS Safari in particular) pause `getUserMedia` microphone tracks and throttle WebRTC background threads when the screen is locked or the browser is minimized. When the screen is unlocked, tracks resume automatically.
3. **Audio Output Routing (`setSinkId`)**:
   - Custom audio output selection is supported in Chromium-based browsers (Chrome, Edge, Brave). In Safari and Firefox, the selector gracefully hides and routes audio to the system's default output.
4. **Session Participant Cap**:
   - The server enforces an upper limit of 200 concurrent attendees per room (`409 FULL`) to protect SFU bandwidth.
5. **Timing-Safe Authentication**:
   - All host endpoints enforce timing-safe comparison on the `x-host-passcode` header using `crypto.timingSafeEqual` to prevent timing attacks.

---

## Automated Tests

Both projects feature comprehensive test suites:

```bash
# Run server integration tests (Supertest + Vitest)
cd eventmic-server
npm test

# Run web unit & transport tests (Vitest + Happy-DOM)
cd ../eventmic-web
npm test

# Verify production build
npm run build
```
