import { z } from 'zod';
import { CATEGORY_SLUGS } from '@vale/engine';

const cents = z.number().int().positive().max(100_000_000_00);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const text = (max: number) => z.string().trim().min(1).max(max);

export const financialSchema = z.object({
  netIncomeCents: cents,
  monthlyHours: z.number().positive().max(744), // horas de um mês de 31 dias
  workDaysPerMonth: z.number().int().min(1).max(31).optional(),
});

export const goalSchema = z.object({
  id: z.string().uuid(),
  name: text(80),
  targetCents: cents,
  currentCents: z.number().int().min(0).max(100_000_000_00).optional(),
  deadline: isoDate.optional(),
  active: z.boolean(),
  createdAt: z.string(),
});

export const referenceSchema = z.object({
  id: z.string().min(1).max(64),
  singular: text(80),
  plural: text(80),
  categorySlug: z.enum(CATEGORY_SLUGS),
  priceCents: cents,
  source: text(120),
  updatedAt: isoDate,
  universal: z.boolean(),
  estimated: z.boolean(),
  active: z.boolean(),
});

const frequencySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('once') }),
  z.object({ kind: z.literal('daily') }),
  z.object({ kind: z.literal('weekdays') }),
  z.object({ kind: z.literal('weekly'), times: z.number().int().min(1).max(100) }),
  z.object({ kind: z.literal('monthly'), times: z.number().int().min(1).max(100) }),
]);

export const inputSchema = z.object({
  description: z.string().trim().max(120).optional(),
  priceCents: cents,
  categorySlug: z.enum(CATEGORY_SLUGS).optional(),
  frequency: frequencySchema.optional(),
  estimatedUses: z.number().int().min(1).max(100_000).optional(),
});

export const evaluationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  input: inputSchema,
  snapshot: z.object({
    engineVersion: z.string().max(20),
    parameters: z.record(z.string(), z.unknown()),
    result: z.record(z.string(), z.unknown()),
  }),
  decisions: z
    .array(
      z.object({
        id: z.string().uuid(),
        decision: z.enum(['comprar', 'esperar', 'desistir']),
        note: z.string().max(500).optional(),
        createdAt: z.string(),
      }),
    )
    .max(50),
});

export const exportBundleSchema = z.object({
  app: z.literal('VALE?'),
  exportedAt: z.string(),
  settings: z.object({ financial: financialSchema.optional(), displayName: z.string().max(80).optional() }),
  goals: z.array(goalSchema).max(200),
  references: z.array(referenceSchema).max(500),
  evaluations: z.array(evaluationSchema).max(5000),
});
