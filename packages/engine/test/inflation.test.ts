import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { adjustForInflation, computeEquivalences } from '../src';

describe('correção pela inflação', () => {
  it('aplica só os meses posteriores ao mês da conferência', () => {
    const r = adjustForInflation(10000, '2026-08-15', { '202608': 5, '202609': 1, '202610': -1 });
    expect(r.cents).toBe(9999); // 100 × 1,01 × 0,99
    expect(r.through).toBe('2026-10');
    expect(r.months).toBe(2);
    expect(r.pct).toBe(-0.01);
  });

  it('sem meses novos, devolve o preço igual e sem data', () => {
    const r = adjustForInflation(2500, '2026-11-23', { '202609': 1, '202610': 2 });
    expect(r).toEqual({ cents: 2500, pct: 0, months: 0 });
  });

  it('atravessa a virada do ano', () => {
    const r = adjustForInflation(10000, '2026-11-02', { '202612': 1, '202701': 1 });
    expect(r.through).toBe('2027-01');
    expect(r.cents).toBe(10201);
  });

  it('para no primeiro mês faltante, sem pular buracos', () => {
    const r = adjustForInflation(10000, '2026-07-01', { '202608': 1, '202610': 50 });
    expect(r.through).toBe('2026-08');
    expect(r.cents).toBe(10100);
  });

  it('ignora valores inválidos na série', () => {
    const r = adjustForInflation(10000, '2026-07-01', { '202608': Number.NaN, '202609': 1 });
    expect(r.months).toBe(0);
  });

  it('é determinística e nunca gera preço negativo ou NaN', () => {
    const month = fc.integer({ min: 1, max: 12 }).map((m) => `2026${String(m).padStart(2, '0')}`);
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000_000 }),
        fc.dictionary(month, fc.double({ min: -20, max: 20, noNaN: true })),
        (cents, series) => {
          const a = adjustForInflation(cents, '2026-01-10', series);
          const b = adjustForInflation(cents, '2026-01-10', series);
          return Number.isSafeInteger(a.cents) && a.cents > 0 && a.cents === b.cents;
        },
      ),
    );
  });

  it('a equivalência carrega a informação do reajuste', () => {
    const r = computeEquivalences(
      10000,
      [
        {
          id: 'gas',
          singular: 'botijão de gás',
          plural: 'botijões de gás',
          categorySlug: 'casa',
          priceCents: 12000 - 2000,
          source: 'Teste',
          updatedAt: '2026-11-23',
          universal: true,
          estimated: true,
          active: true,
          adjustment: { through: '2026-12', pct: 2.27, index: 'IPCA/IBGE, Salvador' },
        },
      ],
    );
    expect(r.available && r.data.items[0]?.adjustment?.index).toBe('IPCA/IBGE, Salvador');
  });
});
