import { AICommandAdapter, CommandResult, GameContext } from './types';
import { NeedleAdapter } from './adapters/NeedleAdapter';
import { RuleBasedFallbackAdapter } from './adapters/RuleBasedFallbackAdapter';
import { CloudAdapter } from './adapters/CloudAdapter';

export class AIAdapterManager {
  private adapters: Map<string, AICommandAdapter> = new Map();
  private activeAdapterId: string = 'rule-based-fallback';

  constructor() {
    const fallback = new RuleBasedFallbackAdapter();
    const needle = new NeedleAdapter();
    const cloud = new CloudAdapter();

    this.adapters.set(fallback.id, fallback);
    this.adapters.set(needle.id, needle);
    this.adapters.set(cloud.id, cloud);
  }

  async initialize(): Promise<void> {
    // Attempt initializing Needle first
    const needle = this.adapters.get('cactus-needle');
    if (needle) {
      await needle.initialize();
      if (needle.status === 'ready') {
        this.activeAdapterId = 'cactus-needle';
        return;
      }
    }

    // Default to fallback
    const fallback = this.adapters.get('rule-based-fallback')!;
    await fallback.initialize();
    this.activeAdapterId = 'rule-based-fallback';
  }

  getActiveAdapter(): AICommandAdapter {
    return this.adapters.get(this.activeAdapterId) || this.adapters.get('rule-based-fallback')!;
  }

  getAllAdapters(): AICommandAdapter[] {
    return Array.from(this.adapters.values());
  }

  setActiveAdapter(id: string): void {
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
