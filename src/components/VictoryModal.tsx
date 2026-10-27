import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../stores/gameStore';
import { CardGeneratorService } from '../services/CardGeneratorService';
import { Star, Share2, ArrowRight, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  onOpenCard: (cardUrl: string) => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onOpenCard }) => {
  const {
    modalVictory,
    setModal,
    currentLevel,
    lastScore,
    snapshot,
    nickname,
    cosmetics,
    nextLevel,
    restartLevel,
  } = useGameStore();

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

  const handleGenerateCard = async () => {
    const cardUrl = await CardGeneratorService.generateCard({
      nickname,
      levelTitle: currentLevel.title,
      levelNumber: currentLevel.id,
      stars: lastScore.stars,
      score: lastScore.totalScore,
      steps: snapshot.stepsTaken,
      commands: snapshot.commandsUsed,
      cosmetics,
    });
    setModal('modalVictory', false);
    onOpenCard(cardUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center border border-cyan-400/50 shadow-[0_0_50px_rgba(0,240,255,0.25)] animate-in fade-in zoom-in-95 duration-200">
        <span className="text-4xl sm:text-5xl mb-2 animate-bounce">🏆</span>
        <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300">
          MISSION ACCOMPLISHED!
        </h2>
        <p className="text-xs sm:text-sm text-cyan-400 font-mono mt-1">
          Sector {currentLevel.id} — {currentLevel.title}
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 my-5">
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
        <div className="my-3 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono">
          +{lastScore.stars * 50} 💎 Energy Crystals Awarded!
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
          <button
            onClick={() => {
              setModal('modalVictory', false);
              restartLevel();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>

          <button
            onClick={handleGenerateCard}
            className="px-4 py-2.5 rounded-xl border border-cyan-500/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Card</span>
          </button>

          <button
            onClick={() => {
              setModal('modalVictory', false);
              nextLevel();
            }}
            className="px-4 py-2.5 rounded-xl neon-button text-xs font-orbitron font-bold flex items-center justify-center gap-1.5 shadow-lg"
          >
            <span>Next Sector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
