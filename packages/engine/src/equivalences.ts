import type { Block, CategorySlug, Cents, EquivalenceItem, PriceReference } from './types';

export const EQUIVALENCE_RULES = {
  maxItems: 3,
  maxQuantity: 500,
  /** Faixa ideal: quantidades que dá para imaginar de cabeça. */
  idealMin: 2,
  idealMax: 20,
  /** Aceitável, mas menos fácil de visualizar. */
  okMax: 50,
  /** Quantidade de referência para desempate (nem 1, nem dezenas). */
  sweetSpot: 6,
} as const;

function score(ref: PriceReference, qty: number, category?: CategorySlug): number {
  const R = EQUIVALENCE_RULES;
  let s = 0;
  if (category && ref.categorySlug === category) s += 100;
  if (qty >= R.idealMin && qty <= R.idealMax) s += 60;
  else if (qty > R.idealMax && qty <= R.okMax) s += 30;
  else if (qty === 1) s += 15;
  // Mais perto de ~6 unidades, melhor.
  s -= Math.abs(Math.log10(qty) - Math.log10(R.sweetSpot)) * 10;
  return s;
}

/**
 * Seleciona equivalências de forma determinística:
 * 1. candidatas = todas as referências ativas, de qualquer categoria;
 * 2. descarta quantidade 0 e acima de 500;
 * 3. pontua: mesma categoria da compra (+100), 2 a 20 unidades (+60), 21 a 50 (+30),
 *    1 unidade (+15), e quanto mais perto de 6 unidades, melhor;
 * 4. escolhe em ordem de pontos, no máximo uma por categoria, até 3.
 * Assim a comparação varia e fica na escala da compra. Sem candidatas, o bloco some.
 */
export function computeEquivalences(
  priceCents: Cents,
  references: PriceReference[] = [],
  category?: CategorySlug,
): Block<{ items: EquivalenceItem[] }> {
  const ranked = references
    .filter((r) => r.active && r.priceCents > 0)
    .map((r) => ({ ref: r, qty: Math.floor(priceCents / r.priceCents) }))
    .filter(({ qty }) => qty >= 1 && qty <= EQUIVALENCE_RULES.maxQuantity)
    .sort((a, b) => score(b.ref, b.qty, category) - score(a.ref, a.qty, category) || a.ref.id.localeCompare(b.ref.id));

  const usadas = new Set<CategorySlug>();
  const candidates: typeof ranked = [];
  for (const c of ranked) {
    if (usadas.has(c.ref.categorySlug)) continue;
    usadas.add(c.ref.categorySlug);
    candidates.push(c);
    if (candidates.length === EQUIVALENCE_RULES.maxItems) break;
  }

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
