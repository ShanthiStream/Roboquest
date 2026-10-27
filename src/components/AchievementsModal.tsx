import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { ACHIEVEMENTS_LIST } from '../game/achievements/achievements';
import { storage } from '../services/StorageService';
import { X, Trophy, CheckCircle2 } from 'lucide-react';

export const AchievementsModal: React.FC = () => {
  const { modalAchievements, setModal } = useGameStore();
  const profile = storage.getProfile();

  if (!modalAchievements) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl glass-panel-glow rounded-2xl flex flex-col max-h-[90vh] overflow-hidden border border-cyan-500/40 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-orbitron font-bold text-lg text-slate-100 flex items-center gap-2">
                <span>ACHIEVEMENTS</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {profile.unlockedAchievements.length} / {ACHIEVEMENTS_LIST.length} UNLOCKED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Conquer operational milestones to earn rare badges and energy crystals
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal('modalAchievements', false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievement Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = profile.unlockedAchievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                  isUnlocked
                    ? 'bg-slate-900/80 border-amber-500/40 shadow-[0_0_12px_rgba(255,179,0,0.15)]'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    isUnlocked ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-slate-900 border border-slate-800'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-orbitron font-bold text-xs text-slate-100 truncate">
                      {ach.title}
                    </h3>
                    {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {ach.description}
                  </p>
                  <span className="text-[10px] text-cyan-400 font-mono mt-1.5 block">
                    +100 💎 Crystals
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
