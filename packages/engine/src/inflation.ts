import type { Cents } from './types';
import { roundCents } from './money';

/** Variação mensal em %, por mês no formato AAAAMM. Ex.: { '202610': 0.42 }. */
export type MonthlySeries = Record<string, number>;

export interface InflationAdjustment {
  cents: Cents;
  /** Último mês aplicado (AAAA-MM). Ausente quando não houve mês a corrigir. */
  through?: string;
  /** Variação acumulada aplicada, em %, com duas casas. */
  pct: number;
  months: number;
}

/**
 * Corrige um preço conferido em `anchorDate` (AAAA-MM-DD) pela variação acumulada
 * dos meses POSTERIORES ao mês da conferência. O mês da conferência não entra:
 * o preço já é daquele mês. Sem meses novos, o preço volta igual.
 * Para no primeiro mês faltante da série, para nunca pular buracos.
 */
export function adjustForInflation(cents: Cents, anchorDate: string, series: MonthlySeries): InflationAdjustment {
  const anchor = anchorDate.slice(0, 4) + anchorDate.slice(5, 7);
  const months = Object.keys(series)
    .filter((m) => /^\d{6}$/.test(m) && m > anchor && Number.isFinite(series[m]))
    .sort();

  let factor = 1;
  let last: string | undefined;
  let expected = nextMonth(anchor);
  for (const m of months) {
    if (m !== expected) break;
    factor *= 1 + series[m]! / 100;
    last = m;
    expected = nextMonth(m);
  }
  if (!last) return { cents, pct: 0, months: 0 };
  const applied = months.indexOf(last) + 1;
  return {
    cents: roundCents(cents * factor),
    through: `${last.slice(0, 4)}-${last.slice(4)}`,
    pct: Math.round((factor - 1) * 10000) / 100,
    months: applied,
  };
}

function nextMonth(yyyymm: string): string {
  let y = Number(yyyymm.slice(0, 4));
  let m = Number(yyyymm.slice(4)) + 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return `${y}${String(m).padStart(2, '0')}`;
}
