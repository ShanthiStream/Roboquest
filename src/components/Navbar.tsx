import React from 'react';
import { useGameStore } from '../stores/gameStore';
import {
  Trophy,
  Palette,
  Cpu,
  Settings,
  Volume2,
  VolumeX,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    mode,
    setMode,
    crystals,
    isMuted,
    toggleMute,
    setModal,
    inspectorData,
    loadDailyLevel,
  } = useGameStore();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Brand logo & active runtime badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setModal('modalLevelSelect', true)}>
          <img src="/robot-icon.svg" alt="Roboquest Mascot" className="w-9 h-9 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
          <div className="hidden sm:block">
            <h1 className="font-orbitron font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
              ROBOQUEST
            </h1>
            <p className="text-[10px] text-cyan-400/80 font-medium tracking-tight -mt-1">
              THE TINY AI ADVENTURE
            </p>
          </div>
        </div>

        {/* Transparent AI Runtime Badge */}
        <button
          onClick={() => setModal('modalAIInspector', true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-900/80 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 transition"
          title="Click to open AI Inspector"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              inspectorData.adapterStatus === 'loading'
                ? 'bg-amber-400 animate-spin'
                : inspectorData.isFallback
                ? 'bg-amber-400'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span>
            {inspectorData.adapterStatus === 'loading'
              ? '⚡ AI: Loading Needle...'
              : inspectorData.isFallback
              ? '⚡ AI: Rule Fallback'
              : '⚡ AI: Cactus Needle'}
          </span>
        </button>
      </div>

      {/* Mode navigation tabs */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setModal('modalLevelSelect', true)}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
            mode === 'story'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Story</span>
        </button>

        <button
          onClick={loadDailyLevel}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
            mode === 'daily'
              ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(255,179,0,0.3)]'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Daily</span>
        </button>

        <button
          onClick={() => setMode('creative')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
            mode === 'creative'
              ? 'bg-purple-500/20 border border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(176,38,255,0.3)]'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Creator</span>
        </button>
      </nav>

      {/* Right controls: Crystals, Achievements, Customizer, Inspector, Settings, Audio */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Crystal balance */}
        <div
          onClick={() => setModal('modalCustomizer', true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold cursor-pointer hover:border-cyan-400 transition"
          title="Energy Crystals — Click to Customize Robot"
        >
          <span className="text-cyan-400">💎</span>
          <span>{crystals}</span>
        </div>

        {/* Customizer */}
        <button
          onClick={() => setModal('modalCustomizer', true)}
          className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 transition"
          title="Robot Customization"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Achievements */}
        <button
          onClick={() => setModal('modalAchievements', true)}
          className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800/70 transition"
          title="Achievements & Badges"
        >
          <Trophy className="w-4 h-4" />
        </button>

        {/* AI Inspector ("Show How AI Thinks") */}
        <button
          onClick={() => setModal('modalAIInspector', true)}
          className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-purple-300 hover:bg-slate-800/70 transition relative"
          title="Show How AI Thinks"
        >
          <Cpu className="w-4 h-4" />
        </button>

        {/* Audio Mute toggle */}
        <button
          onClick={toggleMute}
          className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 transition"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button
          onClick={() => setModal('modalSettings', true)}
          className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 transition"
          title="Settings & Accessibility"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
