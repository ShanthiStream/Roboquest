import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../stores/gameStore';
import { X, Download, Copy, Check, MessageSquare, Trophy, Crown, Sparkles, Cpu, Award, Zap, RotateCcw, Share2, QrCode } from 'lucide-react';

export const GrandWinnerModal: React.FC = () => {
  const {
    modalGrandWinner,
    setModal,
    grandWinnerCardUrl,
    grandWinnerReport,
    nickname,
    restartLevel,
  } = useGameStore();

  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (modalGrandWinner) {
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#ffd700', '#ffb300', '#00f0ff', '#00ffaa', '#b026ff'],
        });
      } catch (e) {}
    }
  }, [modalGrandWinner]);

  if (!modalGrandWinner || !grandWinnerCardUrl) return null;

  const shareText = `👑 I just conquered ALL 10 SECTORS of ROBOQUEST and was rated "${grandWinnerReport?.tier || 'Cybernetic Grandmaster'}" (${grandWinnerReport?.efficiencyScore || 95}% Efficiency) by on-device Cactus Needle AI! Play now: ${window.location.origin}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `roboquest-grand-champion-${nickname.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = grandWinnerCardUrl;
    link.click();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        // Convert dataURL to Blob/File if possible to share actual image file
        const response = await fetch(grandWinnerCardUrl);
        const blob = await response.blob();
        const file = new File(
          [blob],
          `roboquest-grand-champion-${nickname.toLowerCase().replace(/\s+/g, '-')}.png`,
          { type: 'image/png' }
        );

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Roboquest Grand Champion Winner Card',
            text: shareText,
            files: [file],
          });
          setIsSharing(false);
          return;
        }

        await navigator.share({
          title: 'Roboquest Grand Champion Winner Card',
          text: shareText,
          url: window.location.origin,
        });
      } else {
        handleCopyText();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        handleCopyText();
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-lg overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel-glow rounded-3xl p-5 sm:p-7 flex flex-col items-center border border-amber-400/60 shadow-[0_0_60px_rgba(255,191,0,0.3)] my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-amber-500/30 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Crown className="w-5 h-5 fill-amber-400" />
            </span>
            <div>
              <h2 className="font-orbitron font-extrabold text-base sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                CAMPAIGN GRAND WINNER CARD
              </h2>
              <span className="text-[10px] text-amber-300/80 font-mono block">
                Official Certification • Powered by Cactus Needle On-Device AI
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://roboquest.dinesh-0d2.workers.dev/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono hover:bg-cyan-900/60 transition shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              title="Open Live App"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>roboquest.dinesh-0d2.workers.dev</span>
            </a>
            <button
              onClick={() => setModal('modalGrandWinner', false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Canvas Image Preview with Quick Share Badge */}
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_35px_rgba(255,191,0,0.25)] mb-5 bg-slate-950 group">
          <img
            src={grandWinnerCardUrl}
            alt="Roboquest Grand Champion Winner Certificate"
            className="w-full h-auto block select-none"
          />

          {/* Quick Floating Share Button right on the Winner Card */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-orbitron font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,191,0,0.6)] hover:brightness-110 active:scale-95 transition"
              title="Share Winner Card"
            >
              <Share2 className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{isSharing ? 'Sharing...' : 'Share Card'}</span>
            </button>
          </div>
        </div>

        {/* Needle AI Performance Appraisal Section */}
        {grandWinnerReport && (
          <div className="w-full rounded-2xl p-4 sm:p-5 mb-5 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-cyan-950/40 border border-cyan-500/40 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-orbitron font-bold text-xs sm:text-sm text-cyan-300 tracking-wider">
                  NEEDLE AI PERFORMANCE APPRAISAL
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  {grandWinnerReport.latencyMs}ms Local WASM
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                  {Math.round(grandWinnerReport.confidence * 100)}% Calibrated Confidence
                </span>
              </div>
            </div>

            {/* Grid of AI telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
              {/* Strategic Tier */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400">Strategic Tier</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-orbitron font-extrabold text-sm text-amber-300 truncate">
                    {grandWinnerReport.tier}
                  </span>
                </div>
              </div>

              {/* Efficiency Rating */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Efficiency Index</span>
                  <span className="font-bold text-cyan-300">{grandWinnerReport.efficiencyScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-1.5 border border-slate-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                    style={{ width: `${grandWinnerReport.efficiencyScore}%` }}
                  />
                </div>
              </div>

              {/* Identified Playstyle */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/30 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400">Identified Playstyle</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="font-orbitron font-bold text-xs sm:text-sm text-purple-200 truncate">
                    {grandWinnerReport.playstyle}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summary Quote & Key Strengths */}
            <div className="pt-2 text-left space-y-2">
              <p className="text-xs text-slate-200 italic font-sans bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-slate-300">
                "{grandWinnerReport.aiSummary}"
              </p>

              {grandWinnerReport.strengths.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {grandWinnerReport.strengths.map((str, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-200 text-[10px] font-mono"
                    >
                      ✓ {str}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons Row with Primary Share Winner Card */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-orbitron font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,191,0,0.5)] hover:brightness-110 active:scale-95 transition col-span-2 sm:col-span-1"
          >
            <Share2 className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>{isSharing ? 'Sharing...' : 'Share Card'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2.5 rounded-xl border border-cyan-400/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-[0_0_12px_rgba(0,240,255,0.15)]"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="px-3.5 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTwitter}
            className="px-3.5 py-2.5 rounded-xl border border-sky-500/40 bg-sky-950/40 text-sky-300 hover:bg-sky-900/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share to X</span>
          </button>
        </div>
      </div>
    </div>
  );
};
