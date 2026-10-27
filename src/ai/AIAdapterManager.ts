import { AICommandAdapter, CommandResult, GameContext } from './types';
import { NeedleAdapter } from './adapters/NeedleAdapter';
import { RuleBasedFallbackAdapter } from './adapters/RuleBasedFallbackAdapter';
import { CloudAdapter } from './adapters/CloudAdapter';

export class AIAdapterManager {
  private adapters: Map<string, AICommandAdapter> = new Map();
  private activeAdapterId: string = 'cactus-needle';
  public fallbackEnabled: boolean = false; // Rule-based fallback disabled: Model-only mode

  constructor() {
    // Retain fallback adapter for test suites & manual debugging, but keep disabled for gameplay
    const fallback = new RuleBasedFallbackAdapter();
    const needle = new NeedleAdapter();
    const cloud = new CloudAdapter();

    this.adapters.set(fallback.id, fallback);
    this.adapters.set(needle.id, needle);
    this.adapters.set(cloud.id, cloud);
  }

  async initialize(): Promise<void> {
    // Only initialize and activate the Cactus Needle model
    this.activeAdapterId = 'cactus-needle';
    const needle = this.adapters.get('cactus-needle');
    if (needle) {
      await needle.initialize();
    }
  }

  getActiveAdapter(): AICommandAdapter {
    const adapter = this.adapters.get(this.activeAdapterId);
    if (adapter && (adapter.id !== 'rule-based-fallback' || this.fallbackEnabled)) {
      return adapter;
    }
    // Always return Cactus Needle model
    return this.adapters.get('cactus-needle')!;
  }

  getAllAdapters(): AICommandAdapter[] {
    return Array.from(this.adapters.values());
  }

  setActiveAdapter(id: string): void {
    if (id === 'rule-based-fallback' && !this.fallbackEnabled) {
      console.warn('[AIAdapterManager] Rule-based fallback is disabled. Game is configured to use only the on-device AI model.');
      return;
    }
    if (this.adapters.has(id)) {
      this.activeAdapterId = id;
    }
  }

  async parseCommand(instruction: string, context: GameContext): Promise<CommandResult> {
    const adapter = this.getActiveAdapter();
    return adapter.parseCommand(instruction, context);
  }
}

export const aiManager = new AIAdapterManager();
