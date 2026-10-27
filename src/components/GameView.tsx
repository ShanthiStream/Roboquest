import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { GameCanvasRenderer } from '../game/renderer/GameCanvasRenderer';
import { CommandInput } from './CommandInput';
import { BatteryCharging, Key, AlertCircle, Compass, Zap, Sparkles, CheckCircle2, ChevronDown, ChevronUp, X, Cpu } from 'lucide-react';
import { RobotAction } from '../ai/types';

function getActionDetails(action: RobotAction): { name: string; param: string; icon: string } {
  switch (action.type) {
    case 'move':
      return { name: `Move ${action.direction}`, param: `${action.steps} step${action.steps > 1 ? 's' : ''}`, icon: '→' };
    case 'turn':
      return { name: `Turn ${action.direction}`, param: '90° rotate', icon: '⟳' };
    case 'collect':
      return { name: 'Collect', param: action.targetId, icon: '★' };
    case 'interact':
      return { name: 'Interact', param: action.targetId, icon: '⚡' };
    case 'push':
      return { name: `Push ${action.direction}`, param: 'block', icon: '⇢' };
    case 'wait':
      return { name: 'Wait', param: `${action.ticks} tick${action.ticks > 1 ? 's' : ''}`, icon: '⏳' };
    case 'recharge':
      return { name: 'Recharge', param: 'solar', icon: '🔋' };
    case 'inspect':
      return { name: 'Inspect', param: action.targetId || 'tile', icon: '🔍' };
    default:
      return { name: 'Action', param: '', icon: '⚙' };
  }
}

function getConfidenceBadge(confidence?: number) {
  const conf = confidence ?? 0.85;
  const pct = Math.round(conf * 100);
  if (pct >= 85) {
    return {
      pct: `${pct}%`,
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
      glow: 'text-emerald-400',
    };
  }
  if (pct >= 70) {
    return {
      pct: `${pct}%`,
      bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]',
      glow: 'text-cyan-400',
    };
  }
  return {
    pct: `${pct}%`,
    bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
    glow: 'text-amber-400',
  };
}

