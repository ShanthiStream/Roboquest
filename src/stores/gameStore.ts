import { create } from 'zustand';
import { aiManager } from '../ai/AIAdapterManager';
import { RobotAction, UserPerformanceMetrics, AIPerformanceReport } from '../ai/types';
import { sound } from '../audio/SoundSystem';
import { speech } from '../audio/SpeechSystem';
import { GameEngine } from '../game/engine/GameEngine';
import { LEVELS } from '../game/levels/levelData';
import { calculateLevelScore, ScoreBreakdown } from '../game/scoring/scoring';
import { GameSnapshot, LevelDefinition, RobotCosmetics } from '../game/types';
import { DailyChallengeService } from '../services/DailyChallengeService';
import { storage } from '../services/StorageService';
import { CardGeneratorService } from '../services/CardGeneratorService';

export type GameMode = 'story' | 'challenge' | 'creative' | 'daily';

export interface AIInspectorData {
  instruction: string;
  speechTranscript?: string;
  adapterName: string;
  isFallback: boolean;
  adapterStatus: string;
  generatedActions: RobotAction[];
  validationStatus: 'passed' | 'failed' | 'idle';
  validationError?: string;
  latencyMs: number;
  confidence?: number;
  explanation?: string;
  timestamp: string;
}

export interface GameStoreState {
  // Mode and Level
  mode: GameMode;
  currentLevelId: number;
  currentLevel: LevelDefinition;
  engine: GameEngine;
  snapshot: GameSnapshot;
  isExecutingCommand: boolean;
  activeActionIndex: number;
  totalActionSteps: number;
  currentActionPlan: RobotAction[];
  overallConfidence: number | null;

  // AI Inspector
  inspectorData: AIInspectorData;
  inspectorHistory: AIInspectorData[];

  // Voice System
  isListeningVoice: boolean;
  voiceTranscript: string;

  // UI Modals
  modalLevelSelect: boolean;
  modalCustomizer: boolean;
  modalAchievements: boolean;
  modalVictory: boolean;
  modalVictoryCard: boolean;
  modalGrandWinner: boolean;
  grandWinnerReport: AIPerformanceReport | null;
  grandWinnerCardUrl: string | null;
  modalAIInspector: boolean;
  modalSettings: boolean;
  modalDailyChallenge: boolean;
  modalHint: boolean;
  hintStage: number; // 0, 1, 2

  // Audio & Settings
  isMuted: boolean;
  musicVolume: number;
  sfxVolume: number;
  speechVolume: number;
  highContrast: boolean;
  reducedMotion: boolean;

  // Victory result
  lastScore: ScoreBreakdown | null;

  // Profile
  crystals: number;
  nickname: string;
  cosmetics: RobotCosmetics;

  // Actions
  setMode: (mode: GameMode) => void;
  loadLevel: (levelId: number) => void;
  loadCustomLevel: (level: LevelDefinition) => void;
  loadDailyLevel: () => void;
  restartLevel: () => void;
  undoAction: () => void;
  submitCommand: (instruction: string, isVoice?: boolean) => Promise<boolean>;
  nextHint: () => void;
  nextLevel: () => void;

  // Voice actions
  toggleVoiceListening: () => void;
  setVoiceTranscript: (transcript: string) => void;

  // Audio & Settings actions
  toggleMute: () => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setSpeechVolume: (v: number) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;

  // Profile actions
  setNickname: (nick: string) => void;
  equipCosmetics: (cosmetics: RobotCosmetics) => void;

  // Modal open/close actions
  setModal: (modal: string, open: boolean) => void;
  openGrandWinnerCard: () => Promise<void>;
}

const initialLevel = LEVELS[0];
const initialEngine = new GameEngine(initialLevel);
const initialProfile = storage.getProfile();

