import { AICommandAdapter, CommandResult, Direction, GameContext, RobotAction } from '../types';
import { validateActionPlan } from '../schemas/actionSchema';
import { createNeedle, tool, type ToolCollection } from 'cactus-needle/browser';

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export class NeedleAdapter implements AICommandAdapter {
  readonly id = 'cactus-needle';
  readonly name = 'Cactus Needle On-Device AI';
  readonly description = 'Ultra-lightweight on-device foundation model (8-35MB) for direct browser tool-calling and structured action extraction.';
  readonly isFallback = false;
  status: 'uninitialized' | 'loading' | 'ready' | 'error' = 'uninitialized';
  statusMessage?: string;

  private needleSession: any = null;
  private isInitializing = false;

  async initialize(): Promise<void> {
    if (this.status === 'ready') return;
    if (this.isInitializing) return;

    this.isInitializing = true;
    this.status = 'loading';
    this.statusMessage = 'Initializing Cactus Needle runtime...';

    const startTime = performance.now();

    try {
      // Environment validation
      if (typeof window === 'undefined' || typeof Worker === 'undefined') {
        throw new Error('Cactus Needle WebAssembly worker requires a browser environment.');
      }

      if (typeof WebAssembly !== 'object' || !WebAssembly.validate) {
        throw new Error('WebAssembly is not supported in this browser.');
      }

      // Verify asset accessibility
      this.statusMessage = 'Checking local Needle model weights (needle3.cact)...';
      const checkRes = await fetch('/models/needle3.cact', { method: 'HEAD' }).catch(() => null);
      if (!checkRes || !checkRes.ok) {
        throw new Error('Model weights (/models/needle3.cact) are missing from the public distribution.');
      }

      this.statusMessage = 'Compiling Needle WebAssembly engine and allocating tensor memory...';

      // Initialize real on-device Cactus Needle session
      this.needleSession = await createNeedle({
        model: '/models/needle3.cact',
        wasmUrl: '/models/needle.wasm',
        workerUrl: '/models/worker.js',
        modelSha256: 'c9d915eca282ed42d1a09b143b592adb4cc6744ffe2d294adf5cfc5548170c38',
        cache: true,
        stateless: true,
        onDownloadProgress: (progress) => {
          if (progress.percentage) {
            this.statusMessage = `Loading model weights: ${Math.round(progress.percentage)}%`;
          }
        },
        tools: {
          move: tool({
            description: 'Move robot in a cardinal direction (up, down, left, right) or relative direction (forward, backward) by a number of steps.',
            inputSchema: {
              type: 'object',
              properties: {
                direction: {
                  type: 'string',
                  enum: ['forward', 'backward', 'up', 'down', 'left', 'right']
                },
                steps: {
                  type: 'integer',
                  description: 'Number of steps or tiles to traverse'
                }
              }
            }
          }),
          turn: tool({
            description: 'Turn robot heading orientation to left or right.',
            inputSchema: {
              type: 'object',
              properties: {
                direction: {
                  type: 'string',
                  enum: ['left', 'right', 'back']
                }
              },
              required: ['direction']
            }
          }),
          push: tool({
            description: 'Push an adjacent movable crate or block in a direction.',
            inputSchema: {
              type: 'object',
              properties: {
                direction: {
                  type: 'string',
                  enum: ['forward', 'up', 'down', 'left', 'right']
                }
              }
            }
          }),
          interact: tool({
            description: 'Interact with, toggle, or press an adjacent switch, lever, console, or door.',
            inputSchema: {
              type: 'object',
              properties: {
                target: { type: 'string' }
              }
            }
          }),
          collect: tool({
            description: 'Pick up or collect an adjacent key, data disc, energy cell, or item.',
            inputSchema: {
              type: 'object',
              properties: {
                target: { type: 'string' }
              }
            }
          }),
          wait: tool({
            description: 'Wait or pause for a specified number of turns.',
            inputSchema: {
              type: 'object',
              properties: {
                turns: { type: 'integer' }
              }
            }
          }),
          recharge: tool({
            description: 'Recharge robot battery energy at charging station.',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          })
        }
      });

      const initLatency = Math.round(performance.now() - startTime);
      this.status = 'ready';
      this.statusMessage = `Cactus Needle 3 on-device model active (${initLatency}ms). Ready for local tool-calling.`;
    } catch (err: any) {
      this.status = 'error';
      this.statusMessage = err?.message || 'Needle initialization failed.';
      console.warn('[NeedleAdapter] Failed to initialize Needle:', err);
    } finally {
      this.isInitializing = false;
    }
  }

  async parseCommand(instruction: string, context: GameContext): Promise<CommandResult> {
    const startTime = performance.now();

    if (this.status !== 'ready' || !this.needleSession) {
      return {
        success: false,
        actions: [],
        rawOutput: '',
        latencyMs: Math.round(performance.now() - startTime),
        adapterName: this.name,
        validationError: this.statusMessage || 'Needle model is not ready.',
      };
    }

    try {
      // Execute inference via on-device Cactus Needle session
      const prompt = instruction.trim();
      const res = await this.needleSession.generate({ prompt });
      const latencyMs = Math.round(performance.now() - startTime);

      const toolCalls = res.toolCalls || [];
      const actions: RobotAction[] = [];

      for (const call of toolCalls) {
        const name = call.toolName;
        const input = call.input || {};

        switch (name) {
          case 'move': {
            let dir: Direction = context.robot.direction;
            const requestedDir = input.direction?.toLowerCase();

            if (['up', 'down', 'left', 'right'].includes(requestedDir)) {
              dir = requestedDir as Direction;
            } else if (requestedDir === 'backward') {
              dir = OPPOSITE_DIRECTIONS[context.robot.direction];
            } else {
              // 'forward' or omitted defaults to current robot orientation
              dir = context.robot.direction;
            }

            const steps = Math.max(1, Math.min(20, Math.round(Number(input.steps) || 1)));
            actions.push({
              type: 'move',
              direction: dir,
              steps,
            });
            break;
          }

          case 'turn': {
            const turnDir = input.direction?.toLowerCase();
            if (turnDir === 'back') {
              actions.push({ type: 'turn', direction: 'right' });
              actions.push({ type: 'turn', direction: 'right' });
            } else if (turnDir === 'left' || turnDir === 'right') {
              actions.push({ type: 'turn', direction: turnDir });
            }
            break;
          }

          case 'push': {
            let pushDir: Direction = context.robot.direction;
            const requestedDir = input.direction?.toLowerCase();
            if (['up', 'down', 'left', 'right'].includes(requestedDir)) {
              pushDir = requestedDir as Direction;
            }
            actions.push({
              type: 'push',
              direction: pushDir,
            });
            break;
          }

          case 'interact': {
            // Find nearby switch, lever, or door
            const adjacent = context.entities.find(e =>
              ['switch', 'lever', 'door', 'button'].includes(e.type) &&
              Math.abs(e.x - context.robot.x) + Math.abs(e.y - context.robot.y) <= 1
            );
            actions.push({
              type: 'interact',
              targetId: adjacent?.id || input.target || 'switch-1',
            });
            break;
          }

          case 'collect': {
            // Find nearby key, disc, or gem
            const adjacent = context.entities.find(e =>
              ['key', 'data-disc', 'battery', 'gem'].includes(e.type) &&
              Math.abs(e.x - context.robot.x) + Math.abs(e.y - context.robot.y) <= 1
            );
            actions.push({
              type: 'collect',
              targetId: adjacent?.id || input.target || 'item-1',
            });
            break;
          }

          case 'wait': {
            const ticks = Math.max(1, Math.min(10, Math.round(Number(input.turns) || 1)));
            actions.push({ type: 'wait', ticks });
            break;
          }

          case 'recharge': {
            actions.push({ type: 'recharge' });
            break;
          }
        }
      }

      // Check if model returned zero tool calls (e.g. ungrounded or off-topic)
      if (actions.length === 0) {
        return {
          success: false,
          actions: [],
          rawOutput: JSON.stringify(res.raw || res, null, 2),
          latencyMs,
          adapterName: this.name,
          validationError: 'Needle did not identify any valid tool calls for this instruction.',
          explanation: res.reasoning || 'Model withheld prediction (off-topic or ungrounded instruction).',
        };
      }

      // Validate action schema
      const validation = validateActionPlan(actions);
      if (!validation.success) {
        return {
          success: false,
          actions: [],
          rawOutput: JSON.stringify(res.raw || res, null, 2),
          latencyMs,
          adapterName: this.name,
          validationError: `Action validation failed: ${validation.error}`,
          explanation: res.reasoning,
        };
      }

      const confidencePct = res.confidence ? Math.round(res.confidence * 100) : null;
      const explanation = res.reasoning
        ? `${res.reasoning}${confidencePct ? ` (Confidence: ${confidencePct}%)` : ''}`
        : confidencePct ? `Needle calibrated confidence: ${confidencePct}%` : 'Executed on-device via Needle 3.';

      return {
        success: true,
        actions: validation.data,
        rawOutput: JSON.stringify(res.raw || res, null, 2),
        latencyMs,
        adapterName: this.name,
        explanation,
      };
    } catch (err: any) {
      return {
        success: false,
        actions: [],
        rawOutput: String(err),
        latencyMs: Math.round(performance.now() - startTime),
        adapterName: this.name,
        validationError: err?.message || 'Needle inference execution failed.',
      };
    }
  }

  async dispose(): Promise<void> {
    if (this.needleSession) {
      try {
        await this.needleSession.close();
      } catch {}
      this.needleSession = null;
    }
    this.status = 'uninitialized';
    this.statusMessage = undefined;
  }
}
