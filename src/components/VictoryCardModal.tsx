import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { X, Download, Copy, Check, MessageSquare } from 'lucide-react';

interface VictoryCardModalProps {
  cardUrl: string | null;
  onClose: () => void;
}

export const VictoryCardModal: React.FC<VictoryCardModalProps> = ({ cardUrl, onClose }) => {
  const { currentLevel, lastScore, nickname } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!cardUrl) return null;

  const shareText = `🚀 I just completed Sector ${currentLevel.id}: ${currentLevel.title} in ROBOQUEST with ${lastScore?.stars || 3} Stars and ${lastScore?.totalScore || 1500} points using on-device AI! Play now: ${window.location.origin}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `roboquest-sector-${currentLevel.id}-${nickname.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = cardUrl;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl glass-panel-glow rounded-3xl p-6 flex flex-col items-center border border-cyan-400/50 shadow-2xl">
        <div className="w-full flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
          <h2 className="font-orbitron font-bold text-base text-slate-100 flex items-center gap-2">
            <span>SHAREABLE VICTORY CARD</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Canvas Image Preview */}
        <div className="w-full rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl mb-5">
          <img src={cardUrl} alt="Roboquest Victory Certificate" className="w-full h-auto block" />
        </div>

        {/* Share buttons */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl border border-cyan-400/40 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link!' : 'Copy Share Text'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
