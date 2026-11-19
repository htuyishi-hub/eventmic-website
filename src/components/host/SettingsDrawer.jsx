import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Clock, Sparkles } from 'lucide-react';
import { Drawer } from '../ui/Drawer.jsx';
import { Button } from '../ui/Button.jsx';
import { useTransport } from '../../context/TransportContext.jsx';

export function SettingsDrawer({
  isOpen,
  onClose,
  timeLimitMinutes = 0,
  onTimeLimitChange
}) {
  const { transport } = useTransport();
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [sinkIdSupported, setSinkIdSupported] = useState(false);
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Check if setSinkId is supported in current browser
    if (typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype) {
      setSinkIdSupported(true);
    }

    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
        setAudioDevices(audioOutputs);
        if (audioOutputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioOutputs[0].deviceId);
        }
      }).catch(() => {});
    }
  }, [selectedDeviceId]);

  // Handle device change and invoke setSinkId on audio element and transport
  const handleDeviceChange = async (e) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);

    if (transport && typeof transport.setOutputDevice === 'function') {
      try {
        await transport.setOutputDevice(newId);
      } catch (err) {
        console.warn('[Settings] Failed to set output device on transport:', err);
      }
    }

    if (audioRef.current && typeof audioRef.current.setSinkId === 'function') {
      try {
        await audioRef.current.setSinkId(newId);
      } catch (err) {
        console.warn('[Settings] Failed to set sinkId on audio element:', err);
      }
    }
  };

  // Play short generated test tone using Web Audio API
  const handlePlayTestSound = async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Route AudioContext to chosen device if supported
      if (selectedDeviceId && typeof ctx.setSinkId === 'function') {
        try {
          await ctx.setSinkId(selectedDeviceId);
        } catch {}
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // 440Hz A tone
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      setIsPlayingTestTone(true);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      setTimeout(() => {
        setIsPlayingTestTone(false);
        try { ctx.close(); } catch {}
      }, 400);
    } catch (err) {
      console.warn('Test tone playback failed:', err);
      setIsPlayingTestTone(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Console Settings"
      width="max-w-md"
    >
      {/* Hidden audio element for setSinkId routing */}
      <audio ref={audioRef} className="hidden" aria-hidden="true" />

      {/* 1. Audio Output Device (hides gracefully if setSinkId unsupported) */}
      {sinkIdSupported ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Volume2 size={16} className="text-accent" />
            <span>Audio Output Device</span>
          </div>
          <p className="text-xs text-muted">
            Route attendee floor audio to your venue mixing console, soundcard, or headphones.
          </p>

          {audioDevices.length > 0 ? (
            <select
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-white text-xs focus:border-accent focus:outline-none"
            >
              {audioDevices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Audio Output ${i + 1}`}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-background border border-border rounded-xl text-xs text-muted">
              Default System Audio Output (Browser device enumeration active)
            </div>
          )}

          {/* Play Test Tone */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePlayTestSound}
            disabled={isPlayingTestTone}
            className="gap-2 text-xs w-full"
          >
            <Play size={14} className={isPlayingTestTone ? 'animate-pulse text-accent' : ''} />
            <span>{isPlayingTestTone ? 'Playing 440Hz Tone...' : 'Play Test Sound'}</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Test Sound is still available even if custom sink routing is unsupported */}
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Volume2 size={16} className="text-accent" />
            <span>Audio Output</span>
          </div>
          <p className="text-xs text-muted">
            Custom audio output routing is not supported by this browser. Default audio output is active.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePlayTestSound}
            disabled={isPlayingTestTone}
            className="gap-2 text-xs w-full"
          >
            <Play size={14} className={isPlayingTestTone ? 'animate-pulse text-accent' : ''} />
            <span>{isPlayingTestTone ? 'Playing 440Hz Tone...' : 'Play Test Sound'}</span>
          </Button>
        </div>
      )}

      <hr className="border-border" />

      {/* 2. Speaking Time Limit Option */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Clock size={16} className="text-accent" />
          <span>Speaking Time Limit</span>
        </div>
        <p className="text-xs text-muted">
          Automatically revoke speaker floor when duration limit is reached.
        </p>

        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 5].map((mins) => (
            <button
              key={mins}
              onClick={() => onTimeLimitChange(mins)}
              className={`py-2 rounded-lg font-bold text-xs transition-colors border ${
                timeLimitMinutes === mins
                  ? 'bg-accent border-accent text-white shadow-md shadow-accent/25'
                  : 'bg-background border-border text-muted hover:text-white'
              }`}
            >
              {mins === 0 ? 'Off' : `${mins}m`}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-border" />

      {/* 3. Transport Info */}
      <div className="p-4 bg-background border border-border rounded-xl space-y-1.5 text-xs text-muted">
        <div className="flex items-center gap-1.5 text-white font-bold">
          <Sparkles size={14} className="text-accent" />
          <span>Transport Architecture</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Running on BroadcastChannel mock transport. No external cloud servers required for tab-to-tab communication.
        </p>
      </div>
    </Drawer>
  );
}
