import { AICommandAdapter, CommandResult, GameContext } from '../types';

export class CloudAdapter implements AICommandAdapter {
  readonly id = 'cloud-api';
  readonly name = 'Cloudflare AI Gateway (Optional)';
  readonly description = 'Remote serverless endpoint for model execution. Disabled by default to ensure local zero-cost privacy.';
  readonly isFallback = false;
  status: 'uninitialized' | 'ready' | 'error' = 'uninitialized';
  statusMessage?: string;
  private endpointUrl?: string;

  constructor(endpointUrl?: string) {
    this.endpointUrl = endpointUrl;
  }

  async initialize(): Promise<void> {
    if (!this.endpointUrl) {
      this.status = 'error';
      this.statusMessage = 'Cloud adapter is disabled by default. Configure an endpoint in settings to enable.';
      return;
    }
    this.status = 'ready';
    this.statusMessage = 'Cloud endpoint configured.';
  }

  async parseCommand(instruction: string, context: GameContext): Promise<CommandResult> {
    const startTime = performance.now();
    if (!this.endpointUrl || this.status !== 'ready') {
      return {
        success: false,
        actions: [],
        rawOutput: '',
        latencyMs: Math.round(performance.now() - startTime),
        adapterName: this.name,
        validationError: 'Cloud Adapter is disabled. Please use the on-device engine or rule-based fallback.',
      };
    }

    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction, context }),
      });
      const data = await response.json();
      return {
        success: true,
        actions: data.actions || [],
        rawOutput: JSON.stringify(data),
        latencyMs: Math.round(performance.now() - startTime),
        adapterName: this.name,
      };
    } catch (err: any) {
      return {
        success: false,
        actions: [],
        rawOutput: '',
        latencyMs: Math.round(performance.now() - startTime),
        adapterName: this.name,
        validationError: err.message,
      };
    }
  }

  async dispose(): Promise<void> {
    this.status = 'uninitialized';
  }
}
