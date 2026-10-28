import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { GameCanvasRenderer } from '../game/renderer/GameCanvasRenderer';
import { CommandInput } from './CommandInput';
import { TouchControls } from './TouchControls';
import {
  BatteryCharging,
  Key,
  AlertCircle,
  Compass,
  Zap,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Cpu,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Gamepad2,
  ListOrdered,
} from 'lucide-react';
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
  if (pct >= 50) {
    return {
      pct: `${pct}%`,
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
      glow: 'text-amber-400',
    };
  }
  return {
    pct: `${pct}%`,
    bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.25)]',
    glow: 'text-rose-400',
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
  const [showDpad, setShowDpad] = useState(false);
  const [showMobilePlanDrawer, setShowMobilePlanDrawer] = useState(false);

  // Auto-detect touch device on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      setShowDpad(true);
    }
  }, []);

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

  const handleZoomIn = () => rendererRef.current?.zoomIn();
  const handleZoomOut = () => rendererRef.current?.zoomOut();
  const handleResetView = () => rendererRef.current?.resetView();

  const energyPercent = Math.max(0, Math.min(100, snapshot.robot.energy));
  let energyColor = 'bg-emerald-400';
  if (energyPercent < 30) energyColor = 'bg-rose-500 animate-pulse';
  else if (energyPercent < 60) energyColor = 'bg-amber-400';

  return (
    <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden">
      {/* Top HUD: Level Title, Objectives, Viewport Dock (Left) | Status (Center) | Energy & AI Details (Right) */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-4 right-2 sm:right-4 z-20 flex items-start justify-between gap-2 pointer-events-none">
        {/* Left Column: Level Info + Viewport & Control Dock + Mobile AI Plan Pill */}
        <div className="flex flex-col gap-2 items-start pointer-events-none min-w-0 max-w-[60%] sm:max-w-none">
          <div className="glass-panel px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl pointer-events-auto flex items-center gap-2 sm:gap-3 shadow-lg max-w-full">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex-shrink-0">
                  Lvl {currentLevel.id}
                </span>
                <h2 className="font-orbitron font-bold text-xs sm:text-base text-slate-100 truncate">
                  {currentLevel.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-sm hidden md:block">
                {currentLevel.description}
              </p>
            </div>
          </div>

          {/* Left Dock: Viewport Zoom/Fit & D-Pad Controls + Mobile/Tablet AI Plan Pill (Never overlaps Right AI Box) */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-1 p-1 rounded-xl glass-panel shadow-lg border border-slate-700/60">
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 active:scale-95 transition"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 active:scale-95 transition"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="w-8 h-8 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 active:scale-95 transition"
                title="Reset View / Auto-Fit"
                aria-label="Reset View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700/80 mx-0.5" />
              <button
                onClick={() => setShowDpad((prev) => !prev)}
                className={`w-8 h-8 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center active:scale-95 transition ${
                  showDpad
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.35)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
                title={showDpad ? 'Hide Virtual Controls' : 'Show Virtual Controls'}
                aria-label="Toggle Virtual Controls"
              >
                <Gamepad2 className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile & Tablet Floating AI Confidence & Plan Pill (Always accessible) */}
            <button
              onClick={() => {
                if (currentActionPlan.length > 0) {
                  setShowMobilePlanDrawer(true);
                } else {
                  setModal('modalAIInspector', true);
                }
              }}
              className="lg:hidden glass-panel-glow px-2.5 py-1.5 rounded-xl border border-cyan-400/50 flex items-center gap-1.5 text-xs font-mono text-cyan-300 shadow-lg active:scale-95 transition"
              title="View AI Confidence & Action Plan"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse flex-shrink-0" />
              <span>
                {currentActionPlan.length > 0 ? `AI Plan (${currentActionPlan.length})` : 'AI Confidence'}
              </span>
              {overallConfidence !== null && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getConfidenceBadge(overallConfidence).bg}`}>
                  {Math.round(overallConfidence * 100)}%
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Center: Robot Contextual Status Bubble (hidden on small phones to save space) */}
        <div className="hidden md:flex glass-panel px-3 py-1.5 rounded-xl pointer-events-auto items-center gap-1.5 max-w-[220px] lg:max-w-md shadow-lg border-cyan-500/30">
          <span className="text-sm md:text-base">🤖</span>
          <span className="text-[11px] md:text-xs font-mono text-cyan-200 truncate">
            "{snapshot.lastMessage}"
          </span>
        </div>

        {/* Right Column: Stacked Energy Box & AI Confidence Box (Unobstructed) */}
        <div className="flex flex-col gap-2 pointer-events-none items-end flex-shrink-0">
          {/* Box 1: Energy Meter & Inventory */}
          <div className="glass-panel px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl pointer-events-auto flex items-center justify-between gap-2 sm:gap-3 shadow-lg border border-slate-700/60 backdrop-blur-md">
            {/* Energy Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-300 gap-1.5">
                  <span className="hidden xs:inline">ENERGY</span>
                  <span className="font-bold">{energyPercent}%</span>
                </div>
                <div className="w-16 sm:w-24 md:w-28 h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 mt-0.5">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${energyColor}`}
                    style={{ width: `${energyPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Key Inventory */}
            <div className="flex items-center gap-1 sm:gap-1.5 border-l border-slate-700/60 pl-2 sm:pl-3">
              <Key className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 flex-shrink-0" />
              {snapshot.robot.inventory.length === 0 ? (
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500">0</span>
              ) : (
                <div className="flex items-center gap-1">
                  {snapshot.robot.inventory.map((item, idx) => {
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
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${color} shadow-[0_0_6px_currentColor]`}
                        title={`Key: ${item}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Restore AI Plan pill if dismissed on Desktop */}
          {hudDismissed && (
            <button
              onClick={() => {
                setHudDismissed(false);
                setHudMinimized(false);
              }}
              className="hidden lg:flex glass-panel-glow pointer-events-auto px-3 py-1.5 rounded-xl border border-cyan-500/40 items-center gap-1.5 text-xs font-mono text-cyan-300 hover:border-cyan-400 transition shadow-lg"
              title="Restore AI Confidence & Action Plan"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentActionPlan.length > 0 ? `AI Plan (${currentActionPlan.length})` : 'AI Confidence'}</span>
              {overallConfidence !== null && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getConfidenceBadge(overallConfidence).bg}`}>
                  {Math.round(overallConfidence * 100)}%
                </span>
              )}
            </button>
          )}

          {/* Box 2: Desktop AI Confidence & Action Plan Box (Always visible unless dismissed; reserves bottom space when D-Pad is open) */}
          {!hudDismissed && (
            <div className="hidden lg:block w-72 xl:w-80">
              {hudMinimized ? (
                <div className="glass-panel-glow pointer-events-auto w-full p-2.5 rounded-2xl border border-cyan-500/40 shadow-xl backdrop-blur-xl bg-slate-950/92 flex items-center justify-between gap-2 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs font-orbitron font-bold text-slate-100 truncate">
                      {currentActionPlan.length > 0 ? `AI Plan (${currentActionPlan.length})` : 'AI Confidence'}
                    </span>
                    {overallConfidence !== null && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getConfidenceBadge(overallConfidence).bg}`}>
                        {Math.round(overallConfidence * 100)}%
                      </span>
                    )}
                    {isExecutingCommand && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-0.5 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setHudMinimized(false)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 transition"
                      title="Expand AI Confidence Panel"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setHudDismissed(true)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`glass-panel-glow pointer-events-auto w-full rounded-2xl border border-cyan-500/40 shadow-2xl backdrop-blur-xl bg-slate-950/92 p-3 sm:p-3.5 flex flex-col transition-all ${
                    showDpad ? 'max-h-[calc(100dvh-390px)]' : 'max-h-[calc(100dvh-230px)]'
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-slate-800/80 flex-shrink-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-orbitron font-bold text-slate-100 tracking-wider block truncate">
                          AI CONFIDENCE
                        </span>
                        <span className="text-[9px] text-cyan-300 font-mono block truncate">
                          {inspectorData.adapterName || 'Cactus Needle WASM'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {overallConfidence !== null && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getConfidenceBadge(overallConfidence).bg}`}
                          title="Overall Calibrated Model Confidence"
                        >
                          {Math.round(overallConfidence * 100)}%
                        </span>
                      )}
                      <button
                        onClick={() => setHudMinimized(true)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 transition"
                        title="Minimize"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setHudDismissed(true)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Live execution progress ticker if active */}
                  {isExecutingCommand && totalActionSteps > 0 && (
                    <div className="flex items-center justify-between px-2 py-1 mb-2 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex-shrink-0">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        Executing {activeActionIndex + 1} of {totalActionSteps}
                      </span>
                    </div>
                  )}

                  {/* Vertical Stack of Action Cards with individual confidence pills, or Ready status */}
                  {currentActionPlan.length > 0 ? (
                    <div
                      className={`flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin ${
                        showDpad ? 'max-h-[150px]' : 'max-h-[260px]'
                      }`}
                    >
                      {currentActionPlan.map((action, idx) => {
                        const isDone = !isExecutingCommand || idx < activeActionIndex;
                        const isActive = isExecutingCommand && idx === activeActionIndex;
                        const details = getActionDetails(action);
                        const badge = getConfidenceBadge(action.confidence ?? overallConfidence ?? undefined);

                        let cardBorder = 'border-slate-800 bg-slate-900/90';
                        if (isActive) {
                          cardBorder = 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_12px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400/80 animate-pulse';
                        } else if (isDone) {
                          cardBorder = 'border-slate-800/80 bg-slate-900/80';
                        }

                        return (
                          <div
                            key={idx}
                            className={`p-2 sm:p-2.5 rounded-xl border ${cardBorder} flex flex-col justify-between transition-all`}
                          >
                            {/* Top: Step Index & Status */}
                            <div className="flex items-center justify-between gap-1 text-[10px] font-mono mb-1">
                              <span className="text-slate-400 font-bold">Step #{idx + 1}</span>
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
                            <div className="flex items-center justify-between gap-2 my-0.5">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-cyan-400 font-bold text-xs">{details.icon}</span>
                                <span className="text-slate-100 font-bold text-xs truncate">
                                  {details.name}
                                </span>
                              </div>
                              {details.param && (
                                <span className="text-[10px] text-slate-400 font-mono truncate">
                                  {details.param}
                                </span>
                              )}
                            </div>

                            {/* Bottom: Action AI Confidence Score Pill */}
                            <div className="flex items-center justify-between gap-1 pt-1.5 mt-1 border-t border-slate-800/80">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans">
                                Action Confidence
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg}`}
                                title={`Action Confidence Score: ${badge.pct}`}
                              >
                                {badge.pct}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : inspectorData.validationStatus === 'failed' ? (
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-[11px] font-mono text-rose-200 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-rose-300 font-bold uppercase text-[10px]">
                          Command Rejected
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                          {Math.round((overallConfidence ?? inspectorData.confidence ?? 0.14) * 100)}% Conf
                        </span>
                      </div>
                      {inspectorData.instruction && (
                        <p className="text-[10px] text-slate-300 truncate bg-slate-950/70 px-2 py-1 rounded border border-rose-500/20">
                          "{inspectorData.instruction}"
                        </p>
                      )}
                      <p className="text-[10px] text-rose-300/90 leading-relaxed font-sans">
                        {inspectorData.validationError || 'Instruction could not be grounded to valid sector actions.'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Agent Status</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Ready
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                        Enter or speak a command below to view step-by-step action confidence scores.
                      </p>
                    </div>
                  )}

                  {/* Bottom launcher for AI Inspector */}
                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between flex-shrink-0">
                    <button
                      onClick={() => setModal('modalAIInspector', true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-300 text-[10px] font-mono transition"
                    >
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      <span>AI Inspector Details</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Execution Progress overlay if busy */}
      {isExecutingCommand && totalActionSteps > 0 && (
        <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="glass-panel px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-cyan-400/50 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>
              Action {activeActionIndex + 1} of {totalActionSteps}
            </span>
          </div>
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div className="relative w-full flex-1 min-h-0 bg-cyber-900 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
        />

        {/* Touch D-Pad Controls Overlay for Mobile, iPad & Desktop */}
        {showDpad && (
          <TouchControls onClose={() => setShowDpad(false)} />
        )}
      </div>

      {/* Mobile & Tablet AI Plan Drawer Modal */}
      {showMobilePlanDrawer && currentActionPlan.length > 0 && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end p-2 sm:p-4">
          <div className="glass-panel-glow w-full max-w-lg mx-auto rounded-3xl border border-cyan-500/40 shadow-2xl p-4 flex flex-col max-h-[80vh] animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-orbitron font-bold text-slate-100">
                  AI Action Plan ({currentActionPlan.length})
                </span>
                {overallConfidence !== null && (
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getConfidenceBadge(overallConfidence).bg}`}>
                    {Math.round(overallConfidence * 100)}%
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowMobilePlanDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of cards */}
            <div className="flex flex-col gap-2 overflow-y-auto py-3 scrollbar-thin flex-1">
              {currentActionPlan.map((action, idx) => {
                const isDone = !isExecutingCommand || idx < activeActionIndex;
                const isActive = isExecutingCommand && idx === activeActionIndex;
                const details = getActionDetails(action);
                const badge = getConfidenceBadge(action.confidence ?? overallConfidence ?? undefined);

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : isDone
                        ? 'border-slate-800/80 bg-slate-900/80'
                        : 'border-slate-800 bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 font-bold">Step #{idx + 1}</span>
                      {isDone ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : isActive ? (
                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-500">Queued</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span className="text-cyan-400">{details.icon}</span> {details.name}
                      </span>
                      {details.param && <span className="text-xs text-slate-400 font-mono">{details.param}</span>}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Action Confidence</span>
                      <span className={`px-1.5 py-0.5 rounded font-mono font-bold border ${badge.bg}`}>{badge.pct}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inspector button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowMobilePlanDrawer(false);
                  setModal('modalAIInspector', true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Open Full AI Inspector</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Command Input Bar */}
      <div className="w-full z-20 pb-2">
        <CommandInput
          onToggleDpad={() => setShowDpad((prev) => !prev)}
          isDpadOpen={showDpad}
        />
      </div>
    </div>
  );
};
