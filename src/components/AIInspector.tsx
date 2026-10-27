import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { X, Cpu, CheckCircle2, AlertTriangle, Clock, Terminal, BookOpen, Layers, Sparkles } from 'lucide-react';

export const AIInspector: React.FC = () => {
  const { modalAIInspector, setModal, inspectorData, inspectorHistory } = useGameStore();
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'educational'>('current');

  if (!modalAIInspector) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl glass-panel-glow rounded-2xl flex flex-col max-h-[90vh] overflow-hidden border border-cyan-500/40 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-orbitron font-bold text-base text-slate-100 flex items-center gap-2">
                <span>AI INSPECTOR</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  AGENT PIPELINE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transparent on-device AI command decomposition & tool execution
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal('modalAIInspector', false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center border-b border-cyan-500/20 px-6 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'current'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Active Inference</span>
          </button>
          <button
            onClick={() => setActiveTab('educational')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'educational'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>What Did Your AI Do?</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Command History ({inspectorHistory.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
          {activeTab === 'current' && (
            <>
              {/* Engine metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase font-sans">Active Engine</span>
                  <span className="text-cyan-300 font-bold text-xs mt-0.5 block truncate">
                    {inspectorData.adapterName}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {inspectorData.isFallback ? 'Deterministic' : 'Cactus WASM'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase font-sans">Schema Check</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {inspectorData.validationStatus === 'passed' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Zod: PASSED</span>
                      </>
                    ) : inspectorData.validationStatus === 'failed' ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-400 font-bold">REJECTED</span>
                      </>
                    ) : (
                      <span className="text-slate-500">Awaiting Command</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase font-sans">Latency</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">{inspectorData.latencyMs} ms</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase font-sans">Model Confidence</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">
                      {inspectorData.confidence !== undefined ? `${Math.round(inspectorData.confidence * 100)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Natural language input */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[11px] font-sans font-semibold block mb-1">
                  1. Natural Language Instruction
                </span>
                <p className="text-slate-100 font-mono text-sm bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  "{inspectorData.instruction || 'None yet. Enter a command in game.'}"
                </p>
                {inspectorData.speechTranscript && (
                  <span className="text-[11px] text-purple-300 mt-1 block">
                    🎙️ Voice transcript captured via Web Speech API
                  </span>
                )}
              </div>

              {/* Generated structured action plan */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[11px] font-sans font-semibold block mb-2">
                  2. Generated Structured Action Plan & Confidence Breakdown
                </span>

                {inspectorData.generatedActions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {inspectorData.generatedActions.map((act, i) => {
                      const conf = act.confidence ?? inspectorData.confidence ?? 0.85;
                      const pct = Math.round(conf * 100);
                      const badgeColor =
                        pct >= 85
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : pct >= 70
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      return (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-cyan-400 font-bold">#{i + 1}</span>
                            <span className="text-slate-200 font-bold uppercase text-[11px]">{act.type}</span>
                            {'direction' in act && (
                              <span className="text-slate-400 text-[11px]">
                                ({act.direction}{'steps' in act ? ` × ${act.steps}` : ''})
                              </span>
                            )}
                            {'targetId' in act && (
                              <span className="text-slate-400 text-[11px]">({act.targetId})</span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeColor}`}>
                            {pct}% Conf
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <pre className="text-cyan-300 bg-slate-900/95 p-3 rounded-lg border border-slate-800 overflow-x-auto text-xs max-h-40 leading-relaxed">
                  {JSON.stringify(inspectorData.generatedActions, null, 2)}
                </pre>
              </div>

              {/* Model Reasoning / Confidence */}
              {inspectorData.explanation && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200">
                  <span className="text-purple-300 text-[11px] font-sans font-semibold block mb-1">
                    3. Model Reasoning & Calibrated Confidence
                  </span>
                  <p className="font-mono text-xs text-purple-200 leading-relaxed">
                    {inspectorData.explanation}
                  </p>
                </div>
              )}

              {/* Validation / error report */}
              {inspectorData.validationError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                  <span className="font-bold font-sans block mb-0.5">Validation Message:</span>
                  <p>{inspectorData.validationError}</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'educational' && (
            <div className="space-y-4 font-sans text-slate-300 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                <h3 className="font-orbitron font-bold text-sm text-cyan-300 mb-2">
                  How AI Agents Control Robots
                </h3>
                <p className="mb-2">
                  When you give an instruction like <code className="text-cyan-300">"Turn left and collect the battery"</code>,
                  a modern AI model does not manipulate coordinates directly. Instead, it functions as an <strong>agentic tool-caller</strong>:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-400">
                  <li><strong>Natural Language Extraction:</strong> Decomposes complex human language into distinct intent components.</li>
                  <li><strong>Structured Schema Validation:</strong> Formats decisions into strict JSON structures (e.g., <code className="text-cyan-300">RobotAction</code>) verified by Zod.</li>
                  <li><strong>Deterministic Engine Guardrails:</strong> The game engine validates that movement doesn't breach walls, doors, or hazards.</li>
                  <li><strong>Action Execution Queue:</strong> The robot animates each step with auditory and visual feedback.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30">
                <h3 className="font-orbitron font-bold text-sm text-purple-300 mb-2">
                  Why On-Device Inference Matters
                </h3>
                <p className="text-slate-400">
                  Unlike traditional cloud AI (such as ChatGPT or Gemini API) that sends your audio and text to remote data centers,
                  on-device models like <strong>Cactus Needle</strong> operate entirely in the browser using WebAssembly. This delivers:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-300">
                    🔒 Zero server costs & 100% privacy
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                    ⚡ Sub-10ms response times
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {inspectorHistory.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No past commands recorded yet.</p>
              ) : (
                inspectorHistory.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-slate-200 font-bold">"{item.instruction}"</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        {item.timestamp} • {item.adapterName} • {item.generatedActions.length} action(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.confidence !== undefined && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                          {Math.round(item.confidence * 100)}% Conf
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.validationStatus === 'passed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'}`}>
                        {item.validationStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
