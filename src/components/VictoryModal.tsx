import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../stores/gameStore';
import { Star, ArrowRight, RotateCcw, Trophy, Crown, Sparkles, Cpu } from 'lucide-react';

interface VictoryModalProps {
  onOpenCard?: (cardUrl: string) => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = () => {
  const {
    modalVictory,
    setModal,
    mode,
    currentLevel,
    lastScore,
    nextLevel,
    restartLevel,
    openGrandWinnerCard,
    overallConfidence,
    currentActionPlan,
    inspectorData,
  } = useGameStore();

  // The Grand Winner Card is exclusively reserved for conquering the entire 10-sector campaign
  const isLastLevel = mode === 'story' && currentLevel.id === 10;

  useEffect(() => {
    if (modalVictory) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#00ffaa', '#b026ff', '#ffb300'],
        });
      } catch (e) {}
    }
  }, [modalVictory]);

  if (!modalVictory || !lastScore) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center border border-cyan-400/50 shadow-[0_0_50px_rgba(0,240,255,0.25)] animate-in fade-in zoom-in-95 duration-200">
        <span className="text-4xl sm:text-5xl mb-2 animate-bounce">
          {isLastLevel ? '👑' : '🏆'}
        </span>
        <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300">
          {isLastLevel ? 'CAMPAIGN CONQUERED!' : 'MISSION ACCOMPLISHED!'}
        </h2>
        <p className="text-xs sm:text-sm text-cyan-400 font-mono mt-1">
          Sector {currentLevel.id} — {currentLevel.title} {isLastLevel ? '(Final Sector)' : ''}
        </p>

        {/* Special Campaign Winner Banner on Level 10 */}
        {isLastLevel && (
          <div className="w-full my-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/60 shadow-[0_0_30px_rgba(255,191,0,0.25)] text-center animate-pulse">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-orbitron font-extrabold text-xs sm:text-sm tracking-wider">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>ROBOQUEST GRAND CHAMPION</span>
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-[11px] text-amber-200/90 font-mono mt-1">
              You defeated all 10 sectors! Cactus Needle On-Device AI has compiled your performance rating and generated your Grand Winner Card.
            </p>
          </div>
        )}

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-9 h-9 sm:w-11 sm:h-11 transition-all duration-300 ${
                starIdx <= lastScore.stars
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(255,179,0,0.8)] scale-110'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Score Breakdown Card */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 my-2 text-xs font-mono space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>Base Mission Completion:</span>
            <span className="text-slate-100 font-bold">+{lastScore.baseScore}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Energy Efficiency Bonus:</span>
            <span className="text-cyan-300 font-bold">+{lastScore.energyBonus}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Navigation Steps Bonus:</span>
            <span className="text-emerald-300 font-bold">+{lastScore.stepBonus}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Command Economy Bonus:</span>
            <span className="text-purple-300 font-bold">+{lastScore.commandBonus}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-sm sm:text-base font-orbitron font-extrabold text-amber-300">
            <span>TOTAL SCORE:</span>
            <span>{lastScore.totalScore.toLocaleString()} PTS</span>
          </div>
        </div>

        {/* Crystals Earned */}
        <div className="my-2.5 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono">
          +{lastScore.stars * 50} 💎 Energy Crystals Awarded!
        </div>

        {/* AI Agent Confidence & Action Telemetry Summary */}
        <div className="w-full bg-slate-950/80 border border-purple-500/35 rounded-xl px-3.5 py-2.5 my-1 flex items-center justify-between gap-2 text-left">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-purple-200">
                  AI Agent Confidence
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    (overallConfidence ?? 0.95) >= 0.85
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : (overallConfidence ?? 0.95) >= 0.7
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {Math.round((overallConfidence ?? inspectorData.confidence ?? 0.95) * 100)}% Overall
                </span>
                {currentActionPlan.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 text-purple-200 border border-purple-500/30">
                    {Math.round(
                      (currentActionPlan[0].confidence ?? overallConfidence ?? 0.95) * 100
                    )}
                    % Action
                  </span>
                )}
              </div>
              {currentActionPlan.length > 0 && (
                <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                  {currentActionPlan
                    .map(
                      (act) =>
                        `${act.type.toUpperCase()}${
                          'direction' in act
                            ? `(${act.direction}${'steps' in act ? ` × ${act.steps}` : ''})`
                            : ''
                        }`
                    )
                    .join(' → ')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setModal('modalAIInspector', true)}
            className="px-2.5 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 text-[10px] font-mono font-semibold flex items-center gap-1 shrink-0 transition"
            title="Open AI Inspector"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-300" />
            <span>Inspect AI</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={() => {
              setModal('modalVictory', false);
              restartLevel();
            }}
            className="sm:w-1/3 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </button>

          {isLastLevel ? (
            <button
              onClick={() => {
                openGrandWinnerCard();
              }}
              className="sm:flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-orbitron font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,191,0,0.6)] hover:brightness-110 active:scale-95 transition"
            >
              <Trophy className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>VIEW WINNER CARD</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setModal('modalVictory', false);
                nextLevel();
              }}
              className="sm:flex-1 px-5 py-3 rounded-xl neon-button text-xs font-orbitron font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <span>Next Sector</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
