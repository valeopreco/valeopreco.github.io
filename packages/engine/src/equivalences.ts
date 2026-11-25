import type { Block, CategorySlug, Cents, EquivalenceItem, PriceReference } from './types';

export const EQUIVALENCE_RULES = {
  maxItems: 3,
  maxQuantity: 500,
  comfortMin: 2,
  comfortMax: 50,
} as const;

function score(ref: PriceReference, qty: number, category?: CategorySlug): number {
  let s = 0;
  if (category && ref.categorySlug === category) s += 100;
  if (qty >= EQUIVALENCE_RULES.comfortMin && qty <= EQUIVALENCE_RULES.comfortMax) s += 50;
  // Entre as confortáveis, prefere quantidades menores (mais fáceis de imaginar).
  s -= Math.log10(qty);
  return s;
}

/**
 * Seleciona equivalências de forma determinística:
 * 1. candidatas = ativas da mesma categoria + universais;
 * 2. descarta quantidade 0 e acima de 500;
 * 3. ordena por mesma categoria, faixa 2–50 e quantidade menor;
 * 4. no máximo 3. Sem candidatas, o bloco fica indisponível.
 */
export function computeEquivalences(
  priceCents: Cents,
  references: PriceReference[] = [],
  category?: CategorySlug,
): Block<{ items: EquivalenceItem[] }> {
  const candidates = references
    .filter((r) => r.active && r.priceCents > 0)
    .filter((r) => r.universal || (category !== undefined && r.categorySlug === category))
    .map((r) => ({ ref: r, qty: Math.floor(priceCents / r.priceCents) }))
    .filter(({ qty }) => qty >= 1 && qty <= EQUIVALENCE_RULES.maxQuantity)
    .sort((a, b) => score(b.ref, b.qty, category) - score(a.ref, a.qty, category) || a.ref.id.localeCompare(b.ref.id))
    .slice(0, EQUIVALENCE_RULES.maxItems);

  if (candidates.length === 0) return { available: false, missing: 'no-matching-reference' };

  return {
    available: true,
    data: {
      items: candidates.map(({ ref, qty }) => ({
        refId: ref.id,
        quantity: qty,
        label: qty === 1 ? ref.singular : ref.plural,
        unitPriceCents: ref.priceCents,
        source: ref.source,
        updatedAt: ref.updatedAt,
        estimated: ref.estimated,
        ...(ref.adjustment ? { adjustment: ref.adjustment } : {}),
      })),
    },
  };
}
