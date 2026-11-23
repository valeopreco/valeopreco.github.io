import type { Block, Cents, Goal, GoalComparison } from './types';
import { roundPct } from './money';

/**
 * Perspectiva matemática: quanto o preço representa de cada meta ativa.
 * Não presume que o dinheiro estava reservado para a meta.
 */
export function computeGoals(priceCents: Cents, goals: Goal[] = []): Block<{ items: GoalComparison[] }> {
  const active = goals.filter((g) => g.active && g.targetCents > 0);
  if (active.length === 0) return { available: false, missing: 'no-active-goal' };
  return {
    available: true,
    data: {
      items: active.map((g) => {
        const item: GoalComparison = {
          goalId: g.id,
          name: g.name,
          targetCents: g.targetCents,
          pctOfTarget: roundPct((priceCents / g.targetCents) * 100),
        };
        const remaining = g.targetCents - (g.currentCents ?? 0);
        if (g.currentCents && g.currentCents > 0 && remaining > 0) {
          item.pctOfRemaining = roundPct((priceCents / remaining) * 100);
        }
        return item;
      }),
    },
  };
}
