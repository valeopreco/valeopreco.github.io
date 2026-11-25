import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  evaluate,
  formatHours,
  parseBRL,
  computeWorkTime,
  computeRecurrence,
  computeCostPerUse,
  computeGoals,
  computeEquivalences,
  InvalidInputError,
  ENGINE_VERSION,
  type PriceReference,
} from '../src';

const ref = (over: Partial<PriceReference>): PriceReference => ({
  id: 'r',
  singular: 'item',
  plural: 'itens',
  categorySlug: 'outros',
  priceCents: 1000,
  source: 'Teste',
  updatedAt: '2026-11-23',
  universal: false,
  estimated: true,
  active: true,
  ...over,
});

describe('exemplos do briefing', () => {
  it('R$ 2.400 / 160 h / compra R$ 300 = 20 horas', () => {
    const r = computeWorkTime(30000, { netIncomeCents: 240000, monthlyHours: 160 });
    expect(r.available).toBe(true);
    if (r.available) {
      expect(r.data.hourlyRateCents).toBe(1500);
      expect(r.data.hours).toBe(20);
      expect(r.data.label).toBe('cerca de 20 horas');
    }
  });

  it('R$ 25 diário = R$ 9.125 por ano', () => {
    const r = computeRecurrence(2500, { kind: 'daily' });
    expect(r.available && r.data.yearlyCents).toBe(912500);
  });

  it('semanal e mensal', () => {
    const w = computeRecurrence(1000, { kind: 'weekly', times: 3 });
    expect(w.available && w.data.yearlyCents).toBe(1000 * 3 * 52);
    const m = computeRecurrence(5000, { kind: 'monthly', times: 2 });
    expect(m.available && m.data.yearlyCents).toBe(5000 * 2 * 12);
  });

  it('R$ 600 em 100 usos = R$ 6 por uso', () => {
    const r = computeCostPerUse(60000, 100);
    expect(r.available && r.data.cents).toBe(600);
  });

  it('meta R$ 2.000 e compra R$ 200 = 10,0%', () => {
    const r = computeGoals(20000, [{ id: 'g', name: 'Viagem', targetCents: 200000, active: true }]);
    expect(r.available && r.data.items[0]?.pctOfTarget).toBe(10);
  });

  it('R$ 200 = 5 livros de R$ 40 e 20 cafés de R$ 10', () => {
    const refs = [
      ref({ id: 'livro', singular: 'livro', plural: 'livros', categorySlug: 'educacao', priceCents: 4000, universal: true }),
      ref({ id: 'cafe', singular: 'café', plural: 'cafés', categorySlug: 'alimentacao', priceCents: 1000, universal: true }),
    ];
    const r = computeEquivalences(20000, refs);
    expect(r.available).toBe(true);
    if (r.available) {
      const byId = Object.fromEntries(r.data.items.map((i) => [i.refId, i.quantity]));
      expect(byId).toEqual({ livro: 5, cafe: 20 });
    }
  });
});

describe('não inventa dados ausentes', () => {
  it('sem perfil financeiro não calcula tempo', () => {
    expect(computeWorkTime(1000).available).toBe(false);
    expect(computeWorkTime(1000, { netIncomeCents: 0, monthlyHours: 160 }).available).toBe(false);
    expect(computeWorkTime(1000, { netIncomeCents: 100000, monthlyHours: 0 }).available).toBe(false);
  });
  it('sem frequência ou compra única não projeta repetição', () => {
    expect(computeRecurrence(1000)).toEqual({ available: false, missing: 'no-frequency' });
    expect(computeRecurrence(1000, { kind: 'once' })).toEqual({ available: false, missing: 'one-time-purchase' });
  });
  it('sem usos estimados não calcula custo por uso', () => {
    expect(computeCostPerUse(1000).available).toBe(false);
    expect(computeCostPerUse(1000, 0).available).toBe(false);
  });
  it('sem metas ativas não compara', () => {
    expect(computeGoals(1000, [{ id: 'g', name: 'x', targetCents: 1000, active: false }]).available).toBe(false);
  });
  it('sem referências não mostra equivalências', () => {
    expect(computeEquivalences(1000, []).available).toBe(false);
  });
});

