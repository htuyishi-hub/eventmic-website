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
  CheckCircle2,
  QrCode,
  Users,
  WifiOff,
  Zap,
  ArrowRight
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
    <div className="min-h-screen bg-obsidian text-white flex flex-col selection:bg-coral selection:text-white font-sans antialiased">
      {/* Navigation */}
      <header className="border-b border-surface/80 bg-obsidian/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center shadow-lg shadow-coral/25">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">
                EVENTMIC
              </span>
              <span className="ml-2.5 text-[10px] uppercase tracking-widest text-coral font-bold px-2 py-0.5 rounded-full bg-surface border border-coral/30">
                P2P Magic
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/htuyishi-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-surface/80"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[340px] bg-coral/15 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-coral/30 text-coral text-xs font-bold uppercase tracking-widest mb-8 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-coral animate-pulse" />
            <span>The Wireless Mic Revolution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08] mb-8">
            Magic in the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral via-coralHover to-white">
              Palm of Their Hands.
            </span>
          </h1>

          <p className="text-lg sm:text-2xl text-slate max-w-3xl mx-auto leading-relaxed mb-12 font-normal">
            Stop passing the mic. Give your entire audience the superpower to speak directly to the room using the smartphone they already own. Crystal-clear, zero delay, and completely revolutionary.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-5 text-xs sm:text-sm text-slate font-semibold">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-surface/80 border border-surface shadow-sm">
              <Zap className="w-4 h-4 text-coral" />
              <span className="text-white">Instant Connection</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-surface/80 border border-surface shadow-sm">
              <Sparkles className="w-4 h-4 text-coral" />
              <span className="text-white">Acoustic Magic</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-surface/80 border border-surface shadow-sm">
              <ShieldCheck className="w-4 h-4 text-coral" />
              <span className="text-white">Total Host Control</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The "Wow" Factor (Visual Row / 3 Steps) */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="text-coral text-xs font-bold uppercase tracking-widest mb-2">
            Effortless Experience
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            How the Magic Happens
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Step 1: Scan & Enter */}
          <div className="bg-surface/70 rounded-2xl p-8 border border-surface hover:border-coral/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-28 h-28 bg-coral/5 rounded-full blur-xl group-hover:bg-coral/10 transition-all pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-obsidian border border-surface flex items-center justify-center text-coral shadow-inner">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-slate/25 group-hover:text-coral/40 transition-colors">
                  01
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                1. Scan &amp; Enter
              </h3>

              <p className="text-slate text-sm leading-relaxed">
                No accounts. No passwords. Just point your camera at the big screen and you are instantly in the room.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-surface/80 flex items-center gap-2 text-xs text-coral font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero friction onboarding</span>
            </div>
          </div>

          {/* Step 2: The Democratic Queue */}
          <div className="bg-surface/70 rounded-2xl p-8 border border-surface hover:border-coral/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-28 h-28 bg-coral/5 rounded-full blur-xl group-hover:bg-coral/10 transition-all pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-obsidian border border-surface flex items-center justify-center text-coral shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-slate/25 group-hover:text-coral/40 transition-colors">
                  02
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                2. The Democratic Queue
              </h3>

              <p className="text-slate text-sm leading-relaxed">
                Tap to raise your hand. The massive projector shows exactly who is next in line, keeping the room fair, transparent, and engaged.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-surface/80 flex items-center gap-2 text-xs text-coral font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Strict FIFO transparency</span>
            </div>
          </div>

          {/* Step 3: Pure Magic */}
          <div className="bg-surface/70 rounded-2xl p-8 border border-surface hover:border-coral/40 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-28 h-28 bg-coral/5 rounded-full blur-xl group-hover:bg-coral/10 transition-all pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-obsidian border border-surface flex items-center justify-center text-coral shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-slate/25 group-hover:text-coral/40 transition-colors">
                  03
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                3. Pure Magic
              </h3>

              <p className="text-slate text-sm leading-relaxed">
                When the host grants you the floor, your phone transforms into a stadium-grade wireless microphone. You speak, and the whole room listens.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-surface/80 flex items-center gap-2 text-xs text-coral font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>10ms Opus LowDelay audio</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Download Section */}
      <section className="py-14 px-6 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="text-coral text-xs font-bold uppercase tracking-widest mb-2">
            Production Ready
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Deploy the Revolution
          </h2>
          <p className="text-sm sm:text-base text-slate max-w-xl mx-auto">
            Standalone executables with bundled headless P2P daemons. Ready for stages, auditoriums, and town halls.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: The Host Console (Windows) */}
          <div className="bg-surface rounded-2xl p-8 border border-surface/90 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-coral/50 transition-all">
            <div className="absolute top-0 right-0 w-36 h-36 bg-coral/5 rounded-full blur-2xl group-hover:bg-coral/15 transition-all pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-xl bg-obsidian border border-surface flex items-center justify-center text-coral mb-6 shadow-inner">
                <Monitor className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">
                  The Host Console (Windows)
                </h3>
                <span className="text-xs bg-obsidian px-2.5 py-1 rounded text-coral font-bold border border-surface">
                  {latestVersion}
                </span>
              </div>

              <p className="text-slate text-sm leading-relaxed mb-6">
                Your command center. Plug your laptop into the venue's sound system, project the waiting list, and control the room with the ultimate Host Override mute button.
              </p>

              <div className="space-y-2.5 mb-8 text-xs text-slate">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-coral" />
                  <span>Projector Mirroring &amp; Live Speaker Lower-Thirds</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-coral" />
                  <span>One-Touch Host Override Panic Mute</span>
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
                <span>Download Host Console</span>
              </a>

              <div className="mt-3 text-center">
                <a
                  href="https://github.com/htuyishi-hub/eventmic-admin/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>Also available for Linux (.AppImage / .deb)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: The Attendee Mic (Android) */}
          <div className="bg-surface rounded-2xl p-8 border border-surface/90 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-coral/50 transition-all">
            <div className="absolute top-0 right-0 w-36 h-36 bg-coral/5 rounded-full blur-2xl group-hover:bg-coral/15 transition-all pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-xl bg-obsidian border border-surface flex items-center justify-center text-coral mb-6 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">
                  The Attendee Mic (Android)
                </h3>
                <span className="text-xs bg-obsidian px-2.5 py-1 rounded text-coral font-bold border border-surface">
                  APK
                </span>
              </div>

              <p className="text-slate text-sm leading-relaxed mb-6">
                The magic wand for your audience. A beautifully simple app that turns their phone into a professional mic with built-in acoustic feedback elimination—no screeching, just clear voices.
              </p>

              <div className="space-y-2.5 mb-8 text-xs text-slate">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-coral" />
                  <span>Hardware speaker output auto-suppressed (Zero howl)</span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-coral" />
                  <span>Direct QR Scan &amp; Peer-to-Peer Room Sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-coral" />
                  <span>Runs as an un-killable stage foreground service</span>
                </div>
              </div>
            </div>

            <div>
              <a
                href="https://github.com/htuyishi-hub/eventmic-android/releases/latest/download/eventmic-attendee.apk"
                className="w-full py-4 px-6 rounded-xl border-2 border-coral/60 hover:border-coral hover:bg-coral/10 text-white font-bold text-center flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
              >
                <Download className="w-5 h-5 text-coral" />
                <span>Download Attendee App</span>
              </a>

              <div className="mt-3 text-center">
                <a
                  href="https://github.com/htuyishi-hub/eventmic-android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Android source &amp; CI workflows</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Kicker (Footer Value Prop): Unbreakable Offline Mode */}
      <section className="py-12 px-6 max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-r from-surface via-surface/90 to-surface rounded-2xl p-8 sm:p-10 border-2 border-coral/40 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-coral/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-obsidian border border-coral/40 flex items-center justify-center text-coral flex-shrink-0 shadow-lg">
              <WifiOff className="w-8 h-8" />
            </div>

            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-coral text-xs font-bold uppercase tracking-widest mb-1">
                <span>Battle-Tested Resilience</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Unbreakable Offline Mode
              </h3>
              <p className="text-slate text-base sm:text-lg leading-relaxed">
                Venue internet went down? Who cares. EventMic's peer-to-peer magic works flawlessly even if the building loses Wi-Fi connection.
              </p>
              <p className="text-slate/75 text-xs sm:text-sm mt-2">
                Signaling and audio stream directly across the local subnet via OpenDHT. Zero external servers. Zero downtime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface/80 py-8 px-6 text-center text-xs text-slate">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            EventMic — Open Source Wireless Event Audio. Released under GPLv3 / MIT.
          </p>
          <div className="flex items-center gap-4 text-slate/80">
            <a 
              href="https://github.com/htuyishi-hub/eventmic-admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-coral transition-colors"
            >
              Admin Desktop
            </a>
            <span>•</span>
            <a 
              href="https://github.com/htuyishi-hub/eventmic-android" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-coral transition-colors"
            >
              Android Attendee
            </a>
            <span>•</span>
            <span className="text-slate/60">Distribution synced with GitHub Releases</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
