import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { LEVELS } from '../game/levels/levelData';
import { storage } from '../services/StorageService';
import { X, Lock, Play, Star, Trophy, Crown } from 'lucide-react';

export const LevelSelectModal: React.FC = () => {
  const { modalLevelSelect, setModal, loadLevel, currentLevelId, openGrandWinnerCard } = useGameStore();

  if (!modalLevelSelect) return null;

  const profile = storage.getProfile();
  const isCampaignCompleted = (profile.levelProgress[10]?.stars || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl glass-panel-glow rounded-2xl flex flex-col max-h-[90vh] overflow-hidden border border-cyan-500/40 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900/60">
          <div>
            <h2 className="font-orbitron font-bold text-lg text-slate-100 flex items-center gap-2">
              <span>MISSION SELECT</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                10 SECTORS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Select an unlocked laboratory sector to begin your adventure
            </p>
          </div>
          <button
            onClick={() => setModal('modalLevelSelect', false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign Conquered Banner */}
        {isCampaignCompleted && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(255,191,0,0.2)]">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/30 text-amber-300">
                <Crown className="w-4 h-4 fill-amber-400" />
              </span>
              <div>
                <span className="text-xs font-orbitron font-bold text-amber-300 block">
                  CAMPAIGN CHAMPION: ALL 10 SECTORS CONQUERED!
                </span>
                <span className="text-[11px] text-amber-200/80 font-mono">
                  Your Needle AI performance report and Grand Winner Card are available.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setModal('modalLevelSelect', false);
                openGrandWinnerCard();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <Trophy className="w-3.5 h-3.5 fill-slate-950" />
              <span>View Winner Card</span>
            </button>
          </div>
        )}

        {/* Level Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVELS.map((lvl) => {
            const isUnlocked = profile.unlockedLevels.includes(lvl.id);
            const progress = profile.levelProgress[lvl.id] || { stars: 0, highScore: 0 };
            const isCurrent = currentLevelId === lvl.id;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) loadLevel(lvl.id);
                }}
                className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  !isUnlocked
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer'
                    : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      SECTOR {lvl.id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        lvl.difficulty === 'Beginner'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : lvl.difficulty === 'Easy'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                          : lvl.difficulty === 'Medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : lvl.difficulty === 'Hard'
                          ? 'bg-orange-950 text-orange-300 border border-orange-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {lvl.difficulty}
                    </span>
                  </div>

                  <h3 className="font-orbitron font-bold text-sm text-slate-100 mb-1">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {lvl.description}
                  </p>
                </div>

                {/* Stars and Score / Locked status */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {isUnlocked ? (
                    <>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3.5 h-3.5 ${
                              starIdx <= progress.stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                        {progress.highScore > 0 ? `${progress.highScore} PTS` : 'PLAY'}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      <span>LOCKED</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
