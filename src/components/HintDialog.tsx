import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { X, Lightbulb, ArrowRight } from 'lucide-react';

export const HintDialog: React.FC = () => {
  const { modalHint, setModal, currentLevel, hintStage, nextHint } = useGameStore();

  if (!modalHint) return null;

  const stageTitles = ['General Direction', 'Tactical Objective', 'Suggested Command'];
  const currentHintText = currentLevel.hints[hintStage] || currentLevel.hints[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 border border-amber-500/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="font-orbitron font-bold text-sm text-slate-100">
              MISSION ASSISTANCE
            </h2>
          </div>
          <button
            onClick={() => setModal('modalHint', false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Indicator */}
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-amber-300">
          <span>Hint Stage {hintStage + 1} of 3</span>
          <span className="text-slate-400">{stageTitles[hintStage]}</span>
        </div>

        {/* Hint Body */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans mb-5 shadow-inner">
          <span className="text-lg mr-2 inline-block">🤖</span>
          {currentHintText}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3">
          {hintStage < 2 ? (
            <button
              onClick={nextHint}
              className="px-4 py-2 rounded-xl border border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>Next Specific Hint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono">Maximum guidance revealed.</span>
          )}

          <button
            onClick={() => setModal('modalHint', false)}
            className="px-5 py-2 rounded-xl neon-button text-xs font-orbitron font-bold"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