export const GameView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameCanvasRenderer | null>(null);

  const {
    currentLevel,
    engine,
    snapshot,
    cosmetics,
    isExecutingCommand,
    activeActionIndex,
    totalActionSteps,
    currentActionPlan,
    overallConfidence,
    inspectorData,
    setModal,
  } = useGameStore();

  const [hudDismissed, setHudDismissed] = useState(false);
  const [hudMinimized, setHudMinimized] = useState(false);

  // Automatically reopen HUD when a new action plan is generated
  useEffect(() => {
    if (currentActionPlan.length > 0) {
      setHudDismissed(false);
      setHudMinimized(false);
    }
  }, [currentActionPlan]);

  useEffect(() => {
    if (canvasRef.current) {
      const renderer = new GameCanvasRenderer(canvasRef.current);
      rendererRef.current = renderer;
      renderer.syncState(snapshot.robot, snapshot.entities, engine.getTiles(), cosmetics);
      renderer.start();

      return () => {
        renderer.stop();
      };
    }
  }, []);

  // Sync canvas renderer whenever snapshot changes
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.syncState(snapshot.robot, snapshot.entities, engine.getTiles(), cosmetics);
    }
  }, [snapshot, cosmetics]);

  const energyPercent = Math.max(0, Math.min(100, snapshot.robot.energy));
  let energyColor = 'bg-emerald-400';
  if (energyPercent < 30) energyColor = 'bg-rose-500 animate-pulse';
  else if (energyPercent < 60) energyColor = 'bg-amber-400';

  return (
    <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden">
      {/* Top HUD: Level Title, Objectives, Energy Bar, Inventory Keys */}
      <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Level Info */}
        <div className="glass-panel px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-3 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Level {currentLevel.id}
              </span>
              <h2 className="font-orbitron font-bold text-sm sm:text-base text-slate-100">
                {currentLevel.title}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm hidden sm:block">
              {currentLevel.description}
            </p>
          </div>
        </div>

        {/* Center: Robot Contextual Status Bubble */}
        <div className="glass-panel px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-2 max-w-md shadow-lg border-cyan-500/30">
          <span className="text-lg">🤖</span>
          <span className="text-xs font-mono text-cyan-200">
            "{snapshot.lastMessage}"
          </span>
        </div>

        {/* Right: Energy Meter & Inventory */}
        <div className="glass-panel px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-4 shadow-lg">
          {/* Energy Bar */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 gap-2">
                <span>ENERGY</span>
                <span className="font-bold">{energyPercent}%</span>
              </div>
              <div className="w-24 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 mt-0.5">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${energyColor}`}
                  style={{ width: `${energyPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Inventory */}
          <div className="flex items-center gap-1.5 border-l border-slate-700/60 pl-3">
            <Key className="w-3.5 h-3.5 text-slate-400" />
            {snapshot.robot.inventory.length === 0 ? (
              <span className="text-[11px] font-mono text-slate-500">None</span>
            ) : (
              snapshot.robot.inventory.map((item, idx) => {
                const color = item.includes('blue')
                  ? 'bg-cyan-500'
                  : item.includes('yellow')
                  ? 'bg-amber-400'
                  : item.includes('red')
                  ? 'bg-rose-500'
                  : 'bg-emerald-400';
                return (
                  <span
                    key={idx}
                    className={`w-3 h-3 rounded-full ${color} shadow-[0_0_6px_currentColor]`}
                    title={`Key: ${item}`}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Action Execution Progress overlay if busy */}
      {isExecutingCommand && totalActionSteps > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="glass-panel px-4 py-1.5 rounded-full border border-cyan-400/50 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>
              Action {activeActionIndex + 1} of {totalActionSteps}
            </span>
          </div>
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div className="relative w-full flex-1 min-h-[360px] flex items-center justify-center bg-cyber-900">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* On-Screen Action Plan Queue & Confidence HUD */}
      {currentActionPlan.length > 0 && !hudDismissed && (
        <div className="absolute bottom-20 left-4 right-4 z-30 pointer-events-none flex justify-center">
          <div className="glass-panel-glow pointer-events-auto w-full max-w-4xl p-3 sm:p-3.5 rounded-2xl border border-cyan-500/40 shadow-2xl backdrop-blur-xl bg-slate-950/90 transition-all">
            {hudMinimized ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-orbitron font-bold text-slate-100">
                    AI Plan ({currentActionPlan.length} actions)
                  </span>
                  {overallConfidence !== null && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getConfidenceBadge(overallConfidence).bg}`}>
                      {Math.round(overallConfidence * 100)}% Avg Confidence
                    </span>
                  )}
                  {isExecutingCommand && (
                    <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      Step {activeActionIndex + 1}/{totalActionSteps}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setHudMinimized(false)}
                    className="p-1 px-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition text-xs flex items-center gap-1 border border-slate-700/60"
                    title="Expand details"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono">Show Actions</span>
                  </button>
                  <button
                    onClick={() => setHudDismissed(true)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition border border-transparent hover:border-slate-700/60"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-orbitron font-bold text-slate-100 tracking-wider">
                          AI ACTION PLAN
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                          {inspectorData.adapterName.includes('Needle') ? 'Cactus Needle WASM' : 'Rule-Based Engine'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Header items: Overall Confidence & Controls */}
                  <div className="flex items-center gap-2">
                    {overallConfidence !== null && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-sans text-slate-400">Confidence:</span>
                        <span className={`px-1.5 py-0.2 rounded text-[11px] font-mono font-bold border ${getConfidenceBadge(overallConfidence).bg}`}>
                          {Math.round(overallConfidence * 100)}%
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setModal('modalAIInspector', true)}
                      className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-300 text-[10px] font-mono transition"
                    >
                      <span>AI Inspector</span>
                    </button>
                    <button
                      onClick={() => setHudMinimized(true)}
                      className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                      title="Minimize"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setHudDismissed(true)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Horizontal Action Cards with Confidence Badges */}
                <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {currentActionPlan.map((action, idx) => {
                    const isDone = idx < activeActionIndex;
                    const isActive = isExecutingCommand && idx === activeActionIndex;
                    const details = getActionDetails(action);
                    const badge = getConfidenceBadge(action.confidence ?? overallConfidence ?? undefined);

                    let cardBorder = 'border-slate-800 bg-slate-900/90';
                    if (isActive) {
                      cardBorder = 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(0,240,255,0.35)] ring-1 ring-cyan-400/80 animate-pulse';
                    } else if (isDone) {
                      cardBorder = 'border-slate-800/60 bg-slate-950/60 opacity-60';
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex-shrink-0 min-w-[140px] sm:min-w-[155px] p-2 sm:p-2.5 rounded-xl border ${cardBorder} flex flex-col justify-between transition-all`}
                      >
                        {/* Top: Step Index & Status */}
                        <div className="flex items-center justify-between gap-1 text-[10px] font-mono mb-1.5">
                          <span className="text-slate-400 font-bold">#{idx + 1}</span>
                          {isDone ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          ) : isActive ? (
                            <span className="text-cyan-300 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Active
                            </span>
                          ) : (
                            <span className="text-slate-500">Queued</span>
                          )}
                        </div>

                        {/* Mid: Action Name & Params */}
                        <div className="my-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-cyan-400 font-bold text-xs">{details.icon}</span>
                            <span className="text-slate-100 font-bold text-xs truncate">
                              {details.name}
                            </span>
                          </div>
                          {details.param && (
                            <span className="text-[10px] text-slate-400 font-mono block pl-4 truncate">
                              {details.param}
                            </span>
                          )}
                        </div>

                        {/* Bottom: Action AI Confidence Score Pill */}
                        <div className="flex items-center justify-between gap-1 pt-1.5 mt-1 border-t border-slate-800/80">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans">
                            Confidence
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg}`}
                            title={`AI Confidence Score: ${badge.pct}`}
                          >
                            {badge.pct}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Command Input Bar */}
      <div className="w-full z-20 pb-2">
        <CommandInput />
      </div>
    </div>
  );
};