export const useGameStore = create<GameStoreState>((set, get) => ({
  mode: 'story',
  currentLevelId: 1,
  currentLevel: initialLevel,
  engine: initialEngine,
  snapshot: initialEngine.getSnapshot(),
  isExecutingCommand: false,
  activeActionIndex: 0,
  totalActionSteps: 0,
  currentActionPlan: [],
  overallConfidence: null,

  inspectorData: {
    instruction: '',
    adapterName: 'Cactus Needle AI',
    isFallback: false,
    adapterStatus: 'Active',
    generatedActions: [],
    validationStatus: 'idle',
    latencyMs: 0,
    timestamp: new Date().toLocaleTimeString(),
  },
  inspectorHistory: [],

  isListeningVoice: false,
  voiceTranscript: '',

  modalLevelSelect: false,
  modalCustomizer: false,
  modalAchievements: false,
  modalVictory: false,
  modalVictoryCard: false,
  modalGrandWinner: false,
  grandWinnerReport: null,
  grandWinnerCardUrl: null,
  modalAIInspector: false,
  modalSettings: false,
  modalDailyChallenge: false,
  modalHint: false,
  hintStage: 0,

  isMuted: false,
  musicVolume: 0.4,
  sfxVolume: 0.7,
  speechVolume: 0.8,
  highContrast: false,
  reducedMotion: false,

  lastScore: null,
  crystals: initialProfile.crystals,
  nickname: initialProfile.nickname,
  cosmetics: initialProfile.equippedCosmetics,

  setMode: (mode) => set({ mode }),

  loadLevel: (levelId) => {
    const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    const newEngine = new GameEngine(level);
    set({
      mode: 'story',
      currentLevelId: level.id,
      currentLevel: level,
      engine: newEngine,
      snapshot: newEngine.getSnapshot(),
      currentActionPlan: [],
      overallConfidence: null,
      activeActionIndex: 0,
      totalActionSteps: 0,
      hintStage: 0,
      modalVictory: false,
      modalLevelSelect: false,
    });
  },

  loadCustomLevel: (level) => {
    const newEngine = new GameEngine(level);
    set({
      mode: 'creative',
      currentLevelId: level.id,
      currentLevel: level,
      engine: newEngine,
      snapshot: newEngine.getSnapshot(),
      currentActionPlan: [],
      overallConfidence: null,
      activeActionIndex: 0,
      totalActionSteps: 0,
      hintStage: 0,
    });
  },

  loadDailyLevel: () => {
    const dailyLevel = DailyChallengeService.generateDailyLevel();
    const newEngine = new GameEngine(dailyLevel);
    set({
      mode: 'daily',
      currentLevelId: 999,
      currentLevel: dailyLevel,
      engine: newEngine,
      snapshot: newEngine.getSnapshot(),
      currentActionPlan: [],
      overallConfidence: null,
      activeActionIndex: 0,
      totalActionSteps: 0,
      hintStage: 0,
      modalDailyChallenge: false,
    });
  },

  restartLevel: () => {
    const { engine } = get();
    engine.reset();
    set({
      snapshot: engine.getSnapshot(),
      currentActionPlan: [],
      overallConfidence: null,
      activeActionIndex: 0,
      totalActionSteps: 0,
      modalVictory: false,
      hintStage: 0,
    });
  },

  undoAction: () => {
    const { engine } = get();
    if (engine.undo()) {
      set({ snapshot: engine.getSnapshot() });
    }
  },

  submitCommand: async (instruction: string, isVoice: boolean = false) => {
    const { engine, currentLevel, isExecutingCommand } = get();
    if (isExecutingCommand || engine.getSnapshot().status !== 'playing') return false;

    set({ isExecutingCommand: true });

    // Step 1: AI Adapter Inference
    const context = engine.toGameContext();
    const result = await aiManager.parseCommand(instruction, context);
    const activeAdapter = aiManager.getActiveAdapter();
    const confidenceScore = result.confidence ?? (result.actions[0]?.confidence ?? null);

    const inspectorRecord: AIInspectorData = {
      instruction,
      speechTranscript: isVoice ? instruction : undefined,
      adapterName: activeAdapter.name,
      isFallback: activeAdapter.isFallback,
      adapterStatus: activeAdapter.status,
      generatedActions: result.actions,
      validationStatus: result.success ? 'passed' : 'failed',
      validationError: result.validationError,
      latencyMs: result.latencyMs,
      confidence: confidenceScore ?? undefined,
      explanation: result.explanation,
      timestamp: new Date().toLocaleTimeString(),
    };

    set((state) => ({
      inspectorData: inspectorRecord,
      inspectorHistory: [inspectorRecord, ...state.inspectorHistory.slice(0, 20)],
      currentActionPlan: result.actions,
      overallConfidence: confidenceScore,
      activeActionIndex: 0,
      totalActionSteps: result.actions.length,
    }));

    if (!result.success || result.actions.length === 0) {
      speech.speak("I couldn't process that instruction. Please try again.");
      set({ isExecutingCommand: false });
      return false;
    }

    // Step 2: Execute in GameEngine
    const executionSuccess = await engine.executeActions(
      result.actions,
      {
        onStepStart: (_act, idx, total) => {
          set({ activeActionIndex: idx, totalActionSteps: total });
        },
        onStepComplete: (_act, snap) => {
          set({ snapshot: snap });
        },
        onLevelComplete: (snap) => {
          const score = calculateLevelScore(
            currentLevel,
            snap.stepsTaken,
            snap.commandsUsed,
            snap.robot.energy
          );

          storage.recordLevelComplete(
            currentLevel.id,
            score.stars,
            score.totalScore,
            snap.stepsTaken,
            snap.commandsUsed
          );

          // Check achievements
          if (currentLevel.id === 1) storage.unlockAchievement('first-steps');
          if (currentLevel.id === 9) storage.unlockAchievement('logic-master');
          if (currentLevel.id === 10) storage.unlockAchievement('escape-artist');
          if (score.isParBeaten) storage.unlockAchievement('perfect-navigator');
          if (snap.robot.energy >= 75) storage.unlockAchievement('energy-saver');
          if (isVoice) storage.unlockAchievement('voice-commander');

          const profile = storage.getProfile();
          set({
            lastScore: score,
            modalVictory: true,
            crystals: profile.crystals,
          });

          if (currentLevel.id >= 10) {
            speech.speak('Campaign complete! You have conquered all sectors, Commander. Generating your Grand Winner Card.');
          } else {
            speech.speak('Mission accomplished! Excellent work, Commander.');
          }
        },
        onGameOver: (reason) => {
          speech.speak(`Mission halted. ${reason}`);
        },
      },
      get().reducedMotion ? 50 : 220
    );

    set({ isExecutingCommand: false });
    return executionSuccess;
  },

  nextHint: () => {
    set((state) => ({
      hintStage: Math.min(2, state.hintStage + 1),
      modalHint: true,
    }));
  },

  nextLevel: () => {
    const { currentLevelId } = get();
    if (currentLevelId < 10) {
      get().loadLevel(currentLevelId + 1);
    }
  },

  toggleVoiceListening: () => {
    const isCurrentlyListening = get().isListeningVoice;
    if (isCurrentlyListening) {
      speech.stopListening();
      set({ isListeningVoice: false });
    } else {
      speech.setCallbacks({
        onInterimResult: (transcript) => {
          set({ voiceTranscript: transcript });
        },
        onFinalResult: (transcript) => {
          set({ voiceTranscript: transcript, isListeningVoice: false });
          // Automatically execute voice command
          get().submitCommand(transcript, true);
        },
        onError: (err) => {
          set({ isListeningVoice: false });
          alert(err);
        },
        onStateChange: (listening) => {
          set({ isListeningVoice: listening });
        },
      });

      const started = speech.startListening();
      if (started) {
        set({ isListeningVoice: true, voiceTranscript: '' });
      }
    }
  },

  setVoiceTranscript: (transcript) => set({ voiceTranscript: transcript }),

  toggleMute: () => {
    const muted = sound.toggleMute();
    set({ isMuted: muted });
  },

  setMusicVolume: (v) => {
    sound.setMusicVolume(v);
    set({ musicVolume: v });
  },

  setSfxVolume: (v) => {
    sound.setSfxVolume(v);
    set({ sfxVolume: v });
  },

  setSpeechVolume: (v) => {
    speech.setVolume(v);
    set({ speechVolume: v });
  },

  toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
  toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),

  setNickname: (nick) => {
    storage.setNickname(nick);
    set({ nickname: nick });
  },

  equipCosmetics: (cosmetics) => {
    storage.equipCosmetic(cosmetics);
    storage.unlockAchievement('robot-stylist');
    set({ cosmetics });
  },

  setModal: (modal, open) => {
    set({ [modal]: open } as any);
  },

  openGrandWinnerCard: async () => {
    const { nickname, cosmetics, snapshot } = get();
    const profile = storage.getProfile();

    let totalScore = 0;
    let starsEarned = 0;
    let totalSteps = 0;
    let totalCommands = 0;
    let parSteps = 0;
    let parCommands = 0;
    let levelsCleared = 0;

    LEVELS.forEach((lvl) => {
      parSteps += lvl.parSteps;
      parCommands += lvl.parCommands;
      const prog = profile.levelProgress[lvl.id];
      if (prog && prog.stars > 0) {
        levelsCleared++;
        starsEarned += prog.stars;
        totalScore += prog.highScore;
        totalSteps += (prog.bestSteps > 0 && prog.bestSteps < 999) ? prog.bestSteps : lvl.parSteps;
        totalCommands += (prog.bestCommands > 0 && prog.bestCommands < 999) ? prog.bestCommands : lvl.parCommands;
      }
    });

    const metrics: UserPerformanceMetrics = {
      nickname,
      levelsCleared: Math.max(levelsCleared, 10),
      totalLevels: LEVELS.length,
      totalScore: Math.max(totalScore, 20000),
      starsEarned: Math.max(starsEarned, 24),
      maxStars: LEVELS.length * 3,
      totalSteps: Math.max(totalSteps, parSteps),
      parSteps,
      totalCommands: Math.max(totalCommands, parCommands),
      parCommands,
      avgEnergyRemaining: Math.max(snapshot.robot.energy, 75),
      currentLevelId: 10,
    };

    // Evaluate via Needle AI
    const aiReport = await aiManager.evaluatePerformance(metrics);

    // Generate Winner Card Image
    const cardUrl = await CardGeneratorService.generateGrandWinnerCard({
      nickname,
      totalScore: metrics.totalScore,
      totalStars: metrics.starsEarned,
      maxStars: metrics.maxStars,
      totalSteps: metrics.totalSteps,
      totalCommands: metrics.totalCommands,
      parSteps,
      parCommands,
      cosmetics,
      aiReport,
    });

    set({
      modalVictory: false,
      modalGrandWinner: true,
      grandWinnerReport: aiReport,
      grandWinnerCardUrl: cardUrl,
    });
  },
}));
