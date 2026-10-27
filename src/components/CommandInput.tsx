import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Send, Mic, MicOff, Lightbulb, RotateCcw, Undo2 } from 'lucide-react';

export const CommandInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const {
    submitCommand,
    isExecutingCommand,
    isListeningVoice,
    toggleVoiceListening,
    voiceTranscript,
    currentLevel,
    restartLevel,
    undoAction,
    nextHint,
    snapshot,
  } = useGameStore();

  useEffect(() => {
    if (voiceTranscript) {
      setInput(voiceTranscript);
    }
  }, [voiceTranscript]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = input.trim();
    if (!clean || isExecutingCommand) return;

    setHistory((prev) => [clean, ...prev.slice(0, 19)]);
    setHistoryIndex(-1);
    submitCommand(clean);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIdx = historyIndex - 1;
        setHistoryIndex(prevIdx);
        setInput(history[prevIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  // Sample quick suggestion chips tailored to level
  const suggestions = [
    currentLevel.verifiedSolution[0] || 'move forward 3',
    'turn left',
    'turn right',
    'go to the exit',
    'collect battery',
  ].slice(0, 4);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 flex flex-col gap-2">
      {/* Quick suggestions chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-400 no-scrollbar">
        <span className="font-semibold text-cyan-400 shrink-0">Try:</span>
        {suggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => setInput(sug)}
            className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 transition shrink-0"
          >
            "{sug}"
          </button>
        ))}
      </div>

      {/* Main command bar form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Quick actions buttons: Undo, Restart, Hint */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undoAction}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/60 transition"
            title="Undo Last Step"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={restartLevel}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-amber-300 hover:border-amber-500/60 transition"
            title="Restart Level"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextHint}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 transition"
            title="Get Progressive Hint"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
        </div>

        {/* Text Input Container */}
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecutingCommand || snapshot.status !== 'playing'}
            placeholder={
              isListeningVoice
                ? 'Listening... Speak your command now...'
                : isExecutingCommand
                ? 'Robot executing action sequence...'
                : 'Type or speak: "Move forward 3", "Turn left and collect battery", "Go to exit"...'
            }
            className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border text-sm sm:text-base font-mono outline-none transition shadow-inner ${
              isListeningVoice
                ? 'border-red-500/80 ring-2 ring-red-500/30 text-red-300'
                : 'border-cyan-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder-slate-500'
            }`}
          />
        </div>

        {/* Voice Microphone Button */}
        <button
          type="button"
          onClick={toggleVoiceListening}
          className={`p-3 rounded-xl border transition shadow-lg flex items-center justify-center ${
            isListeningVoice
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : 'bg-slate-900/90 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400'
          }`}
          title={isListeningVoice ? 'Stop Voice Recording' : 'Voice Command (Web Speech)'}
        >
          {isListeningVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Execute Command Button */}
        <button
          type="submit"
          disabled={!input.trim() || isExecutingCommand || snapshot.status !== 'playing'}
          className="px-5 py-3 rounded-xl neon-button font-orbitron font-bold text-xs sm:text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          <span>EXECUTE</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
