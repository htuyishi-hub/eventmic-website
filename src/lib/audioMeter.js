/**
 * Creates and manages a Web Audio AnalyserNode for computing real-time mic levels (0..1).
 */
export class AudioMeter {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.rafId = null;
    this.intervalId = null;
    this.currentLevel = 0;
    this.onLevelCallback = null;
  }

  /**
   * Initializes audio meter with an existing MediaStream.
   * @param {MediaStream} stream 
   * @param {(level: number) => void} onLevel 
   * @param {number} [pollIntervalMs=66] - Poll interval (~15 Hz = 66ms)
   */
  start(stream, onLevel, pollIntervalMs = 66) {
    this.stop();
    this.mediaStream = stream;
    this.onLevelCallback = onLevel;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const sample = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Normalize 0..255 to 0..1, apply non-linear curve for natural response
        const normalized = Math.min(1, Math.max(0, avg / 128));
        this.currentLevel = Math.round(normalized * 100) / 100;

        if (this.onLevelCallback) {
          this.onLevelCallback(this.currentLevel);
        }
      };

      // Poll at ~15 Hz (66ms)
      this.intervalId = setInterval(sample, pollIntervalMs);
    } catch (err) {
      console.warn('[AudioMeter] Web Audio initialization failed:', err);
    }
  }

  /**
   * Stops sampling and releases Web Audio resources.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch {}
      this.sourceNode = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaStream = null;
    this.currentLevel = 0;
  }
}
