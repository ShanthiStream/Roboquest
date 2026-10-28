import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { sound } from '../audio/SoundSystem';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, MoveRight, RotateCcw, X, Gamepad2 } from 'lucide-react';

interface TouchControlsProps {
  onClose?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onClose }) => {
  const { submitCommand, undoAction, isExecutingCommand, snapshot } = useGameStore();
  const [activeBtn, setActiveBtn] = useState<string | null>(null);

  const handleAction = async (command: string, soundEffect: () => void = () => sound.playFootstep()) => {
    if (isExecutingCommand || snapshot.status !== 'playing') return;
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {}
    soundEffect();
    await submitCommand(command);
  };

  const isBusy = isExecutingCommand || snapshot.status !== 'playing';

  return (
    <div className="relative pointer-events-auto flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl glass-panel-glow border border-cyan-400/40 shadow-[0_4px_24px_rgba(0,240,255,0.25)] backdrop-blur-xl select-none touch-none">
      {/* Directional D-Pad */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
        <div />
        {/* UP */}
        <button
          type="button"
          disabled={isBusy}
          onTouchStart={() => setActiveBtn('up')}
          onTouchEnd={() => setActiveBtn(null)}
          onMouseDown={() => setActiveBtn('up')}
          onMouseUp={() => setActiveBtn(null)}
          onClick={() => handleAction('go up 1')}
          className={`flex items-center justify-center rounded-xl border font-bold transition-all shadow-md active:scale-95 ${
            activeBtn === 'up'
              ? 'bg-cyan-400 text-cyber-900 border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.8)]'
              : 'bg-slate-900/90 hover:bg-slate-800 border-cyan-500/40 text-cyan-300'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Move Up"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <div />

        {/* LEFT */}
        <button
          type="button"
          disabled={isBusy}
          onTouchStart={() => setActiveBtn('left')}
          onTouchEnd={() => setActiveBtn(null)}
          onMouseDown={() => setActiveBtn('left')}
          onMouseUp={() => setActiveBtn(null)}
          onClick={() => handleAction('go left 1')}
          className={`flex items-center justify-center rounded-xl border font-bold transition-all shadow-md active:scale-95 ${
            activeBtn === 'left'
              ? 'bg-cyan-400 text-cyber-900 border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.8)]'
              : 'bg-slate-900/90 hover:bg-slate-800 border-cyan-500/40 text-cyan-300'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Move Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* CENTER PUSH */}
        <button
          type="button"
          disabled={isBusy}
          onTouchStart={() => setActiveBtn('push')}
          onTouchEnd={() => setActiveBtn(null)}
          onMouseDown={() => setActiveBtn('push')}
          onMouseUp={() => setActiveBtn(null)}
          onClick={() => handleAction('push', () => sound.playSwitch())}
          className={`flex flex-col items-center justify-center rounded-xl border text-[9px] font-mono font-bold tracking-tight transition-all shadow-md active:scale-95 ${
            activeBtn === 'push'
              ? 'bg-amber-400 text-cyber-900 border-amber-300 shadow-[0_0_12px_rgba(255,179,0,0.8)]'
              : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-amber-300'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Push Adjacent Crate"
        >
          <MoveRight className="w-4 h-4" />
          <span className="leading-none mt-0.5">PUSH</span>
        </button>

        {/* RIGHT */}
        <button
          type="button"
          disabled={isBusy}
          onTouchStart={() => setActiveBtn('right')}
          onTouchEnd={() => setActiveBtn(null)}
          onMouseDown={() => setActiveBtn('right')}
          onMouseUp={() => setActiveBtn(null)}
          onClick={() => handleAction('go right 1')}
          className={`flex items-center justify-center rounded-xl border font-bold transition-all shadow-md active:scale-95 ${
            activeBtn === 'right'
              ? 'bg-cyan-400 text-cyber-900 border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.8)]'
              : 'bg-slate-900/90 hover:bg-slate-800 border-cyan-500/40 text-cyan-300'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Move Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div />
        {/* DOWN */}
        <button
          type="button"
          disabled={isBusy}
          onTouchStart={() => setActiveBtn('down')}
          onTouchEnd={() => setActiveBtn(null)}
          onMouseDown={() => setActiveBtn('down')}
          onMouseUp={() => setActiveBtn(null)}
          onClick={() => handleAction('go down 1')}
          className={`flex items-center justify-center rounded-xl border font-bold transition-all shadow-md active:scale-95 ${
            activeBtn === 'down'
              ? 'bg-cyan-400 text-cyber-900 border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.8)]'
              : 'bg-slate-900/90 hover:bg-slate-800 border-cyan-500/40 text-cyan-300'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Move Down"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <div />
      </div>

      {/* Action Buttons Column */}
      <div className="flex flex-col gap-1.5 justify-center">
        {/* Interact / Action */}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => handleAction('interact', () => sound.playSwitch())}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 text-purple-300 text-xs font-mono font-bold shadow-md active:scale-95 transition disabled:opacity-40"
          title="Interact / Toggle Switch / Unlock"
        >
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>ACT</span>
        </button>

        {/* Undo Step */}
        <button
          type="button"
          disabled={isBusy}
          onClick={undoAction}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-mono font-bold shadow-md active:scale-95 transition disabled:opacity-40"
          title="Undo Last Step"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>UNDO</span>
        </button>

        {/* Close D-Pad if dismissable */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center p-1 rounded-lg text-slate-500 hover:text-slate-300 transition"
            title="Hide Touch Pad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
