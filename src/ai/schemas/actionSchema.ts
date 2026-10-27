import { z } from 'zod';
import { RobotAction } from '../types';

export const DirectionSchema = z.enum(['up', 'down', 'left', 'right']);

export const MoveActionSchema = z.object({
  type: z.literal('move'),
  direction: DirectionSchema,
  steps: z.number().int().min(1).max(20),
});

export const TurnActionSchema = z.object({
  type: z.literal('turn'),
  direction: z.enum(['left', 'right']),
});

export const CollectActionSchema = z.object({
  type: z.literal('collect'),
  targetId: z.string().min(1),
});

export const InteractActionSchema = z.object({
  type: z.literal('interact'),
  targetId: z.string().min(1),
});

export const PushActionSchema = z.object({
  type: z.literal('push'),
  direction: DirectionSchema,
});

export const WaitActionSchema = z.object({
  type: z.literal('wait'),
  ticks: z.number().int().min(1).max(10),
});

export const RechargeActionSchema = z.object({
  type: z.literal('recharge'),
});

export const InspectActionSchema = z.object({
  type: z.literal('inspect'),
  targetId: z.string().optional(),
});

export const SingleActionSchema = z.discriminatedUnion('type', [
  MoveActionSchema,
  TurnActionSchema,
  CollectActionSchema,
  InteractActionSchema,
  PushActionSchema,
  WaitActionSchema,
  RechargeActionSchema,
  InspectActionSchema,
]);

export const ActionPlanSchema = z.array(SingleActionSchema).max(30);

export function validateActionPlan(data: unknown): { success: true; data: RobotAction[] } | { success: false; error: string } {
  const result = ActionPlanSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as RobotAction[] };
  } else {
    const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: errorDetails };
  }
}
