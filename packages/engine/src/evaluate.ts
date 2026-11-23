import type { EvaluationContext, EvaluationInput, EvaluationResult } from './types';
import { CATEGORY_SLUGS } from './types';
import { MAX_PRICE_CENTS } from './money';
import { MAX_TIMES } from './recurrence';
import { computeWorkTime } from './workTime';
import { computeEquivalences } from './equivalences';
import { computeRecurrence } from './recurrence';
import { computeCostPerUse } from './costPerUse';
import { computeGoals } from './goals';
import { ENGINE_VERSION } from './version';

export class InvalidInputError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

export function validateInput(input: EvaluationInput): void {
  const { priceCents, estimatedUses, frequency, categorySlug } = input;
  if (!Number.isSafeInteger(priceCents) || priceCents <= 0) {
    throw new InvalidInputError('priceCents', 'Informe um preço maior que zero.');
  }
  if (priceCents > MAX_PRICE_CENTS) throw new InvalidInputError('priceCents', 'Preço acima do limite aceito.');
  if (estimatedUses !== undefined && (!Number.isInteger(estimatedUses) || estimatedUses < 1 || estimatedUses > 100_000)) {
    throw new InvalidInputError('estimatedUses', 'Use um número inteiro entre 1 e 100.000.');
  }
  if (frequency && (frequency.kind === 'weekly' || frequency.kind === 'monthly')) {
    if (!Number.isInteger(frequency.times) || frequency.times < 1 || frequency.times > MAX_TIMES) {
      throw new InvalidInputError('frequency', `Use um número inteiro entre 1 e ${MAX_TIMES}.`);
    }
  }
  if (categorySlug !== undefined && !CATEGORY_SLUGS.includes(categorySlug)) {
    throw new InvalidInputError('categorySlug', 'Categoria desconhecida.');
  }
}

/** Função pura e determinística: mesma entrada, mesmo resultado. */
export function evaluate(input: EvaluationInput, context: EvaluationContext = {}): EvaluationResult {
  validateInput(input);
  const p = input.priceCents;
  return {
    engineVersion: ENGINE_VERSION,
    priceCents: p,
    workTime: computeWorkTime(p, context.financial),
    equivalences: computeEquivalences(p, context.references, input.categorySlug),
    recurrence: computeRecurrence(p, input.frequency),
    costPerUse: computeCostPerUse(p, input.estimatedUses),
    goals: computeGoals(p, context.goals),
  };
}
