import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { RobotCosmetics } from '../game/types';
import { storage } from '../services/StorageService';
import { X, Sparkles, Check, Lock } from 'lucide-react';

export const CustomizerModal: React.FC = () => {
  const { modalCustomizer, setModal, cosmetics, equipCosmetics, crystals } = useGameStore();
  const profile = storage.getProfile();

  const [selectedColor, setSelectedColor] = useState<RobotCosmetics['color']>(cosmetics.color);
  const [selectedAccessory, setSelectedAccessory] = useState<RobotCosmetics['accessory']>(cosmetics.accessory);
  const [selectedTrail, setSelectedTrail] = useState<RobotCosmetics['trail']>(cosmetics.trail);

  if (!modalCustomizer) return null;

  const colors = [
    { id: 'electric-blue', label: 'Electric Blue', hex: '#00f0ff', cost: 0 },
    { id: 'neon-green', label: 'Neon Green', hex: '#00ffaa', cost: 50 },
    { id: 'sunset-orange', label: 'Sunset Orange', hex: '#ff7700', cost: 100 },
    { id: 'cosmic-purple', label: 'Cosmic Purple', hex: '#b026ff', cost: 150 },
    { id: 'classic-silver', label: 'Classic Silver', hex: '#cbd5e1', cost: 200 },
  ];

  const accessories = [
    { id: 'none', label: 'None', cost: 0 },
    { id: 'antenna', label: 'Explorer Antenna', cost: 0 },
    { id: 'space-helmet', label: 'Space Helmet', cost: 100 },
    { id: 'mini-jetpack', label: 'Mini Jetpack', cost: 150 },
    { id: 'scientist-glasses', label: 'Scientist Glasses', cost: 200 },
    { id: 'golden-crown', label: 'Golden Crown', cost: 300 },
  ];

  const trails = [
    { id: 'none', label: 'None', cost: 0 },
    { id: 'sparkle', label: 'Sparkle Trail', cost: 50 },
    { id: 'electric', label: 'Electric Trail', cost: 100 },
    { id: 'rainbow', label: 'Rainbow Trail', cost: 200 },
    { id: 'pixel', label: 'Pixel Trail', cost: 250 },
  ];

  const handleApply = () => {
    equipCosmetics({
      color: selectedColor,
      accessory: selectedAccessory,
      trail: selectedTrail,
    });
    setModal('modalCustomizer', false);
  };

  const handleUnlock = (category: 'colors' | 'accessories' | 'trails', id: string, cost: number) => {
    if (storage.spendCrystals(cost)) {
      storage.unlockCosmetic(category, id);
      useGameStore.setState({ crystals: storage.getProfile().crystals });
    } else {
      alert('Not enough energy crystals! Complete levels to earn more.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl glass-panel-glow rounded-2xl flex flex-col max-h-[90vh] overflow-hidden border border-cyan-500/40 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-900/60">
          <div>
            <h2 className="font-orbitron font-bold text-lg text-slate-100 flex items-center gap-2">
              <span>ROBOT CUSTOMIZER</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                COSMETICS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Customize your robot chassis, headwear, and particle trail effects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <span>💎</span>
              <span>{crystals} Crystals</span>
            </div>
            <button
              onClick={() => setModal('modalCustomizer', false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Colors Selection */}
          <div>
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase mb-3">
              Chassis Color Theme
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {colors.map((c) => {
                const isUnlocked = profile.unlockedCosmetics.colors.includes(c.id);
                const isSelected = selectedColor === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (isUnlocked) setSelectedColor(c.id as any);
                      else handleUnlock('colors', c.id, c.cost);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-black stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{c.label}</span>
                    {!isUnlocked && (
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {c.cost} 💎
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessories Selection */}
          <div>
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase mb-3">
              Headwear & Accessories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {accessories.map((a) => {
                const isUnlocked = profile.unlockedCosmetics.accessories.includes(a.id);
                const isSelected = selectedAccessory === a.id;

                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      if (isUnlocked) setSelectedAccessory(a.id as any);
                      else handleUnlock('accessories', a.id, a.cost);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{a.label}</span>
                      {!isUnlocked && (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                          <Lock className="w-3 h-3" /> {a.cost} 💎
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Trail Effects Selection */}
          <div>
            <h3 className="font-orbitron text-xs font-bold tracking-wider text-cyan-400 uppercase mb-3">
              Visual Motion Trails
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {trails.map((t) => {
                const isUnlocked = profile.unlockedCosmetics.trails.includes(t.id);
                const isSelected = selectedTrail === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (isUnlocked) setSelectedTrail(t.id as any);
                      else handleUnlock('trails', t.id, t.cost);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{t.label}</span>
                      {!isUnlocked && (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                          <Lock className="w-3 h-3" /> {t.cost} 💎
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-900/60 flex items-center justify-end gap-3">
          <button
            onClick={() => setModal('modalCustomizer', false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl neon-button font-orbitron font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>APPLY CUSTOMIZATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
