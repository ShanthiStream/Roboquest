import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { aiManager } from '../ai/AIAdapterManager';
import { storage } from '../services/StorageService';
import { X, Volume2, Eye, Cpu, RefreshCw, User } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    modalSettings,
    setModal,
    isMuted,
    toggleMute,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    speechVolume,
    setSpeechVolume,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    nickname,
    setNickname,
    inspectorData,
  } = useGameStore();

  if (!modalSettings) return null;

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all game progress, levels, and unlocked cosmetics?')) {
      storage.resetAll();
      window.location.reload();
    }
  };

  const handleRuntimeSwitch = async (id: string) => {
    aiManager.setActiveAdapter(id);
    const active = aiManager.getActiveAdapter();
    if (active.status !== 'ready') {
      useGameStore.setState((s) => ({
        inspectorData: {
          ...s.inspectorData,
          adapterName: active.name,
          isFallback: active.isFallback,
          adapterStatus: 'loading',
        },
      }));
      await active.initialize();
    }
    useGameStore.setState((s) => ({
      inspectorData: {
        ...s.inspectorData,
        adapterName: active.name,
        isFallback: active.isFallback,
        adapterStatus: active.status,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl glass-panel-glow rounded-3xl p-6 border border-cyan-500/40 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
          <h2 className="font-orbitron font-bold text-base text-slate-100 flex items-center gap-2">
            <span>SETTINGS & ACCESSIBILITY</span>
          </h2>
          <button
            onClick={() => setModal('modalSettings', false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-6 pr-1">
          {/* Commander Profile */}
          <div className="space-y-2">
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>Commander Profile</span>
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder="Enter commander nickname..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Audio Controls */}
          <div className="space-y-3">
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Levels (Web Audio API)</span>
              </span>
              <button
                onClick={toggleMute}
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono transition ${
                  isMuted ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isMuted ? 'UNMUTE ALL' : 'MUTE ALL'}
              </button>
            </h3>

            {/* Music Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Music Volume</span>
                <span>{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* SFX Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>SFX Volume</span>
                <span>{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Robot Voice Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Robot Speech Synthesis</span>
                <span>{Math.round(speechVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={speechVolume}
                onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Accessibility & Visuals */}
          <div className="space-y-3">
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              <span>Accessibility & Motion</span>
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">High Contrast Mode</span>
                <span className="text-[11px] text-slate-400">Enhance borders and text legibility</span>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={toggleHighContrast}
                className="w-4 h-4 accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Reduced Motion Mode</span>
                <span className="text-[11px] text-slate-400">Accelerate step transitions and disable particle pulses</span>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={toggleReducedMotion}
                className="w-4 h-4 accent-cyan-400"
              />
            </div>
          </div>

          {/* AI Runtime Selector */}
          <div className="space-y-2">
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Inference Runtime Engine</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleRuntimeSwitch('rule-based-fallback')}
                className={`p-3 rounded-xl border text-left transition ${
                  inspectorData.isFallback
                    ? 'border-cyan-400 bg-cyan-950/40'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-slate-100 block">Rule-Based Fallback</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">100% deterministic local compiler</span>
              </button>

              <button
                onClick={() => handleRuntimeSwitch('cactus-needle')}
                className={`p-3 rounded-xl border text-left transition ${
                  !inspectorData.isFallback
                    ? 'border-cyan-400 bg-cyan-950/40'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-slate-100 block">Cactus Needle AI</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Browser WASM tool-calling model</span>
              </button>
            </div>
          </div>

          {/* Reset Game Progress */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleResetData}
              className="w-full py-2.5 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Mission Progress & Cosmetics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