describe('regra de relevância das equivalências', () => {
  it('usa referências de outras categorias quando a da compra não tem', () => {
    const r = computeEquivalences(10000, [ref({ id: 'casa', categorySlug: 'casa' })], 'lazer');
    expect(r.available && r.data.items[0]?.refId).toBe('casa');
  });
  it('no máximo uma referência por categoria, para variar', () => {
    const refs = [
      ref({ id: 'a1', categorySlug: 'alimentacao', priceCents: 1000 }),
      ref({ id: 'a2', categorySlug: 'alimentacao', priceCents: 2000 }),
      ref({ id: 't1', categorySlug: 'transporte', priceCents: 1500 }),
    ];
    const r = computeEquivalences(10000, refs);
    const cats = r.available ? r.data.items.map((i) => i.refId) : [];
    expect(cats).toHaveLength(2);
    expect(cats.filter((id) => id.startsWith('a'))).toHaveLength(1);
  });
  it('prefere quantidades fáceis de imaginar a centenas de unidades', () => {
    const refs = [
      ref({ id: 'barato', categorySlug: 'transporte', priceCents: 500 }), // 164 un.
      ref({ id: 'medio', categorySlug: 'casa', priceCents: 12000 }), // 6 un.
    ];
    const r = computeEquivalences(82000, refs);
    expect(r.available && r.data.items[0]?.refId).toBe('medio');
  });
  it('ignora inativas, mais caras que a compra e acima de 500 unidades', () => {
    const refs = [
      ref({ id: 'a', active: false, universal: true }),
      ref({ id: 'b', priceCents: 50000, universal: true }),
      ref({ id: 'c', priceCents: 1, universal: true }),
    ];
    expect(computeEquivalences(10000, refs).available).toBe(false);
  });
  it('prefere a mesma categoria e limita a 3', () => {
    const refs = [
      ref({ id: 'u1', categorySlug: 'alimentacao', priceCents: 1500 }),
      ref({ id: 'u2', categorySlug: 'transporte', priceCents: 1600 }),
      ref({ id: 'u3', categorySlug: 'casa', priceCents: 1700 }),
      ref({ id: 'u4', categorySlug: 'saude', priceCents: 1800 }),
      ref({ id: 'cat', categorySlug: 'lazer', priceCents: 3000 }),
    ];
    const r = computeEquivalences(10000, refs, 'lazer');
    expect(r.available && r.data.items.length).toBe(3);
    expect(r.available && r.data.items[0]?.refId).toBe('cat');
  });
  it('é determinística', () => {
    const refs = [ref({ id: 'x', universal: true }), ref({ id: 'y', universal: true })];
    expect(computeEquivalences(5000, refs)).toEqual(computeEquivalences(5000, refs));
  });
});

describe('metas', () => {
  it('mostra % do que falta quando há valor atual', () => {
    const r = computeGoals(20000, [{ id: 'g', name: 'PC', targetCents: 400000, currentCents: 200000, active: true }]);
    expect(r.available && r.data.items[0]).toMatchObject({ pctOfTarget: 5, pctOfRemaining: 10 });
  });
  it('percentual com uma casa decimal', () => {
    const r = computeGoals(1000, [{ id: 'g', name: 'x', targetCents: 30000, active: true }]);
    expect(r.available && r.data.items[0]?.pctOfTarget).toBe(3.3);
  });
});

describe('formatação de horas', () => {
  it.each([
    [0.01, 'menos de 5 minutos'],
    [0.25, 'cerca de 15 minutos'],
    [1, 'cerca de 1 hora'],
    [1.5, 'cerca de 1 hora e meia'],
    [3.3, 'cerca de 3 horas e meia'],
    [20, 'cerca de 20 horas'],
    [123.4, 'cerca de 123 horas'],
  ])('%s h → %s', (h, label) => expect(formatHours(h)).toBe(label));

  it('dias de trabalho só com dias informados', () => {
    const sem = computeWorkTime(30000, { netIncomeCents: 240000, monthlyHours: 160 });
    expect(sem.available && sem.data.daysLabel).toBeUndefined();
    const com = computeWorkTime(30000, { netIncomeCents: 240000, monthlyHours: 160, workDaysPerMonth: 20 });
    expect(com.available && com.data.daysLabel).toBe('cerca de 2 dias e meio de trabalho');
  });
});

describe('parseBRL', () => {
  it.each([
    ['300', 30000],
    ['300,5', 30050],
    ['300,50', 30050],
    ['1.299,90', 129990],
    ['R$ 25', 2500],
    ['abc', null],
    ['1,2,3', null],
    ['', null],
  ])('%s → %s', (t, v) => expect(parseBRL(t)).toBe(v));
});

describe('validação', () => {
  it('rejeita preço inválido', () => {
    expect(() => evaluate({ priceCents: 0 })).toThrow(InvalidInputError);
    expect(() => evaluate({ priceCents: 10.5 })).toThrow(InvalidInputError);
    expect(() => evaluate({ priceCents: 100, estimatedUses: 1.5 })).toThrow(InvalidInputError);
  });
  it('registra a versão do motor', () => {
    expect(evaluate({ priceCents: 100 }).engineVersion).toBe(ENGINE_VERSION);
  });
});

describe('propriedades', () => {
  const price = fc.integer({ min: 1, max: 10_000_000 });
  const fin = fc.record({ netIncomeCents: fc.integer({ min: 100, max: 10_000_000 }), monthlyHours: fc.integer({ min: 1, max: 400 }) });

  it('preço maior nunca representa menos horas', () => {
    fc.assert(
      fc.property(price, price, fin, (a, b, f) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        const x = computeWorkTime(lo, f), y = computeWorkTime(hi, f);
        return x.available && y.available && x.data.hours <= y.data.hours;
      }),
    );
  });

  it('nenhum número do resultado é NaN ou infinito', () => {
    fc.assert(
      fc.property(price, fin, fc.integer({ min: 1, max: 1000 }), (p, f, uses) => {
        const r = evaluate(
          { priceCents: p, estimatedUses: uses, frequency: { kind: 'weekly', times: 2 } },
          { financial: f, goals: [{ id: 'g', name: 'g', targetCents: 50000, active: true }] },
        );
        const nums: number[] = [];
        JSON.stringify(r, (_k, v) => (typeof v === 'number' && nums.push(v), v));
        return nums.every(Number.isFinite);
      }),
    );
  });

  it('sem contexto, só aparecem blocos sustentados pela entrada', () => {
    fc.assert(
      fc.property(price, (p) => {
        const r = evaluate({ priceCents: p });
        return !r.workTime.available && !r.equivalences.available && !r.recurrence.available && !r.costPerUse.available && !r.goals.available;
      }),
    );
  });
});
