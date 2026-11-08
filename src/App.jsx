import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Download, 
  Monitor, 
  Smartphone, 
  Radio, 
  ShieldCheck, 
  Github, 
  Volume2, 
  Sliders, 
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [latestVersion, setLatestVersion] = useState('v1.0.0');
  const [isLoadingVersion, setIsLoadingVersion] = useState(true);

  useEffect(() => {
    fetch('https://api.github.com/repos/htuyishi-hub/eventmic-admin/releases/latest')
      .then((res) => {
        if (!res.ok) throw new Error('No release found');
        return res.json();
      })
      .then((data) => {
        if (data && data.tag_name) {
          setLatestVersion(data.tag_name);
        }
      })
      .catch((err) => {
        console.warn('Using fallback version v1.0.0:', err.message);
        setLatestVersion('v1.0.0');
      })
      .finally(() => {
        setIsLoadingVersion(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col selection:bg-coral selection:text-white">
      {/* Navigation */}
      <header className="border-b border-surface/80 bg-obsidian/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center shadow-lg shadow-coral/20">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">
                EVENTMIC
              </span>
              <span className="ml-2 text-xs uppercase tracking-widest text-coral font-bold px-2 py-0.5 rounded bg-surface border border-surface/90">
                P2P Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/htuyishi-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-surface"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-coral/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-surface text-slate text-xs font-semibold uppercase tracking-wider mb-8">
            <Radio className="w-3.5 h-3.5 text-coral animate-pulse" />
            <span>Decentralized Stage Audio Reinforcement</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Live Event Audio, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral via-coralHover to-white">
              Democratized.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate max-w-2xl mx-auto leading-relaxed mb-12">
            A professional, zero-latency wireless microphone system powered by OpenDHT. Turn audience smartphones into stage microphones with strict democratic FIFO queue control.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/60 border border-surface">
              <CheckCircle2 className="w-4 h-4 text-coral" />
              <span>10ms Opus LowDelay</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/60 border border-surface">
              <CheckCircle2 className="w-4 h-4 text-coral" />
              <span>Acoustic Feedback Isolation</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/60 border border-surface">
              <CheckCircle2 className="w-4 h-4 text-coral" />
              <span>Strict Democratic FIFO</span>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section (Two Cards on Surface #0F1E36) */}
      <section className="py-12 px-6 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Download Client &amp; Console
          </h2>
          <p className="text-sm text-slate">
            Open-source binaries ready for immediate venue deployment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Admin Console */}
          <div className="bg-surface rounded-2xl p-8 border border-surface/90 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-coral/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-coral/5 rounded-full blur-2xl group-hover:bg-coral/10 transition-all pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-xl bg-obsidian border border-surface flex items-center justify-center text-coral mb-6 shadow-inner">
                <Monitor className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">
                  EventMic Admin (Windows/Linux)
                </h3>
                <span className="text-xs bg-obsidian px-2.5 py-1 rounded text-coral font-bold border border-surface">
                  {latestVersion}
                </span>
              </div>

              <p className="text-slate text-sm leading-relaxed mb-6">
                The central host dashboard. Plugs into the venue sound system. Features projector-ready queue mirroring, active speaker broadcast lower-thirds, and instant Host Override mute controls.
              </p>

              <div className="space-y-2 mb-8 text-xs text-slate">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-coral" />
                  <span>Hardware AEC, AGC &amp; Noise Suppression Controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-coral" />
                  <span>Bundled standalone headless Jami OpenDHT daemon</span>
                </div>
              </div>
            </div>

            <div>
              <a
                href="https://github.com/htuyishi-hub/eventmic-admin/releases/latest/download/eventmic-admin-windows.exe"
                className="w-full py-4 px-6 rounded-xl bg-coral hover:bg-coralHover text-white font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-coral/25 transition-all transform active:scale-[0.99]"
              >
                <Download className="w-5 h-5" />
                <span>Download for Windows ({latestVersion})</span>
              </a>

              <div className="mt-3 text-center">
                <a
                  href="https://github.com/htuyishi-hub/eventmic-admin/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>Looking for Linux .AppImage / .deb?</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Attendee Mic */}
          <div className="bg-surface rounded-2xl p-8 border border-surface/90 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-slate/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate/5 rounded-full blur-2xl group-hover:bg-slate/10 transition-all pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-xl bg-obsidian border border-surface flex items-center justify-center text-slate mb-6 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">
                  EventMic Attendee (Android)
                </h3>
                <span className="text-xs bg-obsidian px-2.5 py-1 rounded text-slate font-bold border border-surface">
                  APK
                </span>
              </div>

              <p className="text-slate text-sm leading-relaxed mb-6">
                Turns any smartphone into a wireless microphone. Lightweight headless client stripped of all chat bloat. Includes display name onboarding and one-tap OpenDHT "Raise Hand" queuing.
              </p>

              <div className="space-y-2 mb-8 text-xs text-slate">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-slate" />
                  <span>Hardware speaker output auto-suppressed to eliminate howl</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate" />
                  <span>Runs as an un-killable stage foreground service</span>
                </div>
              </div>
            </div>

            <div>
              <a
                href="https://github.com/htuyishi-hub/eventmic-android/releases/latest/download/eventmic-attendee.apk"
                className="w-full py-4 px-6 rounded-xl border-2 border-slate/40 hover:border-white text-white font-bold text-center flex items-center justify-center gap-2 hover:bg-white/5 transition-all transform active:scale-[0.99]"
              >
                <Download className="w-5 h-5 text-slate" />
                <span>Download APK</span>
              </a>

              <div className="mt-3 text-center">
                <a
                  href="https://github.com/htuyishi-hub/eventmic-android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Android source &amp; CI build workflows</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-surface/80 mt-8">
        <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate mb-8">
          Stage-Grade Technology Stack
        </h3>

        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div className="bg-surface/40 p-6 rounded-xl border border-surface">
            <h4 className="text-white font-bold mb-2">Decentralized OpenDHT</h4>
            <p className="text-xs text-slate leading-relaxed">
              Signaling runs on peer-to-peer distributed hash tables. No cloud accounts, no central servers, zero monthly bills.
            </p>
          </div>

          <div className="bg-surface/40 p-6 rounded-xl border border-surface">
            <h4 className="text-white font-bold mb-2">10ms Opus LowDelay</h4>
            <p className="text-xs text-slate leading-relaxed">
              Audio frames packetize at 10ms with constant bitrate. Tuned specifically for public speaking and Q&amp;A sessions.
            </p>
          </div>

          <div className="bg-surface/40 p-6 rounded-xl border border-surface">
            <h4 className="text-white font-bold mb-2">Acoustic Loop Elimination</h4>
            <p className="text-xs text-slate leading-relaxed">
              Attendee phone speaker drivers are hardware-muted the moment the mic goes live, preventing screeching feedback loops.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface/80 py-8 px-6 text-center text-xs text-slate">
        <p>
          EventMic — Open Source Wireless Event Audio. Released under GPLv3 / MIT.
        </p>
        <p className="mt-2 text-slate/70">
          Distribution synced live with GitHub Releases.
        </p>
      </footer>
    </div>
  );
}
