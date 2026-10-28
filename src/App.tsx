import React, { useEffect, useState } from 'react';
import { useGameStore } from './stores/gameStore';
import { Navbar } from './components/Navbar';
import { GameView } from './components/GameView';
import { PuzzleEditorView } from './components/PuzzleEditorView';
import { LevelSelectModal } from './components/LevelSelectModal';
import { CustomizerModal } from './components/CustomizerModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AIInspector } from './components/AIInspector';
import { VictoryModal } from './components/VictoryModal';
import { VictoryCardModal } from './components/VictoryCardModal';
import { GrandWinnerModal } from './components/GrandWinnerModal';
import { SettingsModal } from './components/SettingsModal';
import { HintDialog } from './components/HintDialog';
import { PuzzleEncoder } from './editor/PuzzleEncoder';
import { sound } from './audio/SoundSystem';
import { aiManager } from './ai/AIAdapterManager';

export const App: React.FC = () => {
  const { mode, highContrast, loadCustomLevel } = useGameStore();
  const [victoryCardUrl, setVictoryCardUrl] = useState<string | null>(null);

  // Initialize on-device AI runtime on startup
  useEffect(() => {
    aiManager.initialize().then(() => {
      const active = aiManager.getActiveAdapter();
      useGameStore.setState((s) => ({
        inspectorData: {
          ...s.inspectorData,
          adapterName: active.name,
          isFallback: active.isFallback,
          adapterStatus: active.status,
        },
      }));
    });
  }, []);

  // Check URL query parameters for shared puzzle
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const puzzleCode = params.get('puzzle');
    if (puzzleCode) {
      const decoded = PuzzleEncoder.decode(puzzleCode);
      if (decoded) {
        loadCustomLevel(decoded);
      }
    }
  }, []);

  // Ambient sound initialization on first click
  useEffect(() => {
    const startAudio = () => {
      sound.startAmbientMusic();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
      sound.stopAmbientMusic();
    };
  }, []);

  // High contrast class
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <div className="h-screen w-full bg-cyber-900 text-slate-100 flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 w-full flex flex-col relative overflow-hidden">
        {mode === 'creative' ? <PuzzleEditorView /> : <GameView />}
      </main>

      {/* Global Modals */}
      <LevelSelectModal />
      <CustomizerModal />
      <AchievementsModal />
      <AIInspector />
      <VictoryModal onOpenCard={(url) => setVictoryCardUrl(url)} />
      <VictoryCardModal cardUrl={victoryCardUrl} onClose={() => setVictoryCardUrl(null)} />
      <GrandWinnerModal />
      <SettingsModal />
      <HintDialog />
    </div>
  );
};
